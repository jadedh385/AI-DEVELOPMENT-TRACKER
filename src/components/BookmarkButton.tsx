'use client'

import { useState } from 'react'
import { toggleSave } from '@/app/actions/save'

interface BookmarkButtonProps {
  itemId: string
  initialIsSaved: boolean
}

export function BookmarkButton({ itemId, initialIsSaved }: BookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved)

  const handleClick = async () => {
    const prevSaved = isSaved
    setIsSaved(!prevSaved)

    try {
      await toggleSave(itemId, prevSaved)
    } catch {
      setIsSaved(prevSaved)
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isSaved ? 'Remove from saved' : 'Save for later'}
      className={[
        'flex h-8 w-8 items-center justify-center rounded transition-colors',
        isSaved
          ? 'text-zinc-900 dark:text-zinc-50'
          : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400',
      ].join(' ')}
    >
      {isSaved ? <BookmarkFilledIcon /> : <BookmarkIcon />}
    </button>
  )
}

function BookmarkIcon() {
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
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  )
}

function BookmarkFilledIcon() {
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
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  )
}
