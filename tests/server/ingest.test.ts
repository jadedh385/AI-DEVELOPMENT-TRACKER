import { describe, it, expect } from 'vitest'
import { ingestSource } from '@/server/ingest'
import type { ItemStore, NewItemRecord } from '@/server/ingest'
import type {
  Connector,
  NormalizedItem,
  SourceInput,
} from '@/connectors/types'
import { computeDedupeHash } from '@/lib/dedupe'

const source: SourceInput = {
  id: 'src_hn',
  type: 'hn',
  url: 'https://hn.algolia.com/api/v1/search_by_date',
  platform: 'hackernews',
  keywordFilters: ['AI'],
}

function item(overrides: Partial<NormalizedItem> = {}): NormalizedItem {
  return {
    title: 'A story',
    url: 'https://example.com/a',
    platform: 'hackernews',
    publishedAt: new Date('2026-07-06T00:00:00Z'),
    ...overrides,
  }
}

function fakeConnector(items: NormalizedItem[]): Connector {
  return { type: 'hn', fetchItems: async () => items }
}

/** In-memory store that records inserts and can pre-seed "existing" hashes. */
function fakeStore(existing: Set<string> = new Set()) {
  const inserted: NewItemRecord[] = []
  const store: ItemStore = {
    findExistingHashes: async (hashes) =>
      new Set(hashes.filter((h) => existing.has(h))),
    insertMany: async (records) => {
      inserted.push(...records)
      return records.length
    },
  }
  return { store, inserted }
}

describe('ingestSource', () => {
  it('stores new items and reports counts', async () => {
    const { store, inserted } = fakeStore()

    const result = await ingestSource(
      fakeConnector([
        item({ url: 'https://example.com/a' }),
        item({ url: 'https://example.com/b' }),
      ]),
      source,
      store,
    )

    expect(result).toEqual({ fetched: 2, stored: 2, skipped: 0 })
    expect(inserted).toHaveLength(2)
    expect(inserted[0]).toMatchObject({
      sourceId: 'src_hn',
      canonicalUrl: 'https://example.com/a',
      platform: 'hackernews',
    })
    expect(inserted[0].dedupeHash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('collapses in-batch duplicates before storing', async () => {
    const { store } = fakeStore()

    const result = await ingestSource(
      fakeConnector([
        item({ title: 'first', url: 'https://example.com/dup' }),
        item({ title: 'dup', url: 'https://example.com/dup' }),
        item({ title: 'unique', url: 'https://example.com/u' }),
      ]),
      source,
      store,
    )

    expect(result).toEqual({ fetched: 3, stored: 2, skipped: 1 })
  })

  it('skips items whose hash already exists in the store', async () => {
    const existingHash = computeDedupeHash(item({ url: 'https://example.com/a' }))
    const { store, inserted } = fakeStore(new Set([existingHash]))

    const result = await ingestSource(
      fakeConnector([
        item({ url: 'https://example.com/a' }), // already stored
        item({ url: 'https://example.com/new' }),
      ]),
      source,
      store,
    )

    expect(result).toEqual({ fetched: 2, stored: 1, skipped: 1 })
    expect(inserted).toHaveLength(1)
    expect(inserted[0].canonicalUrl).toBe('https://example.com/new')
  })

  it('handles an empty fetch', async () => {
    const { store } = fakeStore()

    const result = await ingestSource(fakeConnector([]), source, store)

    expect(result).toEqual({ fetched: 0, stored: 0, skipped: 0 })
  })
})
