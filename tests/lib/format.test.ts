import { describe, it, expect } from 'vitest'
import { formatRelativeTime } from '@/lib/format'

const now = new Date('2026-07-06T12:00:00Z')

describe('formatRelativeTime', () => {
  it('renders just-now for very recent times', () => {
    expect(formatRelativeTime(new Date('2026-07-06T11:59:30Z'), now)).toBe(
      'just now',
    )
  })

  it('renders whole minutes', () => {
    expect(formatRelativeTime(new Date('2026-07-06T11:45:00Z'), now)).toBe(
      '15m ago',
    )
  })

  it('renders whole hours', () => {
    expect(formatRelativeTime(new Date('2026-07-06T09:00:00Z'), now)).toBe(
      '3h ago',
    )
  })

  it('renders whole days', () => {
    expect(formatRelativeTime(new Date('2026-07-04T12:00:00Z'), now)).toBe(
      '2d ago',
    )
  })

  it('clamps future timestamps to just now', () => {
    expect(formatRelativeTime(new Date('2026-07-06T12:05:00Z'), now)).toBe(
      'just now',
    )
  })
})
