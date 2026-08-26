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

/** Every `yyyy-MM` that holds at least one entry, for marking the period list. */
export function useMonthsWithEntries(): Set<string> {
  const transactions = useTransactionsStore((state) => state.items)
  return useMemo(
    () => new Set(transactions.map((transaction) => transaction.date.slice(0, 7))),
    [transactions],
  )
}

/** The nearest period that holds entries, for an empty period's way out. */
export function useNearestMonthWithEntries(month: string): string | null {
  const months = useMonthsWithEntries()
  return useMemo(() => {
    if (months.size === 0) return null
    return [...months].sort(
      (a, b) => Math.abs(monthDistance(a, month)) - Math.abs(monthDistance(b, month)),
    )[0]!
  }, [months, month])
}

function monthDistance(a: string, b: string): number {
  const [ay, am] = a.split('-').map(Number)
  const [by, bm] = b.split('-').map(Number)
  return (ay! - by!) * 12 + (am! - bm!)
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
