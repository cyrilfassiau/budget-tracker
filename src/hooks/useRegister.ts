import { useEffect, useMemo } from 'react'

import { PAGE_SIZE } from '@/lib/constants'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useUIStore } from '@/store/useUIStore'
import type { Transaction } from '@/types'
import { summarise, withRunningBalance, type PeriodSummary } from '@/utils/calculations'
import { monthBounds } from '@/utils/dates'
import { applyFilters, pageCount, paginate, sortTransactions } from '@/utils/filters'

import { useDebouncedValue } from './useDebouncedValue'

export interface RegisterRow {
  transaction: Transaction
  /** Balance after this entry, computed across all history, not just this page. */
  balance: number
  /** First row of its day — the register rules a line between days. */
  startsDay: boolean
}

export interface RegisterResult {
  rows: RegisterRow[]
  matched: Transaction[]
  summary: PeriodSummary
  page: number
  totalPages: number
  total: number
  pageSize: number
  isEmpty: boolean
  isFilteredEmpty: boolean
  /** Balance after the most recent entry in scope — the passbook's headline. */
  closingBalance: number
}

/**
 * Scope → filter → sort → paginate, then attach the running balance.
 *
 * The balance is computed over the entire dataset before any filtering, so the
 * figure in the column is the real balance after that entry rather than a
 * subtotal of whatever happens to be on screen.
 */
export function useRegister(): RegisterResult {
  const transactions = useTransactionsStore((state) => state.items)
  const filters = useUIStore((state) => state.filters)
  const sort = useUIStore((state) => state.sort)
  const page = useUIStore((state) => state.page)
  const scope = useUIStore((state) => state.registerScope)
  const month = useUIStore((state) => state.selectedMonth)
  const setPage = useUIStore((state) => state.setPage)

  const debouncedSearch = useDebouncedValue(filters.search, 220)

  const balanceById = useMemo(() => {
    const map = new Map<string, number>()
    for (const row of withRunningBalance(transactions)) {
      map.set(row.transaction.id, row.balance)
    }
    return map
  }, [transactions])

  const scoped = useMemo(() => {
    if (scope === 'all') return transactions
    const { from, to } = monthBounds(month)
    return transactions.filter(
      (transaction) => transaction.date >= from && transaction.date <= to,
    )
  }, [transactions, scope, month])

  const matched = useMemo(
    () => sortTransactions(applyFilters(scoped, { ...filters, search: debouncedSearch }), sort),
    [scoped, filters, debouncedSearch, sort],
  )

  const totalPages = pageCount(matched.length, PAGE_SIZE)

  // Deleting the last row of the last page would otherwise strand the user.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages, setPage])

  const safePage = Math.min(page, totalPages)
  const pageRows = paginate(matched, safePage, PAGE_SIZE)

  const latest = useMemo(
    () =>
      matched.reduce<Transaction | null>(
        (newest, row) =>
          !newest || row.date > newest.date || (row.date === newest.date && row.createdAt > newest.createdAt)
            ? row
            : newest,
        null,
      ),
    [matched],
  )

  return {
    rows: pageRows.map((transaction, index) => ({
      transaction,
      balance: balanceById.get(transaction.id) ?? 0,
      startsDay: index === 0 || pageRows[index - 1]!.date !== transaction.date,
    })),
    matched,
    summary: useMemo(() => summarise(matched), [matched]),
    page: safePage,
    totalPages,
    total: matched.length,
    pageSize: PAGE_SIZE,
    isEmpty: scoped.length === 0,
    isFilteredEmpty: scoped.length > 0 && matched.length === 0,
    closingBalance: latest ? (balanceById.get(latest.id) ?? 0) : 0,
  }
}
