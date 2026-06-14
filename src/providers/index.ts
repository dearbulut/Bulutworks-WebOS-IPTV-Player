import { useSettingsStore } from '../stores/useSettingsStore'
import { XtreamProvider } from './xtream'
import { M3UProvider } from './m3u'
import type { Provider } from './types'

let _provider: Provider | null = null
let _sourceKey = ''

/** Returns a cached provider singleton for the current persisted source. */
export function getProvider(): Provider {
  const source = useSettingsStore.getState().source
  if (!source) throw new Error('No source configured')
  const key = JSON.stringify(source)
  if (_provider && key === _sourceKey) return _provider
  _sourceKey = key
  _provider  = source.kind === 'xtream'
    ? new XtreamProvider(source)
    : new M3UProvider(source)
  return _provider
}

export type { Provider, Channel, Category } from './types'
