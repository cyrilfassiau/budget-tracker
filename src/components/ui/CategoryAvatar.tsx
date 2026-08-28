import { createElement } from 'react'

import { getCategoryIcon } from '@/lib/icons'
import { cn } from '@/lib/cn'

interface CategoryAvatarProps {
  color: string
  icon?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'size-8',
  md: 'size-11',
  lg: 'size-14',
}

const ICONS = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
}

export function CategoryAvatar({ color, icon = 'circle', size = 'md', className }: CategoryAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full text-white',
        SIZES[size],
        className,
      )}
      style={{ backgroundColor: color }}
    >
      {createElement(getCategoryIcon(icon), {
        className: ICONS[size],
        strokeWidth: 2.25,
      })}
    </span>
  )
}
