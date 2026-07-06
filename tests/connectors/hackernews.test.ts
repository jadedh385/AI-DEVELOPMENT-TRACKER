import { describe, it, expect } from 'vitest'
import {
  buildSearchUrl,
  parseAlgoliaResponse,
  HN_MIN_POINTS,
} from '@/connectors/hackernews'
import type { SourceInput } from '@/connectors/types'

const source: SourceInput = {
  id: 'src_hn',
  type: 'hn',
  url: 'https://hn.algolia.com/api/v1/search_by_date',
  platform: 'hackernews',
  category: 'community',
  keywordFilters: ['AI', 'LLM'],
}

// A trimmed but shape-accurate Algolia `search_by_date` payload.
const sampleResponse = {
  hits: [
    {
      objectID: '40123456',
      title: 'Show HN: An open-source LLM agent',
      url: 'https://example.com/agent',
      author: 'ada',
      points: 142,
      created_at_i: 1_751_760_000,
    },
    {
      objectID: '40123457',
      title: 'Ask HN: best local model in 2026?',
      url: null, // Ask HN posts have no external URL
      author: 'grace',
      points: 55,
      created_at_i: 1_751_763_600,
    },
  ],
}

describe('buildSearchUrl', () => {
  const now = new Date('2026-07-06T00:00:00Z')

  it('targets the source endpoint with story tag and a hits cap', () => {
    const url = new URL(buildSearchUrl(source, now))

    expect(url.origin + url.pathname).toBe(source.url)
    expect(url.searchParams.get('tags')).toBe('story')
    expect(Number(url.searchParams.get('hitsPerPage'))).toBeGreaterThan(0)
  })

  it('filters by the min-points floor and a recency window', () => {
    const url = new URL(buildSearchUrl(source, now))
    const numeric = url.searchParams.get('numericFilters') ?? ''

    expect(numeric).toContain(`points>=${HN_MIN_POINTS}`)
    // 48h before `now` in unix seconds.
    const expectedSince = Math.floor(now.getTime() / 1000) - 48 * 3600
    expect(numeric).toContain(`created_at_i>=${expectedSince}`)
  })

  it('passes the source keyword filters into the query', () => {
    const url = new URL(buildSearchUrl(source, now))

    expect(url.searchParams.get('query')).toContain('AI')
    expect(url.searchParams.get('query')).toContain('LLM')
  })
})

describe('parseAlgoliaResponse', () => {
  it('maps hits to normalized items', () => {
    const items = parseAlgoliaResponse(sampleResponse)

    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({
      title: 'Show HN: An open-source LLM agent',
      url: 'https://example.com/agent',
      author: 'ada',
      platform: 'hackernews',
    })
    expect(items[0].publishedAt).toEqual(new Date(1_751_760_000 * 1000))
  })

  it('falls back to the HN permalink when a hit has no external url', () => {
    const [, askHn] = parseAlgoliaResponse(sampleResponse)

    expect(askHn.url).toBe('https://news.ycombinator.com/item?id=40123457')
  })

  it('returns an empty array when there are no hits', () => {
    expect(parseAlgoliaResponse({ hits: [] })).toEqual([])
  })

  it('drops hits without a usable title', () => {
    const withEmpty = {
      hits: [
        { objectID: '1', title: null, url: 'https://x.com', created_at_i: 1 },
        { objectID: '2', title: '   ', url: 'https://y.com', created_at_i: 2 },
        {
          objectID: '3',
          title: 'Real AI story',
          url: 'https://z.com',
          created_at_i: 3,
        },
      ],
    }

    const items = parseAlgoliaResponse(withEmpty)

    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('Real AI story')
  })

  it('throws a clear error on a malformed payload', () => {
    expect(() => parseAlgoliaResponse({ notHits: true })).toThrow(
      /malformed|invalid|hits/i,
    )
  })
})
