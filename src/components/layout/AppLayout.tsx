import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

import { Toaster } from '@/components/ui'
import { TransactionForm } from '@/features/transactions/TransactionForm'
import { useBootstrap } from '@/hooks/useAppData'
import { useTheme } from '@/hooks/useTheme'
import { useTransactionModal } from '@/store/useTransactionModal'
import { useUIStore } from '@/store/useUIStore'

import { Header } from './Header'
import { MobileTabBar } from './MobileTabBar'
import { MobileSidebar, Sidebar } from './Sidebar'

interface AppLayoutProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

/**
 * Shell shared by every page: navigation, header, the global transaction
 * dialog and the toast region. Pages supply only their own content.
 */
export function AppLayout({ title, description, actions, children }: AppLayoutProps) {
  const openNew = useTransactionModal((state) => state.openNew)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)
  const { pathname } = useLocation()

  useBootstrap()
  useTheme()

  // Route changes should never leave the mobile drawer open behind the page.
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname, setSidebarOpen])

  return (
    <div className="flex min-h-dvh bg-bg">
      <Sidebar />
      <MobileSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={title}
          description={description}
          actions={actions}
          onAddTransaction={() => openNew()}
        />

        <main id="main-content" className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        <MobileTabBar />
      </div>

      <TransactionForm />
      <Toaster />
    </div>
  )
}
