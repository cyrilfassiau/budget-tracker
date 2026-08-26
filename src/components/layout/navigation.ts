export interface NavItem {
  to: string
  /** One label, used by every navigation surface. */
  label: string
  index: string
}

/**
 * The book's index. Labels are identical in the sidebar and the tab bar —
 * two names for one destination is a bug, not a responsive adaptation.
 */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Statement', index: 'I' },
  { to: '/transactions', label: 'Register', index: 'II' },
  { to: '/budgets', label: 'Budgets', index: 'III' },
  { to: '/categories', label: 'Categories', index: 'IV' },
  { to: '/settings', label: 'Account', index: 'V' },
]
