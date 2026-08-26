import { Suspense, lazy } from 'react'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import { RouteFallback } from '@/components/layout/RouteFallback'

/** Routes are code-split so the first load does not pay for Recharts. */
const StatementPage = lazy(() =>
  import('@/pages/StatementPage').then((module) => ({ default: module.StatementPage })),
)
const RegisterPage = lazy(() =>
  import('@/pages/RegisterPage').then((module) => ({ default: module.RegisterPage })),
)
const BudgetsPage = lazy(() =>
  import('@/pages/BudgetsPage').then((module) => ({ default: module.BudgetsPage })),
)
const CategoriesPage = lazy(() =>
  import('@/pages/CategoriesPage').then((module) => ({ default: module.CategoriesPage })),
)
const AccountPage = lazy(() =>
  import('@/pages/AccountPage').then((module) => ({ default: module.AccountPage })),
)

export function App() {
  return (
    <Router>
      <a
        href="#main-content"
        className="sr-only bg-ink px-3 py-2 font-narrow text-[12px] font-semibold uppercase tracking-[0.07em] text-sheet focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[70]"
      >
        Skip to content
      </a>

      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<StatementPage />} />
          <Route path="/transactions" element={<RegisterPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/settings" element={<AccountPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  )
}
