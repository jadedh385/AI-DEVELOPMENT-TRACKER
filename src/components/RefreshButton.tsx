'use client'
import { useTransition, useState } from 'react'
import { refreshFeed } from '@/app/actions/refresh'

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ago`
}

export function RefreshButton() {
  const [isPending, startTransition] = useTransition()
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleRefresh() {
    setError(null)
    startTransition(async () => {
      const result = await refreshFeed()
      if (result.success) {
        setLastRefreshed(new Date())
      } else {
        setError(result.error ?? 'Refresh failed')
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleRefresh}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        {isPending && (
          <svg
            className="h-3.5 w-3.5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
          </svg>
        )}
        {isPending ? 'Refreshing…' : 'Refresh'}
      </button>
      {lastRefreshed && !isPending && (
        <span className="text-xs text-zinc-400 dark:text-zinc-600">
          Updated {formatTimeAgo(lastRefreshed)}
        </span>
      )}
      {error && !isPending && (
        <span className="text-xs text-red-500 dark:text-red-400">{error}</span>
      )}
    </div>
  )
}
