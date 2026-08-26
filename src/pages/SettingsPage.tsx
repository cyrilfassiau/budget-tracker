import { Coins, Database, Info, Languages, RotateCcw, Timer, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { AppLayout } from '@/components/layout/AppLayout'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { Button, Card, CardHeader, ConfirmDialog, Field, Select } from '@/components/ui'
import { CURRENCIES } from '@/lib/constants'
import { clearAll, resetToSeed } from '@/services/db'
import { useBudgetsStore } from '@/store/useBudgetsStore'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { toMessage, toast } from '@/store/useToastStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'

const LOCALES = [
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'es-ES', label: 'Español' },
]

const LATENCIES = [
  { value: 0, label: 'Off — instant' },
  { value: 320, label: 'Realistic (320ms)' },
  { value: 900, label: 'Slow (900ms)' },
]

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-fg">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-fg-muted">{description}</span>
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
        className="relative mt-0.5 h-6 w-10 shrink-0 rounded-full bg-border-base transition-colors peer-checked:bg-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--ring)] after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
      />
    </label>
  )
}

export function SettingsPage() {
  const settings = useSettingsStore()
  const invalidateTransactions = useTransactionsStore((state) => state.invalidate)
  const invalidateCategories = useCategoriesStore((state) => state.invalidate)
  const invalidateBudgets = useBudgetsStore((state) => state.invalidate)

  const [pendingAction, setPendingAction] = useState<'reset' | 'clear' | null>(null)

  const refreshAll = async () => {
    await Promise.all([invalidateTransactions(), invalidateCategories(), invalidateBudgets()])
  }

  const handleDataAction = async () => {
    const action = pendingAction
    if (!action) return

    try {
      if (action === 'reset') resetToSeed()
      else clearAll()
      await refreshAll()
      setPendingAction(null)
      toast.success(action === 'reset' ? 'Demo data restored' : 'All data cleared')
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
    <AppLayout title="Settings" description="Preferences, formatting and demo data">
      <div className="flex max-w-2xl animate-in flex-col gap-4">
        <Card>
          <CardHeader title="Appearance" description="Your choice is remembered on this device." />
          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="text-[13px] font-medium text-fg">Theme</span>
            <ThemeToggle />
          </div>
        </Card>

        <Card>
          <CardHeader title="Formatting" description="How amounts and dates are displayed." />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
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

          <p className="mt-3 flex items-center gap-1.5 text-xs text-fg-subtle">
            <Coins className="size-3.5" />
            Formatting only — amounts are never converted between currencies.
          </p>
        </Card>

        <Card>
          <CardHeader title="Behaviour" />
          <div className="mt-1 divide-y divide-[var(--border)]">
            <ToggleRow
              label="Planning mode"
              description="Allow transactions dated in the future, for scheduled bills and planned income."
              checked={settings.allowFutureDates}
              onChange={(allowFutureDates) => update({ allowFutureDates })}
            />
          </div>

          <div className="mt-3">
            <Field
              label="Simulated latency"
              hint="This app stores data in your browser. Latency is faked so loading states behave like a real API."
            >
              {({ id }) => (
                <Select
                  id={id}
                  value={String(settings.latencyMs)}
                  onChange={(event) => update({ latencyMs: Number(event.target.value) })}
                >
                  {LATENCIES.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-fg-subtle">
            <Timer className="size-3.5" />
            Set to "Off" for the snappiest experience.
          </p>
        </Card>

        <Card>
          <CardHeader
            title="Data"
            description="Everything lives in this browser's localStorage."
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              icon={<RotateCcw className="size-4" />}
              onClick={() => setPendingAction('reset')}
            >
              Restore demo data
            </Button>
            <Button
              variant="secondary"
              icon={<Trash2 className="size-4" />}
              onClick={() => setPendingAction('clear')}
            >
              Delete everything
            </Button>
          </div>

          <p className="mt-4 flex items-start gap-1.5 text-xs leading-relaxed text-fg-subtle">
            <Database className="mt-px size-3.5 shrink-0" />
            No account, no server, no tracking. Clearing your browser data removes everything.
          </p>
        </Card>

        <Card>
          <CardHeader title="About" />
          <p className="mt-3 flex items-start gap-1.5 text-[13px] leading-relaxed text-fg-muted">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            <span>
              Budget Tracker is a portfolio project built with React, TypeScript, Zustand, Recharts
              and Tailwind CSS. The data layer is split behind an async service API, so swapping
              localStorage for a REST backend touches only <code className="rounded bg-bg-subtle px-1 py-0.5 text-xs">src/services</code>.
            </span>
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-fg-subtle">
            <Languages className="size-3.5" />
            Number and date formatting follow the locale you pick above.
          </p>
        </Card>
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction === 'reset' ? 'Restore demo data?' : 'Delete everything?'}
        message={
          pendingAction === 'reset'
            ? 'Your current transactions, categories and budgets will be replaced by the sample dataset.'
            : 'All transactions and budgets will be permanently deleted, and categories reset to the defaults.'
        }
        confirmLabel={pendingAction === 'reset' ? 'Restore demo data' : 'Delete everything'}
        onConfirm={handleDataAction}
        onCancel={() => setPendingAction(null)}
      />
    </AppLayout>
  )
}
