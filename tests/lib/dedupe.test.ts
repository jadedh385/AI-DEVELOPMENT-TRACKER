import { describe, it, expect } from 'vitest'
import { computeDedupeHash, dedupeBatch } from '@/lib/dedupe'
import type { NormalizedItem } from '@/connectors/types'

function makeItem(overrides: Partial<NormalizedItem> = {}): NormalizedItem {
  return {
    title: 'A new open model',
    url: 'https://example.com/model',
    platform: 'hackernews',
    publishedAt: new Date('2026-07-06T00:00:00Z'),
    ...overrides,
  }
}

describe('computeDedupeHash', () => {
  it('produces a stable sha256 hex hash for the same URL', () => {
    // Arrange
    const item = makeItem()

    // Act
    const first = computeDedupeHash(item)
    const second = computeDedupeHash(makeItem())

    // Assert
    expect(first).toBe(second)
    expect(first).toMatch(/^[0-9a-f]{64}$/)
  })

  it('hashes the canonical URL, ignoring title differences', () => {
    const a = computeDedupeHash(makeItem({ title: 'Title one' }))
    const b = computeDedupeHash(makeItem({ title: 'Totally different title' }))

    expect(a).toBe(b)
  })

  it('gives different URLs different hashes', () => {
    const a = computeDedupeHash(makeItem({ url: 'https://a.com/x' }))
    const b = computeDedupeHash(makeItem({ url: 'https://b.com/y' }))

    expect(a).not.toBe(b)
  })

  it('falls back to title|platform when the URL is empty', () => {
    // Arrange: two items with no URL but identical title+platform
    const a = computeDedupeHash(makeItem({ url: '' }))
    const b = computeDedupeHash(makeItem({ url: '' }))
    // A different title under the same empty-URL fallback must differ
    const c = computeDedupeHash(makeItem({ url: '', title: 'Other' }))

    // Assert
    expect(a).toBe(b)
    expect(a).not.toBe(c)
    expect(a).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('dedupeBatch', () => {
  it('collapses items that share a canonical URL, keeping the first', () => {
    // Arrange
    const items = [
      makeItem({ title: 'First seen', url: 'https://example.com/dup' }),
      makeItem({ title: 'Later duplicate', url: 'https://example.com/dup' }),
      makeItem({ title: 'Unique', url: 'https://example.com/unique' }),
    ]

    // Act
    const result = dedupeBatch(items)

    // Assert
    expect(result).toHaveLength(2)
    expect(result[0].item.title).toBe('First seen')
    expect(result[1].item.title).toBe('Unique')
  })

  it('attaches the dedupe hash to each surviving item', () => {
    const [only] = dedupeBatch([makeItem()])

    expect(only.dedupeHash).toBe(computeDedupeHash(makeItem()))
  })

  it('returns an empty array for empty input', () => {
    expect(dedupeBatch([])).toEqual([])
  })
})
