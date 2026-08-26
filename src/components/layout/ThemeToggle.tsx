import { cn } from '@/lib/cn'
import { useUIStore } from '@/store/useUIStore'
import type { ThemePreference } from '@/types'

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Sheet' },
  { value: 'dark', label: 'Carbon' },
  { value: 'system', label: 'Auto' },
]

/** Top sheet, carbon copy, or whichever the device is using. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useUIStore((state) => state.theme)
  const setTheme = useUIStore((state) => state.setTheme)

  return (
    <div
      role="radiogroup"
      aria-label="Sheet side"
      className={cn('flex border border-rule', className)}
    >
      {OPTIONS.map(({ value, label }, index) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          onClick={() => setTheme(value)}
          className={cn(
            'px-2 py-1 font-narrow text-[11px] font-semibold uppercase tracking-[0.07em]',
            'transition-colors duration-100',
            index > 0 && 'border-l border-rule',
            theme === value
              ? 'bg-ink text-sheet'
              : 'bg-sheet text-ink-3 hover:bg-sheet-alt hover:text-ink',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
