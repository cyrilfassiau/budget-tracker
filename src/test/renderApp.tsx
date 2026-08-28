import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'

import { STORAGE_KEYS } from '@/lib/constants'
import { DEFAULT_CATEGORIES } from '@/lib/seed'
import { db } from '@/services/db'
import { useBudgetsStore } from '@/store/useBudgetsStore'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { useToastStore } from '@/store/useToastStore'
import { useTransactionModal } from '@/store/useTransactionModal'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useUIStore } from '@/store/useUIStore'
import { EMPTY_FILTERS } from '@/utils/filters'
import { currentMonthKey } from '@/utils/dates'
import type { Budget, Transaction } from '@/types'

interface SeedOptions {
  transactions?: Transaction[]
  budgets?: Budget[]
}

export function resetApp({ transactions = [], budgets = [] }: SeedOptions = {}) {
  localStorage.clear()
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ latencyMs: 0 }))
  localStorage.setItem(STORAGE_KEYS.seeded, 'true')

  db.categories.write(DEFAULT_CATEGORIES)
  db.transactions.write(transactions)
  db.budgets.write(budgets)

  useTransactionsStore.setState({ items: [], status: 'idle', error: null, pendingIds: [] })
  useCategoriesStore.setState({ items: [], status: 'idle', error: null })
  useBudgetsStore.setState({ items: [], status: 'idle', error: null })
  useToastStore.setState({ toasts: [] })
  useTransactionModal.setState({ open: false, editing: null, defaults: null })
  useUIStore.setState({
    filters: EMPTY_FILTERS,
    page: 1,
    sort: { field: 'date', direction: 'desc' },
    registerScope: 'all',
    selectedMonth: currentMonthKey(),
  })
}

export function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}
