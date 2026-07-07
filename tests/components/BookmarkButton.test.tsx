import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookmarkButton } from '@/components/BookmarkButton'

const mockToggleSave = vi.fn()

vi.mock('@/app/actions/save', () => ({
  toggleSave: (...args: unknown[]) => mockToggleSave(...args),
}))

describe('BookmarkButton', () => {
  beforeEach(() => {
    mockToggleSave.mockClear().mockResolvedValue(undefined)
  })

  it('renders with unsaved aria-label when not saved', () => {
    render(<BookmarkButton itemId="item-1" initialIsSaved={false} />)

    expect(screen.getByRole('button', { name: /save for later/i })).toBeInTheDocument()
  })

  it('renders with saved aria-label when already saved', () => {
    render(<BookmarkButton itemId="item-1" initialIsSaved={true} />)

    expect(screen.getByRole('button', { name: /remove from saved/i })).toBeInTheDocument()
  })

  it('calls toggleSave with itemId and current saved state on click', async () => {
    const user = userEvent.setup()
    render(<BookmarkButton itemId="item-42" initialIsSaved={false} />)

    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockToggleSave).toHaveBeenCalledWith('item-42', false)
    })
  })

  it('optimistically toggles to saved state on click', async () => {
    const user = userEvent.setup()
    render(<BookmarkButton itemId="item-1" initialIsSaved={false} />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByRole('button', { name: /remove from saved/i })).toBeInTheDocument()
  })

  it('optimistically toggles to unsaved state on click when saved', async () => {
    const user = userEvent.setup()
    render(<BookmarkButton itemId="item-1" initialIsSaved={true} />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByRole('button', { name: /save for later/i })).toBeInTheDocument()
  })

  it('reverts to previous state when toggleSave rejects', async () => {
    mockToggleSave.mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()
    render(<BookmarkButton itemId="item-1" initialIsSaved={false} />)

    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save for later/i })).toBeInTheDocument()
    })
  })
})
