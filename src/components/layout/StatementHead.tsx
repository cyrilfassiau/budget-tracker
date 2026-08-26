import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useTransactionModal } from '@/store/useTransactionModal'
import { useUIStore } from '@/store/useUIStore'
import { daysElapsed, daysInMonth, isMonthComplete } from '@/utils/dates'

import { ThemeToggle } from './ThemeToggle'

interface StatementHeadProps {
  title: string
  /** Page-specific controls: the period picker, import/export, and so on. */
  actions?: ReactNode
  /** Pages with no period of their own hide the elapsed rule. */
  showPeriod?: boolean
}

/**
 * The printed head of every page, and the app's one global instrument: the
 * elapsed rule. It states how much of the period has actually happened, so no
 * figure below it can be read as a finished month when it is not one.
 */
export function StatementHead({ title, actions, showPeriod = true }: StatementHeadProps) {
  const openNew = useTransactionModal((state) => state.openNew)
  const month = useUIStore((state) => state.selectedMonth)

  const total = daysInMonth(month)
  const elapsed = daysElapsed(month)
  const complete = isMonthComplete(month)
  const progress = total === 0 ? 0 : elapsed / total

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur-[2px]">
      {/* One instance of `actions`, reordered by CSS. Rendering it twice — once
          for wide screens, once for narrow — puts two live controls in the DOM
          and lets any control with internal state desync from its twin. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 pb-1.5 pt-2.5 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="stamp text-ink-3">Budget Tracker</p>
          <h1 className="font-narrow text-[17px] font-bold uppercase leading-tight tracking-[0.05em] text-ink sm:text-[19px]">
            {title}
          </h1>
        </div>

        {actions ? (
          <div className="order-3 flex w-full items-center gap-2 overflow-x-auto pb-0.5 sm:order-none sm:w-auto sm:overflow-visible sm:pb-0">
            {actions}
          </div>
        ) : null}

        <ThemeToggle className="hidden sm:flex" />

        <Button
          variant="primary"
          className="order-2 sm:order-none"
          icon={<Plus className="size-3.5" />}
          // The visible label is short enough to fit a phone; the accessible
          // name says what pressing it actually does.
          aria-label="Enter transaction"
          onClick={() => openNew()}
        >
          Enter
        </Button>
      </div>

      {showPeriod ? (
        <div className="px-4 pb-2 sm:px-6">
          <div className="flex items-baseline justify-between gap-3">
            <p className="stamp text-ink-3">
              {complete
                ? `Period closed · ${total} days`
                : elapsed === 0
                  ? 'Period not started'
                  : `Day ${elapsed} of ${total}`}
            </p>
            {!complete && elapsed > 0 ? (
              <p className="stamp text-ink-3">{Math.round(progress * 100)}% elapsed</p>
            ) : null}
          </div>

          {/* The elapsed rule. Filled to today, hollow for the days still to come. */}
          <div
            className="mt-1 h-1 border border-rule bg-sheet"
            role="img"
            aria-label={
              complete
                ? 'This period is complete.'
                : `${elapsed} of ${total} days of this period have elapsed.`
            }
          >
            <div
              className={cn('h-full transition-[width] duration-500 ease-out', complete ? 'bg-ink-3' : 'bg-ink')}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      ) : null}
    </header>
  )
}
