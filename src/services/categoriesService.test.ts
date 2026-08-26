import { beforeEach, describe, expect, it } from 'vitest'

import { STORAGE_KEYS, UNCATEGORIZED_ID } from '@/lib/constants'
import { DEFAULT_CATEGORIES } from '@/lib/seed'

import * as service from './categoriesService'
import { db } from './db'

const input = { name: 'Coffee', color: '#f97316', icon: 'coffee', kind: 'expense' as const }

beforeEach(() => {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ latencyMs: 0 }))
  db.categories.write(DEFAULT_CATEGORIES)
})

describe('categoriesService', () => {
  it('returns the seeded categories in order', async () => {
    const categories = await service.getAll()
    expect(categories[0]?.name).toBe('Salary')
    expect(categories.at(-1)?.id).toBe(UNCATEGORIZED_ID)
  })

  it('creates a category with the next order value', async () => {
    const created = await service.create(input)
    expect(created.id).toMatch(/^cat-/)
    expect(created.order).toBeGreaterThan(0)
  })

  it('rejects a duplicate name regardless of case', async () => {
    await service.create(input)
    await expect(service.create({ ...input, name: 'coffee' })).rejects.toMatchObject({
      code: 'conflict',
    })
  })

  it('trims whitespace from names', async () => {
    const created = await service.create({ ...input, name: '  Coffee  ' })
    expect(created.name).toBe('Coffee')
  })

  it('updates a category', async () => {
    const created = await service.create(input)
    const updated = await service.update(created.id, { name: 'Espresso', color: '#000000' })
    expect(updated).toMatchObject({ name: 'Espresso', color: '#000000' })
  })

  it('rejects renaming onto an existing name', async () => {
    const created = await service.create(input)
    await expect(service.update(created.id, { name: 'Groceries' })).rejects.toMatchObject({
      code: 'conflict',
    })
  })

  it('deletes a user-created category', async () => {
    const created = await service.create(input)
    await service.remove(created.id)
    expect((await service.getAll()).some((entry) => entry.id === created.id)).toBe(false)
  })

  it('refuses to delete a default category', async () => {
    await expect(service.remove('cat-rent')).rejects.toMatchObject({ code: 'conflict' })
  })

  it('refuses to delete Uncategorized', async () => {
    await expect(service.remove(UNCATEGORIZED_ID)).rejects.toMatchObject({ code: 'conflict' })
  })

  it('persists a new order', async () => {
    const before = await service.getAll()
    const reversed = [...before].reverse().map((entry) => entry.id)

    const after = await service.reorder(reversed)
    expect(after.map((entry) => entry.id)).toEqual(reversed)
  })
})
