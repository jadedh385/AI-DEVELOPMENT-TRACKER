/**
 * Reddit connector — Stage 1.2.
 *
 * Reddit's public JSON API (.json) is blocked without OAuth since 2023.
 * This connector uses Reddit's Atom RSS feed instead, which remains open for
 * public subreddits. Fetches the hot posts feed, validates entries, and maps
 * them to the common `NormalizedItem` shape. Keyword filtering is applied
 * post-fetch (the RSS feed has no server-side keyword search).
 * Dedupe/DB writes are handled downstream.
 */
import Parser from 'rss-parser'
import type { Connector, NormalizedItem, SourceInput } from '@/connectors/types'

/** Finite feed: cap the number of posts pulled per run. */
export const REDDIT_MAX_POSTS = 30

const REDDIT_BASE = 'https://www.reddit.com'

const parser = new Parser({
  // Reddit requires a descriptive User-Agent; generic ones are rate-limited or blocked.
  headers: { 'User-Agent': 'AI-Landscape-Signal/1.0' },
})

/**
 * Builds the Reddit Atom feed URL for a source. Appends `?limit` as a query
 * param — the source URL is stored without query strings (e.g.
 * `https://www.reddit.com/r/MachineLearning+artificial/hot.rss`).
 */
export function buildFetchUrl(source: SourceInput): string {
  const url = new URL(source.url)
  url.searchParams.set('limit', String(REDDIT_MAX_POSTS))
  return url.toString()
}

/**
 * For external link posts Reddit embeds the target URL as the `[link]` anchor
 * inside the entry's content HTML. Self-posts use the Reddit comments URL for
 * both `[link]` and `[comments]`. We prefer the external URL when available.
 */
function extractExternalUrl(content: string | undefined, fallback: string): string {
  if (!content) return fallback
  const match = content.match(/href="([^"]+)">\[link\]/)
  const href = match?.[1]
  if (href && href.startsWith('http') && !href.includes('/r/')) {
    return href
  }
  return fallback
}

function matchesAnyKeyword(title: string, keywords: string[]): boolean {
  if (keywords.length === 0) return true
  const lower = title.toLowerCase()
  return keywords.some((kw) => lower.includes(kw.toLowerCase()))
}

export type AtomEntry = Parser.Item

/**
 * Maps parsed Atom entries to normalized items. Items without a usable title
 * or that don't match any keyword filter are dropped (not thrown).
 */
export function parseAtomItems(
  entries: AtomEntry[],
  options: { keywordFilters?: string[] } = {},
): NormalizedItem[] {
  const { keywordFilters = [] } = options

  return entries
    .filter((entry) => (entry.title ?? '').trim().length > 0)
    .filter((entry) => matchesAnyKeyword(entry.title ?? '', keywordFilters))
    .map((entry) => ({
      title: (entry.title ?? '').trim(),
      url: extractExternalUrl(entry.content, entry.link ?? REDDIT_BASE),
      // `creator` comes from dc:creator (RSS 2.0) or author name if rss-parser maps it.
      author: entry.creator?.replace(/^\/u\//, '') || undefined,
      platform: 'reddit' as const,
      publishedAt: entry.isoDate
        ? new Date(entry.isoDate)
        : new Date(entry.pubDate ?? 0),
    }))
}

/** The Stage 1.2 Reddit connector (Atom/RSS transport). */
export const redditConnector: Connector = {
  type: 'rss',
  async fetchItems(source: SourceInput): Promise<NormalizedItem[]> {
    const url = buildFetchUrl(source)
    let feed: Awaited<ReturnType<typeof parser.parseURL>>

    try {
      feed = await parser.parseURL(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      throw new Error(`Reddit RSS request failed: ${message}`)
    }

    return parseAtomItems(feed.items, { keywordFilters: source.keywordFilters })
  },
}
