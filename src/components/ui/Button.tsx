import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'icon'

/**
 * Stamped, not styled: square corners, one ink, no shadow. The primary is a
 * solid block of carbon; everything else is a ruled outline.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-carbon text-sheet hover:bg-carbon-2',
  secondary: 'border border-rule-strong bg-sheet text-ink hover:bg-sheet-alt hover:border-ink-3',
  ghost: 'text-ink-2 hover:bg-sheet-alt hover:text-ink',
  danger: 'border border-red bg-red-tint text-red hover:bg-red hover:text-sheet',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-[12px] gap-1.5',
  md: 'h-9 px-3.5 text-[13px] gap-2',
  icon: 'size-8',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  fullWidth,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center',
        'font-narrow font-semibold uppercase tracking-[0.07em]',
        'transition-colors duration-100',
        'disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? <Spinner className="size-3.5" /> : icon}
      {children}
    </button>
  )
}
