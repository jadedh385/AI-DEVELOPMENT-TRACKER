'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function toggleSave(itemId: string, isSaved: boolean): Promise<void> {
  if (isSaved) {
    await prisma.feedback.deleteMany({
      where: { itemId, userId: 'local', reaction: 'saved' },
    })
  } else {
    await prisma.feedback.create({
      data: { itemId, userId: 'local', reaction: 'saved' },
    })
  }

  revalidatePath('/')
  revalidatePath('/saved')
}
