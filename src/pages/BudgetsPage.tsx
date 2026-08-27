import { useMemo, useState } from 'react'

import { AppLayout } from '@/components/layout/AppLayout'
import { PeriodPicker } from '@/components/layout/PeriodPicker'
import {
  Amount,
  Button,
  Card,
  CardHead,
  CategoryAvatar,
  ConfirmDialog,
  EmptyState,
  PaceBar,
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
          description: `${formatMonthLabel(previous)} has no budgets set.`,
        })
      } else {
        toast.success(`Copied ${count} budget${count === 1 ? '' : 's'}`, {
          description: `From ${formatMonthLabel(previous)}.`,
        })
      }
    } catch (error) {
      toast.error(toMessage(error, 'Could not copy last month.'))
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
      toast.success(`Budget removed for ${target.name}`)
    } catch (error) {
      toast.error(toMessage(error, 'Could not remove the budget.'))
    }
  }

  return (
    <AppLayout
      title="Budgets"
      actions={
        <>
          <PeriodPicker />
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            New
          </Button>
        </>
      }
    >
      {loading ? (
        <Card>
          <SkeletonRows rows={7} />
        </Card>
      ) : (
        <div className="flex animate-in flex-col gap-4">
          <Card>
            <CardHead
              title="Budgets"
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
                  Copy last month
                </Button>
              }
            />

            {rows.length > 0 ? (
              <div className="pt-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <div>
                    <p className="text-[13px] font-semibold text-fg-muted">Spent this month</p>
                    <p className="figure mt-0.5 text-[30px] font-extrabold leading-none tracking-[-0.03em] text-fg sm:text-[36px]">
                      <Amount value={totals.spent} plain />
                    </p>
                  </div>
                  <p className="text-[13px] font-semibold text-fg-muted">
                    of <Amount value={totals.limit} plain className="text-fg" /> budgeted
                  </p>
                </div>
                <PaceBar
                  className="mt-3"
                  value={totals.ratio}
                  pace={pace}
                  label="All budgets"
                  over={totals.ratio > 1}
                  aheadOfSchedule={totals.ratio > pace + 0.02}
                />
                <p className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 text-[12px] text-fg-faint">
                  <span>
                    The tick marks how much of the month has passed
                    {pace < 1 ? ` — ${formatPercent(pace)} so far` : ''}.
                  </span>
                  <span className="figure shrink-0 font-semibold">
                    {formatPercent(totals.ratio)} spent
                  </span>
                </p>
              </div>
            ) : null}

            {rows.length === 0 ? (
              <EmptyState
                title={`No budgets for ${formatMonthLabel(month)}`}
                description="A limit turns spending into something you can be ahead of, or behind."
                action={
                  <>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setEditing(null)
                        setFormOpen(true)
                      }}
                    >
                      Set your first budget
                    </Button>
                    <Button variant="secondary" loading={copying} onClick={handleCopy}>
                      Copy last month
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
          </Card>

          {unbudgeted.length > 0 ? (
            <Card>
              <CardHead title="No budget set" meta="Categories without a limit this month" />
              <ul className="mt-3 flex flex-wrap gap-2">
                {unbudgeted.map((row) => (
                  <li key={row.categoryId}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing({ ...row, limit: 0 })
                        setFormOpen(true)
                      }}
                      className="pill flex items-center gap-2 bg-surface-2 py-1.5 pl-1.5 pr-3.5 text-[14px] font-semibold text-fg transition-colors hover:bg-surface-3"
                    >
                      <CategoryAvatar color={row.color} icon={row.icon} size="sm" />
                      {row.name}
                      {row.spent > 0 ? (
                        <span className="text-fg-muted">
                          <Amount value={row.spent} plain whole />
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
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
        title={`Remove the budget for ${pendingDelete?.name ?? ''}?`}
        message="The limit is removed for this month only. Your transactions are untouched."
        confirmLabel="Remove"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </AppLayout>
  )
}
