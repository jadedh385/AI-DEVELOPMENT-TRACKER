import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactionButtons } from '@/components/ReactionButtons'

const mockToggleReaction = vi.fn()

vi.mock('@/app/actions/feedback', () => ({
  toggleReaction: (...args: unknown[]) => mockToggleReaction(...args),
}))

describe('ReactionButtons', () => {
  beforeEach(() => {
    mockToggleReaction.mockClear().mockResolvedValue(undefined)
  })

  it('renders helpful and not-relevant buttons', () => {
    render(
      <ReactionButtons itemId="item-1" initialIsHelpful={false} initialIsNotRelevant={false} />,
    )

    expect(screen.getByRole('button', { name: /mark as helpful/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark as not relevant/i })).toBeInTheDocument()
  })

  it('shows remove label when already helpful', () => {
    render(
      <ReactionButtons itemId="item-1" initialIsHelpful={true} initialIsNotRelevant={false} />,
    )

    expect(screen.getByRole('button', { name: /remove helpful/i })).toBeInTheDocument()
  })

  it('shows remove label when already not relevant', () => {
    render(
      <ReactionButtons itemId="item-1" initialIsHelpful={false} initialIsNotRelevant={true} />,
    )

    expect(screen.getByRole('button', { name: /remove not relevant/i })).toBeInTheDocument()
  })

  it('calls toggleReaction with helpful and isActive=false when not helpful', async () => {
    const user = userEvent.setup()
    render(
      <ReactionButtons itemId="item-42" initialIsHelpful={false} initialIsNotRelevant={false} />,
    )

    await user.click(screen.getByRole('button', { name: /mark as helpful/i }))

    await waitFor(() => {
      expect(mockToggleReaction).toHaveBeenCalledWith('item-42', 'helpful', false)
    })
  })

  it('calls toggleReaction with helpful and isActive=true when currently helpful', async () => {
    const user = userEvent.setup()
    render(
      <ReactionButtons itemId="item-42" initialIsHelpful={true} initialIsNotRelevant={false} />,
    )

    await user.click(screen.getByRole('button', { name: /remove helpful/i }))

    await waitFor(() => {
      expect(mockToggleReaction).toHaveBeenCalledWith('item-42', 'helpful', true)
    })
  })

  it('calls toggleReaction with not_relevant and isActive=false when not marked', async () => {
    const user = userEvent.setup()
    render(
      <ReactionButtons itemId="item-42" initialIsHelpful={false} initialIsNotRelevant={false} />,
    )

    await user.click(screen.getByRole('button', { name: /mark as not relevant/i }))

    await waitFor(() => {
      expect(mockToggleReaction).toHaveBeenCalledWith('item-42', 'not_relevant', false)
    })
  })

  it('optimistically marks helpful on click', async () => {
    const user = userEvent.setup()
    render(
      <ReactionButtons itemId="item-1" initialIsHelpful={false} initialIsNotRelevant={false} />,
    )

    await user.click(screen.getByRole('button', { name: /mark as helpful/i }))

    expect(screen.getByRole('button', { name: /remove helpful/i })).toBeInTheDocument()
  })

  it('optimistically clears not-relevant when marking helpful', async () => {
    const user = userEvent.setup()
    render(
      <ReactionButtons itemId="item-1" initialIsHelpful={false} initialIsNotRelevant={true} />,
    )

    await user.click(screen.getByRole('button', { name: /mark as helpful/i }))

    expect(screen.getByRole('button', { name: /mark as not relevant/i })).toBeInTheDocument()
  })

  it('optimistically clears helpful when marking not-relevant', async () => {
    const user = userEvent.setup()
    render(
      <ReactionButtons itemId="item-1" initialIsHelpful={true} initialIsNotRelevant={false} />,
    )

    await user.click(screen.getByRole('button', { name: /mark as not relevant/i }))

    expect(screen.getByRole('button', { name: /mark as helpful/i })).toBeInTheDocument()
  })

  it('reverts to previous state when toggleReaction rejects', async () => {
    mockToggleReaction.mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()
    render(
      <ReactionButtons itemId="item-1" initialIsHelpful={false} initialIsNotRelevant={false} />,
    )

    await user.click(screen.getByRole('button', { name: /mark as helpful/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /mark as helpful/i })).toBeInTheDocument()
    })
  })
})
