import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getActiveSources } from '@/lib/registry'

vi.mock('@/lib/db', () => ({
  prisma: {
    source: {
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/db'

const mockFindMany = vi.mocked(prisma.source.findMany)

function sourceRow(overrides = {}) {
  return {
    id: 'src_1',
    name: 'Hacker News (AI)',
    category: 'community',
    platform: 'hackernews',
    type: 'hn',
    url: 'https://hn.algolia.com/api/v1/search_by_date',
    weight: 1,
    refreshFrequency: 'daily',
    keywordFilters: JSON.stringify(['AI', 'LLM']),
    status: 'active',
    qualityScore: null,
    createdAt: new Date('2026-07-06T00:00:00.000Z'),
    updatedAt: new Date('2026-07-06T00:00:00.000Z'),
    ...overrides,
  }
}

describe('getActiveSources', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns active sources as SourceInput objects', async () => {
    mockFindMany.mockResolvedValue([sourceRow()])

    const sources = await getActiveSources()

    expect(sources).toHaveLength(1)
    expect(sources[0]).toMatchObject({
      id: 'src_1',
      type: 'hn',
      url: 'https://hn.algolia.com/api/v1/search_by_date',
      platform: 'hackernews',
      category: 'community',
      keywordFilters: ['AI', 'LLM'],
    })
  })

  it('queries only active sources', async () => {
    mockFindMany.mockResolvedValue([])

    await getActiveSources()

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'active' } }),
    )
  })

  it('returns empty keywordFilters when the column is null', async () => {
    mockFindMany.mockResolvedValue([sourceRow({ keywordFilters: null })])

    const [source] = await getActiveSources()

    expect(source.keywordFilters).toEqual([])
  })

  it('returns an empty array when no active sources exist', async () => {
    mockFindMany.mockResolvedValue([])

    const sources = await getActiveSources()

    expect(sources).toEqual([])
  })
})
