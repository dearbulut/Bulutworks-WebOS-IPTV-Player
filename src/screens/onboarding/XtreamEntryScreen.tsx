import { useState, useCallback } from 'react'
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation'
import TextField from '../../components/TextField'
import OnScreenKeyboard from '../../components/OnScreenKeyboard'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { Route, routeUrl } from '../../router/routes'

type Field = 'host' | 'username' | 'password'

const FIELD_ORDER: Field[] = ['host', 'username', 'password']

const FIELD_LABELS: Record<Field, string> = {
  host:     'Server URL',
  username: 'Username',
  password: 'Password',
}

function validateXtream(
  host: string,
  username: string,
  password: string,
): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {}
  if (!/^https?:\/\/[a-zA-Z0-9.-]+(:\d+)?(\/.*)?$/.test(host.trim())) {
    errors.host = 'Must be a valid URL, e.g. http://host.com:8080'
  }
  if (!username.trim()) errors.username = 'Username is required'
  if (!password.trim()) errors.password = 'Password is required'
  return errors
}

export default function XtreamEntryScreen() {
  const [fields, setFields] = useState<Record<Field, string>>({ host: '', username: '', password: '' })
  const [active, setActive] = useState<Field>('host')
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const setSource = useSettingsStore((s) => s.setSource)

  const { ref, focusKey } = useFocusable({ isFocusBoundary: true })

  const handleChange = useCallback((value: string) => {
    setFields((f) => ({ ...f, [active]: value }))
  }, [active])

  const handleSubmit = useCallback(() => {
    const errs = validateXtream(fields.host, fields.username, fields.password)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSource({
      kind:     'xtream',
      host:     fields.host.trim(),
      username: fields.username.trim(),
      password: fields.password.trim(),
    })
    window.location.hash = routeUrl(Route.Home)
  }, [fields, setSource])

  const handleDone = useCallback(() => {
    const idx = FIELD_ORDER.indexOf(active)
    if (idx < FIELD_ORDER.length - 1) {
      setActive(FIELD_ORDER[idx + 1])
    } else {
      handleSubmit()
    }
  }, [active, handleSubmit])

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref as React.RefObject<HTMLDivElement>} className="screen entry-screen">
        <h1 className="screen__title">Xtream Codes</h1>
        <p className="screen__desc">Enter your Xtream Codes provider details. Press ✓ to advance to the next field.</p>
        <div className="field-list">
          {FIELD_ORDER.map((f) => (
            <TextField
              key={f}
              focusKey={`xtream-field-${f}`}
              label={FIELD_LABELS[f]}
              value={fields[f]}
              active={active === f}
              error={errors[f]}
              onChange={(v) => setFields((prev) => ({ ...prev, [f]: v }))}
              onFocused={() => setActive(f)}
            />
          ))}
        </div>
        <OnScreenKeyboard
          value={fields[active]}
          onChange={handleChange}
          onDone={handleDone}
          focusKey="xtream-keyboard"
        />
      </div>
    </FocusContext.Provider>
  )
}
