import type { Budget, Category, Transaction } from '@/types'

let sequence = 0

export function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  sequence += 1
  const createdAt = `2026-01-0${(sequence % 9) + 1}T10:00:00.000Z`
  return {
    id: `txn-${sequence}`,
    amount: 10,
    type: 'expense',
    categoryId: 'cat-groceries',
    date: '2026-03-15',
    note: 'Test transaction',
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  }
}

export function makeCategory(overrides: Partial<Category> = {}): Category {
  sequence += 1
  return {
    id: `cat-${sequence}`,
    name: `Category ${sequence}`,
    color: '#6366f1',
    icon: 'circle',
    kind: 'expense',
    order: sequence,
    ...overrides,
  }
}

export function makeBudget(overrides: Partial<Budget> = {}): Budget {
  sequence += 1
  return {
    id: `bdg-${sequence}`,
    categoryId: 'cat-groceries',
    month: '2026-03',
    limit: 100,
    ...overrides,
  }
}
