import type { FeedItem } from '@/lib/items'
import { formatRelativeTime } from '@/lib/format'
import { BookmarkButton } from '@/components/BookmarkButton'

interface ItemCardProps {
  item: FeedItem
}

const PLATFORM_LABELS: Record<string, string> = {
  hackernews: 'HN',
  reddit: 'Reddit',
  rss: 'RSS',
  github: 'GitHub',
  arxiv: 'arXiv',
  x: 'X',
  linkedin: 'LinkedIn',
  manual: 'Manual',
}

export function ItemCard({ item }: ItemCardProps) {
  const timeAgo = formatRelativeTime(item.publishedAt)
  const platformLabel = PLATFORM_LABELS[item.platform] ?? item.platform

  return (
    <article className="border-b border-zinc-200 py-4 dark:border-zinc-800">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <a
            href={item.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block min-h-[44px]"
          >
            <h2 className="text-base font-semibold leading-snug text-zinc-900 group-hover:underline dark:text-zinc-50">
              {item.title}
            </h2>
            {item.summary ? (
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {item.summary}
              </p>
            ) : null}
          </a>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-500">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {item.sourceName}
            </span>
            <span
              className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              aria-label={`Platform: ${item.platform}`}
            >
              {platformLabel}
            </span>
            {item.author ? (
              <>
                <span aria-hidden>·</span>
                <span>{item.author}</span>
              </>
            ) : null}
            <span aria-hidden>·</span>
            <time dateTime={item.publishedAt.toISOString()}>{timeAgo}</time>
          </div>
        </div>

        <div className="flex-shrink-0 pt-0.5">
          <BookmarkButton itemId={item.id} initialIsSaved={item.isSaved} />
        </div>
      </div>
    </article>
  )
}
