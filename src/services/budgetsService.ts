import { createId } from '@/lib/id'
import type { Budget, NewBudget } from '@/types'

import { db } from './db'
import { ServiceError, clone, delay } from './http'

export async function getAll(): Promise<Budget[]> {
  await delay()
  return clone(db.budgets.read())
}

export async function getByMonth(month: string): Promise<Budget[]> {
  await delay()
  return clone(db.budgets.read().filter((row) => row.month === month))
}

export async function upsert(input: NewBudget): Promise<Budget> {
  await delay()
  const rows = db.budgets.read()
  const index = rows.findIndex(
    (row) => row.categoryId === input.categoryId && row.month === input.month,
  )

  if (index >= 0) {
    const next = { ...rows[index]!, limit: input.limit }
    rows[index] = next
    db.budgets.write(rows)
    return clone(next)
  }

  const budget: Budget = { ...input, id: createId('bdg') }
  db.budgets.write([...rows, budget])
  return clone(budget)
}

export async function remove(id: string): Promise<void> {
  await delay()
  const rows = db.budgets.read()
  const next = rows.filter((row) => row.id !== id)
  if (next.length === rows.length) {
    throw new ServiceError(`Budget ${id} not found`, 'not_found')
  }
  db.budgets.write(next)
}

export async function copyMonth(fromMonth: string, toMonth: string): Promise<Budget[]> {
  await delay()
  const rows = db.budgets.read()
  const source = rows.filter((row) => row.month === fromMonth)
  if (source.length === 0) {
    throw new ServiceError('There are no budgets to copy from that month.', 'not_found')
  }

  const kept = rows.filter((row) => row.month !== toMonth)
  const copies = source.map((row) => ({
    id: createId('bdg'),
    categoryId: row.categoryId,
    month: toMonth,
    limit: row.limit,
  }))
  db.budgets.write([...kept, ...copies])
  return clone(copies)
}
