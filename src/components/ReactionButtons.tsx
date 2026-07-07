'use client'

import { useState } from 'react'
import { toggleReaction } from '@/app/actions/feedback'

interface ReactionButtonsProps {
  itemId: string
  initialIsHelpful: boolean
  initialIsNotRelevant: boolean
}

export function ReactionButtons({
  itemId,
  initialIsHelpful,
  initialIsNotRelevant,
}: ReactionButtonsProps) {
  const [isHelpful, setIsHelpful] = useState(initialIsHelpful)
  const [isNotRelevant, setIsNotRelevant] = useState(initialIsNotRelevant)

  const handleHelpful = async () => {
    const prev = { isHelpful, isNotRelevant }
    setIsHelpful(!isHelpful)
    if (!isHelpful) setIsNotRelevant(false)

    try {
      await toggleReaction(itemId, 'helpful', isHelpful)
    } catch {
      setIsHelpful(prev.isHelpful)
      setIsNotRelevant(prev.isNotRelevant)
    }
  }

  const handleNotRelevant = async () => {
    const prev = { isHelpful, isNotRelevant }
    setIsNotRelevant(!isNotRelevant)
    if (!isNotRelevant) setIsHelpful(false)

    try {
      await toggleReaction(itemId, 'not_relevant', isNotRelevant)
    } catch {
      setIsHelpful(prev.isHelpful)
      setIsNotRelevant(prev.isNotRelevant)
    }
  }

  return (
    <div className="flex gap-0.5">
      <button
        onClick={handleHelpful}
        aria-label={isHelpful ? 'Remove helpful mark' : 'Mark as helpful'}
        aria-pressed={isHelpful}
        className={[
          'flex h-8 w-8 items-center justify-center rounded transition-colors',
          isHelpful
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400',
        ].join(' ')}
      >
        {isHelpful ? <ThumbsUpFilledIcon /> : <ThumbsUpIcon />}
      </button>
      <button
        onClick={handleNotRelevant}
        aria-label={isNotRelevant ? 'Remove not relevant mark' : 'Mark as not relevant'}
        aria-pressed={isNotRelevant}
        className={[
          'flex h-8 w-8 items-center justify-center rounded transition-colors',
          isNotRelevant
            ? 'text-red-500 dark:text-red-400'
            : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400',
        ].join(' ')}
      >
        {isNotRelevant ? <ThumbsDownFilledIcon /> : <ThumbsDownIcon />}
      </button>
    </div>
  )
}

function ThumbsUpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  )
}

function ThumbsDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  )
}

function ThumbsUpFilledIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  )
}

function ThumbsDownFilledIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  )
}
