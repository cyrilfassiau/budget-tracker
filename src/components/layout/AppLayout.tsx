import type { ReactNode } from 'react'

import { Toaster } from '@/components/ui'
import { TransactionForm } from '@/features/transactions/TransactionForm'
import { useBootstrap } from '@/hooks/useAppData'
import { useTheme } from '@/hooks/useTheme'

import { Sidebar, TabBar } from './Nav'
import { StatementHead } from './StatementHead'

interface AppLayoutProps {
  title: string
  actions?: ReactNode
  showPeriod?: boolean
  children: ReactNode
}

export function AppLayout({ title, actions, showPeriod, children }: AppLayoutProps) {
  useBootstrap()
  useTheme()

  return (
    <div className="flex min-h-dvh bg-paper">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <StatementHead title={title} actions={actions} showPeriod={showPeriod} />

        <main id="main-content" className="flex-1 px-4 py-4 sm:px-6 sm:py-5">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>

        <TabBar />
      </div>

      <TransactionForm />
      <Toaster />
    </div>
  )
}
