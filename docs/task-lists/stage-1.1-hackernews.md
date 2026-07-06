# Stage 1.1 — Hacker News Vertical Slice

**Status:** Awaiting GATE 1 (connector contract + task list). No code until approved.
**Goal:** Prove the full pipeline on one source: fetch HN → normalize → dedupe → store (SQLite) → render feed → click through to source.

## Locked decisions (Stage 1.1 Preference Gate, 2026-07-06)

| Decision | Choice |
|---|---|
| AI selection | **Algolia keyword search** — curated AI terms + `tags=story` + min-points floor; keyword list stored in the source's `keywordFilters` so it's tunable. |
| Feed size / window | **Last 48h, top ~30 stories, min 20 points.** Finite, high-signal. |
| Trigger | **On-demand script `npm run ingest:hn`** — becomes the Stage 1.8 scheduler's callee (no throwaway code). |

**API:** Algolia HN Search — `https://hn.algolia.com/api/v1/search_by_date` (recency), params `query`, `tags=story`, `numericFilters=points>=20,created_at_i>=<ts>`, `hitsPerPage`. No key; compliant read API (no scraping).

## Connector contract (the GATE 1 lock — sources 2 & 3 must conform)

```ts
// src/connectors/types.ts
export interface NormalizedItem {
  title: string
  url: string            // -> Item.canonicalUrl (the signpost target)
  summary?: string       // pre-LLM excerpt if available
  author?: string
  platform: SourcePlatform
  publishedAt: Date
}

// Subset of a Source registry row a connector needs (a real row from Stage 1.2).
export interface SourceInput {
  id: string
  type: SourceType
  url: string
  platform: SourcePlatform
  keywordFilters?: string[]
}

export interface Connector {
  readonly type: SourceType
  fetchItems(source: SourceInput): Promise<NormalizedItem[]>
}
```

- Connectors return `NormalizedItem[]` **without** `dedupeHash`. A shared util computes the hash and de-dupes, keeping that logic in one place for all sources.
- All external I/O validated with **Zod** at the boundary; malformed payloads never reach the DB.

## Task list (TDD — test first each step)

1. `src/connectors/types.ts` — the contract above.
2. `src/lib/dedupe.ts` — `computeDedupeHash(item)` (sha256 of canonical URL; fallback `title|platform`) + `dedupeBatch(items)`. **Tests:** stable hash, URL-vs-fallback, collapses dupes.
3. `src/connectors/hackernews.ts` — build query from keywords + numericFilters; `fetch` the Algolia API; Zod-validate; map hits → `NormalizedItem`. **Tests:** parses a sample payload; handles malformed/empty; builds correct query params.
4. `src/lib/constants.ts` — add `DEFAULT_AI_KEYWORDS` (AI, LLM, GPT, Claude, Anthropic, OpenAI, model, agent, neural, diffusion, transformer…).
5. `src/server/ingest.ts` — `ingestSource(connector, source)`: fetch → dedupe → upsert into DB skipping existing `dedupeHash`; returns `{ fetched, stored, skipped }`. **Tests:** stores new, skips duplicates.
6. `scripts/ingest-hn.ts` + `"ingest:hn"` script (via `tsx`) — seed HN `SourceInput` (moves to a registry row in 1.2), run ingest, log summary.
7. `src/lib/items.ts` — `getFeedItems()` (recency order, capped). Feed page (`src/app/page.tsx`) becomes a server component listing real items: title → source link, platform, timestamp; empty-state preserved.

## Deliverable

`npm run ingest:hn` pulls real HN AI stories into SQLite; `npm run dev` shows them in the feed; each links out to the HN/source URL. ≥80% coverage on new logic; connector has parse + malformed tests.

## New dependencies

- `zod` (boundary validation), `tsx` (run the TS ingest script). Both added at implementation start.
