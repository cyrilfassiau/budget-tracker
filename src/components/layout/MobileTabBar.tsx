import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/cn'

import { NAV_ITEMS } from './navigation'

/** Thumb-reachable navigation on phones; hidden once the sidebar appears. */
export function MobileTabBar() {
  return (
    <nav
      aria-label="Main"
      className="sticky bottom-0 z-30 border-t border-border-base bg-card/95 backdrop-blur-md sm:hidden"
    >
      <ul className="flex items-stretch">
        {NAV_ITEMS.map(({ to, short, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                  isActive ? 'text-accent' : 'text-fg-subtle',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="size-5" strokeWidth={isActive ? 2.4 : 1.9} />
                  {short}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
