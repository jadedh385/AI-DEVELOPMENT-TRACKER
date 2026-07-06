import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    item: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/db'
import { summarizeItem, summarizeUnsummarized } from '@/lib/summarize'
import type { SummaryClient } from '@/lib/summarize'

const mockFindMany = vi.mocked(prisma.item.findMany)
const mockUpdate = vi.mocked(prisma.item.update)

const mockCreate = vi.fn()
const mockClient: SummaryClient = { create: mockCreate }

function textResponse(text: string) {
  return { content: [{ type: 'text', text }] }
}

function dbItem(overrides: object = {}) {
  return {
    id: 'item_1',
    sourceId: 'src_1',
    title: 'Llama 4 released with 128K context',
    canonicalUrl: 'https://example.com/story',
    summary: null,
    author: null,
    platform: 'hackernews',
    category: 'models',
    publishedAt: new Date('2026-07-07T00:00:00Z'),
    fetchedAt: new Date('2026-07-07T00:00:00Z'),
    dedupeHash: 'abc123',
    ...overrides,
  }
}

describe('summarizeItem', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  it('returns a one-line summary on success', async () => {
    mockCreate.mockResolvedValue(textResponse('Signals a major step in open-weight model capability.'))

    const result = await summarizeItem(
      { title: 'Llama 4 released with 128K context', platform: 'hackernews', category: 'models' },
      mockClient,
    )

    expect(result).toBe('Signals a major step in open-weight model capability.')
  })

  it('trims whitespace from the response', async () => {
    mockCreate.mockResolvedValue(textResponse('  Relevant for enterprise AI adoption.  '))

    const result = await summarizeItem(
      { title: 'GPT-5 enterprise pricing announced', platform: 'rss', category: 'companies' },
      mockClient,
    )

    expect(result).toBe('Relevant for enterprise AI adoption.')
  })

  it('calls the API with the correct model and inputs', async () => {
    mockCreate.mockResolvedValue(textResponse('Some summary.'))

    await summarizeItem({ title: 'My Title', platform: 'reddit', category: 'research' }, mockClient)

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-haiku-4-5',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: expect.stringContaining('My Title') }),
        ]),
      }),
    )
  })

  it('returns null when client is null (no API key)', async () => {
    const result = await summarizeItem(
      { title: 'Some story', platform: 'hackernews', category: 'community' },
      null,
    )

    expect(result).toBeNull()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns null when ANTHROPIC_API_KEY is not set (default client path)', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '')

    const result = await summarizeItem({
      title: 'Some story',
      platform: 'hackernews',
      category: 'community',
    })

    expect(result).toBeNull()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns null and logs when the API call throws', async () => {
    mockCreate.mockRejectedValue(new Error('API rate limit exceeded'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await summarizeItem(
      { title: 'Another story', platform: 'reddit', category: 'research' },
      mockClient,
    )

    expect(result).toBeNull()
    expect(errorSpy).toHaveBeenCalledWith(
      '[summarize] API call failed:',
      'API rate limit exceeded',
    )
    errorSpy.mockRestore()
  })

  it('strips control characters and truncates long titles before sending', async () => {
    mockCreate.mockResolvedValue(textResponse('Summary.'))
    const longTitle = 'A'.repeat(400)
    const titleWithControls = 'Injected\x00control\x1fchars'

    await summarizeItem({ title: longTitle, platform: 'hackernews', category: 'community' }, mockClient)
    await summarizeItem({ title: titleWithControls, platform: 'hackernews', category: 'community' }, mockClient)

    const firstCall = mockCreate.mock.calls[0][0] as { messages: Array<{ content: string }> }
    const secondCall = mockCreate.mock.calls[1][0] as { messages: Array<{ content: string }> }

    // Truncated to MAX_TITLE_LENGTH (300)
    const firstTitle = firstCall.messages[0].content.split('\n')[0].replace('Title: ', '')
    expect(firstTitle).toHaveLength(300)

    // Control characters stripped from title
    const secondTitle = secondCall.messages[0].content.split('\n')[0].replace('Title: ', '')
    expect(secondTitle).not.toMatch(/[\x00-\x1f]/)
  })

  it('returns null when response has no content blocks', async () => {
    mockCreate.mockResolvedValue({ content: [] })

    const result = await summarizeItem(
      { title: 'A story', platform: 'hackernews', category: 'community' },
      mockClient,
    )

    expect(result).toBeNull()
  })

  it('returns null when the response block is not a text type', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'tool_use', id: 'tu_1' }] })

    const result = await summarizeItem(
      { title: 'A story', platform: 'hackernews', category: 'community' },
      mockClient,
    )

    expect(result).toBeNull()
  })
})

describe('summarizeUnsummarized', () => {
  beforeEach(() => {
    mockCreate.mockReset()
    mockFindMany.mockReset()
    mockUpdate.mockReset()
  })

  it('returns 0 when no unsummarized items exist', async () => {
    mockFindMany.mockResolvedValue([])

    const count = await summarizeUnsummarized(mockClient)

    expect(count).toBe(0)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('queries only items with null summary', async () => {
    mockFindMany.mockResolvedValue([])

    await summarizeUnsummarized(mockClient)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { summary: null } }),
    )
  })

  it('returns 0 and warns when client is null (no API key)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const count = await summarizeUnsummarized(null)

    expect(count).toBe(0)
    expect(mockFindMany).not.toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('returns 0 and warns when ANTHROPIC_API_KEY is not set (default client path)', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const count = await summarizeUnsummarized()

    expect(count).toBe(0)
    expect(mockFindMany).not.toHaveBeenCalled()

    vi.unstubAllEnvs()
    warnSpy.mockRestore()
  })

  it('updates each item with its generated summary', async () => {
    mockFindMany.mockResolvedValue([
      dbItem({ id: 'item_1', title: 'Story A' }),
      dbItem({ id: 'item_2', title: 'Story B', platform: 'rss', category: 'research' }),
    ])
    mockCreate
      .mockResolvedValueOnce(textResponse('Summary A.'))
      .mockResolvedValueOnce(textResponse('Summary B.'))
    mockUpdate.mockResolvedValue({} as never)

    const count = await summarizeUnsummarized(mockClient)

    expect(count).toBe(2)
    expect(mockUpdate).toHaveBeenCalledTimes(2)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'item_1' }, data: { summary: 'Summary A.' } }),
    )
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'item_2' }, data: { summary: 'Summary B.' } }),
    )
  })

  it('skips DB update when summarizeItem returns null', async () => {
    mockFindMany.mockResolvedValue([dbItem()])
    mockCreate.mockRejectedValue(new Error('API error'))

    const count = await summarizeUnsummarized(mockClient)

    expect(count).toBe(0)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns count of only successfully summarized items', async () => {
    mockFindMany.mockResolvedValue([
      dbItem({ id: 'item_1' }),
      dbItem({ id: 'item_2' }),
      dbItem({ id: 'item_3' }),
    ])
    mockCreate
      .mockResolvedValueOnce(textResponse('Summary 1.'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(textResponse('Summary 3.'))
    mockUpdate.mockResolvedValue({} as never)

    const count = await summarizeUnsummarized(mockClient)

    expect(count).toBe(2)
    expect(mockUpdate).toHaveBeenCalledTimes(2)
  })
})
