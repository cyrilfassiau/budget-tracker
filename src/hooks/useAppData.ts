import { useEffect, useMemo } from 'react'

import { ensureSeeded } from '@/services/db'
import { useBudgetsStore } from '@/store/useBudgetsStore'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import type { Category } from '@/types'

/**
 * Single place where the app's data is loaded. Called once from the layout so
 * pages can assume the stores are populated (or loading).
 */
export function useBootstrap(): void {
  const fetchTransactions = useTransactionsStore((state) => state.fetchAll)
  const fetchCategories = useCategoriesStore((state) => state.fetchAll)
  const fetchBudgets = useBudgetsStore((state) => state.fetchAll)
  const loadSettings = useSettingsStore((state) => state.load)

  useEffect(() => {
    ensureSeeded()
    void loadSettings()
    void fetchCategories()
    void fetchTransactions()
    void fetchBudgets()
  }, [fetchTransactions, fetchCategories, fetchBudgets, loadSettings])
}

/** Lookup map for rendering a transaction's category without an O(n) find. */
export function useCategoryMap(): Map<string, Category> {
  const categories = useCategoriesStore((state) => state.items)
  return useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )
}

/** True while any of the primary collections is still loading. */
export function useIsLoading(): boolean {
  const transactions = useTransactionsStore((state) => state.status)
  const categories = useCategoriesStore((state) => state.status)
  const budgets = useBudgetsStore((state) => state.status)
  return [transactions, categories, budgets].some(
    (status) => status === 'idle' || status === 'loading',
  )
}
