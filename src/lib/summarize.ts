import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/db'

const MODEL = 'claude-haiku-4-5'
const MAX_SUMMARY_TOKENS = 100
const MAX_TITLE_LENGTH = 300

const SYSTEM_PROMPT =
  'You are a concise AI news curator for a busy professional. ' +
  "Given an item's title, platform, and category, write exactly one sentence explaining " +
  'why it matters to someone tracking AI developments. Be specific, not generic. ' +
  'Respond with only the sentence — no preamble, no labels.'

export interface SummaryInput {
  title: string
  platform: string
  category: string
}

interface ContentBlock {
  type: string
  text?: string
}

/** Minimal client shape; real impl wraps the Anthropic SDK, tests inject a mock. */
export interface SummaryClient {
  create(params: object): Promise<{ content: ReadonlyArray<ContentBlock> }>
}

/** Strips control characters and truncates title before LLM interpolation. */
function sanitizeTitle(title: string): string {
  return title
    .replace(/[\x00-\x1f\x7f]/g, ' ')
    .slice(0, MAX_TITLE_LENGTH)
    .trim()
}

/** Creates an Anthropic-backed client, or null when the API key is absent. */
function buildClient(): SummaryClient | null {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null
  const sdk = new Anthropic({ apiKey })
  return {
    create(params) {
      return sdk.messages.create(
        params as Parameters<(typeof sdk.messages)['create']>[0],
      ) as Promise<{ content: ReadonlyArray<ContentBlock> }>
    },
  }
}

/**
 * Generates a one-line "why it matters" summary for a single item.
 * Returns null when the API key is absent or the API call fails.
 * `client` is injectable for testing; defaults to the Anthropic SDK client.
 */
export async function summarizeItem(
  input: SummaryInput,
  client: SummaryClient | null = buildClient(),
): Promise<string | null> {
  if (!client) return null

  try {
    const response = await client.create({
      model: MODEL,
      max_tokens: MAX_SUMMARY_TOKENS,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Title: ${sanitizeTitle(input.title)}\nPlatform: ${input.platform}\nCategory: ${input.category}`,
        },
      ],
    })

    const block = response.content[0]
    if (!block || block.type !== 'text') return null
    return block.text?.trim() || null
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[summarize] API call failed:', message)
    return null
  }
}

/**
 * Finds all items with a null summary and summarizes them.
 * Returns the count of items successfully updated.
 * `client` is injectable for testing; defaults to the Anthropic SDK client.
 */
export async function summarizeUnsummarized(
  client: SummaryClient | null = buildClient(),
): Promise<number> {
  if (!client) {
    console.warn('[summarize] ANTHROPIC_API_KEY not set — skipping LLM summaries')
    return 0
  }

  const items = await prisma.item.findMany({
    where: { summary: null },
    select: { id: true, title: true, platform: true, category: true },
  })

  if (items.length === 0) return 0

  let updated = 0
  for (const item of items) {
    const summary = await summarizeItem(
      { title: item.title, platform: item.platform, category: item.category },
      client,
    )
    if (summary !== null) {
      await prisma.item.update({ where: { id: item.id }, data: { summary } })
      updated++
    }
  }

  return updated
}
