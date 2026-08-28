import {
  ArrowLeftRight,
  House,
  PieChart,
  Settings,
  Tag,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string

  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: House },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budgets', icon: PieChart },
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/settings', label: 'Settings', icon: Settings },
]
