import { Monitor, Moon, Sun } from 'lucide-react'

import { cn } from '@/lib/cn'
import { useUIStore } from '@/store/useUIStore'
import type { ThemePreference } from '@/types'

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
]

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useUIStore((state) => state.theme)
  const setTheme = useUIStore((state) => state.setTheme)

  return (
    <div
      role="radiogroup"
      aria-label="Appearance"
      className={cn('pill inline-flex items-center gap-0.5 bg-surface-2 p-1', className)}
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          onClick={() => setTheme(value)}
          className={cn(
            'tap flex items-center justify-center rounded-full transition-colors',
            theme === value ? 'bg-fg text-bg' : 'text-fg-muted hover:text-fg',
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  )
}
