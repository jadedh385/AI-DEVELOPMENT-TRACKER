/**
 * Unified ingest — `npm run ingest:all`.
 *
 * Seeds all known source rows, loads active sources from the registry, and runs
 * each through its connector. Stage 1.8's scheduler reuses `ingestSource`
 * directly; this script is the operator-facing on-demand equivalent.
 */
import { prisma } from '@/lib/db'
import { DEFAULT_AI_KEYWORDS } from '@/lib/constants'
import { hackernewsConnector } from '@/connectors/hackernews'
import { redditConnector } from '@/connectors/reddit'
import { rssConnector } from '@/connectors/rss'
import { ingestSource } from '@/server/ingest'
import { getActiveSources } from '@/lib/registry'
import { summarizeUnsummarized } from '@/lib/summarize'
import type { Connector } from '@/connectors/types'

const REDDIT_SUBREDDITS = 'MachineLearning+artificial+LocalLLaMA+ChatGPT'
const OPENAI_RSS_URL = 'https://openai.com/news/rss.xml'
const HN_ALGOLIA_ENDPOINT = 'https://hn.algolia.com/api/v1/search_by_date'
const REDDIT_URL = `https://www.reddit.com/r/${REDDIT_SUBREDDITS}/hot.rss`

const CONNECTOR_MAP: Record<string, Connector> = {
  hn: hackernewsConnector,
  rss: rssConnector,
}

async function seedSources(): Promise<void> {
  const keywords = [...DEFAULT_AI_KEYWORDS]
  const keywordsJson = JSON.stringify(keywords)

  await prisma.source.upsert({
    where: { type_url: { type: 'hn', url: HN_ALGOLIA_ENDPOINT } },
    create: {
      name: 'Hacker News (AI)',
      category: 'community',
      platform: 'hackernews',
      type: 'hn',
      url: HN_ALGOLIA_ENDPOINT,
      keywordFilters: keywordsJson,
    },
    update: {},
  })

  await prisma.source.upsert({
    where: { type_url: { type: 'rss', url: REDDIT_URL } },
    create: {
      name: 'Reddit AI',
      category: 'community',
      platform: 'reddit',
      type: 'rss',
      url: REDDIT_URL,
      keywordFilters: keywordsJson,
    },
    update: {},
  })

  await prisma.source.upsert({
    where: { type_url: { type: 'rss', url: OPENAI_RSS_URL } },
    create: {
      name: 'OpenAI Blog',
      category: 'research',
      platform: 'rss',
      type: 'rss',
      url: OPENAI_RSS_URL,
    },
    update: {},
  })
}

async function main(): Promise<void> {
  await seedSources()

  const sources = await getActiveSources()
  console.info(`[ingest:all] ${sources.length} active source(s) found`)

  let totalFetched = 0
  let totalStored = 0
  let totalSkipped = 0

  for (const source of sources) {
    const connector =
      source.platform === 'reddit' ? redditConnector : CONNECTOR_MAP[source.type]

    if (!connector) {
      console.warn(`[ingest:all] no connector for type="${source.type}" — skipping ${source.id}`)
      continue
    }

    try {
      const result = await ingestSource(connector, source)
      console.info(
        `[ingest:all] ${source.id}: fetched=${result.fetched} stored=${result.stored} skipped=${result.skipped}`,
      )
      totalFetched += result.fetched
      totalStored += result.stored
      totalSkipped += result.skipped
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[ingest:all] ${source.id} failed: ${message}`)
    }
  }

  console.info(
    `[ingest:all] done — total fetched=${totalFetched} stored=${totalStored} skipped=${totalSkipped}`,
  )

  const summarized = await summarizeUnsummarized()
  if (summarized > 0) {
    console.info(`[ingest:all] summarized ${summarized} new item(s)`)
  }
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[ingest:all] fatal: ${message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
