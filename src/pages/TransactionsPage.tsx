import { Plus, Receipt, SearchX } from 'lucide-react'
import { useState } from 'react'

import { AppLayout } from '@/components/layout/AppLayout'
import { PeriodPicker } from '@/components/layout/PeriodPicker'
import { Amount, Button, Card, ConfirmDialog, EmptyState, SkeletonRows } from '@/components/ui'
import { ImportExport } from '@/features/transactions/ImportExport'
import { Pagination } from '@/features/transactions/Pagination'
import { TransactionFilters } from '@/features/transactions/TransactionFilters'
import { TransactionRow } from '@/features/transactions/TransactionRow'
import { useCategoryMap, useIsLoading } from '@/hooks/useAppData'
import { useRegister } from '@/hooks/useRegister'
import { useCurrencyFormat } from '@/store/useSettingsStore'
import { toMessage, toast } from '@/store/useToastStore'
import { useTransactionModal } from '@/store/useTransactionModal'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useUIStore } from '@/store/useUIStore'
import type { Transaction } from '@/types'
import { formatMonthLabel } from '@/utils/dates'
import { formatMoney } from '@/utils/money'

export function TransactionsPage() {
  const {
    rows,
    matched,
    summary,
    page,
    totalPages,
    total,
    pageSize,
    isEmpty,
    isFilteredEmpty,
    closingBalance,
  } = useRegister()
  const loading = useIsLoading()
  const categories = useCategoryMap()
  const scope = useUIStore((state) => state.registerScope)
  const month = useUIStore((state) => state.selectedMonth)
  const setPage = useUIStore((state) => state.setPage)
  const resetFilters = useUIStore((state) => state.resetFilters)
  const pendingIds = useTransactionsStore((state) => state.pendingIds)
  const removeTransaction = useTransactionsStore((state) => state.remove)
  const add = useTransactionsStore((state) => state.add)
  const openNew = useTransactionModal((state) => state.openNew)
  const openEdit = useTransactionModal((state) => state.openEdit)
  const { currency, locale } = useCurrencyFormat()

  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null)
  const [restoredId, setRestoredId] = useState<string | null>(null)

  const scopeLabel = scope === 'month' ? formatMonthLabel(month) : 'All time'

  const handleDelete = async () => {
    const target = pendingDelete
    if (!target) return

    try {
      await removeTransaction(target.id)
      setPendingDelete(null)
      toast.success('Transaction deleted', {
        action: {
          label: 'Undo',
          onClick: () => {
            void add({
              amount: target.amount,
              type: target.type,
              categoryId: target.categoryId,
              date: target.date,
              note: target.note,
            }).then((created) => {
              setRestoredId(created.id)
              toast.success('Transaction restored')
            })
          },
        },
      })
    } catch (error) {
      toast.error(toMessage(error, 'Could not delete the transaction.'))
    }
  }

  return (
    <AppLayout
      title="Transactions"
      actions={
        <>
          {scope === 'month' ? <PeriodPicker /> : null}
          <ImportExport rows={matched} scopeLabel={scopeLabel} />
          <Button
            variant="primary"
            icon={<Plus className="size-4" />}
            onClick={() => openNew()}
            aria-label="Add transaction"
          >
            Add
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TransactionFilters />

        <Card className="flex flex-col gap-2">
          {!loading && !isEmpty && !isFilteredEmpty ? (
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 pb-1">
              <div>
                <p className="text-[13px] font-semibold text-fg-muted">Balance</p>
                <p className="figure mt-0.5 text-[30px] font-extrabold leading-none tracking-[-0.03em] text-fg sm:text-[36px]">
                  <Amount value={closingBalance} plain />
                </p>
              </div>
              <p className="text-[13px] font-semibold text-fg-muted">
                <span className="text-positive">
                  <Amount value={summary.income} plain /> in
                </span>
                {' · '}
                <Amount value={summary.expenses} plain /> out
              </p>
            </div>
          ) : null}

          {loading ? (
            <SkeletonRows rows={8} />
          ) : isEmpty ? (
            <EmptyState
              icon={<Receipt className="size-6" />}
              title={scope === 'month' ? `Nothing in ${scopeLabel}` : 'No transactions yet'}
              description="Everything you add shows up here with the balance it left behind."
              action={
                <Button variant="primary" onClick={() => openNew()}>
                  Add a transaction
                </Button>
              }
            />
          ) : isFilteredEmpty ? (
            <EmptyState
              icon={<SearchX className="size-6" />}
              title="No matches"
              description="Nothing here matches the current filters. Try widening the dates or clearing them."
              action={
                <Button variant="secondary" onClick={resetFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <ul className="flex flex-col">
                {rows.map(({ transaction, balance }) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    category={categories.get(transaction.categoryId)}
                    balance={balance}
                    showBalance
                    pending={pendingIds.includes(transaction.id)}
                    fresh={transaction.id === restoredId}
                    onEdit={openEdit}
                    onDelete={setPendingDelete}
                  />
                ))}
              </ul>

              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onChange={setPage}
              />
            </>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this transaction?"
        message={
          pendingDelete ? (
            <>
              <strong className="font-bold text-fg">
                {pendingDelete.note || categories.get(pendingDelete.categoryId)?.name}
              </strong>{' '}
              for {formatMoney(pendingDelete.amount, currency, locale)} will be removed. You can undo
              it straight afterwards.
            </>
          ) : null
        }
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </AppLayout>
  )
}
