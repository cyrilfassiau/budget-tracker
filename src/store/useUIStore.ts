import { create } from 'zustand'

import { STORAGE_KEYS } from '@/lib/constants'
import { readJSON, writeJSON } from '@/lib/storage'
import type { ThemePreference, TransactionFilters, TransactionSort } from '@/types'
import { currentMonthKey } from '@/utils/dates'
import { DEFAULT_SORT, EMPTY_FILTERS } from '@/utils/filters'

interface UIState {
  selectedMonth: string
  filters: TransactionFilters
  sort: TransactionSort
  page: number

  registerScope: 'month' | 'all'
  theme: ThemePreference

  setMonth: (month: string) => void
  setFilters: (patch: Partial<TransactionFilters>) => void
  resetFilters: () => void
  setSort: (sort: TransactionSort) => void
  toggleSort: (field: TransactionSort['field']) => void
  setPage: (page: number) => void
  setScope: (scope: 'month' | 'all') => void
  setTheme: (theme: ThemePreference) => void
}

export const useUIStore = create<UIState>((set) => ({
  selectedMonth: currentMonthKey(),
  filters: EMPTY_FILTERS,
  sort: DEFAULT_SORT,
  page: 1,
  registerScope: 'month',
  theme: readJSON<ThemePreference>(STORAGE_KEYS.theme, 'system'),

  setMonth: (selectedMonth) => set({ selectedMonth, page: 1 }),

  setScope: (registerScope) => set({ registerScope, page: 1 }),

  setFilters: (patch) =>
    set((state) => ({ filters: { ...state.filters, ...patch }, page: 1 })),

  resetFilters: () => set({ filters: EMPTY_FILTERS, page: 1 }),

  setSort: (sort) => set({ sort, page: 1 }),

  toggleSort: (field) =>
    set((state) => ({
      page: 1,
      sort:
        state.sort.field === field
          ? { field, direction: state.sort.direction === 'asc' ? 'desc' : 'asc' }
          : { field, direction: 'desc' },
    })),

  setPage: (page) => set({ page }),

  setTheme: (theme) => {
    writeJSON(STORAGE_KEYS.theme, theme)
    set({ theme })
  },
}))
