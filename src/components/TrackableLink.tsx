'use client'

import { recordOpened } from '@/app/actions/feedback'

interface TrackableLinkProps {
  itemId: string
  href: string
  className?: string
  children: React.ReactNode
}

export function TrackableLink({ itemId, href, className, children }: TrackableLinkProps) {
  const handleClick = () => {
    recordOpened(itemId).catch(() => {})
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}
