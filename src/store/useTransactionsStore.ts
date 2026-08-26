import { create } from 'zustand'

import * as transactionsService from '@/services/transactionsService'
import type { NewTransaction, Transaction } from '@/types'

export type RequestStatus = 'idle' | 'loading' | 'ready' | 'error'

interface TransactionsState {
  items: Transaction[]
  status: RequestStatus
  error: string | null
  /** Ids with an in-flight mutation, so rows can show their own pending state. */
  pendingIds: string[]
  fetchAll: () => Promise<void>
  add: (input: NewTransaction) => Promise<Transaction>
  addMany: (inputs: NewTransaction[]) => Promise<Transaction[]>
  edit: (id: string, patch: Partial<NewTransaction>) => Promise<Transaction>
  remove: (id: string) => Promise<void>
  /** Re-reads from the service after an out-of-band change (import, reset). */
  invalidate: () => Promise<void>
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  items: [],
  status: 'idle',
  error: null,
  pendingIds: [],

  fetchAll: async () => {
    set({ status: 'loading', error: null })
    try {
      const items = await transactionsService.getAll()
      set({ items, status: 'ready' })
    } catch (error) {
      set({ status: 'error', error: (error as Error).message })
    }
  },

  add: async (input) => {
    const created = await transactionsService.create(input)
    set((state) => ({ items: [created, ...state.items] }))
    return created
  },

  addMany: async (inputs) => {
    const created = await transactionsService.createMany(inputs)
    set((state) => ({ items: [...created, ...state.items] }))
    return created
  },

  edit: async (id, patch) => {
    set((state) => ({ pendingIds: [...state.pendingIds, id] }))
    try {
      const updated = await transactionsService.update(id, patch)
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updated : item)),
      }))
      return updated
    } finally {
      set((state) => ({ pendingIds: state.pendingIds.filter((value) => value !== id) }))
    }
  },

  remove: async (id) => {
    const snapshot = get().items
    // Optimistic: the row disappears immediately and is restored on failure.
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
    try {
      await transactionsService.remove(id)
    } catch (error) {
      set({ items: snapshot })
      throw error
    }
  },

  invalidate: async () => {
    const items = await transactionsService.getAll()
    set({ items, status: 'ready' })
  },
}))
