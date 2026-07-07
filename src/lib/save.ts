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
      feedback: { where: { userId: 'local' }, select: { reaction: true } },
    },
  })

  return rows.map((row) => {
    const reactions = new Set(row.feedback.map((f) => f.reaction))
    return {
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
      isHelpful: reactions.has('helpful'),
      isNotRelevant: reactions.has('not_relevant'),
    }
  })
}
