import { useMemo, useState } from 'react'

import { AppLayout } from '@/components/layout/AppLayout'
import { PeriodPicker } from '@/components/layout/PeriodPicker'
import {
  Amount,
  Button,
  CategoryMark,
  ConfirmDialog,
  EmptyState,
  PaceBar,
  Sheet,
  SheetHead,
  SkeletonRows,
} from '@/components/ui'
import { BudgetForm } from '@/features/budgets/BudgetForm'
import { BudgetRow } from '@/features/budgets/BudgetRow'
import { useIsLoading } from '@/hooks/useAppData'
import { useBudgetsStore } from '@/store/useBudgetsStore'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { toMessage, toast } from '@/store/useToastStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useUIStore } from '@/store/useUIStore'
import { budgetProgress, type BudgetProgress } from '@/utils/calculations'
import { formatMonthLabel, monthProgress, shiftMonth } from '@/utils/dates'
import { formatPercent, roundMoney } from '@/utils/money'

export function BudgetsPage() {
  const month = useUIStore((state) => state.selectedMonth)
  const budgets = useBudgetsStore((state) => state.items)
  const removeBudget = useBudgetsStore((state) => state.remove)
  const copyMonth = useBudgetsStore((state) => state.copyMonth)
  const categories = useCategoriesStore((state) => state.items)
  const transactions = useTransactionsStore((state) => state.items)
  const loading = useIsLoading()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<BudgetProgress | null>(null)
  const [pendingDelete, setPendingDelete] = useState<BudgetProgress | null>(null)
  const [copying, setCopying] = useState(false)

  const rows = useMemo(
    () => budgetProgress(budgets, transactions, categories, month),
    [budgets, transactions, categories, month],
  )

  const unbudgeted = useMemo(
    () =>
      budgetProgress(budgets, transactions, categories, month, { includeUnbudgeted: true })
        .filter((row) => row.limit === 0)
        .sort((a, b) => b.spent - a.spent),
    [budgets, transactions, categories, month],
  )

  const totals = useMemo(() => {
    const limit = roundMoney(rows.reduce((sum, row) => sum + row.limit, 0))
    const spent = roundMoney(rows.reduce((sum, row) => sum + row.spent, 0))
    return { limit, spent, ratio: limit > 0 ? spent / limit : 0 }
  }, [rows])

  const pace = monthProgress(month)
  const overCount = rows.filter((row) => row.status === 'over').length
  const aheadCount = rows.filter((row) => row.aheadOfSchedule && row.status !== 'over').length

  const handleCopy = async () => {
    setCopying(true)
    const previous = shiftMonth(month, -1)
    try {
      const count = await copyMonth(previous, month)
      // A no-op is not a success: say plainly that nothing was there to copy.
      if (count === 0) {
        toast.info('Nothing to copy', {
          description: `${formatMonthLabel(previous)} has no limits set.`,
        })
      } else {
        toast.success(`Copied ${count} ${count === 1 ? 'limit' : 'limits'}`, {
          description: `From ${formatMonthLabel(previous)}.`,
        })
      }
    } catch (error) {
      toast.error(toMessage(error, 'Could not copy the previous period.'))
    } finally {
      setCopying(false)
    }
  }

  const handleDelete = async () => {
    const target = pendingDelete
    if (!target?.budgetId) return
    try {
      await removeBudget(target.budgetId)
      setPendingDelete(null)
      toast.success(`Limit removed for ${target.name}`)
    } catch (error) {
      toast.error(toMessage(error, 'Could not remove the limit.'))
    }
  }

  return (
    <AppLayout
      title="Budgets"
      actions={
        <>
          <PeriodPicker />
          <Button
            variant="secondary"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            Set limit
          </Button>
        </>
      }
    >
      {loading ? (
        <Sheet>
          <SkeletonRows rows={7} />
        </Sheet>
      ) : (
        <div className="flex animate-in flex-col gap-4">
          <Sheet>
            <SheetHead
              title={`Limits for ${formatMonthLabel(month)}`}
              meta={
                overCount > 0
                  ? `${overCount} over the limit`
                  : aheadCount > 0
                    ? `${aheadCount} ahead of pace`
                    : rows.length > 0
                      ? 'All on schedule'
                      : undefined
              }
              action={
                <Button variant="ghost" size="sm" loading={copying} onClick={handleCopy}>
                  Copy previous
                </Button>
              }
            />

            {rows.length > 0 ? (
              <div className="border-b border-rule px-4 py-3 sm:px-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[13px] text-ink-2">Total against limits</p>
                  <p className="text-[15px] font-semibold text-ink">
                    <Amount value={totals.spent} plain />
                    <span className="font-normal text-ink-3">
                      {' of '}
                      <Amount value={totals.limit} plain />
                    </span>
                  </p>
                </div>
                <PaceBar
                  className="mt-2"
                  value={totals.ratio}
                  pace={pace}
                  label="All budgets"
                  over={totals.ratio > 1}
                  aheadOfSchedule={totals.ratio > pace + 0.02}
                />
                <p className="mt-1 flex items-baseline justify-between gap-2 text-[11px] text-ink-3">
                  <span>
                    The tick marks how much of the period has passed
                    {pace < 1 ? ` — ${formatPercent(pace)} so far` : ''}.
                  </span>
                  <span className="figure shrink-0">{formatPercent(totals.ratio)} spent</span>
                </p>
              </div>
            ) : null}

            {rows.length === 0 ? (
              <EmptyState
                title={`No limits for ${formatMonthLabel(month)}`}
                description="A limit is what turns spending into something you can be ahead of, or behind."
                action={
                  <>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setEditing(null)
                        setFormOpen(true)
                      }}
                    >
                      Set the first limit
                    </Button>
                    <Button variant="secondary" loading={copying} onClick={handleCopy}>
                      Copy previous period
                    </Button>
                  </>
                }
              />
            ) : (
              <ul>
                {rows.map((row) => (
                  <BudgetRow
                    key={row.categoryId}
                    budget={row}
                    onEdit={(budget) => {
                      setEditing(budget)
                      setFormOpen(true)
                    }}
                    onDelete={setPendingDelete}
                  />
                ))}
              </ul>
            )}
          </Sheet>

          {unbudgeted.length > 0 ? (
            <Sheet>
              <SheetHead title="Without a limit" meta="Categories not budgeted this period" />
              <ul className="flex flex-wrap gap-1.5 p-3 sm:p-4">
                {unbudgeted.map((row) => (
                  <li key={row.categoryId}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing({ ...row, limit: 0 })
                        setFormOpen(true)
                      }}
                      className="flex items-center gap-1.5 border border-rule bg-sheet px-2 py-1 text-[12px] text-ink-2 transition-colors hover:border-ink hover:text-ink"
                    >
                      <CategoryMark icon={row.icon} size="sm" />
                      {row.name}
                      {row.spent > 0 ? (
                        <span className="text-ink-3">
                          <Amount value={row.spent} plain whole />
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </Sheet>
          ) : null}
        </div>
      )}

      <BudgetForm
        open={formOpen}
        month={month}
        categoryId={editing?.categoryId ?? null}
        currentLimit={editing && editing.limit > 0 ? editing.limit : null}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Remove the limit for ${pendingDelete?.name ?? ''}?`}
        message="The limit is removed for this period only. Your entries are untouched."
        confirmLabel="Remove limit"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </AppLayout>
  )
}
