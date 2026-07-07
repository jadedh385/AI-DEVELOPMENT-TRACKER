import { unlink } from 'fs/promises'
import { PrismaClient } from '@prisma/client'
import { TEST_DB_PATH, TEST_DB_URL } from './test-db'

export default async function globalSetup() {
  // By the time globalSetup runs, the webServer has already started and
  // prisma migrate deploy has already run (in the webServer command). We only
  // need to seed deterministic test fixtures here.
  const prisma = new PrismaClient({ datasources: { db: { url: TEST_DB_URL } } })

  try {
    const now = new Date()
    const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000)

    const hnSource = await prisma.source.upsert({
      where: { id: 'e2e-src-hn' },
      update: {},
      create: {
        id: 'e2e-src-hn',
        name: 'Hacker News',
        category: 'community',
        platform: 'hackernews',
        type: 'hn',
        url: 'https://hn.algolia.com/api/v1/search',
        status: 'active',
      },
    })

    const redditSource = await prisma.source.upsert({
      where: { id: 'e2e-src-reddit' },
      update: {},
      create: {
        id: 'e2e-src-reddit',
        name: 'r/MachineLearning',
        category: 'research',
        platform: 'reddit',
        type: 'reddit_json',
        url: 'https://www.reddit.com/r/MachineLearning/.json',
        status: 'active',
      },
    })

    await prisma.item.upsert({
      where: { id: 'e2e-item-hn-1' },
      update: {},
      create: {
        id: 'e2e-item-hn-1',
        sourceId: hnSource.id,
        title: 'GPT-5 Released with Surprising Capabilities',
        canonicalUrl: 'https://example.com/gpt5',
        summary: 'OpenAI releases GPT-5 with multimodal reasoning improvements.',
        platform: 'hackernews',
        category: 'community',
        publishedAt: hoursAgo(3),
        dedupeHash: 'e2e-hash-hn-1',
      },
    })

    await prisma.item.upsert({
      where: { id: 'e2e-item-hn-2' },
      update: {},
      create: {
        id: 'e2e-item-hn-2',
        sourceId: hnSource.id,
        title: 'Anthropic Raises $2B in New Funding Round',
        canonicalUrl: 'https://example.com/anthropic-funding',
        summary: 'Anthropic secures $2 billion to scale frontier model research.',
        platform: 'hackernews',
        category: 'community',
        publishedAt: hoursAgo(5),
        dedupeHash: 'e2e-hash-hn-2',
      },
    })

    await prisma.item.upsert({
      where: { id: 'e2e-item-reddit-1' },
      update: {},
      create: {
        id: 'e2e-item-reddit-1',
        sourceId: redditSource.id,
        title: 'Fine-tuning LLMs on Consumer Hardware in 2026',
        canonicalUrl: 'https://example.com/finetune-llm',
        summary: 'A practical guide to fine-tuning 7B models on a single RTX 4090.',
        platform: 'reddit',
        category: 'research',
        publishedAt: hoursAgo(7),
        dedupeHash: 'e2e-hash-reddit-1',
      },
    })
  } finally {
    await prisma.$disconnect()
  }
}
