import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Amount, CategoryAvatar } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { Category, Transaction } from '@/types'
import { formatDateLabel } from '@/utils/dates'

interface TransactionRowProps {
  transaction: Transaction
  category?: Category
  /** Balance after this entry, across all history. */
  balance?: number
  showBalance?: boolean
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
  pending?: boolean
  /** A just-added row drops onto the stack. */
  fresh?: boolean
}

function RowMenu({
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
          'tap flex size-9 items-center justify-center rounded-full text-fg-faint transition-colors',
          'hover:bg-surface-2 hover:text-fg',
          open && 'bg-surface-2 text-fg',
        )}
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-40 animate-in overflow-hidden rounded-[16px] bg-raised p-1 shadow-[0_10px_30px_-8px_rgb(var(--scrim)/0.35)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onEdit()
            }}
            className="flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2 text-[14px] font-semibold text-fg transition-colors hover:bg-surface-2"
          >
            <Pencil className="size-4" />
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onDelete()
            }}
            className="flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2 text-[14px] font-semibold text-negative transition-colors hover:bg-negative-soft"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  )
}

/**
 * One line of the feed: circular category avatar, what it was, and the amount.
 *
 * Money arriving is the only thing that turns green; a transfer is labelled
 * because it changes no balance and would otherwise read as a payment.
 */
export function TransactionRow({
  transaction,
  category,
  balance,
  showBalance = false,
  onEdit,
  onDelete,
  pending = false,
  fresh = false,
}: TransactionRowProps) {
  const label = transaction.note || category?.name || 'Transaction'
  const isTransfer = transaction.type === 'transfer'
  const isIncome = transaction.type === 'income'

  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-[16px] px-2 py-2.5 transition-colors hover:bg-surface',
        pending && 'opacity-50',
        fresh && 'animate-drop',
      )}
    >
      <CategoryAvatar color={category?.color ?? '#8b8f9a'} icon={category?.icon} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="min-w-0 truncate text-[15px] font-bold text-fg">{label}</p>
          {isTransfer ? (
            <span className="pill shrink-0 bg-surface-2 px-2 py-0.5 text-[12px] font-semibold text-fg-muted">
              Transfer
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-[13px] text-fg-muted">
          {category?.name ?? 'Uncategorized'} · {formatDateLabel(transaction.date, 'd MMM')}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-[15px] font-extrabold text-fg">
          {isTransfer ? (
            <Amount value={transaction.amount} plain className="text-fg-muted" />
          ) : (
            // Signed for both directions: the sign carries the direction, so
            // red stays free to mean trouble rather than "this was spending".
            <Amount value={isIncome ? transaction.amount : -transaction.amount} signed />
          )}
        </p>
        {showBalance && balance !== undefined ? (
          <p className="mt-0.5 text-[12px] font-semibold text-fg-faint">
            <Amount value={balance} plain />
          </p>
        ) : null}
      </div>

      {onEdit && onDelete ? (
        <RowMenu
          label={label}
          onEdit={() => onEdit(transaction)}
          onDelete={() => onDelete(transaction)}
        />
      ) : null}
    </li>
  )
}
