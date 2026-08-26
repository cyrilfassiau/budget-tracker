import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Amount, CategoryMark } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { Category, Transaction } from '@/types'
import { formatDateLabel } from '@/utils/dates'

interface RegisterEntryProps {
  transaction: Transaction
  category?: Category
  /** Balance after this entry, across all history. */
  balance?: number
  showBalance?: boolean
  startsDay?: boolean
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
  pending?: boolean
  /** Recently added rows are struck onto the sheet. */
  fresh?: boolean
}

function EntryActions({
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
          'p-1 text-ink-3 transition-colors hover:bg-sheet-alt hover:text-ink',
          open && 'bg-sheet-alt text-ink',
        )}
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-32 animate-in border border-ink bg-sheet"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onEdit()
            }}
            className="flex w-full items-center gap-2 px-2.5 py-1.5 font-narrow text-[12px] font-semibold uppercase tracking-[0.06em] text-ink transition-colors hover:bg-sheet-alt"
          >
            <Pencil className="size-3" />
            Amend
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onDelete()
            }}
            className="flex w-full items-center gap-2 border-t border-rule px-2.5 py-1.5 font-narrow text-[12px] font-semibold uppercase tracking-[0.06em] text-red transition-colors hover:bg-red-tint"
          >
            <Trash2 className="size-3" />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  )
}

/**
 * One line of the register.
 *
 * Paid out and paid in are separate columns, so direction is read from
 * position rather than colour — which leaves colour free to mean the one thing
 * it means everywhere in this app: trouble.
 */
export function RegisterEntry({
  transaction,
  category,
  balance,
  showBalance = false,
  startsDay = false,
  onEdit,
  onDelete,
  pending = false,
  fresh = false,
}: RegisterEntryProps) {
  const label = transaction.note || category?.name || 'Entry'
  const isTransfer = transaction.type === 'transfer'

  return (
    <tr
      className={cn(
        'group border-t transition-colors hover:bg-sheet-alt',
        startsDay ? 'border-rule-strong' : 'border-rule',
        pending && 'opacity-50',
        fresh && 'animate-entry',
      )}
    >
      <td className="whitespace-nowrap py-2 pl-4 pr-2 align-top sm:pl-5">
        <time dateTime={transaction.date} className="stamp text-ink-3">
          {startsDay ? formatDateLabel(transaction.date, 'dd MMM') : ''}
        </time>
      </td>

      <td className="w-full py-2 pr-2 align-top">
        <div className="flex items-baseline gap-2">
          <p className="min-w-0 truncate text-[13px] text-ink">{label}</p>
          {isTransfer ? <span className="stamp shrink-0 text-[9px] text-ink-3">TFR</span> : null}
          {/* On a phone the money columns collapse into one, so direction
              moves onto a tag rather than being lost. */}
          {transaction.type === 'income' ? (
            <span className="stamp shrink-0 text-[9px] text-ink-3 sm:hidden">IN</span>
          ) : null}
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-3">
          <CategoryMark icon={category?.icon} size="sm" />
          <span className="truncate">{category?.name ?? 'Uncategorized'}</span>
        </p>
      </td>

      {/* One amount column on a phone; three ruled columns from `sm` up. */}
      <td
        data-column="amount"
        className="whitespace-nowrap px-2 py-2 text-right align-top text-[13px] text-ink sm:hidden"
      >
        <Amount value={transaction.amount} plain />
      </td>

      <td
        data-column="paid-out"
        className="hidden whitespace-nowrap px-2 py-2 text-right align-top text-[13px] text-ink sm:table-cell"
      >
        {transaction.type === 'expense' ? <Amount value={transaction.amount} plain /> : null}
      </td>

      <td
        data-column="paid-in"
        className="hidden whitespace-nowrap px-2 py-2 text-right align-top text-[13px] text-ink sm:table-cell"
      >
        {transaction.type === 'income' ? <Amount value={transaction.amount} plain /> : null}
      </td>

      <td
        data-column="transfer"
        className="hidden whitespace-nowrap px-2 py-2 text-right align-top text-[13px] text-ink-2 sm:table-cell"
      >
        {isTransfer ? <Amount value={transaction.amount} plain /> : null}
      </td>

      {showBalance ? (
        <td
          data-column="balance"
          className="hidden whitespace-nowrap px-2 py-2 text-right align-top text-[13px] font-semibold text-ink lg:table-cell"
        >
          {balance === undefined ? null : <Amount value={balance} />}
        </td>
      ) : null}

      <td className="w-8 py-2 pl-1 pr-3 align-top sm:pr-4">
        {onEdit && onDelete ? (
          <EntryActions
            label={label}
            onEdit={() => onEdit(transaction)}
            onDelete={() => onDelete(transaction)}
          />
        ) : null}
      </td>
    </tr>
  )
}

/** The register's printed column heads. */
export function RegisterHead({ showBalance = false }: { showBalance?: boolean }) {
  return (
    <thead>
      <tr className="border-b border-rule-strong bg-sheet-alt">
        <th scope="col" className="col-head py-1.5 pl-4 pr-2 text-left sm:pl-5">
          Date
        </th>
        <th scope="col" className="col-head py-1.5 pr-2 text-left">
          Particulars
        </th>
        <th scope="col" className="col-head px-2 py-1.5 text-right sm:hidden">
          Amount
        </th>
        <th scope="col" className="col-head hidden px-2 py-1.5 text-right sm:table-cell">
          Paid out
        </th>
        <th scope="col" className="col-head hidden px-2 py-1.5 text-right sm:table-cell">
          Paid in
        </th>
        <th scope="col" className="col-head hidden px-2 py-1.5 text-right sm:table-cell">
          Transfer
        </th>
        {showBalance ? (
          <th scope="col" className="col-head hidden px-2 py-1.5 text-right lg:table-cell">
            Balance
          </th>
        ) : null}
        <th scope="col" className="w-8 py-1.5 pl-1 pr-3 sm:pr-4">
          <span className="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
  )
}
