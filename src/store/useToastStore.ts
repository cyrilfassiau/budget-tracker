import { create } from 'zustand'

import { createId } from '@/lib/id'

export type ToastVariant = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  description?: string
  variant: ToastVariant

  action?: { label: string; onClick: () => void }
}

interface ToastState {
  toasts: Toast[]
  push: (toast: Omit<Toast, 'id'>) => string
  dismiss: (id: string) => void
  clear: () => void
}

export const TOAST_DURATION = 4200

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = createId('toast')
    set((state) => ({ toasts: [...state.toasts.slice(-3), { ...toast, id }] }))
    return id
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  clear: () => set({ toasts: [] }),
}))

export const toast = {
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) =>
    useToastStore.getState().push({ ...options, message, variant: 'success' }),
  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) =>
    useToastStore.getState().push({ ...options, message, variant: 'error' }),
  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) =>
    useToastStore.getState().push({ ...options, message, variant: 'info' }),
}

export function toMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error) return error
  return fallback
}
