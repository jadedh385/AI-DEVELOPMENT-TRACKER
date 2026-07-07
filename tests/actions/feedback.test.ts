import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockDeleteMany, mockCreate, mockRevalidatePath } = vi.hoisted(() => ({
  mockDeleteMany: vi.fn(),
  mockCreate: vi.fn(),
  mockRevalidatePath: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    feedback: {
      deleteMany: mockDeleteMany,
      create: mockCreate,
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

import { toggleReaction, recordOpened } from '@/app/actions/feedback'

describe('toggleReaction', () => {
  beforeEach(() => {
    mockDeleteMany.mockClear().mockResolvedValue({ count: 1 })
    mockCreate.mockClear().mockResolvedValue({ id: 'fb-1' })
    mockRevalidatePath.mockClear()
  })

  it('deletes helpful reaction when currently active', async () => {
    await toggleReaction('item-1', 'helpful', true)

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { itemId: 'item-1', userId: 'local', reaction: 'helpful' },
    })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('deletes not_relevant reaction when currently active', async () => {
    await toggleReaction('item-1', 'not_relevant', true)

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { itemId: 'item-1', userId: 'local', reaction: 'not_relevant' },
    })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('clears opposite reaction and creates helpful when activating helpful', async () => {
    await toggleReaction('item-1', 'helpful', false)

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { itemId: 'item-1', userId: 'local', reaction: 'not_relevant' },
    })
    expect(mockCreate).toHaveBeenCalledWith({
      data: { itemId: 'item-1', userId: 'local', reaction: 'helpful' },
    })
  })

  it('clears opposite reaction and creates not_relevant when activating not_relevant', async () => {
    await toggleReaction('item-1', 'not_relevant', false)

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { itemId: 'item-1', userId: 'local', reaction: 'helpful' },
    })
    expect(mockCreate).toHaveBeenCalledWith({
      data: { itemId: 'item-1', userId: 'local', reaction: 'not_relevant' },
    })
  })

  it('revalidates the feed path after any toggle', async () => {
    await toggleReaction('item-1', 'helpful', false)

    expect(mockRevalidatePath).toHaveBeenCalledWith('/')
  })
})

describe('recordOpened', () => {
  beforeEach(() => {
    mockCreate.mockClear().mockResolvedValue({ id: 'fb-2' })
  })

  it('creates an opened reaction', async () => {
    await recordOpened('item-1')

    expect(mockCreate).toHaveBeenCalledWith({
      data: { itemId: 'item-1', userId: 'local', reaction: 'opened' },
    })
  })
})
