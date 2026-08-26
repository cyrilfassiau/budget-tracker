import { ArrowDown, ArrowUp, Search, X } from 'lucide-react'
import { useState } from 'react'

import { Button, Field, Input, Select, TypePicker } from '@/components/ui'
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
 * Search and scope stay visible; the rest folds away. The period scope lives
 * here rather than only on the statement, so arriving from "see all entries"
 * never silently widens the period the reader had in mind.
 */
export function RegisterControls() {
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
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[12rem] flex-1">
          <label htmlFor="register-search" className="sr-only">
            Search particulars
          </label>
          <Input
            id="register-search"
            type="search"
            placeholder="Search particulars…"
            value={filters.search}
            onChange={(event) => setFilters({ search: event.target.value })}
            leading={<Search className="size-3.5" />}
          />
        </div>

        <TypePicker<'month' | 'all'>
          label="Period scope"
          value={scope}
          onChange={setScope}
          options={[
            { value: 'month', label: 'This period' },
            { value: 'all', label: 'All history' },
          ]}
          className="w-auto shrink-0"
        />

        <Button
          variant={expanded ? 'primary' : 'secondary'}
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls="register-filters"
        >
          Filters{activeCount > 0 ? ` (${activeCount})` : ''}
        </Button>

        {isFilterActive(filters) ? (
          <Button variant="ghost" onClick={resetFilters} icon={<X className="size-3.5" />}>
            Clear
          </Button>
        ) : null}
      </div>

      <div
        id="register-filters"
        hidden={!expanded}
        className="grid animate-in gap-3 border border-rule bg-sheet p-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Field label="Type">
          {() => (
            <TypePicker<TransactionType | 'all'>
              label="Filter by type"
              value={filters.type}
              onChange={(type) => setFilters({ type })}
              options={[
                { value: 'all', label: 'All' },
                { value: 'expense', label: 'Out' },
                { value: 'income', label: 'In' },
                { value: 'transfer', label: 'Tfr' },
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

      <div className="flex items-center gap-1">
        <span className="col-head mr-1 text-ink-3">Order by</span>
        {SORT_FIELDS.map(({ field, label }) => {
          const active = sort.field === field
          return (
            <button
              key={field}
              type="button"
              onClick={() => toggleSort(field)}
              aria-pressed={active}
              className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5',
                'font-narrow text-[11px] font-semibold uppercase tracking-[0.06em]',
                'transition-colors duration-100',
                active ? 'bg-ink text-sheet' : 'text-ink-3 hover:bg-sheet-alt hover:text-ink',
              )}
            >
              {label}
              {active ? (
                sort.direction === 'asc' ? (
                  <ArrowUp className="size-2.5" />
                ) : (
                  <ArrowDown className="size-2.5" />
                )
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
