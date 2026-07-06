import { getFeedItems } from '@/lib/items'
import { ItemCard } from '@/components/ItemCard'

// Always reflect the latest ingested items rather than a build-time snapshot.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const items = await getFeedItems()

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            AI Landscape Signal
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            What happened in AI, and where to read more.
          </p>
        </header>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <ItemCard item={item} />
                </li>
              ))}
            </ul>
            <p className="py-8 text-center text-xs text-zinc-400 dark:text-zinc-600">
              You&apos;re all caught up.
            </p>
          </>
        )}
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No items yet.
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
        Run <code className="font-mono">npm run ingest:hn</code> to pull the
        latest Hacker News AI stories.
      </p>
    </div>
  )
}
