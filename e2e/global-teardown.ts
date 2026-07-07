import { unlink } from 'fs/promises'
import { TEST_DB_PATH } from './test-db'

export default async function globalTeardown() {
  for (const suffix of ['', '-wal', '-shm', '-journal']) {
    await unlink(`${TEST_DB_PATH}${suffix}`).catch(() => {})
  }
}
