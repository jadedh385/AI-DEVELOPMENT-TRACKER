import type { FeedItem } from '@/lib/items'
import { formatRelativeTime } from '@/lib/format'

interface ItemCardProps {
  item: FeedItem
}

/**
 * One feed card: the signpost. Headline links out to the canonical source; the
 * card itself holds no article body (§5.4 signpost-not-reader). Whole card is a
 * ≥44px touch target that opens the source in a new tab.
 */
export function ItemCard({ item }: ItemCardProps) {
  const timeAgo = formatRelativeTime(item.publishedAt)

  return (
    <article className="border-b border-zinc-200 py-4 dark:border-zinc-800">
      <a
        href={item.canonicalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block min-h-[44px]"
      >
        <h2 className="text-lg font-semibold leading-snug text-zinc-900 group-hover:underline dark:text-zinc-50">
          {item.title}
        </h2>
        {item.summary ? (
          <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {item.summary}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-500">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {item.sourceName}
          </span>
          <span aria-hidden>·</span>
          <span className="capitalize">{item.platform}</span>
          {item.author ? (
            <>
              <span aria-hidden>·</span>
              <span>{item.author}</span>
            </>
          ) : null}
          <span aria-hidden>·</span>
          <time dateTime={item.publishedAt.toISOString()}>{timeAgo}</time>
        </div>
      </a>
    </article>
  )
}
