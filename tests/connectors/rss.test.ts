import { describe, it, expect } from 'vitest'
import { parseRssItems, type RssItem } from '@/connectors/rss'

function item(overrides: Partial<RssItem> = {}): RssItem {
  return {
    title: 'Claude 4 achieves new reasoning benchmarks',
    link: 'https://www.anthropic.com/news/claude-4',
    contentSnippet: 'Anthropic releases Claude 4 with improved reasoning.',
    creator: 'Anthropic',
    isoDate: '2026-07-06T00:00:00.000Z',
    ...overrides,
  }
}

describe('parseRssItems', () => {
  it('maps items to normalized shape', () => {
    const result = parseRssItems([item()])

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      title: 'Claude 4 achieves new reasoning benchmarks',
      url: 'https://www.anthropic.com/news/claude-4',
      summary: 'Anthropic releases Claude 4 with improved reasoning.',
      author: 'Anthropic',
      platform: 'rss',
    })
    expect(result[0].publishedAt).toEqual(new Date('2026-07-06T00:00:00.000Z'))
  })

  it('drops items with a missing title', () => {
    const result = parseRssItems([item({ title: undefined })])

    expect(result).toHaveLength(0)
  })

  it('drops items with a whitespace-only title', () => {
    const result = parseRssItems([item({ title: '   ' })])

    expect(result).toHaveLength(0)
  })

  it('drops items with a missing link', () => {
    const result = parseRssItems([item({ link: undefined })])

    expect(result).toHaveLength(0)
  })

  it('falls back to pubDate when isoDate is absent', () => {
    const result = parseRssItems([
      item({ isoDate: undefined, pubDate: 'Mon, 06 Jul 2026 00:00:00 +0000' }),
    ])

    expect(result).toHaveLength(1)
    expect(result[0].publishedAt).toBeInstanceOf(Date)
    expect(Number.isNaN(result[0].publishedAt.getTime())).toBe(false)
  })

  it('uses fetchedAt as publishedAt when no date is present', () => {
    const before = new Date()
    const result = parseRssItems([item({ isoDate: undefined, pubDate: undefined })])
    const after = new Date()

    expect(result).toHaveLength(1)
    expect(result[0].publishedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(result[0].publishedAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('handles missing author gracefully', () => {
    const result = parseRssItems([item({ creator: undefined })])

    expect(result[0].author).toBeUndefined()
  })

  it('omits summary when contentSnippet is absent', () => {
    const result = parseRssItems([item({ contentSnippet: undefined })])

    expect(result[0].summary).toBeUndefined()
  })

  it('returns an empty array for an empty input', () => {
    expect(parseRssItems([])).toEqual([])
  })
})
