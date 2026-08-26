import { useState } from 'react'

import { AppLayout } from '@/components/layout/AppLayout'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { Button, ConfirmDialog, Field, Select, Sheet, SheetHead } from '@/components/ui'
import { CURRENCIES } from '@/lib/constants'
import { clearAll, resetToSeed } from '@/services/db'
import { useBudgetsStore } from '@/store/useBudgetsStore'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { toMessage, toast } from '@/store/useToastStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { downloadFile, toCSV } from '@/utils/csv'
import { toDateKey } from '@/utils/dates'

const LOCALES = [
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'es-ES', label: 'Español' },
]

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 border-t border-rule px-4 py-3 sm:px-5">
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-ink">{label}</span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-2">{description}</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative mt-0.5 h-5 w-9 shrink-0 border border-rule-strong bg-sheet-alt transition-colors peer-checked:border-carbon peer-checked:bg-carbon peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--carbon)] after:absolute after:left-0.5 after:top-0.5 after:size-3.5 after:bg-ink after:transition-transform peer-checked:after:translate-x-4 peer-checked:after:bg-sheet"
      />
    </label>
  )
}

export function AccountPage() {
  const settings = useSettingsStore()
  const transactions = useTransactionsStore((state) => state.items)
  const categories = useCategoriesStore((state) => state.items)
  const budgets = useBudgetsStore((state) => state.items)
  const invalidateTransactions = useTransactionsStore((state) => state.invalidate)
  const invalidateCategories = useCategoriesStore((state) => state.invalidate)
  const invalidateBudgets = useBudgetsStore((state) => state.invalidate)

  const [pendingAction, setPendingAction] = useState<'reset' | 'clear' | null>(null)

  const exportBackup = () => {
    if (transactions.length === 0) {
      toast.info('Nothing to export yet')
      return
    }
    downloadFile(`budget-tracker-backup-${toDateKey(new Date())}.csv`, toCSV(transactions, categories))
    toast.success(`Backed up ${transactions.length} entries`)
  }

  const handleDataAction = async () => {
    const action = pendingAction
    if (!action) return
    try {
      if (action === 'reset') resetToSeed()
      else clearAll()
      await Promise.all([invalidateTransactions(), invalidateCategories(), invalidateBudgets()])
      setPendingAction(null)
      toast.success(action === 'reset' ? 'Sample book restored' : 'Everything deleted')
    } catch (error) {
      toast.error(toMessage(error, 'Could not update the book.'))
    }
  }

  const update = (patch: Parameters<typeof settings.update>[0]) => {
    void settings.update(patch).catch((error) => {
      toast.error(toMessage(error, 'Could not save that setting.'))
    })
  }

  return (
    <AppLayout title="Account" showPeriod={false}>
      <div className="flex max-w-2xl animate-in flex-col gap-4">
        <Sheet>
          <SheetHead title="Presentation" />
          <div className="flex items-center justify-between gap-4 border-t border-rule px-4 py-3 sm:px-5">
            <span className="text-[13px] font-semibold text-ink">Sheet side</span>
            <ThemeToggle />
          </div>

          <div className="grid gap-3 border-t border-rule px-4 py-3 sm:grid-cols-2 sm:px-5">
            <Field label="Currency">
              {({ id }) => (
                <Select
                  id={id}
                  value={settings.currency}
                  onChange={(event) => update({ currency: event.target.value })}
                >
                  {CURRENCIES.map((entry) => (
                    <option key={entry.code} value={entry.code}>
                      {entry.symbol} · {entry.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field label="Locale">
              {({ id }) => (
                <Select
                  id={id}
                  value={settings.locale}
                  onChange={(event) => update({ locale: event.target.value })}
                >
                  {LOCALES.map((entry) => (
                    <option key={entry.code} value={entry.code}>
                      {entry.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          <p className="border-t border-rule px-4 py-2 text-[11px] text-ink-3 sm:px-5">
            Presentation only. Amounts are never converted between currencies.
          </p>
        </Sheet>

        <Sheet>
          <SheetHead title="Entry" />
          <ToggleRow
            label="Planning"
            description="Allow entries dated in the future, for bills and income you already know about."
            checked={settings.allowFutureDates}
            onChange={(allowFutureDates) => update({ allowFutureDates })}
          />
        </Sheet>

        <Sheet>
          <SheetHead
            title="The book"
            meta={`${transactions.length} entries · ${categories.length} categories · ${budgets.length} limits`}
          />

          <div className="border-t border-rule px-4 py-3 sm:px-5">
            <p className="text-[13px] leading-relaxed text-ink-2">
              This book is held in this browser alone. There is no account and no server, so
              clearing your browsing data erases it and nobody can restore it for you.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={exportBackup}>
                Export a backup
              </Button>
              <Button variant="secondary" onClick={() => setPendingAction('reset')}>
                Restore the sample book
              </Button>
            </div>
          </div>

          {/* Kept apart from everything reversible, and styled as what it is. */}
          <div className="border-t-2 border-red px-4 py-3 sm:px-5">
            <p className="col-head text-red">Irreversible</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
              Deleting everything removes {transactions.length} entries and {budgets.length} limits
              permanently. Export a backup first if there is anything here you want to keep.
            </p>
            <Button
              variant="danger"
              className="mt-2.5"
              onClick={() => setPendingAction('clear')}
            >
              Delete everything
            </Button>
          </div>
        </Sheet>
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction === 'reset' ? 'Restore the sample book?' : 'Delete everything?'}
        message={
          pendingAction === 'reset' ? (
            <>
              Your {transactions.length} entries and {budgets.length} limits will be replaced by the
              sample book. This cannot be undone.
            </>
          ) : (
            <>
              <strong className="font-semibold text-ink">{transactions.length} entries</strong> and{' '}
              <strong className="font-semibold text-ink">{budgets.length} limits</strong> will be
              permanently deleted, and categories reset to the defaults. Nothing can bring them
              back.
            </>
          )
        }
        confirmLabel={pendingAction === 'reset' ? 'Restore' : 'Delete everything'}
        typeToConfirm={pendingAction === 'clear' ? 'delete' : undefined}
        secondaryAction={
          transactions.length > 0 ? { label: 'Export a backup', onClick: exportBackup } : undefined
        }
        onConfirm={handleDataAction}
        onCancel={() => setPendingAction(null)}
      />
    </AppLayout>
  )
}
