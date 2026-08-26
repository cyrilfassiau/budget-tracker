import { Monitor, Moon, Sun } from 'lucide-react'

import { cn } from '@/lib/cn'
import { useUIStore } from '@/store/useUIStore'
import type { ThemePreference } from '@/types'

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
]

/** Three-state theme switch; the preference is persisted by the UI store. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useUIStore((state) => state.theme)
  const setTheme = useUIStore((state) => state.setTheme)

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-xl border border-border-base bg-bg-subtle p-0.5',
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={`${label} theme`}
          title={`${label} theme`}
          onClick={() => setTheme(value)}
          className={cn(
            'flex size-7 items-center justify-center rounded-lg transition-all duration-150',
            theme === value
              ? 'bg-card text-fg shadow-sm'
              : 'text-fg-subtle hover:text-fg',
          )}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  )
}
