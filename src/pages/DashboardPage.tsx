import { ChartPie, PiggyBank, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { TrendChart, TrendLegend } from '@/components/charts/TrendChart'
import { SpendingDonut } from '@/components/charts/SpendingDonut'
import { AppLayout } from '@/components/layout/AppLayout'
import { MonthPicker } from '@/components/layout/MonthPicker'
import { Badge, Button, Card, CardHeader, EmptyState } from '@/components/ui'
import { BudgetRow } from '@/features/budgets/BudgetRow'
import { DashboardSkeleton } from '@/features/dashboard/DashboardSkeleton'
import { RecentTransactions } from '@/features/dashboard/RecentTransactions'
import { SummaryCards } from '@/features/dashboard/SummaryCards'
import { useIsLoading } from '@/hooks/useAppData'
import { useDashboard } from '@/hooks/useDashboard'
import { useTransactionModal } from '@/store/useTransactionModal'
import { formatMonthLabel } from '@/utils/dates'

export function DashboardPage() {
  const data = useDashboard()
  const loading = useIsLoading()
  const openNew = useTransactionModal((state) => state.openNew)

  const hasActivity = data.summary.transactionCount > 0

  return (
    <AppLayout
      title="Dashboard"
      description={`Overview for ${formatMonthLabel(data.month)}`}
      actions={<MonthPicker />}
    >
      {loading ? (
        <DashboardSkeleton />
      ) : !hasActivity ? (
        <Card className="animate-in">
          <EmptyState
            icon={<Sparkles className="size-5" />}
            title={`Nothing recorded for ${formatMonthLabel(data.month)}`}
            description="Add a transaction for this month, or pick another month to see its history."
            action={
              <Button variant="primary" onClick={() => openNew()}>
                Add a transaction
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="flex animate-in flex-col gap-4">
          <SummaryCards data={data} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader
                title="Income vs. expenses"
                description="Last six months"
                action={<TrendLegend />}
              />
              <div className="mt-4">
                <TrendChart data={data.series} activeMonth={data.month} />
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader
                title="Where the money went"
                description={formatMonthLabel(data.month)}
              />
              <div className="mt-4">
                {data.spendingByCategory.length === 0 ? (
                  <EmptyState
                    size="sm"
                    icon={<ChartPie className="size-5" />}
                    title="No spending this month"
                    description="Every expense you record is broken down here by category."
                  />
                ) : (
                  <SpendingDonut
                    data={data.spendingByCategory}
                    total={data.summary.expenses}
                  />
                )}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="Budgets"
                description={`${data.budgets.length} tracked this month`}
                action={
                  data.overBudgetCount > 0 ? (
                    <Badge tone="expense">
                      {data.overBudgetCount} over
                    </Badge>
                  ) : (
                    <Link
                      to="/budgets"
                      className="rounded-lg px-2 py-1 text-[13px] font-medium text-accent transition-colors hover:bg-accent-soft"
                    >
                      Manage
                    </Link>
                  )
                }
              />

              {data.budgets.length === 0 ? (
                <EmptyState
                  size="sm"
                  icon={<PiggyBank className="size-5" />}
                  title="No budgets set"
                  description="Set a monthly limit per category to track spending against a plan."
                  action={
                    <Link
                      to="/budgets"
                      className="inline-flex h-8 items-center rounded-lg bg-accent-soft px-3 text-[13px] font-medium text-accent transition-[filter] hover:brightness-97 dark:hover:brightness-125"
                    >
                      Set a budget
                    </Link>
                  }
                />
              ) : (
                <ul className="mt-2 divide-y divide-[var(--border)]">
                  {data.budgets.slice(0, 5).map((budget) => (
                    <BudgetRow key={budget.categoryId} budget={budget} compact />
                  ))}
                </ul>
              )}
            </Card>

            <RecentTransactions transactions={data.recent} />
          </div>
        </div>
      )}
    </AppLayout>
  )
}
