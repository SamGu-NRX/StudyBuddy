'use client'

import { pusherClient } from '@/lib/pusher'
import { cn, toPusherKey } from '@/lib/utils'
import { Message } from '@/schema'
import { format } from 'date-fns'
import Image from 'next/image'
import { FC, useEffect, useRef, useState } from 'react'

interface MessagesProps {
  initialMessages: Message[]
  sessionId: string
  chatId: string
  sessionImg: string | null | undefined
  chatPartner: User
}

/**
 * Chat transcript for one conversation.
 *
 * Renders `initialMessages` (server-fetched) and then appends realtime
 * messages: the effect subscribes to the `chat:<chatId>` Pusher channel
 * (key mangled via `toPusherKey` from `@/lib/utils`) and prepends every
 * `'incoming-message'` event payload (`setMessages((prev) => [message, ...prev])`).
 *
 * Rendering model: the container is `flex-col-reverse` and new messages are
 * PREPENDED, so array index 0 is the newest message and — because
 * `flex-col-reverse` lays DOM order out bottom-up — index 0 is also the
 * visually bottom-most bubble; older messages stack upward and the newest
 * bubble stays in view without any scroll code (`scrollDownRef`, attached
 * to an empty spacer div at the visual bottom, is never scrolled to here).
 * Within a row, the bubble is `order-1`/`order-2` and the avatar the
 * mirror value, so the avatar always sits on the outer edge (right for the
 * current user, left for the chat partner).
 *
 * Run grouping: in array order `messages[index - 1]` is the NEWER message,
 * i.e. the bubble rendered directly BELOW the current one, so
 * `hasNextMessageFromSameUser` is true when a newer bubble from the same
 * sender sits directly below — this bubble is stacked inside a run, its
 * avatar is hidden (`invisible`) and its bottom corners stay rounded. When
 * it is false, this is the lowest bubble of a run (the newest message of a
 * sender's streak, or index 0, where `messages[-1]` is `undefined`): the
 * corner adjacent to the avatar is squared (`rounded-br-none` for the
 * current user, `rounded-bl-none` for the chat partner) and the avatar
 * shows.
 *
 * Type trap: the `Message` used here is the Zod type from `@/schema`
 * (`{ id, senderId, text, timestamp }` — no `receiverId`), while sibling
 * files in this directory (e.g. `SidebarChatList.tsx`) use the ambient
 * GLOBAL `Message` from `src/types/db.d.ts`, which additionally declares
 * `receiverId`. `chatPartner: User` is likewise the ambient global `User`
 * from `db.d.ts`, not an import.
 *
 * Known issues (pre-existing; fixes are out of scope for this file):
 * - `@/lib/pusher` and `date-fns` do not resolve (`src/lib/pusher.ts` does
 *   not exist; `date-fns` is absent from `package.json`) — two residual
 *   TS2307 errors on this file's imports.
 * - Timestamps render time-only (`format(timestamp, 'HH:mm')`) — older
 *   messages carry no date marker.
 * - `sessionImg as string` casts `string | null | undefined` to `string`
 *   for `next/image`'s `src`; a session user without an image yields a
 *   null/undefined `src` at runtime.
 * - Unused component: nothing in `src/` renders `<Messages>` or passes
 *   `initialMessages` (verified by grep across the repo).
 */
const Messages: FC<MessagesProps> = ({
  initialMessages,
  sessionId,
  chatId,
  chatPartner,
  sessionImg,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages)

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`chat:${chatId}`)
    )

    const messageHandler = (message: Message) => {
      setMessages((prev) => [message, ...prev])
    }

    pusherClient.bind('incoming-message', messageHandler)

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`chat:${chatId}`)
      )
      pusherClient.unbind('incoming-message', messageHandler)
    }
  }, [chatId])

  const scrollDownRef = useRef<HTMLDivElement | null>(null)

  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, 'HH:mm')
  }

  return (
    <div
      id='messages'
      className='flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'>
      <div ref={scrollDownRef} />

      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId

        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId

        return (
          <div
            className='chat-message'
            key={`${message.id}-${message.timestamp}`}>
            <div
              className={cn('flex items-end', {
                'justify-end': isCurrentUser,
              })}>
              <div
                className={cn(
                  'flex flex-col space-y-2 text-base max-w-xs mx-2',
                  {
                    'order-1 items-end': isCurrentUser,
                    'order-2 items-start': !isCurrentUser,
                  }
                )}>
                <span
                  className={cn('px-4 py-2 rounded-lg inline-block', {
                    'bg-indigo-600 text-white': isCurrentUser,
                    'bg-gray-200 text-gray-900': !isCurrentUser,
                    'rounded-br-none':
                      !hasNextMessageFromSameUser && isCurrentUser,
                    'rounded-bl-none':
                      !hasNextMessageFromSameUser && !isCurrentUser,
                  })}>
                  {message.text}{' '}
                  <span className='ml-2 text-xs text-gray-400'>
                    {formatTimestamp(message.timestamp)}
                  </span>
                </span>
              </div>

              <div
                className={cn('relative w-6 h-6', {
                  'order-2': isCurrentUser,
                  'order-1': !isCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}>
                <Image
                  fill
                  src={
                    isCurrentUser ? (sessionImg as string) : chatPartner.image
                  }
                  alt='Profile picture'
                  referrerPolicy='no-referrer'
                  className='rounded-full'
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Messages