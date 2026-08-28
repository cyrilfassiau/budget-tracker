import { cn } from '@/lib/cn'

interface Option<T extends string> {
  value: T
  label: string
  hint?: string
}

interface SegmentedPillProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: Option<T>[]
  label: string
  className?: string
}

export function SegmentedPill<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: SegmentedPillProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('pill inline-flex items-center gap-1 bg-surface-2 p-1', className)}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            title={option.hint}
            onClick={() => onChange(option.value)}
            className={cn(
              'pill h-9 flex-1 whitespace-nowrap px-4 text-[14px] font-bold transition-colors',
              selected
                ? 'bg-fg text-bg'
                : 'text-fg-muted hover:text-fg',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
