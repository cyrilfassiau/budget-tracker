import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/cn'

import { NAV_ITEMS } from './navigation'

/**
 * The bound left edge of the book, from `lg` up. Section numerals are the
 * book's own index, not decoration: they are how a passbook's tabs are cut.
 */
export function Sidebar() {
  return (
    <aside className="hidden w-52 shrink-0 border-r border-rule bg-sheet lg:flex lg:flex-col">
      <div className="border-b border-rule px-5 py-4">
        <p className="stamp text-ink-3">Account book</p>
        <p className="mt-0.5 font-narrow text-[15px] font-bold uppercase tracking-[0.06em] text-ink">
          Budget Tracker
        </p>
      </div>

      <nav aria-label="Sections" className="flex-1 py-1">
        {NAV_ITEMS.map(({ to, label, index }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-baseline gap-3 border-l-2 px-5 py-2',
                'font-narrow text-[13px] font-semibold uppercase tracking-[0.07em]',
                'transition-colors duration-100',
                isActive
                  ? 'border-carbon bg-carbon-tint text-ink'
                  : 'border-transparent text-ink-3 hover:bg-sheet-alt hover:text-ink',
              )
            }
          >
            <span className="stamp w-4 shrink-0 text-[10px] text-ink-3">{index}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <p className="border-t border-rule px-5 py-3 text-[11px] leading-relaxed text-ink-3">
        Held in this browser only. No account, no server.
      </p>
    </aside>
  )
}

/**
 * Below `lg` the same index runs along the foot of the page. One navigation at
 * every width — there is no band where the app has none, and none where it has
 * two.
 */
export function TabBar() {
  return (
    <nav
      aria-label="Sections"
      className="sticky bottom-0 z-30 border-t border-rule bg-sheet lg:hidden"
    >
      <ul className="flex items-stretch">
        {NAV_ITEMS.map(({ to, label }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex h-12 items-center justify-center border-t-2 px-1',
                  'font-narrow text-[11px] font-semibold uppercase tracking-[0.05em]',
                  'transition-colors duration-100',
                  isActive
                    ? 'border-carbon bg-carbon-tint text-ink'
                    : 'border-transparent text-ink-3',
                )
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
