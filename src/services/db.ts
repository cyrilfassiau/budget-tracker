import { STORAGE_KEYS } from '@/lib/constants'
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SETTINGS,
  buildSeedBudgets,
  buildSeedTransactions,
} from '@/lib/seed'
import { readJSON, writeJSON } from '@/lib/storage'
import type { Budget, Category, Settings, Transaction } from '@/types'

/**
 * Thin table abstraction over the storage layer. Services talk to `table(...)`
 * rather than to localStorage keys directly, which keeps the swap to a real
 * API mechanical.
 */
function table<T>(key: string, fallback: T[]) {
  return {
    read: () => readJSON<T[]>(key, fallback),
    write: (rows: T[]) => writeJSON(key, rows),
  }
}

export const db = {
  transactions: table<Transaction>(STORAGE_KEYS.transactions, []),
  categories: table<Category>(STORAGE_KEYS.categories, DEFAULT_CATEGORIES),
  budgets: table<Budget>(STORAGE_KEYS.budgets, []),
  settings: {
    read: () => ({
      ...DEFAULT_SETTINGS,
      ...readJSON<Partial<Settings>>(STORAGE_KEYS.settings, {}),
    }),
    write: (value: Settings) => writeJSON(STORAGE_KEYS.settings, value),
  },
}

/**
 * Populates a demo dataset the first time the app runs so the dashboard has
 * something to show. Runs exactly once — a user who deletes everything keeps
 * an empty app.
 */
export function ensureSeeded(): void {
  if (readJSON<boolean>(STORAGE_KEYS.seeded, false)) return

  db.categories.write(DEFAULT_CATEGORIES)
  db.transactions.write(buildSeedTransactions())
  db.budgets.write(buildSeedBudgets())
  db.settings.write(DEFAULT_SETTINGS)
  writeJSON(STORAGE_KEYS.seeded, true)
}

/** Wipes every table and re-seeds — wired to "Reset demo data" in Settings. */
export function resetToSeed(): void {
  writeJSON(STORAGE_KEYS.seeded, false)
  ensureSeeded()
}

/** Clears every table without re-seeding. */
export function clearAll(): void {
  db.categories.write(DEFAULT_CATEGORIES)
  db.transactions.write([])
  db.budgets.write([])
  writeJSON(STORAGE_KEYS.seeded, true)
}
