import { describe, it, expect } from 'vitest'
import {
  isSourceType,
  isFeedbackReaction,
  SOURCE_TYPES,
} from '@/lib/constants'

describe('source-domain constants', () => {
  it('accepts a known source type', () => {
    // Arrange
    const value = 'hn'

    // Act
    const result = isSourceType(value)

    // Assert
    expect(result).toBe(true)
  })

  it('rejects an unknown source type', () => {
    expect(isSourceType('tiktok')).toBe(false)
  })

  it('rejects a non-string value', () => {
    expect(isSourceType(42)).toBe(false)
  })

  it('exposes the full set of supported source types', () => {
    expect(SOURCE_TYPES).toContain('rss')
    expect(SOURCE_TYPES).toContain('reddit_json')
  })

  it('validates feedback reactions', () => {
    expect(isFeedbackReaction('helpful')).toBe(true)
    expect(isFeedbackReaction('angry')).toBe(false)
  })
})
