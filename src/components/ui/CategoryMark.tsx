import { getCategoryIcon } from '@/lib/icons'
import { cn } from '@/lib/cn'

interface CategoryMarkProps {
  icon?: string
  /** Only rendered where colour is the sole available encoding. */
  color?: string
  showColor?: boolean
  size?: 'sm' | 'md'
  className?: string
}

/**
 * A category's mark in the register is its icon, drawn in ink.
 *
 * Category colour is deliberately absent here: in this app colour means one
 * thing only — trouble — and identity that competes with it makes both
 * unreadable. Colour returns in the chart layer and on the categories page,
 * where it is the only encoding available.
 */
export function CategoryMark({
  icon = 'circle',
  color,
  showColor = false,
  size = 'md',
  className,
}: CategoryMarkProps) {
  const Icon = getCategoryIcon(icon)

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        size === 'sm' ? 'size-4' : 'size-5',
        className,
      )}
      style={showColor && color ? { color } : undefined}
    >
      {/* oxlint-disable-next-line react/static-components */}
      <Icon className={size === 'sm' ? 'size-3.5' : 'size-4'} strokeWidth={1.75} />
    </span>
  )
}
