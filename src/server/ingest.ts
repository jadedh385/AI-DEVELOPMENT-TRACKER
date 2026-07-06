/**
 * Ingest orchestrator — the shared fetch → dedupe → store path for every
 * source. Stage 1.8's scheduler will call `ingestSource` per registry row; the
 * on-demand `ingest:hn` script calls it now.
 *
 * The DB write path is behind an `ItemStore` interface so the orchestration is
 * unit-testable without a live database. The default store is Prisma-backed.
 */
import { prisma } from '@/lib/db'
import { dedupeBatch } from '@/lib/dedupe'
import type { Connector, SourceInput } from '@/connectors/types'

/** A row ready to persist to the `Item` table. */
export interface NewItemRecord {
  sourceId: string
  title: string
  canonicalUrl: string
  summary?: string
  author?: string
  platform: string
  publishedAt: Date
  dedupeHash: string
}

/** Storage boundary the orchestrator depends on (Prisma in production). */
export interface ItemStore {
  /** Returns the subset of the given hashes already present in storage. */
  findExistingHashes(hashes: string[]): Promise<Set<string>>
  /** Persists records, returning how many were actually inserted. */
  insertMany(records: NewItemRecord[]): Promise<number>
}

/** Outcome of one ingest run, for logging and the scheduler. */
export interface IngestResult {
  fetched: number
  stored: number
  skipped: number
}

/** Prisma-backed store; created lazily so tests never touch the DB. */
export function createPrismaItemStore(): ItemStore {
  return {
    async findExistingHashes(hashes) {
      if (hashes.length === 0) return new Set()
      const rows = await prisma.item.findMany({
        where: { dedupeHash: { in: hashes } },
        select: { dedupeHash: true },
      })
      return new Set(rows.map((row) => row.dedupeHash))
    },
    async insertMany(records) {
      if (records.length === 0) return 0
      // Existing hashes are already filtered upstream; SQLite's createMany does
      // not support skipDuplicates, and the unique `dedupeHash` index is the
      // final backstop.
      const result = await prisma.item.createMany({ data: records })
      return result.count
    },
  }
}

/**
 * Fetches a source, de-duplicates the batch, drops items already stored, and
 * persists the rest. Returns counts. `store` is injectable for testing.
 */
export async function ingestSource(
  connector: Connector,
  source: SourceInput,
  store: ItemStore = createPrismaItemStore(),
): Promise<IngestResult> {
  const items = await connector.fetchItems(source)
  const fetched = items.length

  const hashed = dedupeBatch(items)
  const existing = await store.findExistingHashes(
    hashed.map((entry) => entry.dedupeHash),
  )

  const records: NewItemRecord[] = hashed
    .filter((entry) => !existing.has(entry.dedupeHash))
    .map((entry) => ({
      sourceId: source.id,
      title: entry.item.title,
      canonicalUrl: entry.item.url,
      summary: entry.item.summary,
      author: entry.item.author,
      platform: entry.item.platform,
      publishedAt: entry.item.publishedAt,
      dedupeHash: entry.dedupeHash,
    }))

  const stored = await store.insertMany(records)

  return { fetched, stored, skipped: fetched - stored }
}
