import {
  LayoutDashboard,
  ListOrdered,
  PieChart,
  Settings,
  Tags,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Short label used by the mobile tab bar. */
  short: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', short: 'Activity', icon: ListOrdered },
  { to: '/budgets', label: 'Budgets', short: 'Budgets', icon: PieChart },
  { to: '/categories', label: 'Categories', short: 'Tags', icon: Tags },
  { to: '/settings', label: 'Settings', short: 'Settings', icon: Settings },
]
