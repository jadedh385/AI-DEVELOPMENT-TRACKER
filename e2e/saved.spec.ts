import { test, expect } from '@playwright/test'

test.beforeEach(async ({ request }) => {
  await request.post('/api/test/reset')
})

test.describe('save for later', () => {
  test('saved page shows empty state when nothing is saved', async ({ page }) => {
    await page.goto('/saved')
    await expect(page.getByText('Nothing saved yet.')).toBeVisible()
  })

  test('bookmarking an item updates button label', async ({ page }) => {
    await page.goto('/')
    const article = page.locator('article').first()
    await article.getByRole('button', { name: 'Save for later' }).click()
    await expect(article.getByRole('button', { name: 'Remove from saved' })).toBeVisible()
  })

  test('saved item appears on /saved page', async ({ page }) => {
    await page.goto('/')
    const article = page.locator('article').first()
    const title = await article.getByRole('heading').textContent()
    await article.getByRole('button', { name: 'Save for later' }).click()
    await page.getByRole('link', { name: 'Saved' }).click()
    await expect(page).toHaveURL('/saved')
    await expect(page.getByText(title!)).toBeVisible()
    await expect(page.getByText("That's everything you've saved.")).toBeVisible()
  })

  test('Back to feed link returns to /', async ({ page }) => {
    await page.goto('/saved')
    await page.getByRole('link', { name: 'Back to feed' }).click()
    await expect(page).toHaveURL('/')
  })
})
