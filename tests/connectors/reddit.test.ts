import { describe, it, expect } from 'vitest'
import {
  buildFetchUrl,
  parseAtomItems,
  REDDIT_MAX_POSTS,
  type AtomEntry,
} from '@/connectors/reddit'
import type { SourceInput } from '@/connectors/types'

const source: SourceInput = {
  id: 'src_reddit',
  type: 'rss',
  url: 'https://www.reddit.com/r/MachineLearning+artificial/hot.rss',
  platform: 'reddit',
  keywordFilters: ['AI', 'LLM'],
}

function entry(overrides: Partial<AtomEntry> = {}): AtomEntry {
  return {
    title: 'New LLM paper drops SOTA on benchmarks',
    link: 'https://www.reddit.com/r/MachineLearning/comments/abc/title/',
    // Typical Reddit Atom content: [link] points to external URL, [comments] to discussion.
    content:
      'submitted by /u/ada <span><a href="https://example.com/paper">[link]</a></span> <span><a href="https://www.reddit.com/r/MachineLearning/comments/abc/title/">[comments]</a></span>',
    creator: '/u/ada',
    isoDate: '2026-07-06T00:00:00.000Z',
    ...overrides,
  }
}

describe('buildFetchUrl', () => {
  it('targets the source RSS endpoint', () => {
    const url = new URL(buildFetchUrl(source))

    expect(url.origin + url.pathname).toBe(source.url)
  })

  it('caps the number of posts at REDDIT_MAX_POSTS', () => {
    const url = new URL(buildFetchUrl(source))

    expect(Number(url.searchParams.get('limit'))).toBe(REDDIT_MAX_POSTS)
  })
})

describe('parseAtomItems', () => {
  it('maps entries to normalized items', () => {
    const items = parseAtomItems([entry()])

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      title: 'New LLM paper drops SOTA on benchmarks',
      url: 'https://example.com/paper',
      author: 'ada',
      platform: 'reddit',
    })
    expect(items[0].publishedAt).toEqual(new Date('2026-07-06T00:00:00.000Z'))
  })

  it('falls back to the Reddit comments URL for self-posts', () => {
    const selfPost = entry({
      // Both [link] and [comments] point to Reddit for self-posts.
      content:
        'text content <span><a href="https://www.reddit.com/r/ML/comments/abc/title/">[link]</a></span>',
      link: 'https://www.reddit.com/r/ML/comments/abc/title/',
    })

    const [item] = parseAtomItems([selfPost])

    expect(item.url).toBe('https://www.reddit.com/r/ML/comments/abc/title/')
  })

  it('uses pubDate when isoDate is absent', () => {
    const items = parseAtomItems([entry({ isoDate: undefined, pubDate: 'Mon, 06 Jul 2026 00:00:00 +0000' })])

    expect(items[0].publishedAt).toBeInstanceOf(Date)
    expect(Number.isNaN(items[0].publishedAt.getTime())).toBe(false)
  })

  it('filters by keyword when keywordFilters are provided', () => {
    const entries = [
      entry({ title: 'Totally unrelated post' }),
      entry({ title: 'GPT-4 beats humans at reasoning', link: 'https://www.reddit.com/r/ML/comments/gpt/' }),
    ]

    const items = parseAtomItems(entries, { keywordFilters: ['GPT', 'LLM'] })

    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('GPT-4 beats humans at reasoning')
  })

  it('returns all entries when no keyword filters are set', () => {
    const entries = [entry({ title: 'Post A' }), entry({ title: 'Post B' })]

    expect(parseAtomItems(entries, { keywordFilters: [] })).toHaveLength(2)
  })

  it('drops entries with an empty or whitespace-only title', () => {
    const entries = [
      entry({ title: '   ' }),
      entry({ title: 'Real AI post' }),
    ]

    const items = parseAtomItems(entries)

    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('Real AI post')
  })

  it('strips the /u/ prefix from the author', () => {
    const [item] = parseAtomItems([entry({ creator: '/u/some_redditor' })])

    expect(item.author).toBe('some_redditor')
  })

  it('handles a missing author gracefully', () => {
    const [item] = parseAtomItems([entry({ creator: undefined })])

    expect(item.author).toBeUndefined()
  })

  it('returns an empty array when there are no entries', () => {
    expect(parseAtomItems([])).toEqual([])
  })
})
