import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    item: {
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/db'
import { getFeedItems, FEED_LIMIT } from '@/lib/items'

const mockFindMany = vi.mocked(prisma.item.findMany)

function makeRow(overrides: object = {}) {
  return {
    id: 'item-1',
    sourceId: 'src-1',
    title: 'Test Item',
    canonicalUrl: 'https://example.com',
    summary: 'Why it matters',
    author: 'Author',
    platform: 'hackernews',
    category: 'research',
    publishedAt: new Date('2026-01-01'),
    fetchedAt: new Date('2026-01-01'),
    dedupeHash: 'abc123',
    source: { name: 'Hacker News' },
    feedback: [] as { reaction: string }[],
    ...overrides,
  }
}

describe('getFeedItems', () => {
  beforeEach(() => {
    mockFindMany.mockClear()
  })

  it('returns mapped FeedItem array', async () => {
    mockFindMany.mockResolvedValue([makeRow()])

    const result = await getFeedItems()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'item-1',
      title: 'Test Item',
      sourceName: 'Hacker News',
      isSaved: false,
    })
  })

  it('marks isSaved true when saved feedback exists', async () => {
    mockFindMany.mockResolvedValue([makeRow({ feedback: [{ reaction: 'saved' }] })])

    const result = await getFeedItems()

    expect(result[0].isSaved).toBe(true)
  })

  it('marks isHelpful true when helpful feedback exists', async () => {
    mockFindMany.mockResolvedValue([makeRow({ feedback: [{ reaction: 'helpful' }] })])

    const result = await getFeedItems()

    expect(result[0].isHelpful).toBe(true)
    expect(result[0].isNotRelevant).toBe(false)
  })

  it('marks isNotRelevant true when not_relevant feedback exists', async () => {
    mockFindMany.mockResolvedValue([makeRow({ feedback: [{ reaction: 'not_relevant' }] })])

    const result = await getFeedItems()

    expect(result[0].isNotRelevant).toBe(true)
    expect(result[0].isHelpful).toBe(false)
  })

  it('returns false for all reactions when no feedback exists', async () => {
    mockFindMany.mockResolvedValue([makeRow()])

    const result = await getFeedItems()

    expect(result[0].isSaved).toBe(false)
    expect(result[0].isHelpful).toBe(false)
    expect(result[0].isNotRelevant).toBe(false)
  })

  it('fetches without where clause when no filters provided', async () => {
    mockFindMany.mockResolvedValue([])

    await getFeedItems()

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    )
  })

  it('applies platform filter in where clause', async () => {
    mockFindMany.mockResolvedValue([])

    await getFeedItems({ platforms: ['reddit'] })

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          platform: { in: ['reddit'] },
        }),
      }),
    )
  })

  it('applies category filter in where clause', async () => {
    mockFindMany.mockResolvedValue([])

    await getFeedItems({ categories: ['research'] })

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: { in: ['research'] },
        }),
      }),
    )
  })

  it('applies both platform and category filters together', async () => {
    mockFindMany.mockResolvedValue([])

    await getFeedItems({ platforms: ['reddit', 'hackernews'], categories: ['research'] })

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          platform: { in: ['reddit', 'hackernews'] },
          category: { in: ['research'] },
        }),
      }),
    )
  })

  it('omits platform clause when platforms array is empty', async () => {
    mockFindMany.mockResolvedValue([])

    await getFeedItems({ platforms: [] })

    const call = mockFindMany.mock.calls[0][0] as { where?: Record<string, unknown> }
    expect(call.where?.platform).toBeUndefined()
  })

  it('omits category clause when categories array is empty', async () => {
    mockFindMany.mockResolvedValue([])

    await getFeedItems({ categories: [] })

    const call = mockFindMany.mock.calls[0][0] as { where?: Record<string, unknown> }
    expect(call.where?.category).toBeUndefined()
  })

  it('respects FEED_LIMIT cap', async () => {
    mockFindMany.mockResolvedValue([])

    await getFeedItems()

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: FEED_LIMIT }),
    )
  })

  it('orders by publishedAt descending', async () => {
    mockFindMany.mockResolvedValue([])

    await getFeedItems()

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { publishedAt: 'desc' } }),
    )
  })

  it('returns empty array when no items match filters', async () => {
    mockFindMany.mockResolvedValue([])

    const result = await getFeedItems({ platforms: ['github'] })

    expect(result).toEqual([])
  })
})
