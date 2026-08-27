import { ArrowDown, ArrowUp, Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

import { Button, Field, Input, SegmentedPill, Select } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { useUIStore } from '@/store/useUIStore'
import type { SortField, TransactionType } from '@/types'
import { countActiveFilters, isFilterActive } from '@/utils/filters'

const SORT_FIELDS: { field: SortField; label: string }[] = [
  { field: 'date', label: 'Date' },
  { field: 'amount', label: 'Amount' },
]

/**
 * Search and month scope stay out; the rest folds away. The scope control
 * lives here as well as on the header, so arriving from "see all" never
 * silently widens the month the reader had in mind.
 */
export function TransactionFilters() {
  const filters = useUIStore((state) => state.filters)
  const setFilters = useUIStore((state) => state.setFilters)
  const resetFilters = useUIStore((state) => state.resetFilters)
  const scope = useUIStore((state) => state.registerScope)
  const setScope = useUIStore((state) => state.setScope)
  const sort = useUIStore((state) => state.sort)
  const toggleSort = useUIStore((state) => state.toggleSort)
  const categories = useCategoriesStore((state) => state.items)

  const [expanded, setExpanded] = useState(false)
  const activeCount = countActiveFilters(filters)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[11rem] flex-1">
          <label htmlFor="transaction-search" className="sr-only">
            Search transactions
          </label>
          <Input
            id="transaction-search"
            type="search"
            placeholder="Search"
            value={filters.search}
            onChange={(event) => setFilters({ search: event.target.value })}
            leading={<Search className="size-4" />}
          />
        </div>

        <Button
          variant={expanded ? 'primary' : 'secondary'}
          icon={<SlidersHorizontal className="size-4" />}
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls="transaction-filters"
        >
          Filters{activeCount > 0 ? ` (${activeCount})` : ''}
        </Button>

        {isFilterActive(filters) ? (
          <Button variant="ghost" icon={<X className="size-4" />} onClick={resetFilters}>
            Clear
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <SegmentedPill<'month' | 'all'>
          label="Period scope"
          value={scope}
          onChange={setScope}
          options={[
            { value: 'month', label: 'This month' },
            { value: 'all', label: 'All time' },
          ]}
        />

        <div className="ml-auto flex items-center gap-1">
          <span className="text-[13px] font-semibold text-fg-faint">Sort</span>
          {SORT_FIELDS.map(({ field, label }) => {
            const active = sort.field === field
            return (
              <button
                key={field}
                type="button"
                onClick={() => toggleSort(field)}
                aria-pressed={active}
                className={cn(
                  'pill inline-flex items-center gap-1 px-3 py-1.5 text-[13px] font-bold transition-colors',
                  active ? 'bg-surface-2 text-fg' : 'text-fg-muted hover:bg-surface hover:text-fg',
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
      </div>

      <div
        id="transaction-filters"
        hidden={!expanded}
        className="grid animate-in gap-4 rounded-[20px] bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Field label="Type">
          {() => (
            <SegmentedPill<TransactionType | 'all'>
              label="Filter by type"
              value={filters.type}
              onChange={(type) => setFilters({ type })}
              options={[
                { value: 'all', label: 'All' },
                { value: 'expense', label: 'Out' },
                { value: 'income', label: 'In' },
                { value: 'transfer', label: 'Moved' },
              ]}
              className="w-full"
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
