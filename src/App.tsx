import { Suspense, lazy } from 'react'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import { RouteFallback } from '@/components/layout/RouteFallback'

/** Routes are code-split so the first load does not pay for Recharts. */
const OverviewPage = lazy(() =>
  import('@/pages/OverviewPage').then((module) => ({ default: module.OverviewPage })),
)
const TransactionsPage = lazy(() =>
  import('@/pages/TransactionsPage').then((module) => ({ default: module.TransactionsPage })),
)
const BudgetsPage = lazy(() =>
  import('@/pages/BudgetsPage').then((module) => ({ default: module.BudgetsPage })),
)
const CategoriesPage = lazy(() =>
  import('@/pages/CategoriesPage').then((module) => ({ default: module.CategoriesPage })),
)
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
)

export function App() {
  return (
    <Router>
      <a
        href="#main-content"
        className="pill sr-only bg-accent px-4 py-2 text-[14px] font-bold text-accent-fg focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70]"
      >
        Skip to content
      </a>

      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  )
}
