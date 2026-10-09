'use client'

import { pusherClient } from '@/lib/pusher'
import { chatHrefConstructor, toPusherKey } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { toast } from 'sonner'
import UnseenChatToast from './UnreadChatToast'

interface SidebarChatListProps {
  friends: User[]
  sessionId: string
}

/**
 * Message pushed on the `user:<sessionId>:chats` channel, extended with
 * denormalized sender metadata for the toast UI.
 *
 * NOTE: extends the ambient GLOBAL `Message` declared in src/types/db.d.ts —
 * not the Zod-inferred `Message` from '@/schema' that Messages.tsx uses, so
 * two distinct Message types coexist in this directory.
 */
interface ExtendedMessage extends Message {
  senderImg: string
  senderName: string
}

/**
 * Sidebar list of the user's chats: one link per friend to
 * /dashboard/chat/{chatHrefConstructor(sessionId, friend.id)}, with a badge
 * showing the count of unseen messages from that friend.
 *
 * Realtime (pusherClient):
 * - `user:<sessionId>:chats` — 'new_message' fires a toast and bumps the
 *   unseen badge for that sender.
 * - `user:<sessionId>:friends` — 'new_friend' appends the newly added friend
 *   to the list.
 *
 * The list is seeded from the `friends` prop on first render only; afterwards
 * it grows solely through 'new_friend' events.
 */
const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }) => {
  const pathname = usePathname()
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([])
  const [activeChats, setActiveChats] = useState<User[]>(friends)

  // Subscribe to the user's realtime channels; keys are Pusher-safe
  // (`:` → `__` via toPusherKey). Cleanup unsubscribes and unbinds both
  // handlers so re-subscribes never stack.
  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`))
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

    // A friend was added: append the new chat to the list.
    const newFriendHandler = (newFriend: User) => {
      console.log("received new user", newFriend)
      setActiveChats((prev) => [...prev, newFriend])
    }

    // A message arrived: toast it and count it as unseen, unless the user is
    // already viewing this sender's conversation.
    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`

      if (!shouldNotify) return

      // Notify: the toast links to the chat; the unseen badge count updates
      // via setUnseenMessages below.
      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          sessionId={sessionId}
          senderId={message.senderId}
          senderImg={message.senderImg}
          senderMessage={message.text}
          senderName={message.senderName}
        />
      ))

      setUnseenMessages((prev) => [...prev, message])
    }

    pusherClient.bind('new_message', chatHandler)
    pusherClient.bind('new_friend', newFriendHandler)

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`))
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

      pusherClient.unbind('new_message', chatHandler)
      pusherClient.unbind('new_friend', newFriendHandler)
    }
  }, [pathname, sessionId])

  // On chat pages, drop unseen messages from the sender whose conversation is
  // being viewed — clearing that chat's badge.
  useEffect(() => {
    if (pathname?.includes('chat')) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathname.includes(msg.senderId))
      })
    }
  }, [pathname])

  return (
    <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1'>
      {/* Copy before sort: Array#sort mutates in place, and activeChats
          aliases the `friends` prop via its useState seed. */}
      {[...activeChats].sort().map((friend) => {
        const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
          return unseenMsg.senderId === friend.id
        }).length

        return (
          <li key={friend.id}>
            <a
              href={`/dashboard/chat/${chatHrefConstructor(
                sessionId,
                friend.id
              )}`}
              className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'>
              {friend.name}
              {unseenMessagesCount > 0 ? (
                <div className='bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center'>
                  {unseenMessagesCount}
                </div>
              ) : null}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export default SidebarChatList