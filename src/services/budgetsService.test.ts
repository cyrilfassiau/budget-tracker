import { beforeEach, describe, expect, it } from 'vitest'

import { STORAGE_KEYS } from '@/lib/constants'

import * as service from './budgetsService'
import { db } from './db'

beforeEach(() => {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ latencyMs: 0 }))
  db.budgets.write([])
})

describe('budgetsService', () => {
  it('creates a budget when none exists for that category and month', async () => {
    const budget = await service.upsert({ categoryId: 'cat-rent', month: '2026-03', limit: 900 })
    expect(budget.id).toMatch(/^bdg-/)
    expect(await service.getAll()).toHaveLength(1)
  })

  it('overwrites the limit instead of creating a duplicate', async () => {
    await service.upsert({ categoryId: 'cat-rent', month: '2026-03', limit: 900 })
    const updated = await service.upsert({ categoryId: 'cat-rent', month: '2026-03', limit: 950 })

    expect(await service.getAll()).toHaveLength(1)
    expect(updated.limit).toBe(950)
  })

  it('keeps limits for different months apart', async () => {
    await service.upsert({ categoryId: 'cat-rent', month: '2026-03', limit: 900 })
    await service.upsert({ categoryId: 'cat-rent', month: '2026-04', limit: 950 })

    expect(await service.getByMonth('2026-03')).toHaveLength(1)
    expect(await service.getAll()).toHaveLength(2)
  })

  it('copies a month, replacing whatever the target month had', async () => {
    await service.upsert({ categoryId: 'cat-rent', month: '2026-03', limit: 900 })
    await service.upsert({ categoryId: 'cat-food', month: '2026-03', limit: 300 })
    await service.upsert({ categoryId: 'cat-rent', month: '2026-04', limit: 10 })

    const copies = await service.copyMonth('2026-03', '2026-04')
    const april = await service.getByMonth('2026-04')

    expect(copies).toHaveLength(2)
    expect(april).toHaveLength(2)
    expect(april.find((entry) => entry.categoryId === 'cat-rent')?.limit).toBe(900)
  })

  it('refuses to copy from an empty month', async () => {
    await expect(service.copyMonth('2026-01', '2026-02')).rejects.toMatchObject({
      code: 'not_found',
    })
  })

  it('deletes a budget', async () => {
    const budget = await service.upsert({ categoryId: 'cat-rent', month: '2026-03', limit: 900 })
    await service.remove(budget.id)
    expect(await service.getAll()).toHaveLength(0)
  })
})
