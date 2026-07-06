/**
 * Hacker News connector — Stage 1.1.
 *
 * Uses the public Algolia HN Search API (`search_by_date`, no key, a compliant
 * read API — no scraping). Fetches recent AI-relevant stories, validates the
 * payload with Zod at the boundary, and maps hits to the common
 * `NormalizedItem` shape. Dedupe/DB writes are handled downstream.
 */
import { z } from 'zod'
import type { Connector, NormalizedItem, SourceInput } from '@/connectors/types'

/** Min points for a story to count as signal (Stage 1.1 lock). */
export const HN_MIN_POINTS = 20
/** Recency window: only stories from the last N hours. */
export const HN_WINDOW_HOURS = 48
/** Finite feed: cap the number of stories pulled per run. */
export const HN_MAX_STORIES = 30

const SECONDS_PER_HOUR = 3600
const HN_ITEM_PERMALINK = 'https://news.ycombinator.com/item?id='

/**
 * Builds the Algolia `search_by_date` request URL for a source. `now` is
 * injectable so the recency window is deterministic under test.
 */
export function buildSearchUrl(
  source: SourceInput,
  now: Date = new Date(),
): string {
  const keywords = source.keywordFilters ?? []
  const query = keywords.join(' ')
  const nowSeconds = Math.floor(now.getTime() / 1000)
  const since = nowSeconds - HN_WINDOW_HOURS * SECONDS_PER_HOUR

  const url = new URL(source.url)
  url.searchParams.set('query', query)
  // Make every keyword optional so a story matching ANY term is returned.
  url.searchParams.set('optionalWords', query)
  url.searchParams.set('tags', 'story')
  url.searchParams.set(
    'numericFilters',
    `points>=${HN_MIN_POINTS},created_at_i>=${since}`,
  )
  url.searchParams.set('hitsPerPage', String(HN_MAX_STORIES))
  return url.toString()
}

// Algolia returns many fields; we validate only the ones we consume and ignore
// the rest. Nullable because Ask/Show HN posts omit `url`, and older records
// occasionally omit points/author.
const hitSchema = z.object({
  objectID: z.string(),
  title: z.string().nullish(),
  url: z.string().nullish(),
  author: z.string().nullish(),
  points: z.number().nullish(),
  created_at_i: z.number(),
})

const responseSchema = z.object({
  hits: z.array(hitSchema),
})

type AlgoliaHit = z.infer<typeof hitSchema>

function toNormalizedItem(hit: AlgoliaHit): NormalizedItem {
  return {
    title: (hit.title ?? '').trim(),
    // Signpost target: the external URL when present, else the HN discussion.
    url: hit.url?.trim() || `${HN_ITEM_PERMALINK}${hit.objectID}`,
    author: hit.author ?? undefined,
    platform: 'hackernews',
    publishedAt: new Date(hit.created_at_i * 1000),
  }
}

/**
 * Validates a raw Algolia response and maps it to normalized items. Throws on a
 * malformed payload so bad data never reaches the DB. Hits without a usable
 * title are dropped (not thrown) — one junk row shouldn't fail a whole batch.
 */
export function parseAlgoliaResponse(payload: unknown): NormalizedItem[] {
  const parsed = responseSchema.safeParse(payload)
  if (!parsed.success) {
    throw new Error(
      `Malformed Algolia HN response: ${parsed.error.issues
        .map((issue) => issue.message)
        .join('; ')}`,
    )
  }

  return parsed.data.hits
    .map(toNormalizedItem)
    .filter((item) => item.title.length > 0)
}

/** The Stage 1.1 Hacker News connector. */
export const hackernewsConnector: Connector = {
  type: 'hn',
  async fetchItems(source: SourceInput): Promise<NormalizedItem[]> {
    const url = buildSearchUrl(source)
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(
        `Algolia HN request failed: ${response.status} ${response.statusText}`,
      )
    }

    const payload: unknown = await response.json()
    return parseAlgoliaResponse(payload)
  },
}
