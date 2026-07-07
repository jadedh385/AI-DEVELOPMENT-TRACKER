export default function Loading() {
  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="h-7 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </header>

        <div className="mb-6 flex gap-2">
          {[80, 96, 72, 88].map((w) => (
            <div
              key={w}
              className="h-7 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>

        <ul className="space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="border-b border-zinc-200 py-4 dark:border-zinc-800">
              <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="mt-1 h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="mt-3 flex gap-2">
                <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-5 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
