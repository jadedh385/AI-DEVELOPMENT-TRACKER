import { PrismaClient } from '@prisma/client'

/**
 * A single PrismaClient per process. In development Next.js hot-reloads modules,
 * which would otherwise spawn a new client (and connection) on every reload, so
 * we cache it on globalThis outside production.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
