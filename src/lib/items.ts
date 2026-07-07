/**
 * Feed reads. Keeps the feed finite (§6.4): a bounded, recency-ordered list
 * with a clear end, not an infinite stream.
 */
import { prisma } from '@/lib/db'

/** Hard cap on feed length — the feed must be completable. */
export const FEED_LIMIT = 50

/** A feed row shaped for the reader UI (signpost fields + source name). */
export interface FeedItem {
  id: string
  title: string
  canonicalUrl: string
  summary: string | null
  author: string | null
  platform: string
  category: string
  publishedAt: Date
  sourceName: string
  isSaved: boolean
}

/** Most-recent-first, capped. Includes saved status for the local user. */
export async function getFeedItems(): Promise<FeedItem[]> {
  const rows = await prisma.item.findMany({
    orderBy: { publishedAt: 'desc' },
    take: FEED_LIMIT,
    include: {
      source: { select: { name: true } },
      feedback: {
        where: { reaction: 'saved', userId: 'local' },
        select: { id: true },
      },
    },
  })

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    canonicalUrl: row.canonicalUrl,
    summary: row.summary,
    author: row.author,
    platform: row.platform,
    category: row.category,
    publishedAt: row.publishedAt,
    sourceName: row.source.name,
    isSaved: row.feedback.length > 0,
  }))
}
