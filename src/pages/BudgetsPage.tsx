import { CopyPlus, PiggyBank, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AppLayout } from '@/components/layout/AppLayout'
import { MonthPicker } from '@/components/layout/MonthPicker'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CategoryDot,
  ConfirmDialog,
  EmptyState,
  ProgressBar,
  Skeleton,
} from '@/components/ui'
import { BudgetForm } from '@/features/budgets/BudgetForm'
import { BudgetRow } from '@/features/budgets/BudgetRow'
import { useIsLoading } from '@/hooks/useAppData'
import { useBudgetsStore } from '@/store/useBudgetsStore'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { useCurrencyFormat } from '@/store/useSettingsStore'
import { toMessage, toast } from '@/store/useToastStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useUIStore } from '@/store/useUIStore'
import { budgetProgress, type BudgetProgress } from '@/utils/calculations'
import { formatMonthLabel, shiftMonth } from '@/utils/dates'
import { formatMoney, roundMoney } from '@/utils/money'

export function BudgetsPage() {
  const month = useUIStore((state) => state.selectedMonth)
  const budgets = useBudgetsStore((state) => state.items)
  const removeBudget = useBudgetsStore((state) => state.remove)
  const copyMonth = useBudgetsStore((state) => state.copyMonth)
  const categories = useCategoriesStore((state) => state.items)
  const transactions = useTransactionsStore((state) => state.items)
  const loading = useIsLoading()
  const { currency, locale } = useCurrencyFormat()

  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BudgetProgress | null>(null)
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
    return { limit, spent, remaining: roundMoney(limit - spent), ratio: limit > 0 ? spent / limit : 0 }
  }, [rows])

  const overCount = rows.filter((row) => row.status === 'over').length

  const handleCopy = async () => {
    setCopying(true)
    try {
      const previous = shiftMonth(month, -1)
      const count = await copyMonth(previous, month)
      toast.success(`Copied ${count} budget${count === 1 ? '' : 's'}`, {
        description: `From ${formatMonthLabel(previous)}.`,
      })
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
      toast.success(`Budget for "${target.name}" removed`)
    } catch (error) {
      toast.error(toMessage(error, 'Could not remove the budget.'))
    }
  }

  const openCreate = () => {
    setEditingCategory(null)
    setFormOpen(true)
  }

  const openEdit = (budget: BudgetProgress) => {
    setEditingCategory(budget)
    setFormOpen(true)
  }

  return (
    <AppLayout
      title="Budgets"
      description={`Monthly limits for ${formatMonthLabel(month)}`}
      actions={
        <div className="flex items-center gap-2">
          <MonthPicker />
          <Button size="sm" variant="secondary" icon={<Plus className="size-3.5" />} onClick={openCreate}>
            <span className="hidden sm:inline">Set budget</span>
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="flex animate-in flex-col gap-4">
          <Card>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-fg-muted">Budgeted this month</p>
                <p className="tabular mt-1 text-2xl font-semibold tracking-tight text-fg">
                  {formatMoney(totals.spent, currency, locale)}
                  <span className="text-base font-normal text-fg-subtle">
                    {' / '}
                    {formatMoney(totals.limit, currency, locale)}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {overCount > 0 ? (
                  <Badge tone="expense">
                    {overCount} categor{overCount === 1 ? 'y' : 'ies'} over
                  </Badge>
                ) : totals.limit > 0 ? (
                  <Badge tone="income">
                    {formatMoney(Math.max(0, totals.remaining), currency, locale)} left
                  </Badge>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<CopyPlus className="size-3.5" />}
                  loading={copying}
                  onClick={handleCopy}
                >
                  Copy last month
                </Button>
              </div>
            </div>

            <ProgressBar
              value={totals.ratio}
              label="Total budget"
              tone={totals.ratio > 1 ? 'over' : totals.ratio >= 0.8 ? 'warning' : 'default'}
              className="mt-4"
            />
          </Card>

          <Card>
            <CardHeader
              title="By category"
              description={`${rows.length} budget${rows.length === 1 ? '' : 's'} set`}
            />

            {rows.length === 0 ? (
              <EmptyState
                icon={<PiggyBank className="size-5" />}
                title={`No budgets for ${formatMonthLabel(month)}`}
                description="Set a limit per category to see spending tracked against a plan, with a warning before you go over."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="primary" onClick={openCreate}>
                      Set your first budget
                    </Button>
                    <Button variant="secondary" loading={copying} onClick={handleCopy}>
                      Copy last month
                    </Button>
                  </div>
                }
              />
            ) : (
              <ul className="mt-1 divide-y divide-[var(--border)]">
                {rows.map((row) => (
                  <BudgetRow
                    key={row.categoryId}
                    budget={row}
                    onEdit={openEdit}
                    onDelete={setPendingDelete}
                  />
                ))}
              </ul>
            )}
          </Card>

          {unbudgeted.length > 0 ? (
            <Card>
              <CardHeader
                title="Not budgeted"
                description="Categories without a limit this month"
              />
              <ul className="mt-3 flex flex-wrap gap-2">
                {unbudgeted.map((row) => (
                  <li key={row.categoryId}>
                    <button
                      type="button"
                      onClick={() => openEdit({ ...row, limit: 0 })}
                      className="flex items-center gap-2 rounded-xl border border-border-base bg-card px-2.5 py-1.5 text-[13px] text-fg-muted transition-colors hover:border-accent hover:text-fg"
                    >
                      <CategoryDot color={row.color} icon={row.icon} size="sm" />
                      {row.name}
                      {row.spent > 0 ? (
                        <span className="tabular text-xs text-fg-subtle">
                          {formatMoney(row.spent, currency, locale, { maximumFractionDigits: 0 })}
                        </span>
                      ) : null}
                      <Plus className="size-3.5 text-fg-subtle" />
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
        categoryId={editingCategory?.categoryId ?? null}
        currentLimit={editingCategory && editingCategory.limit > 0 ? editingCategory.limit : null}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Remove the budget for "${pendingDelete?.name ?? ''}"?`}
        message="The limit is removed for this month only. Your transactions are not affected."
        confirmLabel="Remove budget"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </AppLayout>
  )
}
