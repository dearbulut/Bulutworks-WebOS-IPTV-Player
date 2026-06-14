import { useState, useCallback } from 'react'
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation'
import TextField from '../../components/TextField'
import OnScreenKeyboard from '../../components/OnScreenKeyboard'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { Route, routeUrl } from '../../router/routes'

function validateM3U(url: string): string | null {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'URL must start with http:// or https://'
  }
  if (!url.endsWith('.m3u') && !url.endsWith('.m3u8') && !url.includes('/get.php')) {
    return 'URL must end with .m3u or .m3u8, or contain /get.php'
  }
  return null
}

export default function M3UEntryScreen() {
  const [url,   setUrl]   = useState('')
  const [error, setError] = useState<string | null>(null)
  const setSource = useSettingsStore((s) => s.setSource)

  const { ref, focusKey } = useFocusable({ isFocusBoundary: true })

  const handleDone = useCallback(() => {
    const err = validateM3U(url.trim())
    if (err) { setError(err); return }
    setError(null)
    setSource({ kind: 'm3u', url: url.trim() })
    window.location.hash = routeUrl(Route.Home)
  }, [url, setSource])

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref as React.RefObject<HTMLDivElement>} className="screen entry-screen">
        <h1 className="screen__title">M3U Playlist URL</h1>
        <p className="screen__desc">Enter a direct link to your M3U or M3U8 playlist file.</p>
        <TextField
          label="Playlist URL"
          value={url}
          active
          error={error ?? undefined}
          inputMode="url"
          onChange={setUrl}
          focusKey="m3u-url-field"
        />
        <OnScreenKeyboard
          value={url}
          onChange={setUrl}
          onDone={handleDone}
          focusKey="m3u-keyboard"
        />
      </div>
    </FocusContext.Provider>
  )
}
