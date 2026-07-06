/**
 * Source registry — Stage 1.3.
 *
 * Reads active Source rows from the database and projects them to `SourceInput`
 * objects the ingest pipeline can consume. This is the single place that
 * translates stored source config into runnable connector parameters, powering
 * both on-demand scripts and the Stage 1.8 scheduler.
 */
import { prisma } from '@/lib/db'
import type { SourceInput } from '@/connectors/types'
import { isSourceCategory, isSourcePlatform, isSourceType } from '@/lib/constants'

/** Returns all active sources as typed `SourceInput` objects. */
export async function getActiveSources(): Promise<SourceInput[]> {
  const rows = await prisma.source.findMany({ where: { status: 'active' } })

  const sources: SourceInput[] = []

  for (const row of rows) {
    if (!isSourceType(row.type)) continue
    if (!isSourcePlatform(row.platform)) continue
    if (!isSourceCategory(row.category)) continue

    const keywordFilters: string[] = row.keywordFilters
      ? (JSON.parse(row.keywordFilters) as string[])
      : []

    sources.push({
      id: row.id,
      type: row.type,
      url: row.url,
      platform: row.platform,
      category: row.category,
      keywordFilters,
    })
  }

  return sources
}
