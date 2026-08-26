import { useState } from 'react'

import { AppLayout } from '@/components/layout/AppLayout'
import { PeriodPicker } from '@/components/layout/PeriodPicker'
import { Amount, Button, ConfirmDialog, EmptyState, Sheet } from '@/components/ui'
import { ImportExport } from '@/features/transactions/ImportExport'
import { Pagination } from '@/features/transactions/Pagination'
import { RegisterControls } from '@/features/transactions/RegisterControls'
import { RegisterEntry, RegisterHead } from '@/features/transactions/RegisterEntry'
import { useCategoryMap, useIsLoading } from '@/hooks/useAppData'
import { useRegister } from '@/hooks/useRegister'
import { SkeletonRows } from '@/components/ui/Skeleton'
import { useCurrencyFormat } from '@/store/useSettingsStore'
import { toMessage, toast } from '@/store/useToastStore'
import { useTransactionModal } from '@/store/useTransactionModal'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useUIStore } from '@/store/useUIStore'
import type { Transaction } from '@/types'
import { formatMonthLabel } from '@/utils/dates'
import { formatMoney } from '@/utils/money'

export function RegisterPage() {
  const { rows, matched, summary, page, totalPages, total, pageSize, isEmpty, isFilteredEmpty } =
    useRegister()
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

  const scopeLabel = scope === 'month' ? formatMonthLabel(month) : 'All history'

  const handleDelete = async () => {
    const target = pendingDelete
    if (!target) return

    try {
      await removeTransaction(target.id)
      setPendingDelete(null)
      toast.success('Entry deleted', {
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
              toast.success('Entry restored')
            })
          },
        },
      })
    } catch (error) {
      toast.error(toMessage(error, 'Could not delete the entry.'))
    }
  }

  return (
    <AppLayout
      title="Register"
      actions={
        <>
          {scope === 'month' ? <PeriodPicker /> : null}
          <ImportExport rows={matched} scopeLabel={scopeLabel} />
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <RegisterControls />

        <Sheet className="overflow-hidden">
          {loading ? (
            <SkeletonRows rows={8} />
          ) : isEmpty ? (
            <EmptyState
              title={scope === 'month' ? `Nothing in ${scopeLabel}` : 'The register is empty'}
              description="Every entry you record appears here with the balance it left behind."
              action={
                <Button variant="primary" onClick={() => openNew()}>
                  Record an entry
                </Button>
              }
            />
          ) : isFilteredEmpty ? (
            <EmptyState
              title="No entries match"
              description="Nothing in this period matches the filters. Widen the dates, or clear them."
              action={
                <Button variant="secondary" onClick={resetFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <caption className="sr-only">
                    Register of entries for {scopeLabel}
                  </caption>
                  <RegisterHead showBalance />
                  <tbody>
                    {rows.map(({ transaction, balance, startsDay }) => (
                      <RegisterEntry
                        key={transaction.id}
                        transaction={transaction}
                        category={categories.get(transaction.categoryId)}
                        balance={balance}
                        showBalance
                        startsDay={startsDay}
                        pending={pendingIds.includes(transaction.id)}
                        fresh={transaction.id === restoredId}
                        onEdit={openEdit}
                        onDelete={setPendingDelete}
                      />
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-ink bg-sheet-alt">
                      <td className="col-head py-1.5 pl-4 pr-2 sm:pl-5" colSpan={2}>
                        {scopeLabel}
                        <span className="sm:hidden"> · net</span>
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 text-right text-[13px] font-semibold sm:hidden">
                        <Amount value={summary.income - summary.expenses} />
                      </td>
                      <td className="hidden whitespace-nowrap px-2 py-1.5 text-right text-[13px] font-semibold text-ink sm:table-cell">
                        <Amount value={summary.expenses} plain />
                      </td>
                      <td className="hidden whitespace-nowrap px-2 py-1.5 text-right text-[13px] font-semibold text-ink sm:table-cell">
                        <Amount value={summary.income} plain />
                      </td>
                      <td className="hidden whitespace-nowrap px-2 py-1.5 text-right text-[13px] text-ink-2 sm:table-cell">
                        <Amount value={summary.transfers} plain blankZero />
                      </td>
                      <td className="hidden px-2 py-1.5 lg:table-cell" />
                      <td className="py-1.5 pl-1 pr-3 sm:pr-4" />
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="border-t border-rule">
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
        </Sheet>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this entry?"
        message={
          pendingDelete ? (
            <>
              <strong className="font-semibold text-ink">
                {pendingDelete.note || categories.get(pendingDelete.categoryId)?.name}
              </strong>{' '}
              for {formatMoney(pendingDelete.amount, currency, locale)} will be struck from the
              register. You can undo it straight afterwards.
            </>
          ) : null
        }
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </AppLayout>
  )
}
