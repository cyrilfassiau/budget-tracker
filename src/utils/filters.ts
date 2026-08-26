import type {
  Transaction,
  TransactionFilters,
  TransactionSort,
} from '@/types'

export const EMPTY_FILTERS: TransactionFilters = {
  search: '',
  type: 'all',
  categoryIds: [],
  from: null,
  to: null,
}

export const DEFAULT_SORT: TransactionSort = { field: 'date', direction: 'desc' }

export function isFilterActive(filters: TransactionFilters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.type !== 'all' ||
    filters.categoryIds.length > 0 ||
    filters.from !== null ||
    filters.to !== null
  )
}

export function countActiveFilters(filters: TransactionFilters): number {
  let count = 0
  if (filters.search.trim()) count += 1
  if (filters.type !== 'all') count += 1
  if (filters.categoryIds.length > 0) count += 1
  if (filters.from || filters.to) count += 1
  return count
}

export function applyFilters(
  transactions: Transaction[],
  filters: TransactionFilters,
): Transaction[] {
  const search = filters.search.trim().toLowerCase()
  const categoryIds = filters.categoryIds.length > 0 ? new Set(filters.categoryIds) : null

  return transactions.filter((transaction) => {
    if (filters.type !== 'all' && transaction.type !== filters.type) return false
    if (categoryIds && !categoryIds.has(transaction.categoryId)) return false
    if (filters.from && transaction.date < filters.from) return false
    if (filters.to && transaction.date > filters.to) return false
    if (search && !transaction.note.toLowerCase().includes(search)) return false
    return true
  })
}

export function sortTransactions(
  transactions: Transaction[],
  sort: TransactionSort,
): Transaction[] {
  const direction = sort.direction === 'asc' ? 1 : -1

  return [...transactions].sort((a, b) => {
    if (sort.field === 'amount') {
      const delta = a.amount - b.amount
      return delta === 0 ? a.date.localeCompare(b.date) * direction : delta * direction
    }
    const delta = a.date.localeCompare(b.date)
    // Same-day rows fall back to insertion order so the list never jitters.
    return delta === 0 ? a.createdAt.localeCompare(b.createdAt) * direction : delta * direction
  })
}

export function paginate<T>(rows: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return rows.slice(start, start + pageSize)
}

export function pageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize))
}
