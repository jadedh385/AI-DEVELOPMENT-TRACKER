import path from 'path'
import { defineConfig, devices } from '@playwright/test'

const TEST_DB_URL = `file:${path.resolve(__dirname, 'prisma/test.db')}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Migrate first so Next.js starts with the schema already in place.
    // Playwright runs the webServer plugin BEFORE globalSetup, so migration
    // must happen here — not in globalSetup — to avoid a chicken-and-egg
    // health-check failure.
    command: `DATABASE_URL="${TEST_DB_URL}" E2E_TESTING=true sh -c 'rm -f prisma/test.db prisma/test.db-wal prisma/test.db-shm && node_modules/.bin/prisma migrate deploy && node_modules/.bin/next dev --port 3001'`,
    url: 'http://localhost:3001',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
