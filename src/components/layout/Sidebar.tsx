import { Wallet, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/cn'
import { useUIStore } from '@/store/useUIStore'

import { NAV_ITEMS } from './navigation'

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
              'transition-colors duration-150',
              isActive
                ? 'bg-accent-soft text-accent'
                : 'text-fg-muted hover:bg-card-muted hover:text-fg',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                className={cn('size-4.5 shrink-0 transition-transform', !isActive && 'group-hover:scale-110')}
                strokeWidth={isActive ? 2.4 : 2}
              />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-3">
      <span className="flex size-8 items-center justify-center rounded-xl bg-accent text-accent-fg">
        <Wallet className="size-4.5" strokeWidth={2.4} />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-fg">Budget Tracker</span>
    </div>
  )
}

/** Persistent sidebar from `lg` upwards. */
export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border-base bg-card lg:flex lg:flex-col">
      <div className="flex h-16 items-center">
        <Brand />
      </div>
      <div className="flex-1 px-3 py-2">
        <NavList />
      </div>
      <p className="px-6 py-4 text-[11px] leading-relaxed text-fg-subtle">
        Data lives in this browser only.
      </p>
    </aside>
  )
}

/** Slide-over version of the same navigation for small screens. */
export function MobileSidebar() {
  const open = useUIStore((state) => state.sidebarOpen)
  const setOpen = useUIStore((state) => state.setSidebarOpen)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 animate-fade-in bg-[rgb(8_11_18/0.5)]"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div className="relative flex h-full w-64 animate-in flex-col border-r border-border-base bg-card">
        <div className="flex h-16 items-center justify-between pr-3">
          <Brand />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-fg-subtle hover:bg-card-muted hover:text-fg"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 px-3 py-2">
          <NavList onNavigate={() => setOpen(false)} />
        </div>
      </div>
    </div>
  )
}
