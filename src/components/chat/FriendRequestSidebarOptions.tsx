'use client'

import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { User } from 'lucide-react'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'

interface FriendRequestSidebarOptionsProps {
  sessionId: string
  initialUnseenRequestCount: number
}

/**
 * Renders the 'Friend requests' row in the chat sidebar: a link to
 * `/dashboard/requests` showing a User icon, a truncated label, and a
 * live count badge with the number of unseen friend requests (the badge
 * is hidden while the count is 0).
 *
 * The badge stays live through two Pusher subscriptions, both made inside
 * a single `useEffect` keyed on `sessionId`:
 *
 * - Channel `user:<sessionId>:incoming_friend_requests` — every
 *   `incoming_friend_requests` event increments the count. (The event
 *   payload is an `IncomingFriendRequest[]` — see src/types/pusher.d.ts —
 *   but this handler ignores it and only counts.)
 * - Channel `user:<sessionId>:friends` — a `new_friend` event, fired when
 *   a pending request is accepted, decrements the count.
 *
 * Channel names follow the app-wide convention: the raw server-side key
 * `user:<id>:<event>` is passed through `toPusherKey` (src/lib/utils.ts),
 * which replaces every `:` with `__`, so Pusher receives channel names
 * like `user__<id>__<event>`.
 *
 * The effect's cleanup unsubscribes from both channels and unbinds both
 * handlers on unmount (or when `sessionId` changes), so no stale events
 * fire against a dead component and no duplicate bindings accumulate.
 *
 * @param props.sessionId - ID of the signed-in user; scopes both Pusher
 *   channels to their private friend-request and friends feeds.
 * @param props.initialUnseenRequestCount - Unseen-request count fetched
 *   server-side; seeds the badge before any live events arrive.
 */
const FriendRequestSidebarOptions: FC<FriendRequestSidebarOptionsProps> = ({
  sessionId,
  initialUnseenRequestCount,
}) => {
  const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
    initialUnseenRequestCount
  )

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    )
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

    const friendRequestHandler = () => {
      setUnseenRequestCount((prev) => prev + 1)
    }

    const addedFriendHandler = () => {
      setUnseenRequestCount((prev) => prev - 1)
    }

    pusherClient.bind('incoming_friend_requests', friendRequestHandler)
    pusherClient.bind('new_friend', addedFriendHandler)

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      )
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

      pusherClient.unbind('new_friend', addedFriendHandler)
      pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
    }
  }, [sessionId])

  return (
    <Link
      href='/dashboard/requests'
      className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'>
      <div className='text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
        <User className='h-4 w-4' />
      </div>
      <p className='truncate'>Friend requests</p>

      {unseenRequestCount > 0 ? (
        <div className='rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600'>
          {unseenRequestCount}
        </div>
      ) : null}
    </Link>
  )
}

export default FriendRequestSidebarOptions