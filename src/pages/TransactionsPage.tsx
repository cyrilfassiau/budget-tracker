import { FilterX, Receipt } from 'lucide-react'
import { useState } from 'react'

import { AppLayout } from '@/components/layout/AppLayout'
import { Button, Card, ConfirmDialog, EmptyState } from '@/components/ui'
import { ImportExport } from '@/features/transactions/ImportExport'
import { Pagination } from '@/features/transactions/Pagination'
import { SortControls } from '@/features/transactions/SortControls'
import { TransactionFilters } from '@/features/transactions/TransactionFilters'
import { TransactionItem } from '@/features/transactions/TransactionItem'
import { TransactionListSkeleton } from '@/features/transactions/TransactionListSkeleton'
import { useCategoryMap, useIsLoading } from '@/hooks/useAppData'
import { useTransactionList } from '@/hooks/useTransactionList'
import { useCurrencyFormat } from '@/store/useSettingsStore'
import { toMessage, toast } from '@/store/useToastStore'
import { useTransactionModal } from '@/store/useTransactionModal'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useUIStore } from '@/store/useUIStore'
import type { Transaction } from '@/types'
import { formatMoney } from '@/utils/money'

export function TransactionsPage() {
  const { rows, summary, page, totalPages, total, pageSize, isEmpty, isFilteredEmpty } =
    useTransactionList()
  const loading = useIsLoading()
  const categories = useCategoryMap()
  const setPage = useUIStore((state) => state.setPage)
  const resetFilters = useUIStore((state) => state.resetFilters)
  const pendingIds = useTransactionsStore((state) => state.pendingIds)
  const removeTransaction = useTransactionsStore((state) => state.remove)
  const add = useTransactionsStore((state) => state.add)
  const openNew = useTransactionModal((state) => state.openNew)
  const openEdit = useTransactionModal((state) => state.openEdit)
  const { currency, locale } = useCurrencyFormat()

  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null)

  const handleDelete = async () => {
    const target = pendingDelete
    if (!target) return

    try {
      await removeTransaction(target.id)
      setPendingDelete(null)
      toast.success('Transaction deleted', {
        // Undo re-creates the row rather than resurrecting the old id — good
        // enough here, and it is what a real API would do too.
        action: {
          label: 'Undo',
          onClick: () => {
            void add({
              amount: target.amount,
              type: target.type,
              categoryId: target.categoryId,
              date: target.date,
              note: target.note,
            }).then(() => toast.success('Transaction restored'))
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
      description={`${total} match${total === 1 ? '' : 'es'} · ${formatMoney(summary.expenses, currency, locale)} out, ${formatMoney(summary.income, currency, locale)} in`}
      actions={<ImportExport />}
    >
      <div className="flex flex-col gap-4">
        <TransactionFilters />

        <Card flush className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border-base px-4 py-2.5 sm:px-5">
            <SortControls />
          </div>

          {loading ? (
            <TransactionListSkeleton />
          ) : isEmpty ? (
            <EmptyState
              icon={<Receipt className="size-5" />}
              title="No transactions yet"
              description="Add your first transaction and it will appear here, ready to filter, sort and export."
              action={
                <Button variant="primary" onClick={() => openNew()}>
                  Add your first transaction
                </Button>
              }
            />
          ) : isFilteredEmpty ? (
            <EmptyState
              icon={<FilterX className="size-5" />}
              title="No matches"
              description="No transaction matches the current filters. Try widening the date range or clearing the search."
              action={
                <Button variant="soft" onClick={resetFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <ul className="divide-y divide-[var(--border)]">
                {rows.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    category={categories.get(transaction.categoryId)}
                    pending={pendingIds.includes(transaction.id)}
                    onEdit={openEdit}
                    onDelete={setPendingDelete}
                  />
                ))}
              </ul>

              <div className="border-t border-border-base">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  pageSize={pageSize}
                  onChange={setPage}
                />
              </div>
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
              <strong className="font-medium text-fg">
                {pendingDelete.note || categories.get(pendingDelete.categoryId)?.name}
              </strong>{' '}
              for {formatMoney(pendingDelete.amount, currency, locale)} will be removed. You can
              undo this straight after.
            </>
          ) : null
        }
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </AppLayout>
  )
}
