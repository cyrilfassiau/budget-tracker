import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Lock,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Amount, CategoryAvatar } from '@/components/ui'
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
  income: 'Income',
  expense: 'Spending',
  transfer: 'Transfers',
  both: 'Any',
}

/**
 * Reordering works by drag on a pointer and by the arrows everywhere else. The
 * arrows are always rendered, never revealed on hover, because a touch device
 * has no hover to reveal them with.
 */
function OverflowMenu({
  category,
  canMoveUp,
  canMoveDown,
  onEdit,
  onDelete,
  onMove,
}: Pick<CategoryCardProps, 'category' | 'canMoveUp' | 'canMoveDown' | 'onEdit' | 'onDelete' | 'onMove'>) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const item =
    'flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-[14px] font-semibold transition-colors disabled:opacity-30'

  return (
    <div ref={containerRef} className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Actions for ${category.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'tap flex size-9 items-center justify-center rounded-full text-fg-faint transition-colors',
          open && 'bg-surface-2 text-fg',
        )}
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-44 animate-in overflow-hidden rounded-[16px] bg-raised p-1 shadow-[0_10px_30px_-8px_rgb(var(--scrim)/0.35)]"
        >
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onEdit(category) }} className={cn(item, 'text-fg hover:bg-surface-2')}>
            <Pencil className="size-4" />
            Edit
          </button>
          <button type="button" role="menuitem" disabled={!canMoveUp} onClick={() => onMove(category, -1)} className={cn(item, 'text-fg hover:bg-surface-2')}>
            <ChevronUp className="size-4" />
            Move up
          </button>
          <button type="button" role="menuitem" disabled={!canMoveDown} onClick={() => onMove(category, 1)} className={cn(item, 'text-fg hover:bg-surface-2')}>
            <ChevronDown className="size-4" />
            Move down
          </button>
          <button type="button" role="menuitem" disabled={category.isSystem} onClick={() => { setOpen(false); onDelete(category) }} className={cn(item, 'text-negative hover:bg-negative-soft')}>
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  )
}

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
        'flex items-center gap-3 rounded-[16px] px-2 py-2.5 transition-colors',
        dragging && 'opacity-40',
        dropTarget ? 'bg-accent-soft' : 'hover:bg-surface',
      )}
    >
      <span aria-hidden="true" className="hidden cursor-grab text-fg-faint active:cursor-grabbing sm:block">
        <GripVertical className="size-4" />
      </span>

      <CategoryAvatar color={category.color} icon={category.icon} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[15px] font-bold text-fg">{category.name}</p>
          {category.isSystem ? (
            <Lock className="size-3 shrink-0 text-fg-faint" aria-label="Built-in category" />
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-[13px] text-fg-muted">
          {KIND_LABEL[category.kind]}
          {usage.count > 0
            ? ` · ${usage.count} transaction${usage.count === 1 ? '' : 's'}`
            : ' · unused'}
        </p>
      </div>

      {usage.total > 0 ? (
        <span className="shrink-0 text-[15px] font-bold text-fg">
          <Amount value={usage.total} plain whole />
        </span>
      ) : null}

      <OverflowMenu
        category={category}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onEdit={onEdit}
        onDelete={onDelete}
        onMove={onMove}
      />

      <div className="hidden shrink-0 items-center gap-0.5 sm:flex">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => onMove(category, -1)}
            disabled={!canMoveUp}
            aria-label={`Move ${category.name} up`}
            className="px-1 text-fg-faint transition-colors hover:text-fg disabled:opacity-25"
          >
            <ChevronUp className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMove(category, 1)}
            disabled={!canMoveDown}
            aria-label={`Move ${category.name} down`}
            className="px-1 text-fg-faint transition-colors hover:text-fg disabled:opacity-25"
          >
            <ChevronDown className="size-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onEdit(category)}
          aria-label={`Edit ${category.name}`}
          className="flex size-8 items-center justify-center rounded-full text-fg-faint transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(category)}
          disabled={category.isSystem}
          aria-label={`Delete ${category.name}`}
          title={category.isSystem ? 'Built-in categories cannot be deleted' : undefined}
          className="flex size-8 items-center justify-center rounded-full text-fg-faint transition-colors hover:bg-negative-soft hover:text-negative disabled:pointer-events-none disabled:opacity-25"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </li>
  )
}
