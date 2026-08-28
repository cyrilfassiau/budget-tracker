export type TransactionType = 'income' | 'expense' | 'transfer'

export type CategoryKind = TransactionType | 'both'

export interface Transaction {
  id: string

  amount: number
  type: TransactionType
  categoryId: string

  date: string
  note: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string

  color: string

  icon: string
  kind: CategoryKind

  order: number

  isSystem?: boolean
}

export interface Budget {
  id: string
  categoryId: string

  month: string
  limit: number
}

export type ThemePreference = 'light' | 'dark' | 'system'

export interface Settings {
  theme: ThemePreference
  currency: string
  locale: string

  allowFutureDates: boolean

  latencyMs: number
}

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
export type TransactionDraft = Partial<NewTransaction>
export type NewCategory = Omit<Category, 'id' | 'order' | 'isSystem'> &
  Partial<Pick<Category, 'order'>>
export type NewBudget = Omit<Budget, 'id'>
export type SortField = 'date' | 'amount'
export type SortDirection = 'asc' | 'desc'

export interface TransactionFilters {
  search: string
  type: TransactionType | 'all'
  categoryIds: string[]
  from: string | null
  to: string | null
}

export interface TransactionSort {
  field: SortField
  direction: SortDirection
}
