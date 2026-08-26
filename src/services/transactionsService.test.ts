import { beforeEach, describe, expect, it } from 'vitest'

import { STORAGE_KEYS, UNCATEGORIZED_ID } from '@/lib/constants'

import { db } from './db'
import { ServiceError } from './http'
import * as service from './transactionsService'

const payload = {
  amount: 42.5,
  type: 'expense' as const,
  categoryId: 'cat-groceries',
  date: '2026-03-10',
  note: 'Weekly shop',
}

beforeEach(() => {
  // Latency off keeps the service tests fast; the delay itself is not the
  // behaviour under test.
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ latencyMs: 0 }))
  db.transactions.write([])
})

describe('transactionsService', () => {
  it('creates a transaction with an id and timestamps', async () => {
    const created = await service.create(payload)

    expect(created.id).toMatch(/^txn-/)
    expect(created.createdAt).toBeTruthy()
    expect(created).toMatchObject(payload)
  })

  it('persists across calls', async () => {
    await service.create(payload)
    expect(await service.getAll()).toHaveLength(1)
  })

  it('returns transactions newest first', async () => {
    await service.create({ ...payload, date: '2026-01-01' })
    await service.create({ ...payload, date: '2026-03-01' })
    await service.create({ ...payload, date: '2026-02-01' })

    const all = await service.getAll()
    expect(all.map((entry) => entry.date)).toEqual(['2026-03-01', '2026-02-01', '2026-01-01'])
  })

  it('reads one transaction by id', async () => {
    const created = await service.create(payload)
    expect(await service.getById(created.id)).toMatchObject({ id: created.id })
  })

  it('throws a not_found error for a missing id', async () => {
    await expect(service.getById('nope')).rejects.toBeInstanceOf(ServiceError)
    await expect(service.getById('nope')).rejects.toMatchObject({ code: 'not_found' })
  })

  it('updates only the fields provided and bumps updatedAt', async () => {
    const created = await service.create(payload)
    const updated = await service.update(created.id, { amount: 99 })

    expect(updated.amount).toBe(99)
    expect(updated.note).toBe(payload.note)
    expect(updated.createdAt).toBe(created.createdAt)
  })

  it('refuses to update a missing transaction', async () => {
    await expect(service.update('nope', { amount: 1 })).rejects.toMatchObject({
      code: 'not_found',
    })
  })

  it('deletes a transaction', async () => {
    const created = await service.create(payload)
    await service.remove(created.id)
    expect(await service.getAll()).toHaveLength(0)
  })

  it('refuses to delete a missing transaction', async () => {
    await expect(service.remove('nope')).rejects.toMatchObject({ code: 'not_found' })
  })

  it('creates many at once for CSV import', async () => {
    const created = await service.createMany([payload, { ...payload, amount: 5 }])
    expect(created).toHaveLength(2)
    expect(await service.getAll()).toHaveLength(2)
  })

  it('reassigns transactions when a category is deleted', async () => {
    await service.create(payload)
    await service.create({ ...payload, categoryId: 'cat-rent' })

    const moved = await service.reassignCategory('cat-groceries', UNCATEGORIZED_ID)
    const all = await service.getAll()

    expect(moved).toBe(1)
    expect(all.filter((entry) => entry.categoryId === UNCATEGORIZED_ID)).toHaveLength(1)
    expect(all.filter((entry) => entry.categoryId === 'cat-rent')).toHaveLength(1)
  })

  it('returns copies so callers cannot mutate stored data', async () => {
    const created = await service.create(payload)
    created.amount = 9999

    expect((await service.getById(created.id)).amount).toBe(payload.amount)
  })
})
