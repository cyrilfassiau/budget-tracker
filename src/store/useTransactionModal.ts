import { create } from 'zustand'

import type { Transaction, TransactionType } from '@/types'

interface TransactionModalState {
  open: boolean
  /** Set when editing; `null` means "create a new transaction". */
  editing: Transaction | null
  /** Pre-selected type/category when opening from a category or budget row. */
  defaults: { type?: TransactionType; categoryId?: string; date?: string } | null
  openNew: (defaults?: TransactionModalState['defaults']) => void
  openEdit: (transaction: Transaction) => void
  close: () => void
}

/**
 * The add/edit dialog is reachable from the header, the empty states and the
 * budget rows, so its open state lives outside the component tree.
 */
export const useTransactionModal = create<TransactionModalState>((set) => ({
  open: false,
  editing: null,
  defaults: null,
  openNew: (defaults = null) => set({ open: true, editing: null, defaults }),
  openEdit: (transaction) => set({ open: true, editing: transaction, defaults: null }),
  close: () => set({ open: false, editing: null, defaults: null }),
}))
