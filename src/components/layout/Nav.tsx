import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/cn'

import { NAV_ITEMS } from './navigation'

/** Persistent rail from `lg` up. */
export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col px-3 py-5 lg:flex">
      <p className="px-3 pb-5 text-[19px] font-extrabold tracking-[-0.03em] text-fg">
        Budget Tracker
      </p>

      <nav aria-label="Sections" className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[15px] font-bold',
                'transition-colors duration-150',
                isActive ? 'bg-surface-2 text-fg' : 'text-fg-muted hover:bg-surface hover:text-fg',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="size-5 shrink-0" strokeWidth={isActive ? 2.4 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <p className="mt-auto px-3 pt-5 text-[12px] leading-relaxed text-fg-faint">
        Held in this browser only. No account, no server.
      </p>
    </aside>
  )
}

/**
 * Below `lg` the same destinations sit under the thumb. One navigation at
 * every width — no band where the app has none, none where it has two.
 */
export function TabBar() {
  return (
    <nav
      aria-label="Sections"
      className="sticky bottom-0 z-30 border-t border-surface-2 bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="flex items-stretch">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-bold',
                  'transition-colors duration-150',
                  isActive ? 'text-accent' : 'text-fg-faint',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="size-[22px]" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="max-w-full truncate px-0.5">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
