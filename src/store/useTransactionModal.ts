import { create } from 'zustand'

import type { Transaction, TransactionType } from '@/types'

interface TransactionModalState {
  open: boolean

  editing: Transaction | null

  defaults: { type?: TransactionType; categoryId?: string; date?: string } | null
  openNew: (defaults?: TransactionModalState['defaults']) => void
  openEdit: (transaction: Transaction) => void
  close: () => void
}

export const useTransactionModal = create<TransactionModalState>((set) => ({
  open: false,
  editing: null,
  defaults: null,
  openNew: (defaults = null) => set({ open: true, editing: null, defaults }),
  openEdit: (transaction) => set({ open: true, editing: transaction, defaults: null }),
  close: () => set({ open: false, editing: null, defaults: null }),
}))
