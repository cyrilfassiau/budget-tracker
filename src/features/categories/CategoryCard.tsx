import { ChevronDown, ChevronUp, GripVertical, Lock, Pencil, Trash2 } from 'lucide-react'

import { Badge, CategoryDot } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useCurrencyFormat } from '@/store/useSettingsStore'
import type { Category } from '@/types'
import { formatMoney } from '@/utils/money'

export interface CategoryUsage {
  count: number
  total: number
}

interface CategoryCardProps {
  category: Category
  usage: CategoryUsage
  dragging?: boolean
  dropTarget?: boolean
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  /** Keyboard-accessible alternative to dragging. */
  onMove: (category: Category, direction: -1 | 1) => void
  canMoveUp: boolean
  canMoveDown: boolean
  dragHandlers: {
    onDragStart: () => void
    onDragEnter: () => void
    onDragEnd: () => void
  }
}

const KIND_LABEL = {
  income: 'Income',
  expense: 'Expense',
  both: 'Both',
} as const

export function CategoryCard({
  category,
  usage,
  dragging,
  dropTarget,
  onEdit,
  onDelete,
  onMove,
  canMoveUp,
  canMoveDown,
  dragHandlers,
}: CategoryCardProps) {
  const { currency, locale } = useCurrencyFormat()

  return (
    <li
      draggable
      onDragStart={dragHandlers.onDragStart}
      onDragEnter={dragHandlers.onDragEnter}
      onDragEnd={dragHandlers.onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      className={cn(
        'group relative flex items-center gap-3 rounded-2xl border border-border-base bg-card p-3.5',
        'transition-[opacity,transform,border-color] duration-150',
        dragging && 'opacity-40',
        dropTarget && 'border-accent ring-2 ring-accent/20',
      )}
    >
      <span
        aria-hidden="true"
        className="hidden cursor-grab text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing sm:block"
      >
        <GripVertical className="size-4" />
      </span>

      <CategoryDot color={category.color} icon={category.icon} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium text-fg">{category.name}</p>
          {category.isSystem ? (
            <span title="Default category — cannot be deleted" className="text-fg-subtle">
              <Lock className="size-3" aria-label="Default category" />
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-fg-subtle">
          {usage.count === 0
            ? 'No transactions yet'
            : `${usage.count} transaction${usage.count === 1 ? '' : 's'} · ${formatMoney(usage.total, currency, locale, { maximumFractionDigits: 0 })}`}
        </p>
      </div>

      <Badge tone={category.kind === 'income' ? 'income' : 'neutral'} className="hidden sm:inline-flex">
        {KIND_LABEL[category.kind]}
      </Badge>

      <div className="flex shrink-0 items-center gap-0.5">
        <div className="flex flex-col opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 sm:flex">
          <button
            type="button"
            onClick={() => onMove(category, -1)}
            disabled={!canMoveUp}
            aria-label={`Move ${category.name} up`}
            className="rounded p-0.5 text-fg-subtle transition-colors hover:text-fg disabled:opacity-30"
          >
            <ChevronUp className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMove(category, 1)}
            disabled={!canMoveDown}
            aria-label={`Move ${category.name} down`}
            className="rounded p-0.5 text-fg-subtle transition-colors hover:text-fg disabled:opacity-30"
          >
            <ChevronDown className="size-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onEdit(category)}
          aria-label={`Edit ${category.name}`}
          className="rounded-lg p-1.5 text-fg-subtle transition-colors hover:bg-bg-subtle hover:text-fg"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(category)}
          disabled={category.isSystem}
          aria-label={`Delete ${category.name}`}
          title={category.isSystem ? 'Default categories cannot be deleted' : undefined}
          className="rounded-lg p-1.5 text-fg-subtle transition-colors hover:bg-expense-soft hover:text-expense disabled:pointer-events-none disabled:opacity-30"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </li>
  )
}
