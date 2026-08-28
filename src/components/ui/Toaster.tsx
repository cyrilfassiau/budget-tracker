import { X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/cn'
import { TOAST_DURATION, useToastStore, type Toast as ToastModel } from '@/store/useToastStore'

function Toast({ toast }: { toast: ToastModel }) {
  const dismiss = useToastStore((state) => state.dismiss)

  useEffect(() => {
    const timer = setTimeout(
      () => dismiss(toast.id),
      toast.action ? TOAST_DURATION * 2 : TOAST_DURATION,
    )
    return () => clearTimeout(timer)
  }, [toast.id, toast.action, dismiss])

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-[18px] p-3.5 pr-2.5 animate-in',
        'shadow-[0_8px_28px_-8px_rgb(var(--scrim)/0.35)]',
        toast.variant === 'error' ? 'bg-negative text-negative-fg' : 'bg-fg text-bg',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold">{toast.message}</p>
        {toast.description ? (
          <p className="mt-0.5 text-[13px] leading-snug opacity-80">{toast.description}</p>
        ) : null}
        {toast.action ? (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick()
              dismiss(toast.id)
            }}
            className="pill mt-2 bg-white/20 px-3 py-1 text-[13px] font-bold transition-colors hover:bg-white/30"
          >
            {toast.action.label}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss"
        className="rounded-full p-1.5 opacity-70 transition-opacity hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts)

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-20 left-4 z-[60] flex w-[calc(100%-2rem)] flex-col gap-2 sm:bottom-5 sm:left-auto sm:right-5 sm:w-80"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body,
  )
}
