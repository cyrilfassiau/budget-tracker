/** Category every transaction falls back to when its category is deleted. */
export const UNCATEGORIZED_ID = 'cat-uncategorized'

export const STORAGE_KEYS = {
  transactions: 'budget-tracker:transactions',
  categories: 'budget-tracker:categories',
  budgets: 'budget-tracker:budgets',
  settings: 'budget-tracker:settings',
  theme: 'budget-tracker:theme',
  seeded: 'budget-tracker:seeded',
  schema: 'budget-tracker:schema',
} as const

export const MONTH_FORMAT = 'yyyy-MM'
export const DATE_FORMAT = 'yyyy-MM-dd'

export const PAGE_SIZE = 12

export const CURRENCIES = [
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
] as const

/** Palette offered in the category colour picker. */
export const CATEGORY_COLORS = [
  '#e11d48',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#d946ef',
  '#ec4899',
  '#64748b',
  '#0f766e',
] as const
