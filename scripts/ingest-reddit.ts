/**
 * On-demand Reddit ingest — `npm run ingest:reddit`.
 *
 * Uses Reddit's public Atom RSS feed (the JSON API is blocked without OAuth
 * since 2023). Ensures a source registry row exists, projects it to a
 * `SourceInput`, and runs the shared ingest pipeline. Stage 1.8's scheduler
 * reuses `ingestSource`, not this CLI wrapper.
 */
import { prisma } from '@/lib/db'
import { DEFAULT_AI_KEYWORDS } from '@/lib/constants'
import { redditConnector } from '@/connectors/reddit'
import { ingestSource } from '@/server/ingest'
import type { SourceInput } from '@/connectors/types'

const REDDIT_SUBREDDITS = 'MachineLearning+artificial+LocalLLaMA+ChatGPT'
const REDDIT_URL = `https://www.reddit.com/r/${REDDIT_SUBREDDITS}/hot.rss`

async function ensureRedditSource(): Promise<SourceInput> {
  const keywords = [...DEFAULT_AI_KEYWORDS]

  const source = await prisma.source.upsert({
    where: { type_url: { type: 'rss', url: REDDIT_URL } },
    create: {
      name: 'Reddit AI',
      category: 'community',
      platform: 'reddit',
      type: 'rss',
      url: REDDIT_URL,
      keywordFilters: JSON.stringify(keywords),
    },
    update: {},
  })

  const parsedKeywords: string[] = source.keywordFilters
    ? (JSON.parse(source.keywordFilters) as string[])
    : keywords

  return {
    id: source.id,
    type: 'rss',
    url: source.url,
    platform: 'reddit',
    keywordFilters: parsedKeywords,
  }
}

async function main(): Promise<void> {
  const source = await ensureRedditSource()
  const result = await ingestSource(redditConnector, source)

  console.info(
    `[ingest:reddit] fetched=${result.fetched} stored=${result.stored} skipped=${result.skipped}`,
  )
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[ingest:reddit] failed: ${message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
