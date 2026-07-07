import { getActiveSources } from '@/lib/registry'
import { ingestSource } from '@/server/ingest'
import { summarizeUnsummarized } from '@/lib/summarize'
import { hackernewsConnector } from '@/connectors/hackernews'
import { redditConnector } from '@/connectors/reddit'
import { rssConnector } from '@/connectors/rss'
import type { Connector } from '@/connectors/types'
import type { SourceType } from '@/lib/constants'
import type { IngestResult } from '@/server/ingest'

export interface SourceIngestResult extends IngestResult {
  sourceId: string
}

export interface SourceIngestError {
  sourceId: string
  error: string
}

export interface IngestAllResult {
  sources: SourceIngestResult[]
  errors: SourceIngestError[]
  summarized: number
}

const CONNECTORS: Partial<Record<SourceType, Connector>> = {
  hn: hackernewsConnector,
  reddit_json: redditConnector,
  rss: rssConnector,
}

export async function ingestAll(): Promise<IngestAllResult> {
  const activeSources = await getActiveSources()

  const sources: SourceIngestResult[] = []
  const errors: SourceIngestError[] = []

  for (const source of activeSources) {
    const connector = CONNECTORS[source.type]
    if (!connector) continue

    try {
      const result = await ingestSource(connector, source)
      sources.push({ sourceId: source.id, ...result })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      errors.push({ sourceId: source.id, error: message })
    }
  }

  const summarized = await summarizeUnsummarized()

  return { sources, errors, summarized }
}
