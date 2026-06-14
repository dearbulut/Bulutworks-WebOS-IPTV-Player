import { useSettingsStore } from '../stores/useSettingsStore'
import { en, type TranslationKey } from './en'
import { tr } from './tr'

const catalogs: Record<string, Record<TranslationKey, string>> = {
  en: en as Record<TranslationKey, string>,
  tr,
}

export function t(key: TranslationKey): string {
  const locale = useSettingsStore.getState().locale
  const catalog = catalogs[locale] ?? (en as Record<TranslationKey, string>)
  return catalog[key]
}

export type { TranslationKey }
