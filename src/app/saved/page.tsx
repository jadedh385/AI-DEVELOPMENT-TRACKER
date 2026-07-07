import Link from 'next/link'
import { getSavedItems } from '@/lib/save'
import { ItemCard } from '@/components/ItemCard'

export const dynamic = 'force-dynamic'

export default async function SavedPage() {
  const items = await getSavedItems()

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              aria-label="Back to feed"
            >
              ← Feed
            </Link>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Saved
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Items you&apos;ve bookmarked.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Nothing saved yet.</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
              Tap the bookmark on any item to save it here.
            </p>
          </div>
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
              That&apos;s everything you&apos;ve saved.
            </p>
          </>
        )}
      </main>
    </div>
  )
}
