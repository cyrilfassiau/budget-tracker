import { create } from 'zustand'

import * as budgetsService from '@/services/budgetsService'
import type { Budget, NewBudget } from '@/types'

import type { RequestStatus } from './useTransactionsStore'

interface BudgetsState {
  items: Budget[]
  status: RequestStatus
  error: string | null
  fetchAll: () => Promise<void>
  setLimit: (input: NewBudget) => Promise<Budget>
  remove: (id: string) => Promise<void>
  copyMonth: (fromMonth: string, toMonth: string) => Promise<number>
  invalidate: () => Promise<void>
}

export const useBudgetsStore = create<BudgetsState>((set) => ({
  items: [],
  status: 'idle',
  error: null,

  fetchAll: async () => {
    set({ status: 'loading', error: null })
    try {
      const items = await budgetsService.getAll()
      set({ items, status: 'ready' })
    } catch (error) {
      set({ status: 'error', error: (error as Error).message })
    }
  },

  setLimit: async (input) => {
    const saved = await budgetsService.upsert(input)
    set((state) => {
      const exists = state.items.some((item) => item.id === saved.id)
      return {
        items: exists
          ? state.items.map((item) => (item.id === saved.id ? saved : item))
          : [...state.items, saved],
      }
    })
    return saved
  },

  remove: async (id) => {
    await budgetsService.remove(id)
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
  },

  copyMonth: async (fromMonth, toMonth) => {
    const copies = await budgetsService.copyMonth(fromMonth, toMonth)
    set((state) => ({
      items: [...state.items.filter((item) => item.month !== toMonth), ...copies],
    }))
    return copies.length
  },

  invalidate: async () => {
    const items = await budgetsService.getAll()
    set({ items, status: 'ready' })
  },
}))
