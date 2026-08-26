/**
 * Domain model for the app. These types are the contract between the UI, the
 * stores and the service layer — when a real API replaces localStorage the
 * shapes below are what the endpoints must return.
 */

export type TransactionType = 'income' | 'expense'

/** Which transaction types a category may be used for. */
export type CategoryKind = TransactionType | 'both'

export interface Transaction {
  id: string
  /** Always a positive number; direction is carried by `type`. */
  amount: number
  type: TransactionType
  categoryId: string
  /** Calendar day in `yyyy-MM-dd` form — deliberately not a timestamp. */
  date: string
  note: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  /** Hex colour used for charts, badges and the category dot. */
  color: string
  /** Key into the icon registry (`src/lib/icons.ts`). */
  icon: string
  kind: CategoryKind
  /** Manual sort position, mutated by drag-and-drop reordering. */
  order: number
  /** Seeded categories cannot be deleted, only renamed/recoloured. */
  isSystem?: boolean
}

export interface Budget {
  id: string
  categoryId: string
  /** Month the limit applies to, in `yyyy-MM` form. */
  month: string
  limit: number
}

export type ThemePreference = 'light' | 'dark' | 'system'

export interface Settings {
  theme: ThemePreference
  currency: string
  locale: string
  /** Allow booking transactions with a future date (planning mode). */
  allowFutureDates: boolean
  /** Artificial latency on the fake async services, in ms. */
  latencyMs: number
}

/** Payload accepted when creating a record — the store owns id/timestamps. */
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
