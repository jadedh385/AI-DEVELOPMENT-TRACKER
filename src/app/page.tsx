import Link from 'next/link'
import { getFeedItems } from '@/lib/items'
import { ItemCard } from '@/components/ItemCard'
import { FilterBar } from '@/components/FilterBar'
import { RefreshButton } from '@/components/RefreshButton'
import { SOURCE_PLATFORMS, SOURCE_CATEGORIES } from '@/lib/constants'

// Always reflect the latest ingested items rather than a build-time snapshot.
export const dynamic = 'force-dynamic'

interface HomeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parseParam(value: string | string[] | undefined): string[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const activePlatforms = parseParam(params.platform)
  const activeCategories = parseParam(params.category)

  const items = await getFeedItems({
    platforms: activePlatforms,
    categories: activeCategories,
  })

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              AI Landscape Signal
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              What happened in AI, and where to read more.
            </p>
          </div>
          <div className="flex flex-shrink-0 items-start gap-2">
            <RefreshButton />
            <Link
              href="/saved"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              Saved
            </Link>
          </div>
        </header>

        <FilterBar
          platforms={[...SOURCE_PLATFORMS].filter((p) =>
            ['hackernews', 'reddit', 'rss', 'github', 'arxiv'].includes(p),
          )}
          categories={[...SOURCE_CATEGORIES]}
          activePlatforms={activePlatforms}
          activeCategories={activeCategories}
        />

        {items.length === 0 ? (
          <EmptyState hasFilters={activePlatforms.length > 0 || activeCategories.length > 0} />
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

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {hasFilters ? 'No items match the selected filters.' : 'No items yet.'}
      </p>
      {!hasFilters && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          Hit <strong>Refresh</strong> to pull the latest stories.
        </p>
      )}
    </div>
  )
}
