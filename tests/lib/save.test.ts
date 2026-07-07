import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    item: {
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/db'
import { getSavedItems } from '@/lib/save'

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

describe('getSavedItems', () => {
  beforeEach(() => {
    mockFindMany.mockClear()
  })

  it('returns mapped FeedItem array for saved items', async () => {
    mockFindMany.mockResolvedValue([makeRow()])

    const result = await getSavedItems()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'item-1',
      title: 'Test Item',
      sourceName: 'Hacker News',
      isSaved: true,
    })
  })

  it('filters by saved reaction and local user', async () => {
    mockFindMany.mockResolvedValue([])

    await getSavedItems()

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          feedback: {
            some: { reaction: 'saved', userId: 'local' },
          },
        },
      }),
    )
  })

  it('returns items ordered by publishedAt descending', async () => {
    mockFindMany.mockResolvedValue([])

    await getSavedItems()

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { publishedAt: 'desc' },
      }),
    )
  })

  it('returns empty array when nothing is saved', async () => {
    mockFindMany.mockResolvedValue([])

    const result = await getSavedItems()

    expect(result).toEqual([])
  })

  it('maps null summary and author correctly', async () => {
    mockFindMany.mockResolvedValue([makeRow({ summary: null, author: null })])

    const result = await getSavedItems()

    expect(result[0].summary).toBeNull()
    expect(result[0].author).toBeNull()
  })
})
