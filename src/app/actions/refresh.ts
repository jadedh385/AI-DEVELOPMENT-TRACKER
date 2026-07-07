'use server'
import { revalidatePath } from 'next/cache'
import { ingestAll } from '@/server/ingest-all'
import type { IngestAllResult } from '@/server/ingest-all'

export interface RefreshResult {
  success: boolean
  data?: IngestAllResult
  error?: string
}

export async function refreshFeed(): Promise<RefreshResult> {
  try {
    const data = await ingestAll()
    revalidatePath('/')
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}
