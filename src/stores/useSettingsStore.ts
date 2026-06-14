import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type M3USource     = { kind: 'm3u';    url: string }
export type XtreamSource  = { kind: 'xtream'; host: string; username: string; password: string }
export type Source        = M3USource | XtreamSource

interface SettingsState {
  source:    Source | null
  locale:    string
  brand:     string
  setSource: (source: Source | null) => void
  setLocale: (locale: string) => void
  setBrand:  (brand: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      source:    null,
      locale:    'en',
      brand:     'bulutworks',
      setSource: (source) => set({ source }),
      setLocale: (locale) => set({ locale }),
      setBrand:  (brand)  => set({ brand }),
    }),
    { name: 'bulutworks-settings' }
  )
)
