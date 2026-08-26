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
export const SCHEMA_VERSION = 2

export function ensureSeeded(): void {
  if (readJSON<boolean>(STORAGE_KEYS.seeded, false)) {
    migrate()
    return
  }

  db.categories.write(DEFAULT_CATEGORIES)
  db.transactions.write(buildSeedTransactions())
  db.budgets.write(buildSeedBudgets())
  db.settings.write(DEFAULT_SETTINGS)
  writeJSON(STORAGE_KEYS.seeded, true)
  writeJSON(STORAGE_KEYS.schema, SCHEMA_VERSION)
}

/**
 * Brings an existing book up to date with the current model.
 *
 * Transfers were introduced after the first release, so a book written before
 * it holds "Savings" entries typed as expenses. Re-seeding would fix the demo
 * and destroy anyone's real data, so instead each entry whose category is now
 * a transfer category is retyped in place. Runs at most once per book.
 */
export function migrate(): void {
  if (readJSON<number>(STORAGE_KEYS.schema, 0) >= SCHEMA_VERSION) return

  // The stored categories were written by the old seed, so their `kind` is
  // stale too. Reconcile only the narrow case this migration is for — a
  // built-in category that has become a transfer category — so a kind the
  // user chose themselves is never overwritten.
  const storedCategories = db.categories.read()
  const defaultKinds = new Map(DEFAULT_CATEGORIES.map((entry) => [entry.id, entry.kind]))

  let categoriesChanged = false
  const reconciled = storedCategories.map((category) => {
    if (category.kind === 'expense' && defaultKinds.get(category.id) === 'transfer') {
      categoriesChanged = true
      return { ...category, kind: 'transfer' as const }
    }
    return category
  })
  if (categoriesChanged) db.categories.write(reconciled)

  const transferCategories = new Set(
    reconciled.filter((category) => category.kind === 'transfer').map((category) => category.id),
  )

  if (transferCategories.size > 0) {
    const rows = db.transactions.read()
    let changed = 0
    const next = rows.map((row) => {
      if (row.type === 'transfer' || !transferCategories.has(row.categoryId)) return row
      changed += 1
      return { ...row, type: 'transfer' as const, updatedAt: new Date().toISOString() }
    })
    if (changed > 0) db.transactions.write(next)
  }

  writeJSON(STORAGE_KEYS.schema, SCHEMA_VERSION)
}

/** Wipes every table and re-seeds — wired to "Restore the sample book". */
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
