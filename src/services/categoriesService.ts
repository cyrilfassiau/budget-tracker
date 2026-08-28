import { UNCATEGORIZED_ID } from '@/lib/constants'
import { createId } from '@/lib/id'
import type { Category, NewCategory } from '@/types'

import { db } from './db'
import { ServiceError, clone, delay } from './http'

function sorted(rows: Category[]): Category[] {
  return [...rows].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
}

export async function getAll(): Promise<Category[]> {
  await delay()
  return clone(sorted(db.categories.read()))
}

export async function getById(id: string): Promise<Category> {
  await delay()
  const found = db.categories.read().find((row) => row.id === id)
  if (!found) throw new ServiceError(`Category ${id} not found`, 'not_found')
  return clone(found)
}

export async function create(input: NewCategory): Promise<Category> {
  await delay()
  const rows = db.categories.read()
  const duplicate = rows.some(
    (row) => row.name.trim().toLowerCase() === input.name.trim().toLowerCase(),
  )
  if (duplicate) {
    throw new ServiceError(`A category named "${input.name}" already exists.`, 'conflict')
  }

  const category: Category = {
    ...input,
    name: input.name.trim(),
    id: createId('cat'),
    order: input.order ?? Math.max(-1, ...rows.map((row) => row.order)) + 1,
  }
  db.categories.write([...rows, category])
  return clone(category)
}

export async function update(id: string, patch: Partial<NewCategory>): Promise<Category> {
  await delay()
  const rows = db.categories.read()
  const index = rows.findIndex((row) => row.id === id)
  if (index === -1) throw new ServiceError(`Category ${id} not found`, 'not_found')

  if (patch.name) {
    const clash = rows.some(
      (row) =>
        row.id !== id && row.name.trim().toLowerCase() === patch.name!.trim().toLowerCase(),
    )
    if (clash) {
      throw new ServiceError(`A category named "${patch.name}" already exists.`, 'conflict')
    }
  }

  const next: Category = { ...rows[index]!, ...patch }
  if (patch.name) next.name = patch.name.trim()
  rows[index] = next
  db.categories.write(rows)
  return clone(next)
}

export async function remove(id: string): Promise<void> {
  await delay()
  if (id === UNCATEGORIZED_ID) {
    throw new ServiceError('The Uncategorized category cannot be deleted.', 'conflict')
  }
  const rows = db.categories.read()
  const target = rows.find((row) => row.id === id)
  if (!target) throw new ServiceError(`Category ${id} not found`, 'not_found')
  if (target.isSystem) {
    throw new ServiceError(`"${target.name}" is a default category and cannot be deleted.`, 'conflict')
  }
  db.categories.write(rows.filter((row) => row.id !== id))
}

export async function reorder(orderedIds: string[]): Promise<Category[]> {
  await delay(0)
  const rows = db.categories.read()
  const next = rows.map((row) => {
    const index = orderedIds.indexOf(row.id)
    return index === -1 ? row : { ...row, order: index }
  })
  db.categories.write(next)
  return clone(sorted(next))
}
