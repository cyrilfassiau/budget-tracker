import { ChevronDown, ChevronUp, GripVertical, Lock, Pencil, Trash2 } from 'lucide-react'

import { Amount, CategoryMark } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { Category, CategoryKind } from '@/types'

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
  onMove: (category: Category, direction: -1 | 1) => void
  canMoveUp: boolean
  canMoveDown: boolean
  dragHandlers: {
    onDragStart: () => void
    onDragEnter: () => void
    onDragEnd: () => void
  }
}

const KIND_LABEL: Record<CategoryKind, string> = {
  income: 'In',
  expense: 'Out',
  transfer: 'Transfer',
  both: 'Any',
}

/**
 * A line in the index of categories. This is the one surface where a
 * category's colour is the subject rather than a competing signal, so the
 * swatch shows here and nowhere in the register.
 *
 * Reordering works by drag on a pointer and by the arrow buttons everywhere
 * else — the buttons are always rendered, never revealed on hover, because a
 * touch device has no hover to reveal them with.
 */
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
  return (
    <li
      draggable
      onDragStart={dragHandlers.onDragStart}
      onDragEnter={dragHandlers.onDragEnter}
      onDragEnd={dragHandlers.onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      className={cn(
        'flex items-center gap-2 border-t border-rule px-3 py-2 transition-colors sm:px-4',
        dragging && 'opacity-40',
        dropTarget && 'bg-carbon-tint',
      )}
    >
      <span aria-hidden="true" className="hidden cursor-grab text-ink-3 active:cursor-grabbing sm:block">
        <GripVertical className="size-3.5" />
      </span>

      <span
        aria-hidden="true"
        className="size-3 shrink-0 border border-rule-strong"
        style={{ backgroundColor: category.color }}
      />
      <CategoryMark icon={category.icon} size="sm" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[13px] text-ink">{category.name}</p>
          {category.isSystem ? (
            <Lock className="size-2.5 shrink-0 text-ink-3" aria-label="Built-in category" />
          ) : null}
        </div>
        <p className="stamp text-[10px] text-ink-3">
          {KIND_LABEL[category.kind]}
          {usage.count > 0 ? ` · ${usage.count} ${usage.count === 1 ? 'entry' : 'entries'}` : ' · unused'}
        </p>
      </div>

      {usage.total > 0 ? (
        <span className="whitespace-nowrap text-[13px] text-ink-2">
          <Amount value={usage.total} plain whole />
        </span>
      ) : null}

      <div className="flex shrink-0 items-center gap-0.5">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => onMove(category, -1)}
            disabled={!canMoveUp}
            aria-label={`Move ${category.name} up`}
            className="px-0.5 text-ink-3 transition-colors hover:text-ink disabled:opacity-25"
          >
            <ChevronUp className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => onMove(category, 1)}
            disabled={!canMoveDown}
            aria-label={`Move ${category.name} down`}
            className="px-0.5 text-ink-3 transition-colors hover:text-ink disabled:opacity-25"
          >
            <ChevronDown className="size-3" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onEdit(category)}
          aria-label={`Edit ${category.name}`}
          className="p-1 text-ink-3 transition-colors hover:bg-sheet-alt hover:text-ink"
        >
          <Pencil className="size-3" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(category)}
          disabled={category.isSystem}
          aria-label={`Delete ${category.name}`}
          title={category.isSystem ? 'Built-in categories cannot be deleted' : undefined}
          className="p-1 text-ink-3 transition-colors hover:bg-red-tint hover:text-red disabled:pointer-events-none disabled:opacity-25"
        >
          <Trash2 className="size-3" />
        </button>
      </div>
    </li>
  )
}
