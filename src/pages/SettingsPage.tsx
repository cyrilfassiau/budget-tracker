import { useState } from 'react'

import { AppLayout } from '@/components/layout/AppLayout'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { Button, Card, CardHead, ConfirmDialog, Field, Select } from '@/components/ui'
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
    <label className="flex cursor-pointer items-start justify-between gap-4 py-1">
      <span className="min-w-0">
        <span className="block text-[15px] font-bold text-fg">{label}</span>
        <span className="mt-0.5 block text-[13px] leading-relaxed text-fg-muted">{description}</span>
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
        className="relative mt-0.5 h-7 w-12 shrink-0 rounded-full bg-surface-3 transition-colors peer-checked:bg-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--ring)] after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"
      />
    </label>
  )
}

export function SettingsPage() {
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
    downloadFile(
      `budget-tracker-backup-${toDateKey(new Date())}.csv`,
      toCSV(transactions, categories),
    )
    toast.success(`Backed up ${transactions.length} transactions`)
  }

  const handleDataAction = async () => {
    const action = pendingAction
    if (!action) return
    try {
      if (action === 'reset') resetToSeed()
      else clearAll()
      await Promise.all([invalidateTransactions(), invalidateCategories(), invalidateBudgets()])
      setPendingAction(null)
      toast.success(action === 'reset' ? 'Sample data restored' : 'Everything deleted')
    } catch (error) {
      toast.error(toMessage(error, 'Could not update your data.'))
    }
  }

  const update = (patch: Parameters<typeof settings.update>[0]) => {
    void settings.update(patch).catch((error) => {
      toast.error(toMessage(error, 'Could not save that setting.'))
    })
  }

  return (
    <AppLayout title="Settings">
      <div className="flex max-w-2xl animate-in flex-col gap-4">
        <Card className="flex flex-col gap-4">
          <CardHead title="Appearance" />
          <div className="flex items-center justify-between gap-4">
            <span className="text-[15px] font-bold text-fg">Theme</span>
            <ThemeToggle />
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <CardHead title="Money" meta="How amounts are shown" />
          <div className="grid gap-4 sm:grid-cols-2">
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

            <Field label="Language">
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
          <p className="text-[13px] text-fg-faint">
            Display only. Amounts are never converted between currencies.
          </p>
        </Card>

        <Card className="flex flex-col gap-3">
          <CardHead title="Adding transactions" />
          <ToggleRow
            label="Planning mode"
            description="Allow transactions dated in the future, for bills and income you already know about."
            checked={settings.allowFutureDates}
            onChange={(allowFutureDates) => update({ allowFutureDates })}
          />
        </Card>

        <Card className="flex flex-col gap-4">
          <CardHead
            title="Your data"
            meta={`${transactions.length} transactions · ${categories.length} categories · ${budgets.length} budgets`}
          />

          <p className="text-[14px] leading-relaxed text-fg-muted">
            Everything lives in this browser alone. There is no account and no server, so clearing
            your browsing data erases it and nobody can restore it for you.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={exportBackup}>
              Export a backup
            </Button>
            <Button variant="secondary" onClick={() => setPendingAction('reset')}>
              Restore sample data
            </Button>
          </div>

          {/* Kept apart from everything reversible, and styled as what it is. */}
          <div className="rounded-[16px] bg-negative-soft p-4">
            <p className="text-[14px] font-bold text-negative">Delete everything</p>
            <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
              Removes {transactions.length} transactions and {budgets.length} budgets permanently.
              Export a backup first if there is anything here you want to keep.
            </p>
            <Button variant="danger" size="sm" className="mt-3" onClick={() => setPendingAction('clear')}>
              Delete everything
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction === 'reset' ? 'Restore sample data?' : 'Delete everything?'}
        message={
          pendingAction === 'reset' ? (
            <>
              Your {transactions.length} transactions and {budgets.length} budgets will be replaced
              by the sample data. This cannot be undone.
            </>
          ) : (
            <>
              <strong className="font-bold text-fg">{transactions.length} transactions</strong> and{' '}
              <strong className="font-bold text-fg">{budgets.length} budgets</strong> will be
              permanently deleted, and categories reset to the defaults. Nothing can bring them back.
            </>
          )
        }
        confirmLabel={pendingAction === 'reset' ? 'Restore' : 'Delete everything'}
        typeToConfirm={pendingAction === 'clear' ? 'delete' : undefined}
        secondaryAction={
          transactions.length > 0 ? { label: 'Export a backup first', onClick: exportBackup } : undefined
        }
        onConfirm={handleDataAction}
        onCancel={() => setPendingAction(null)}
      />
    </AppLayout>
  )
}
