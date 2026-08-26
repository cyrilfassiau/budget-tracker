import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Badge, CategoryDot } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useCurrencyFormat } from '@/store/useSettingsStore'
import type { Category, Transaction } from '@/types'
import { formatDateLabel } from '@/utils/dates'
import { formatMoney } from '@/utils/money'

interface TransactionItemProps {
  transaction: Transaction
  category?: Category
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
  /** Compact rows drop the actions menu — used by the dashboard preview. */
  compact?: boolean
  pending?: boolean
}

function ActionsMenu({
  onEdit,
  onDelete,
  label,
}: {
  onEdit: () => void
  onDelete: () => void
  label: string
}) {
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

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Actions for ${label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'rounded-lg p-1.5 text-fg-subtle transition-colors hover:bg-bg-subtle hover:text-fg',
          open && 'bg-bg-subtle text-fg',
        )}
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-36 animate-scale-in overflow-hidden rounded-xl border border-border-base bg-card p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onEdit()
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-fg transition-colors hover:bg-card-muted"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onDelete()
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-expense transition-colors hover:bg-expense-soft"
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  )
}

/** One transaction row, shared by the list view and the dashboard preview. */
export function TransactionItem({
  transaction,
  category,
  onEdit,
  onDelete,
  compact = false,
  pending = false,
}: TransactionItemProps) {
  const { currency, locale } = useCurrencyFormat()
  const isIncome = transaction.type === 'income'
  const label = transaction.note || category?.name || 'Transaction'

  return (
    <li
      className={cn(
        'group flex items-center gap-3 px-4 py-3 transition-colors sm:px-5',
        'hover:bg-card-muted',
        pending && 'opacity-60',
      )}
    >
      <CategoryDot
        color={category?.color ?? '#64748b'}
        icon={category?.icon}
        size={compact ? 'sm' : 'md'}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg">{label}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-subtle">
          <span className="truncate">{category?.name ?? 'Uncategorized'}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={transaction.date}>{formatDateLabel(transaction.date, 'd MMM')}</time>
        </p>
      </div>

      {!compact ? (
        <Badge tone={isIncome ? 'income' : 'neutral'} className="hidden sm:inline-flex">
          {isIncome ? 'Income' : 'Expense'}
        </Badge>
      ) : null}

      <span
        className={cn(
          'tabular shrink-0 text-sm font-semibold',
          isIncome ? 'text-income' : 'text-fg',
        )}
      >
        {isIncome ? '+' : '−'}
        {formatMoney(transaction.amount, currency, locale)}
      </span>

      {!compact && onEdit && onDelete ? (
        <ActionsMenu
          label={label}
          onEdit={() => onEdit(transaction)}
          onDelete={() => onDelete(transaction)}
        />
      ) : null}
    </li>
  )
}
