import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockPush = vi.fn()
const mockGet = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet, getAll: vi.fn().mockReturnValue([]) }),
  usePathname: () => '/',
}))

import { FilterBar } from '@/components/FilterBar'

const PLATFORMS = ['hackernews', 'reddit', 'rss'] as const
const CATEGORIES = ['research', 'products', 'models', 'community'] as const

function renderFilterBar() {
  return render(
    <FilterBar
      platforms={[...PLATFORMS]}
      categories={[...CATEGORIES]}
      activePlatforms={[]}
      activeCategories={[]}
    />,
  )
}

describe('FilterBar', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockGet.mockClear()
  })

  it('renders a chip for each platform', () => {
    renderFilterBar()

    expect(screen.getByRole('button', { name: /hackernews/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reddit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /rss/i })).toBeInTheDocument()
  })

  it('renders a chip for each category', () => {
    renderFilterBar()

    expect(screen.getByRole('button', { name: /research/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /products/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /models/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /community/i })).toBeInTheDocument()
  })

  it('marks active platform chips as pressed', () => {
    render(
      <FilterBar
        platforms={[...PLATFORMS]}
        categories={[...CATEGORIES]}
        activePlatforms={['reddit']}
        activeCategories={[]}
      />,
    )

    expect(screen.getByRole('button', { name: /reddit/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /hackernews/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('marks active category chips as pressed', () => {
    render(
      <FilterBar
        platforms={[...PLATFORMS]}
        categories={[...CATEGORIES]}
        activePlatforms={[]}
        activeCategories={['research']}
      />,
    )

    expect(screen.getByRole('button', { name: /research/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('calls router.push with added platform when inactive chip is clicked', async () => {
    const user = userEvent.setup()
    renderFilterBar()

    await user.click(screen.getByRole('button', { name: /reddit/i }))

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('platform=reddit'),
    )
  })

  it('calls router.push without platform when active chip is clicked (deselect)', async () => {
    const user = userEvent.setup()
    render(
      <FilterBar
        platforms={[...PLATFORMS]}
        categories={[...CATEGORIES]}
        activePlatforms={['reddit']}
        activeCategories={[]}
      />,
    )

    await user.click(screen.getByRole('button', { name: /reddit/i }))

    const pushedUrl = mockPush.mock.calls[0][0] as string
    expect(pushedUrl).not.toContain('platform=reddit')
  })

  it('preserves existing active filters when adding a new one', async () => {
    const user = userEvent.setup()
    render(
      <FilterBar
        platforms={[...PLATFORMS]}
        categories={[...CATEGORIES]}
        activePlatforms={['hackernews']}
        activeCategories={['research']}
      />,
    )

    await user.click(screen.getByRole('button', { name: /reddit/i }))

    const pushedUrl = mockPush.mock.calls[0][0] as string
    expect(pushedUrl).toContain('platform=hackernews')
    expect(pushedUrl).toContain('platform=reddit')
    expect(pushedUrl).toContain('category=research')
  })

  it('shows a reset button when any filter is active', () => {
    render(
      <FilterBar
        platforms={[...PLATFORMS]}
        categories={[...CATEGORIES]}
        activePlatforms={['reddit']}
        activeCategories={[]}
      />,
    )

    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  it('hides the reset button when no filters are active', () => {
    renderFilterBar()

    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
  })

  it('calls router.push with empty params when reset is clicked', async () => {
    const user = userEvent.setup()
    render(
      <FilterBar
        platforms={[...PLATFORMS]}
        categories={[...CATEGORIES]}
        activePlatforms={['reddit']}
        activeCategories={['research']}
      />,
    )

    await user.click(screen.getByRole('button', { name: /clear/i }))

    const pushedUrl = mockPush.mock.calls[0][0] as string
    expect(pushedUrl).not.toContain('platform=')
    expect(pushedUrl).not.toContain('category=')
  })
})
