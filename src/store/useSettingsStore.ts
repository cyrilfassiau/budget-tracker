import { create } from 'zustand'

import { DEFAULT_SETTINGS } from '@/lib/seed'
import * as settingsService from '@/services/settingsService'
import type { Settings } from '@/types'

interface SettingsState extends Settings {
  hydrated: boolean
  load: () => Promise<void>
  update: (patch: Partial<Settings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...DEFAULT_SETTINGS,
  hydrated: false,

  load: async () => {
    const settings = await settingsService.get()
    set({ ...settings, hydrated: true })
  },

  update: async (patch) => {
    const settings = await settingsService.update(patch)
    set(settings)
  },
}))

export function useCurrencyFormat() {
  const currency = useSettingsStore((state) => state.currency)
  const locale = useSettingsStore((state) => state.locale)
  return { currency, locale }
}
