import { ArrowDown, ArrowUp } from 'lucide-react'

import { cn } from '@/lib/cn'
import { useUIStore } from '@/store/useUIStore'
import type { SortField } from '@/types'

const FIELDS: { field: SortField; label: string }[] = [
  { field: 'date', label: 'Date' },
  { field: 'amount', label: 'Amount' },
]

/** Column-style sort toggles above the list. */
export function SortControls() {
  const sort = useUIStore((state) => state.sort)
  const toggleSort = useUIStore((state) => state.toggleSort)

  return (
    <div className="flex items-center gap-1">
      <span className="mr-1 text-xs text-fg-subtle">Sort</span>
      {FIELDS.map(({ field, label }) => {
        const active = sort.field === field
        return (
          <button
            key={field}
            type="button"
            onClick={() => toggleSort(field)}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors',
              active ? 'bg-accent-soft text-accent' : 'text-fg-muted hover:bg-card-muted hover:text-fg',
            )}
          >
            {label}
            {active ? (
              sort.direction === 'asc' ? (
                <ArrowUp className="size-3" />
              ) : (
                <ArrowDown className="size-3" />
              )
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
