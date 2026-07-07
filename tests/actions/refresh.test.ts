import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockIngestAll, mockRevalidatePath } = vi.hoisted(() => ({
  mockIngestAll: vi.fn(),
  mockRevalidatePath: vi.fn(),
}))

vi.mock('@/server/ingest-all', () => ({ ingestAll: mockIngestAll }))
vi.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }))

import { refreshFeed } from '@/app/actions/refresh'

const fakeResult = { sources: [], errors: [], summarized: 0 }

describe('refreshFeed', () => {
  beforeEach(() => {
    mockIngestAll.mockClear().mockResolvedValue(fakeResult)
    mockRevalidatePath.mockClear()
  })

  it('calls ingestAll and revalidates the feed path', async () => {
    await refreshFeed()

    expect(mockIngestAll).toHaveBeenCalledTimes(1)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/')
  })

  it('returns success with ingest results', async () => {
    const data = {
      sources: [{ sourceId: 'src-1', fetched: 5, stored: 3, skipped: 2 }],
      errors: [],
      summarized: 3,
    }
    mockIngestAll.mockResolvedValue(data)

    const result = await refreshFeed()

    expect(result).toEqual({ success: true, data })
  })

  it('returns error result when ingestAll throws', async () => {
    mockIngestAll.mockRejectedValue(new Error('DB connection failed'))

    const result = await refreshFeed()

    expect(result).toEqual({ success: false, error: 'DB connection failed' })
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })
})
