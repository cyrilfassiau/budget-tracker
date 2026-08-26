import { X } from 'lucide-react'
import { useCallback, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { useFocusTrap, useScrollLock } from '@/hooks/useFocusTrap'
import { cn } from '@/lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md'
  closeOnBackdrop?: boolean
}

/**
 * A slip laid over the book. Focus is trapped, Escape closes, the page behind
 * cannot scroll, and focus returns to the trigger. Ids are generated per
 * instance so two open dialogs never collide.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const handleEscape = useCallback(() => onClose(), [onClose])

  useFocusTrap(panelRef, open, handleEscape)
  useScrollLock(open)

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 animate-fade-in bg-[rgb(12_16_14/0.5)]"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'relative z-10 flex max-h-[92dvh] w-full animate-in flex-col',
          'border border-ink bg-sheet',
          size === 'sm' ? 'sm:max-w-sm' : 'sm:max-w-md',
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-rule px-4 py-2.5">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-narrow text-[13px] font-semibold uppercase tracking-[0.08em] text-ink"
            >
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-0.5 text-[12px] text-ink-3">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-0.5 p-1 text-ink-3 transition-colors hover:bg-sheet-alt hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5">{children}</div>

        {footer ? (
          <footer className="flex items-center justify-end gap-2 border-t border-rule px-4 py-2.5">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
