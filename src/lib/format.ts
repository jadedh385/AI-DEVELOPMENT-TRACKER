/** Display formatters for the reader UI. Pure and deterministic (inject `now`). */

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

/**
 * Compact "time ago" label for a feed item, e.g. `just now`, `15m ago`,
 * `3h ago`, `2d ago`. Future timestamps clamp to `just now`.
 */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const elapsed = now.getTime() - date.getTime()

  if (elapsed < MINUTE_MS) return 'just now'
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)}m ago`
  if (elapsed < DAY_MS) return `${Math.floor(elapsed / HOUR_MS)}h ago`
  return `${Math.floor(elapsed / DAY_MS)}d ago`
}
