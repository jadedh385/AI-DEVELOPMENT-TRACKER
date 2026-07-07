import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGetActiveSources, mockIngestSource, mockSummarizeUnsummarized } =
  vi.hoisted(() => ({
    mockGetActiveSources: vi.fn(),
    mockIngestSource: vi.fn(),
    mockSummarizeUnsummarized: vi.fn(),
  }))

vi.mock('@/lib/registry', () => ({ getActiveSources: mockGetActiveSources }))
vi.mock('@/server/ingest', () => ({ ingestSource: mockIngestSource }))
vi.mock('@/lib/summarize', () => ({
  summarizeUnsummarized: mockSummarizeUnsummarized,
}))

import { ingestAll } from '@/server/ingest-all'
import type { SourceInput } from '@/connectors/types'

function fakeSource(overrides: Partial<SourceInput> = {}): SourceInput {
  return {
    id: 'src-1',
    type: 'hn',
    url: 'https://hn.algolia.com/api/v1/search_by_date',
    platform: 'hackernews',
    category: 'community',
    ...overrides,
  }
}

describe('ingestAll', () => {
  beforeEach(() => {
    mockGetActiveSources.mockClear().mockResolvedValue([])
    mockIngestSource.mockClear().mockResolvedValue({ fetched: 5, stored: 3, skipped: 2 })
    mockSummarizeUnsummarized.mockClear().mockResolvedValue(3)
  })

  it('returns empty results when no active sources', async () => {
    const result = await ingestAll()

    expect(result).toEqual({ sources: [], errors: [], summarized: 3 })
  })

  it('processes each active source and aggregates results', async () => {
    mockGetActiveSources.mockResolvedValue([
      fakeSource({ id: 'src-hn', type: 'hn' }),
      fakeSource({ id: 'src-rss', type: 'rss', platform: 'rss', url: 'https://blog.example.com/feed.xml' }),
    ])

    const result = await ingestAll()

    expect(mockIngestSource).toHaveBeenCalledTimes(2)
    expect(result.sources).toHaveLength(2)
    expect(result.sources[0]).toEqual({ sourceId: 'src-hn', fetched: 5, stored: 3, skipped: 2 })
    expect(result.sources[1]).toEqual({ sourceId: 'src-rss', fetched: 5, stored: 3, skipped: 2 })
    expect(result.errors).toHaveLength(0)
  })

  it('skips sources with no connector (github_api, arxiv, manual)', async () => {
    mockGetActiveSources.mockResolvedValue([
      fakeSource({ id: 'src-gh', type: 'github_api' }),
      fakeSource({ id: 'src-hn', type: 'hn' }),
    ])

    const result = await ingestAll()

    expect(mockIngestSource).toHaveBeenCalledTimes(1)
    expect(result.sources).toHaveLength(1)
    expect(result.sources[0].sourceId).toBe('src-hn')
  })

  it('isolates per-source errors without stopping other sources', async () => {
    mockGetActiveSources.mockResolvedValue([
      fakeSource({ id: 'src-broken', type: 'hn' }),
      fakeSource({ id: 'src-ok', type: 'rss', platform: 'rss', url: 'https://blog.example.com/feed.xml' }),
    ])
    mockIngestSource
      .mockRejectedValueOnce(new Error('network timeout'))
      .mockResolvedValueOnce({ fetched: 5, stored: 5, skipped: 0 })

    const result = await ingestAll()

    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toEqual({ sourceId: 'src-broken', error: 'network timeout' })
    expect(result.sources).toHaveLength(1)
    expect(result.sources[0].sourceId).toBe('src-ok')
  })

  it('calls summarizeUnsummarized after all ingests and includes the count', async () => {
    mockGetActiveSources.mockResolvedValue([fakeSource()])
    mockSummarizeUnsummarized.mockResolvedValue(7)

    const result = await ingestAll()

    expect(mockSummarizeUnsummarized).toHaveBeenCalledTimes(1)
    expect(result.summarized).toBe(7)
  })

  it('still calls summarizeUnsummarized even when all sources error', async () => {
    mockGetActiveSources.mockResolvedValue([fakeSource()])
    mockIngestSource.mockRejectedValue(new Error('boom'))

    const result = await ingestAll()

    expect(mockSummarizeUnsummarized).toHaveBeenCalledTimes(1)
    expect(result.errors).toHaveLength(1)
    expect(result.summarized).toBe(3)
  })
})
