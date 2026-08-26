import { Receipt } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button, Card, CardHeader, EmptyState } from '@/components/ui'
import { TransactionItem } from '@/features/transactions/TransactionItem'
import { useCategoryMap } from '@/hooks/useAppData'
import { useTransactionModal } from '@/store/useTransactionModal'
import type { Transaction } from '@/types'

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  const categories = useCategoryMap()
  const openNew = useTransactionModal((state) => state.openNew)

  return (
    <Card flush className="overflow-hidden">
      <div className="p-5 pb-3">
        <CardHeader
          title="Recent activity"
          description="Latest entries this month"
          action={
            <Link
              to="/transactions"
              className="rounded-lg px-2 py-1 text-[13px] font-medium text-accent transition-colors hover:bg-accent-soft"
            >
              View all
            </Link>
          }
        />
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          size="sm"
          icon={<Receipt className="size-5" />}
          title="Nothing recorded yet"
          description="Transactions you add this month will show up here."
          action={
            <Button size="sm" variant="soft" onClick={() => openNew()}>
              Add your first transaction
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-[var(--border)] border-t border-border-base">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              category={categories.get(transaction.categoryId)}
              compact
            />
          ))}
        </ul>
      )}
    </Card>
  )
}
