import {
  Banknote,
  Bus,
  Car,
  CircleDashed,
  Clapperboard,
  Coffee,
  CreditCard,
  Dumbbell,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Laptop,
  PiggyBank,
  Plane,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react'

/**
 * Registry of icons a category may use. Categories store the *key*, never the
 * component, so they stay serialisable.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  cart: ShoppingCart,
  bag: ShoppingBag,
  home: Home,
  bus: Bus,
  car: Car,
  plane: Plane,
  zap: Zap,
  smartphone: Smartphone,
  laptop: Laptop,
  clapperboard: Clapperboard,
  dumbbell: Dumbbell,
  heart: Heart,
  graduationCap: GraduationCap,
  gift: Gift,
  coffee: Coffee,
  receipt: Receipt,
  creditCard: CreditCard,
  banknote: Banknote,
  wallet: Wallet,
  piggyBank: PiggyBank,
  trendingUp: TrendingUp,
  sparkles: Sparkles,
  circle: CircleDashed,
}

export const ICON_KEYS = Object.keys(CATEGORY_ICONS)

export function getCategoryIcon(key: string): LucideIcon {
  return CATEGORY_ICONS[key] ?? CircleDashed
}
