import { test, expect } from '@playwright/test'

test.beforeEach(async ({ request }) => {
  await request.post('/api/test/reset')
})

test.describe('feedback reactions', () => {
  test('marks item as helpful', async ({ page }) => {
    await page.goto('/')
    const article = page.locator('article').first()
    await article.getByRole('button', { name: 'Mark as helpful' }).click()
    await expect(article.getByRole('button', { name: 'Remove helpful mark' })).toBeVisible()
  })

  test('marks item as not relevant', async ({ page }) => {
    await page.goto('/')
    const article = page.locator('article').first()
    await article.getByRole('button', { name: 'Mark as not relevant' }).click()
    await expect(article.getByRole('button', { name: 'Remove not relevant mark' })).toBeVisible()
  })

  test('marking helpful clears not-relevant (mutual exclusivity)', async ({ page }) => {
    await page.goto('/')
    const article = page.locator('article').first()
    await article.getByRole('button', { name: 'Mark as not relevant' }).click()
    await expect(article.getByRole('button', { name: 'Remove not relevant mark' })).toBeVisible()
    await article.getByRole('button', { name: 'Mark as helpful' }).click()
    await expect(article.getByRole('button', { name: 'Remove helpful mark' })).toBeVisible()
    await expect(article.getByRole('button', { name: 'Mark as not relevant' })).toBeVisible()
  })

  test('clicking helpful again removes the mark', async ({ page }) => {
    await page.goto('/')
    const article = page.locator('article').first()
    await article.getByRole('button', { name: 'Mark as helpful' }).click()
    await article.getByRole('button', { name: 'Remove helpful mark' }).click()
    await expect(article.getByRole('button', { name: 'Mark as helpful' })).toBeVisible()
  })
})
