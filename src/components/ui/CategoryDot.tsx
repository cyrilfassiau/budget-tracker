import { getCategoryIcon } from '@/lib/icons'
import { cn } from '@/lib/cn'

interface CategoryDotProps {
  color: string
  icon?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'size-6 rounded-lg',
  md: 'size-9 rounded-xl',
  lg: 'size-11 rounded-2xl',
}

const ICON_SIZES = {
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-5',
}

/**
 * The category's identity in one element: its colour as a tinted tile with its
 * icon on top. Used in lists, the dashboard and the category grid.
 */
export function CategoryDot({ color, icon = 'circle', size = 'md', className }: CategoryDotProps) {
  const Icon = getCategoryIcon(icon)

  return (
    <span
      aria-hidden="true"
      className={cn('flex shrink-0 items-center justify-center', SIZES[size], className)}
      style={{ backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
    >
      <Icon className={ICON_SIZES[size]} strokeWidth={2.2} />
    </span>
  )
}
