'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          AI Landscape Signal
        </h1>
        <div className="mt-8 rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Something went wrong loading the feed.
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
            {error.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={reset}
            className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Try again
          </button>
        </div>
      </main>
    </div>
  )
}
