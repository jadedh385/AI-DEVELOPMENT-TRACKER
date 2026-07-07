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

import { toggleSave } from '@/app/actions/save'

describe('toggleSave', () => {
  beforeEach(() => {
    mockDeleteMany.mockClear().mockResolvedValue({ count: 1 })
    mockCreate.mockClear().mockResolvedValue({ id: 'fb-1' })
    mockRevalidatePath.mockClear()
  })

  it('deletes saved feedback when currently saved', async () => {
    await toggleSave('item-1', true)

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { itemId: 'item-1', userId: 'local', reaction: 'saved' },
    })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('creates saved feedback when not currently saved', async () => {
    await toggleSave('item-1', false)

    expect(mockCreate).toHaveBeenCalledWith({
      data: { itemId: 'item-1', userId: 'local', reaction: 'saved' },
    })
    expect(mockDeleteMany).not.toHaveBeenCalled()
  })

  it('revalidates feed and saved paths after unsaving', async () => {
    await toggleSave('item-1', true)

    expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/saved')
  })

  it('revalidates feed and saved paths after saving', async () => {
    await toggleSave('item-1', false)

    expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/saved')
  })
})
