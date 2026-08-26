import { cn } from '@/lib/cn'

interface Option<T extends string> {
  value: T
  label: string
  icon?: React.ReactNode
}

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: Option<T>[]
  /** Accessible name for the group. */
  label: string
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Radio-group semantics with a segmented look — used for income/expense and
 * the theme picker. Arrow keys move between options for free via `role=radio`.
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  size = 'md',
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'inline-flex w-full items-center gap-1 rounded-xl border border-border-base bg-bg-subtle p-1',
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg font-medium',
              'transition-all duration-150',
              size === 'sm' ? 'h-7 px-2 text-xs' : 'h-8 px-3 text-[13px]',
              selected
                ? 'bg-card text-fg shadow-sm'
                : 'text-fg-muted hover:text-fg',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
