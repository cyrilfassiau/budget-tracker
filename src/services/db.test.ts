import { beforeEach, describe, expect, it } from 'vitest'

import { STORAGE_KEYS } from '@/lib/constants'
import { DEFAULT_CATEGORIES } from '@/lib/seed'
import { makeTransaction } from '@/test/factories'
import { writeJSON } from '@/lib/storage'

import { db, migrate } from './db'

describe('migrate', () => {
  beforeEach(() => {
    localStorage.clear()
    db.categories.write(DEFAULT_CATEGORIES)
  })

  it('retypes entries whose category has become a transfer category', () => {
    db.transactions.write([
      makeTransaction({ id: 'old', type: 'expense', categoryId: 'cat-savings' }),
      makeTransaction({ id: 'keep', type: 'expense', categoryId: 'cat-groceries' }),
    ])

    migrate()

    const rows = db.transactions.read()
    expect(rows.find((row) => row.id === 'old')?.type).toBe('transfer')
    expect(rows.find((row) => row.id === 'keep')?.type).toBe('expense')
  })

  it('leaves a book that has already been migrated alone', () => {
    writeJSON(STORAGE_KEYS.schema, 2)
    db.transactions.write([makeTransaction({ id: 'old', type: 'expense', categoryId: 'cat-savings' })])

    migrate()

    expect(db.transactions.read()[0]?.type).toBe('expense')
  })

  it('records the schema version so it runs only once', () => {
    db.transactions.write([])
    migrate()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.schema)!)).toBe(2)
  })
})

describe('migrate: stale category kinds', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('retypes a built-in category that has become a transfer category', () => {
    // A book written before transfers existed: Savings stored as an expense.
    db.categories.write(
      DEFAULT_CATEGORIES.map((category) =>
        category.id === 'cat-savings' ? { ...category, kind: 'expense' as const } : category,
      ),
    )
    db.transactions.write([
      makeTransaction({ id: 'old', type: 'expense', categoryId: 'cat-savings' }),
    ])

    migrate()

    expect(db.categories.read().find((c) => c.id === 'cat-savings')?.kind).toBe('transfer')
    expect(db.transactions.read()[0]?.type).toBe('transfer')
  })

  it('never overwrites a kind the user chose for their own category', () => {
    db.categories.write([
      ...DEFAULT_CATEGORIES,
      { id: 'cat-mine', name: 'Mine', color: '#64748b', icon: 'circle', kind: 'expense', order: 50 },
    ])
    db.transactions.write([makeTransaction({ type: 'expense', categoryId: 'cat-mine' })])

    migrate()

    expect(db.categories.read().find((c) => c.id === 'cat-mine')?.kind).toBe('expense')
    expect(db.transactions.read()[0]?.type).toBe('expense')
  })
})
