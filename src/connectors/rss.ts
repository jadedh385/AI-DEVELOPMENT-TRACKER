/**
 * Generic RSS/Atom connector — Stage 1.3.
 *
 * Fetches any RSS or Atom feed and maps items to the common `NormalizedItem`
 * shape. No keyword filtering is applied: RSS sources (lab blogs) are already
 * focused, so every item is surfaced. Dedupe/DB writes are handled downstream.
 */
import Parser from 'rss-parser'
import type { Connector, NormalizedItem, SourceInput } from '@/connectors/types'

/** The subset of rss-parser's output that this connector depends on. */
export interface RssItem {
  title?: string
  link?: string
  contentSnippet?: string
  creator?: string
  isoDate?: string
  pubDate?: string
}

const parser = new Parser<Record<string, unknown>, RssItem>({
  headers: { 'User-Agent': 'AI-Landscape-Signal/1.0' },
})

/** Maps raw RSS items to `NormalizedItem`, dropping invalid entries. */
export function parseRssItems(items: RssItem[]): NormalizedItem[] {
  const result: NormalizedItem[] = []

  for (const raw of items) {
    const title = raw.title?.trim()
    if (!title) continue

    const url = raw.link?.trim()
    if (!url) continue

    const publishedAt = raw.isoDate
      ? new Date(raw.isoDate)
      : raw.pubDate
        ? new Date(raw.pubDate)
        : new Date()

    result.push({
      title,
      url,
      summary: raw.contentSnippet?.trim() || undefined,
      author: raw.creator?.trim() || undefined,
      platform: 'rss',
      publishedAt,
    })
  }

  return result
}

export const rssConnector: Connector = {
  type: 'rss',

  async fetchItems(source: SourceInput): Promise<NormalizedItem[]> {
    const feed = await parser.parseURL(source.url)
    return parseRssItems(feed.items)
  },
}
