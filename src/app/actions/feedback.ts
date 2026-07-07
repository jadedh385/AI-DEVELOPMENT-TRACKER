'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

const OPPOSITE_REACTION = {
  helpful: 'not_relevant',
  not_relevant: 'helpful',
} as const

export async function toggleReaction(
  itemId: string,
  reaction: 'helpful' | 'not_relevant',
  isActive: boolean,
): Promise<void> {
  if (isActive) {
    await prisma.feedback.deleteMany({
      where: { itemId, userId: 'local', reaction },
    })
  } else {
    await prisma.feedback.deleteMany({
      where: { itemId, userId: 'local', reaction: OPPOSITE_REACTION[reaction] },
    })
    await prisma.feedback.create({
      data: { itemId, userId: 'local', reaction },
    })
  }
  revalidatePath('/')
}

export async function recordOpened(itemId: string): Promise<void> {
  await prisma.feedback.create({
    data: { itemId, userId: 'local', reaction: 'opened' },
  })
}
