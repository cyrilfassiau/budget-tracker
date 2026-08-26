import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

import { Badge, Button, Field, Input, SegmentedControl, Select } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { useUIStore } from '@/store/useUIStore'
import type { TransactionType } from '@/types'
import { countActiveFilters, isFilterActive } from '@/utils/filters'

/**
 * Search is always visible; the rest collapses behind a toggle so the list
 * stays the focus on small screens.
 */
export function TransactionFilters() {
  const filters = useUIStore((state) => state.filters)
  const setFilters = useUIStore((state) => state.setFilters)
  const resetFilters = useUIStore((state) => state.resetFilters)
  const categories = useCategoriesStore((state) => state.items)

  const [expanded, setExpanded] = useState(false)
  const activeCount = countActiveFilters(filters)
  const active = isFilterActive(filters)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <label htmlFor="transaction-search" className="sr-only">
            Search notes
          </label>
          <Input
            id="transaction-search"
            type="search"
            placeholder="Search notes…"
            value={filters.search}
            onChange={(event) => setFilters({ search: event.target.value })}
            leading={<Search className="size-4" />}
          />
        </div>

        <Button
          variant={expanded ? 'soft' : 'secondary'}
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls="transaction-filter-panel"
          icon={<SlidersHorizontal className="size-4" />}
        >
          <span className="hidden sm:inline">Filters</span>
          {activeCount > 0 ? (
            <Badge tone="accent" className="ml-0.5">
              {activeCount}
            </Badge>
          ) : null}
        </Button>

        {active ? (
          <Button
            variant="ghost"
            onClick={resetFilters}
            icon={<X className="size-4" />}
            aria-label="Clear all filters"
          >
            <span className="hidden sm:inline">Clear</span>
          </Button>
        ) : null}
      </div>

      <div
        id="transaction-filter-panel"
        hidden={!expanded}
        className={cn(
          'grid animate-in gap-4 rounded-2xl border border-border-base bg-card p-4',
          'sm:grid-cols-2 lg:grid-cols-4',
        )}
      >
        <Field label="Type" className="sm:col-span-2 lg:col-span-1">
          {() => (
            <SegmentedControl<TransactionType | 'all'>
              label="Filter by type"
              size="sm"
              value={filters.type}
              onChange={(type) => setFilters({ type })}
              options={[
                { value: 'all', label: 'All' },
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' },
              ]}
            />
          )}
        </Field>

        <Field label="Category">
          {({ id }) => (
            <Select
              id={id}
              value={filters.categoryIds[0] ?? ''}
              onChange={(event) =>
                setFilters({ categoryIds: event.target.value ? [event.target.value] : [] })
              }
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="From">
          {({ id }) => (
            <Input
              id={id}
              type="date"
              value={filters.from ?? ''}
              max={filters.to ?? undefined}
              onChange={(event) => setFilters({ from: event.target.value || null })}
            />
          )}
        </Field>

        <Field label="To">
          {({ id }) => (
            <Input
              id={id}
              type="date"
              value={filters.to ?? ''}
              min={filters.from ?? undefined}
              onChange={(event) => setFilters({ to: event.target.value || null })}
            />
          )}
        </Field>
      </div>
    </div>
  )
}
