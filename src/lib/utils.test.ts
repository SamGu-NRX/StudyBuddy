import { describe, expect, it } from 'vitest'
import { chatHrefConstructor, cn, toPusherKey } from '@/lib/utils'

describe('cn', () => {
  it('joins class names and drops falsy ones', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c')
  })

  it('lets later utilities override earlier tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

describe('toPusherKey', () => {
  it('replaces colons so keys are pusher-safe', () => {
    expect(toPusherKey('chat:user:123')).toBe('chat__user__123')
  })

  it('leaves keys without colons untouched', () => {
    expect(toPusherKey('plain')).toBe('plain')
  })
})

describe('chatHrefConstructor', () => {
  it('builds a stable href regardless of argument order', () => {
    expect(chatHrefConstructor('b', 'a')).toBe('a--b')
    expect(chatHrefConstructor('a', 'b')).toBe('a--b')
  })
})
