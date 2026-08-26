import { cn } from '@/lib/cn'

interface Option<T extends string> {
  value: T
  label: string
  hint?: string
}

interface TypePickerProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: Option<T>[]
  label: string
  className?: string
}

/**
 * Ruled tabs sharing one border, the way a form offers boxes to tick. Radio
 * semantics, so arrow keys work without extra handling.
 */
export function TypePicker<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: TypePickerProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('flex w-full border border-rule', className)}
    >
      {options.map((option, index) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            title={option.hint}
            className={cn(
              'flex flex-1 flex-col items-center justify-center py-1.5',
              'font-narrow text-[12px] font-semibold uppercase tracking-[0.07em]',
              'transition-colors duration-100',
              index > 0 && 'border-l border-rule',
              selected
                ? 'bg-carbon text-sheet'
                : 'bg-sheet text-ink-3 hover:bg-sheet-alt hover:text-ink',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
