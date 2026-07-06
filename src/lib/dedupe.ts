/**
 * Shared de-duplication for all connectors.
 *
 * Connectors return `NormalizedItem[]` without a hash; this module owns the one
 * canonical way to identify "the same story" so every source dedupes
 * identically — both within a single fetch and across sources over time (the DB
 * enforces a unique `dedupeHash`).
 */
import { createHash } from 'node:crypto'
import type { NormalizedItem } from '@/connectors/types'

/** A normalized item paired with its computed content hash, ready to store. */
export interface HashedItem {
  item: NormalizedItem
  dedupeHash: string
}

/**
 * Deterministic identity for an item: sha256 of its canonical URL, falling back
 * to `title|platform` when the URL is missing (some sources are URL-less). The
 * fallback is namespaced so an empty-URL item can never collide with a real
 * URL hash.
 */
export function computeDedupeHash(item: NormalizedItem): string {
  const url = item.url.trim()
  const basis = url.length > 0 ? url : `fallback:${item.title}|${item.platform}`
  return createHash('sha256').update(basis).digest('hex')
}

/**
 * Collapses items that resolve to the same hash, preserving input order and
 * keeping the first occurrence. Returns each survivor with its hash attached so
 * callers never recompute it.
 */
export function dedupeBatch(items: readonly NormalizedItem[]): HashedItem[] {
  const seen = new Set<string>()
  const result: HashedItem[] = []

  for (const item of items) {
    const dedupeHash = computeDedupeHash(item)
    if (seen.has(dedupeHash)) continue
    seen.add(dedupeHash)
    result.push({ item, dedupeHash })
  }

  return result
}
