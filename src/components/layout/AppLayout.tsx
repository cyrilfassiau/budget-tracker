import type { ReactNode } from 'react'

import { Toaster } from '@/components/ui'
import { TransactionForm } from '@/features/transactions/TransactionForm'
import { useBootstrap } from '@/hooks/useAppData'
import { useTheme } from '@/hooks/useTheme'

import { Sidebar, TabBar } from './Nav'

interface AppLayoutProps {
  title: string
  actions?: ReactNode
  children: ReactNode
}

export function AppLayout({ title, actions, children }: AppLayoutProps) {
  useBootstrap()
  useTheme()

  return (
    <div className="flex min-h-dvh bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6">
            <h1 className="min-w-0 flex-1 truncate text-[24px] font-extrabold tracking-[-0.03em] text-fg">
              {title}
            </h1>
            {actions ? (
              <div className="order-last flex w-full flex-wrap items-center gap-2 sm:order-none sm:w-auto">
                {actions}
              </div>
            ) : null}
          </div>
        </header>
        <main id="main-content" className="flex-1 px-4 pb-6 sm:px-6">
          <div className="mx-auto w-full max-w-3xl lg:max-w-5xl">{children}</div>
        </main>
        <TabBar />
      </div>
      <TransactionForm />
      <Toaster />
    </div>
  )
}
