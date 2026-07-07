'use client'

import { useRouter } from 'next/navigation'

const PLATFORM_LABELS: Record<string, string> = {
  hackernews: 'HackerNews',
  reddit: 'Reddit',
  rss: 'RSS',
  github: 'GitHub',
  arxiv: 'arXiv',
}

const CATEGORY_LABELS: Record<string, string> = {
  research: 'Research',
  products: 'Products',
  models: 'Models',
  companies: 'Companies',
  people: 'People',
  community: 'Community',
  conferences: 'Conferences',
}

interface FilterBarProps {
  platforms: string[]
  categories: string[]
  activePlatforms: string[]
  activeCategories: string[]
}

function buildUrl(platforms: string[], categories: string[]): string {
  const params = new URLSearchParams()
  for (const p of platforms) params.append('platform', p)
  for (const c of categories) params.append('category', c)
  const qs = params.toString()
  return qs ? `/?${qs}` : '/'
}

function toggle(active: string[], value: string): string[] {
  return active.includes(value)
    ? active.filter((v) => v !== value)
    : [...active, value]
}

interface ChipProps {
  label: string
  isActive: boolean
  onClick: () => void
}

function Chip({ label, isActive, onClick }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={[
        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
        'min-h-[32px] touch-manipulation',
        isActive
          ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

export function FilterBar({
  platforms,
  categories,
  activePlatforms,
  activeCategories,
}: FilterBarProps) {
  const router = useRouter()
  const hasActiveFilters = activePlatforms.length > 0 || activeCategories.length > 0

  function handlePlatformClick(platform: string) {
    const next = toggle(activePlatforms, platform)
    router.push(buildUrl(next, activeCategories))
  }

  function handleCategoryClick(category: string) {
    const next = toggle(activeCategories, category)
    router.push(buildUrl(activePlatforms, next))
  }

  function handleReset() {
    router.push('/')
  }

  return (
    <div className="mb-4 space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {platforms.map((platform) => (
          <Chip
            key={platform}
            label={PLATFORM_LABELS[platform] ?? platform}
            isActive={activePlatforms.includes(platform)}
            onClick={() => handlePlatformClick(platform)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {categories.map((category) => (
          <Chip
            key={category}
            label={CATEGORY_LABELS[category] ?? category}
            isActive={activeCategories.includes(category)}
            onClick={() => handleCategoryClick(category)}
          />
        ))}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="ml-1 text-xs text-zinc-400 underline-offset-2 hover:text-zinc-600 hover:underline dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
