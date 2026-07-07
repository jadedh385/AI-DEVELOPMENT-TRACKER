export default function Loading() {
  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <div className="h-4 w-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-3 h-7 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-2 h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </header>

        <ul className="space-y-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="border-b border-zinc-200 py-4 dark:border-zinc-800">
              <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="mt-3 flex gap-2">
                <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
