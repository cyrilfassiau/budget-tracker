import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-fg shadow-sm hover:brightness-110 active:brightness-95 disabled:hover:brightness-100',
  secondary:
    'bg-card text-fg border border-border-base hover:bg-card-muted active:bg-bg-subtle',
  ghost: 'text-fg-muted hover:bg-card-muted hover:text-fg',
  soft: 'bg-accent-soft text-accent hover:brightness-97 dark:hover:brightness-125',
  danger: 'bg-expense text-white shadow-sm hover:brightness-110 active:brightness-95',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-5 text-[15px] gap-2 rounded-xl',
  icon: 'size-9 rounded-lg',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  /** Rendered before the label; hidden while `loading`. */
  icon?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
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
        'inline-flex shrink-0 select-none items-center justify-center font-medium',
        'transition-[background-color,color,filter,box-shadow,transform] duration-150',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
}
