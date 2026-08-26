import { useEffect, useMemo } from 'react'

import { PAGE_SIZE } from '@/lib/constants'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useUIStore } from '@/store/useUIStore'
import type { Transaction } from '@/types'
import { applyFilters, pageCount, paginate, sortTransactions } from '@/utils/filters'
import { summarise, type PeriodSummary } from '@/utils/calculations'

import { useDebouncedValue } from './useDebouncedValue'

export interface TransactionListResult {
  /** The rows to render on the current page. */
  rows: Transaction[]
  /** Every row matching the filters, before pagination. */
  matched: Transaction[]
  summary: PeriodSummary
  page: number
  totalPages: number
  total: number
  pageSize: number
  isEmpty: boolean
  isFilteredEmpty: boolean
}

/**
 * Filter → sort → paginate pipeline for the transactions page. Kept out of the
 * component so each step stays independently testable.
 */
export function useTransactionList(): TransactionListResult {
  const transactions = useTransactionsStore((state) => state.items)
  const filters = useUIStore((state) => state.filters)
  const sort = useUIStore((state) => state.sort)
  const page = useUIStore((state) => state.page)
  const setPage = useUIStore((state) => state.setPage)

  const debouncedSearch = useDebouncedValue(filters.search, 220)

  const matched = useMemo(
    () => sortTransactions(applyFilters(transactions, { ...filters, search: debouncedSearch }), sort),
    [transactions, filters, debouncedSearch, sort],
  )

  const totalPages = pageCount(matched.length, PAGE_SIZE)

  // Deleting the last row of the last page would otherwise strand the user.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages, setPage])

  const safePage = Math.min(page, totalPages)

  return {
    rows: paginate(matched, safePage, PAGE_SIZE),
    matched,
    summary: useMemo(() => summarise(matched), [matched]),
    page: safePage,
    totalPages,
    total: matched.length,
    pageSize: PAGE_SIZE,
    isEmpty: transactions.length === 0,
    isFilteredEmpty: transactions.length > 0 && matched.length === 0,
  }
}
