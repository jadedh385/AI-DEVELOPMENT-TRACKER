/**
 * Validated string domains for the data model.
 *
 * SQLite has no native enum type, so "enum" columns are stored as strings and
 * validated in application code against these unions. Keeping the canonical
 * values here (single source of truth) also keeps them portable to Postgres.
 */

export const SOURCE_TYPES = [
  'rss',
  'reddit_json',
  'github_api',
  'hn',
  'arxiv',
  'manual',
] as const
export type SourceType = (typeof SOURCE_TYPES)[number]

export const SOURCE_PLATFORMS = [
  'hackernews',
  'reddit',
  'rss',
  'github',
  'arxiv',
  'x',
  'linkedin',
  'manual',
] as const
export type SourcePlatform = (typeof SOURCE_PLATFORMS)[number]

export const SOURCE_CATEGORIES = [
  'research',
  'products',
  'models',
  'companies',
  'people',
  'community',
  'conferences',
] as const
export type SourceCategory = (typeof SOURCE_CATEGORIES)[number]

export const SOURCE_STATUSES = ['active', 'paused'] as const
export type SourceStatus = (typeof SOURCE_STATUSES)[number]

export const REFRESH_FREQUENCIES = ['daily', 'twice_daily'] as const
export type RefreshFrequency = (typeof REFRESH_FREQUENCIES)[number]

export const FEEDBACK_REACTIONS = [
  'helpful',
  'not_relevant',
  'saved',
  'opened',
] as const
export type FeedbackReaction = (typeof FEEDBACK_REACTIONS)[number]

/** Builds a type guard that checks membership in a readonly string union. */
function makeGuard<T extends readonly string[]>(values: T) {
  const set: ReadonlySet<string> = new Set(values)
  return (value: unknown): value is T[number] =>
    typeof value === 'string' && set.has(value)
}

/**
 * Curated AI terms used to filter a keyword-search source (e.g. the Algolia HN
 * API) down to AI-relevant stories. Stored as a source's `keywordFilters` so it
 * is tunable per-source at runtime; this is only the seed default.
 */
export const DEFAULT_AI_KEYWORDS = [
  'AI',
  'artificial intelligence',
  'LLM',
  'GPT',
  'Claude',
  'Anthropic',
  'OpenAI',
  'Gemini',
  'machine learning',
  'neural network',
  'transformer',
  'diffusion',
  'agent',
  'fine-tuning',
  'inference',
] as const

export const isSourceType = makeGuard(SOURCE_TYPES)
export const isSourcePlatform = makeGuard(SOURCE_PLATFORMS)
export const isSourceCategory = makeGuard(SOURCE_CATEGORIES)
export const isSourceStatus = makeGuard(SOURCE_STATUSES)
export const isRefreshFrequency = makeGuard(REFRESH_FREQUENCIES)
export const isFeedbackReaction = makeGuard(FEEDBACK_REACTIONS)
