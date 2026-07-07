import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  if (process.env.E2E_TESTING !== 'true') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  await prisma.feedback.deleteMany()
  return NextResponse.json({ ok: true })
}
