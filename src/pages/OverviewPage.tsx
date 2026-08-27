import { Receipt } from 'lucide-react'
import { Link } from 'react-router-dom'

import { SpendingRing } from '@/components/charts/SpendingRing'
import { TrendBars } from '@/components/charts/TrendBars'
import { AppLayout } from '@/components/layout/AppLayout'
import { PeriodPicker } from '@/components/layout/PeriodPicker'
import { Button, Card, CardHead, EmptyState } from '@/components/ui'
import { BudgetRow } from '@/features/budgets/BudgetRow'
import { BalanceCard } from '@/features/overview/BalanceCard'
import { OverviewSkeleton } from '@/features/overview/OverviewSkeleton'
import { TransactionRow } from '@/features/transactions/TransactionRow'
import { useCategoryMap, useIsLoading, useNearestMonthWithEntries } from '@/hooks/useAppData'
import { useStatement } from '@/hooks/useStatement'
import { useTransactionModal } from '@/store/useTransactionModal'
import { useUIStore } from '@/store/useUIStore'
import { formatMonthLabel } from '@/utils/dates'

const seeAll =
  'text-[14px] font-bold text-accent transition-opacity hover:opacity-70'

export function OverviewPage() {
  const data = useStatement()
  const loading = useIsLoading()
  const categories = useCategoryMap()
  const openNew = useTransactionModal((state) => state.openNew)
  const openEdit = useTransactionModal((state) => state.openEdit)
  const setMonth = useUIStore((state) => state.setMonth)
  const nearest = useNearestMonthWithEntries(data.month)

  const hasEntries = data.summary.transactionCount > 0

  return (
    <AppLayout title="Home" actions={<PeriodPicker />}>
      {loading ? (
        <OverviewSkeleton />
      ) : (
        <div className="flex animate-in flex-col gap-4">
          <BalanceCard data={data} />

          {!hasEntries ? (
            <Card>
              <EmptyState
                icon={<Receipt className="size-6" />}
                title={`Nothing in ${formatMonthLabel(data.month)}`}
                description="Add a transaction to this month, or jump to a month that already has some."
                action={
                  <>
                    {/* Opens dated inside the month on screen, not today. */}
                    <Button variant="primary" onClick={() => openNew()}>
                      Add a transaction
                    </Button>
                    {nearest && nearest !== data.month ? (
                      <Button variant="secondary" onClick={() => setMonth(nearest)}>
                        Go to {formatMonthLabel(nearest, 'MMM yyyy')}
                      </Button>
                    ) : null}
                  </>
                }
              />
            </Card>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="flex flex-col gap-4">
                  <CardHead title="Spending" meta={formatMonthLabel(data.month)} />
                  <SpendingRing data={data.spendingByCategory} total={data.summary.expenses} />
                </Card>

                <Card className="flex flex-col gap-3">
                  <CardHead
                    title="Budgets"
                    meta={
                      data.overBudgetCount > 0
                        ? `${data.overBudgetCount} over the limit`
                        : data.aheadOfScheduleCount > 0
                          ? `${data.aheadOfScheduleCount} ahead of pace`
                          : data.budgets.length > 0
                            ? 'All on track'
                            : undefined
                    }
                    action={
                      <Link to="/budgets" className={seeAll}>
                        See all
                      </Link>
                    }
                  />

                  {data.budgets.length === 0 ? (
                    <EmptyState
                      size="sm"
                      title="No budgets yet"
                      description="A limit turns spending into something you can be ahead of, or behind."
                      action={
                        <Link
                          to="/budgets"
                          className="pill inline-flex h-9 items-center bg-surface-2 px-3.5 text-[14px] font-bold text-fg transition-colors hover:bg-surface-3"
                        >
                          Set a budget
                        </Link>
                      }
                    />
                  ) : (
                    <ul className="flex flex-col">
                      {data.budgets.slice(0, 4).map((budget) => (
                        <BudgetRow key={budget.categoryId} budget={budget} compact />
                      ))}
                    </ul>
                  )}
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="flex flex-col gap-4">
                  <CardHead title="Last 6 months" meta="Spending" />
                  <TrendBars data={data.series} activeMonth={data.month} />
                </Card>

                <Card className="flex flex-col gap-2">
                  <CardHead
                    title="Recent"
                    action={
                      <Link to="/transactions" className={seeAll}>
                        See all
                      </Link>
                    }
                  />
                  <ul className="flex flex-col">
                    {data.recent.map((transaction) => (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        category={categories.get(transaction.categoryId)}
                        onEdit={openEdit}
                      />
                    ))}
                  </ul>
                </Card>
              </div>
            </>
          )}
        </div>
      )}
    </AppLayout>
  )
}
