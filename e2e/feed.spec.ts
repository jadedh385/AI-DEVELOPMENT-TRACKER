import { test, expect } from '@playwright/test'

test.describe('feed', () => {
  test('shows heading and tagline', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'AI Landscape Signal' })).toBeVisible()
    await expect(page.getByText('What happened in AI, and where to read more.')).toBeVisible()
  })

  test('renders all seeded items', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('article')).toHaveCount(3)
  })

  test('each item shows a title and platform badge', async ({ page }) => {
    await page.goto('/')
    const first = page.locator('article').first()
    await expect(first.getByRole('heading')).toBeVisible()
    await expect(first.locator('[aria-label^="Platform:"]')).toBeVisible()
  })

  test('shows end-of-feed marker', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText("You're all caught up.")).toBeVisible()
  })

  test('item title links out to canonical URL', async ({ page }) => {
    await page.goto('/')
    const href = await page.locator('article').first().getByRole('link').first().getAttribute('href')
    expect(href).toMatch(/^https?:\/\//)
  })

  test('Saved link navigates to /saved', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Saved' }).click()
    await expect(page).toHaveURL('/saved')
    await expect(page.getByRole('heading', { name: 'Saved' })).toBeVisible()
  })
})
