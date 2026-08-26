import { Menu, Plus } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui'
import { useUIStore } from '@/store/useUIStore'

import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  title: string
  description?: string
  /** Page-specific controls (month picker, filters trigger…). */
  actions?: ReactNode
  onAddTransaction: () => void
}

export function Header({ title, description, actions, onAddTransaction }: HeaderProps) {
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)

  return (
    <header className="sticky top-0 z-30 border-b border-border-base bg-bg/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
          className="-ml-1 rounded-lg p-2 text-fg-muted transition-colors hover:bg-card-muted hover:text-fg lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold tracking-tight text-fg sm:text-lg">
            {title}
          </h1>
          {description ? (
            <p className="hidden truncate text-[13px] text-fg-muted sm:block">{description}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">{actions}</div>
          <ThemeToggle className="hidden sm:inline-flex" />
          <Button variant="primary" icon={<Plus className="size-4" />} onClick={onAddTransaction}>
            <span className="hidden sm:inline">Add transaction</span>
            <span className="sr-only sm:hidden">Add transaction</span>
          </Button>
        </div>
      </div>

      {/* On narrow screens the page actions wrap onto their own row. */}
      {actions ? (
        <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 sm:px-6 md:hidden">
          {actions}
        </div>
      ) : null}
    </header>
  )
}
