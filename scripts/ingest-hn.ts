/**
 * On-demand Hacker News ingest — `npm run ingest:hn`.
 *
 * Ensures a HN source registry row exists (Stage 1.2 will manage these via UI),
 * projects it to a `SourceInput`, and runs the shared ingest pipeline. This is
 * production-grade: Stage 1.8's scheduler reuses `ingestSource`, not this file's
 * CLI wrapper.
 */
import { prisma } from '@/lib/db'
import { DEFAULT_AI_KEYWORDS } from '@/lib/constants'
import { hackernewsConnector } from '@/connectors/hackernews'
import { ingestSource } from '@/server/ingest'
import type { SourceInput } from '@/connectors/types'

const HN_ALGOLIA_ENDPOINT = 'https://hn.algolia.com/api/v1/search_by_date'

async function ensureHackerNewsSource(): Promise<SourceInput> {
  const keywords = [...DEFAULT_AI_KEYWORDS]

  const source = await prisma.source.upsert({
    where: { type_url: { type: 'hn', url: HN_ALGOLIA_ENDPOINT } },
    create: {
      name: 'Hacker News (AI)',
      category: 'community',
      platform: 'hackernews',
      type: 'hn',
      url: HN_ALGOLIA_ENDPOINT,
      keywordFilters: JSON.stringify(keywords),
    },
    update: {},
  })

  const parsedKeywords: string[] = source.keywordFilters
    ? (JSON.parse(source.keywordFilters) as string[])
    : keywords

  return {
    id: source.id,
    type: 'hn',
    url: source.url,
    platform: 'hackernews',
    keywordFilters: parsedKeywords,
  }
}

async function main(): Promise<void> {
  const source = await ensureHackerNewsSource()
  const result = await ingestSource(hackernewsConnector, source)

  console.info(
    `[ingest:hn] fetched=${result.fetched} stored=${result.stored} skipped=${result.skipped}`,
  )
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[ingest:hn] failed: ${message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
