import { create } from 'zustand'

import { UNCATEGORIZED_ID } from '@/lib/constants'
import * as categoriesService from '@/services/categoriesService'
import * as transactionsService from '@/services/transactionsService'
import type { Category, NewCategory } from '@/types'

import type { RequestStatus } from './useTransactionsStore'

interface CategoriesState {
  items: Category[]
  status: RequestStatus
  error: string | null
  fetchAll: () => Promise<void>
  add: (input: NewCategory) => Promise<Category>
  edit: (id: string, patch: Partial<NewCategory>) => Promise<Category>
  remove: (id: string) => Promise<number>
  reorder: (orderedIds: string[]) => Promise<void>
  invalidate: () => Promise<void>
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  items: [],
  status: 'idle',
  error: null,

  fetchAll: async () => {
    set({ status: 'loading', error: null })
    try {
      const items = await categoriesService.getAll()
      set({ items, status: 'ready' })
    } catch (error) {
      set({ status: 'error', error: (error as Error).message })
    }
  },

  add: async (input) => {
    const created = await categoriesService.create(input)
    set((state) => ({ items: [...state.items, created] }))
    return created
  },

  edit: async (id, patch) => {
    const updated = await categoriesService.update(id, patch)
    set((state) => ({ items: state.items.map((item) => (item.id === id ? updated : item)) }))
    return updated
  },

  remove: async (id) => {
    const moved = await transactionsService.reassignCategory(id, UNCATEGORIZED_ID)
    await categoriesService.remove(id)
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
    return moved
  },

  reorder: async (orderedIds) => {
    const snapshot = get().items

    const byId = new Map(snapshot.map((item) => [item.id, item]))
    set({
      items: orderedIds
        .map((id, index) => {
          const item = byId.get(id)
          return item ? { ...item, order: index } : null
        })
        .filter((item): item is Category => item !== null),
    })
    try {
      const items = await categoriesService.reorder(orderedIds)
      set({ items })
    } catch (error) {
      set({ items: snapshot })
      throw error
    }
  },

  invalidate: async () => {
    const items = await categoriesService.getAll()
    set({ items, status: 'ready' })
  },
}))
