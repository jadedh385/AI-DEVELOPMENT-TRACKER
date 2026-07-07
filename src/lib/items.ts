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

/** Active filter dimensions. Empty arrays mean "no filter on that dimension". */
export interface FeedFilters {
  platforms?: string[]
  categories?: string[]
}

function buildWhere(filters: FeedFilters) {
  const platformClause =
    filters.platforms && filters.platforms.length > 0
      ? { platform: { in: filters.platforms } }
      : {}

  const categoryClause =
    filters.categories && filters.categories.length > 0
      ? { category: { in: filters.categories } }
      : {}

  const where = { ...platformClause, ...categoryClause }
  return Object.keys(where).length > 0 ? where : undefined
}

/** Most-recent-first, capped. Includes saved status for the local user. */
export async function getFeedItems(filters: FeedFilters = {}): Promise<FeedItem[]> {
  const rows = await prisma.item.findMany({
    where: buildWhere(filters),
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
