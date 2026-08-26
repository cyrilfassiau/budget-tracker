import { createId } from '@/lib/id'
import type { NewTransaction, Transaction } from '@/types'

import { db } from './db'
import { ServiceError, clone, delay } from './http'

/**
 * CRUD for transactions.
 *
 * Every function is `async` even though the storage read/write underneath is
 * synchronous: the call sites (stores, components) are already written against
 * a promise-based API, so pointing these at `fetch` later changes this file
 * only.
 */

function sortByDateDesc(rows: Transaction[]): Transaction[] {
  return [...rows].sort((a, b) =>
    a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date),
  )
}

export async function getAll(): Promise<Transaction[]> {
  await delay()
  return clone(sortByDateDesc(db.transactions.read()))
}

export async function getById(id: string): Promise<Transaction> {
  await delay()
  const found = db.transactions.read().find((row) => row.id === id)
  if (!found) throw new ServiceError(`Transaction ${id} not found`, 'not_found')
  return clone(found)
}

export async function create(input: NewTransaction): Promise<Transaction> {
  await delay()
  const now = new Date().toISOString()
  const transaction: Transaction = {
    ...input,
    id: createId('txn'),
    createdAt: now,
    updatedAt: now,
  }
  db.transactions.write([transaction, ...db.transactions.read()])
  return clone(transaction)
}

export async function update(
  id: string,
  patch: Partial<NewTransaction>,
): Promise<Transaction> {
  await delay()
  const rows = db.transactions.read()
  const index = rows.findIndex((row) => row.id === id)
  if (index === -1) throw new ServiceError(`Transaction ${id} not found`, 'not_found')

  const next: Transaction = {
    ...rows[index]!,
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  rows[index] = next
  db.transactions.write(rows)
  return clone(next)
}

export async function remove(id: string): Promise<void> {
  await delay()
  const rows = db.transactions.read()
  const next = rows.filter((row) => row.id !== id)
  if (next.length === rows.length) {
    throw new ServiceError(`Transaction ${id} not found`, 'not_found')
  }
  db.transactions.write(next)
}

/** Used by CSV import and recurring-transaction materialisation. */
export async function createMany(inputs: NewTransaction[]): Promise<Transaction[]> {
  await delay()
  const now = new Date().toISOString()
  const created = inputs.map((input) => ({
    ...input,
    id: createId('txn'),
    createdAt: now,
    updatedAt: now,
  }))
  db.transactions.write([...created, ...db.transactions.read()])
  return clone(created)
}

/** Moves every transaction of one category onto another (category deletion). */
export async function reassignCategory(
  fromCategoryId: string,
  toCategoryId: string,
): Promise<number> {
  await delay(0)
  const rows = db.transactions.read()
  let moved = 0
  const next = rows.map((row) => {
    if (row.categoryId !== fromCategoryId) return row
    moved += 1
    return { ...row, categoryId: toCategoryId, updatedAt: new Date().toISOString() }
  })
  if (moved > 0) db.transactions.write(next)
  return moved
}
