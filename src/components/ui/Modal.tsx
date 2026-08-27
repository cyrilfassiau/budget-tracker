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
 * A bottom sheet on a phone, a centred dialog from `sm` up.
 *
 * The grab handle is not decoration: it is the affordance that tells a
 * thumb this panel came from the bottom edge and goes back there.
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
        className="absolute inset-0 animate-fade-in bg-[rgb(var(--scrim)/0.55)]"
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
          'relative z-10 flex max-h-[92dvh] w-full flex-col bg-raised',
          'animate-sheet rounded-t-[28px] sm:animate-in sm:rounded-[24px]',
          size === 'sm' ? 'sm:max-w-sm' : 'sm:max-w-md',
        )}
      >
        <div aria-hidden="true" className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-surface-3 sm:hidden" />

        <header className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-[19px] font-extrabold tracking-[-0.02em] text-fg">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-0.5 text-[13px] text-fg-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 flex size-9 items-center justify-center rounded-full bg-surface-2 text-fg-muted transition-colors hover:bg-surface-3 hover:text-fg"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2">{children}</div>

        {footer ? (
          <footer className="flex items-center gap-2 px-5 pb-5 pt-3 [&>*]:flex-1">{footer}</footer>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
