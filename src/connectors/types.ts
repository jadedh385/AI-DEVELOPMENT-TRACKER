/**
 * The connector contract (Stage 1.1 GATE 1 lock).
 *
 * Every source type implements `Connector`. Connectors are responsible only for
 * fetching a source's raw payload and mapping it to `NormalizedItem[]`. They do
 * NOT compute the dedupe hash or touch the database — a shared util
 * (`src/lib/dedupe.ts`) owns hashing/de-duplication so that logic lives in one
 * place across all sources. Sources 2 & 3 (Reddit, RSS) must conform to this.
 */
import type { SourcePlatform, SourceType } from '@/lib/constants'

/**
 * The common shape every source normalizes to before storage. Deliberately
 * excludes `dedupeHash` — that is derived downstream, not by the connector.
 */
export interface NormalizedItem {
  title: string
  /** The signpost target → persisted as `Item.canonicalUrl`. */
  url: string
  /** Pre-LLM excerpt if the source provides one. */
  summary?: string
  author?: string
  platform: SourcePlatform
  publishedAt: Date
}

/**
 * The subset of a Source registry row a connector needs to fetch. In Stage 1.2
 * this is projected from a real DB row; for now it is seeded by the ingest
 * script.
 */
export interface SourceInput {
  id: string
  type: SourceType
  url: string
  platform: SourcePlatform
  keywordFilters?: string[]
}

/** A source-type-specific fetcher that yields normalized (un-hashed) items. */
export interface Connector {
  readonly type: SourceType
  fetchItems(source: SourceInput): Promise<NormalizedItem[]>
}
