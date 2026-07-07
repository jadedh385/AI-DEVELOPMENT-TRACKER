import { prisma } from '@/lib/db'
import type { FeedItem } from '@/lib/items'

export async function getSavedItems(): Promise<FeedItem[]> {
  const rows = await prisma.item.findMany({
    where: {
      feedback: {
        some: { reaction: 'saved', userId: 'local' },
      },
    },
    orderBy: { publishedAt: 'desc' },
    include: {
      source: { select: { name: true } },
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
    isSaved: true,
  }))
}
