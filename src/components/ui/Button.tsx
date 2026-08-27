import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-fg hover:opacity-90 active:opacity-80',
  secondary: 'bg-surface-2 text-fg hover:bg-surface-3',
  ghost: 'text-fg-muted hover:bg-surface-2 hover:text-fg',
  danger: 'bg-negative text-negative-fg hover:opacity-90 active:opacity-80',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[14px] gap-1.5',
  md: 'h-11 px-5 text-[15px] gap-2',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

/** Pill-shaped, flat-filled, chunky enough for a thumb. */
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
        'pill inline-flex shrink-0 select-none items-center justify-center font-bold',
        'transition-[background-color,opacity,transform] duration-150 active:scale-[0.98]',
        'disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : icon}
      {children}
    </button>
  )
}

interface QuickActionProps {
  label: string
  icon: ReactNode
  onClick: () => void
  variant?: 'accent' | 'neutral'
}

/**
 * The circular action under the balance — icon in a filled disc with its label
 * beneath, the way a banking app offers its two or three primary verbs.
 */
export function QuickAction({ label, icon, onClick, variant = 'neutral' }: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-16 shrink-0 flex-col items-center gap-1.5 outline-offset-4"
    >
      <span
        className={cn(
          'flex size-14 items-center justify-center rounded-full transition-transform',
          'group-hover:scale-105 group-active:scale-95',
          variant === 'accent' ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-fg',
        )}
      >
        {icon}
      </span>
      <span className="text-[12px] font-semibold leading-tight text-fg-muted">{label}</span>
    </button>
  )
}
