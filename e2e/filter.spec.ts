import { test, expect } from '@playwright/test'

test.describe('feed filtering', () => {
  test('shows all 3 items with no filters', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('article')).toHaveCount(3)
  })

  test('HackerNews chip filters to 2 HN items', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'HackerNews' }).click()
    await expect(page).toHaveURL(/platform=hackernews/)
    await expect(page.locator('article')).toHaveCount(2)
  })

  test('Reddit chip filters to 1 Reddit item', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Reddit' }).click()
    await expect(page).toHaveURL(/platform=reddit/)
    await expect(page.locator('article')).toHaveCount(1)
  })

  test('Research category chip filters to 1 item', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Research' }).click()
    await expect(page).toHaveURL(/category=research/)
    await expect(page.locator('article')).toHaveCount(1)
  })

  test('non-matching combination shows empty state', async ({ page }) => {
    // HN items are "community", not "research" — so 0 match
    await page.goto('/?platform=hackernews&category=research')
    await expect(page.getByText('No items match the selected filters.')).toBeVisible()
    await expect(page.locator('article')).toHaveCount(0)
  })

  test('Clear filters resets to full feed', async ({ page }) => {
    await page.goto('/?platform=reddit')
    await page.getByRole('button', { name: 'Clear filters' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.locator('article')).toHaveCount(3)
  })

  test('clicking an active chip removes that filter', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'HackerNews' }).click()
    await expect(page.locator('article')).toHaveCount(2)
    await page.getByRole('button', { name: 'HackerNews' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.locator('article')).toHaveCount(3)
  })
})
