import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'

// ---------------------------------------------------------------------------
// Module-level active-field registry
// window.bw.paste(text) dev-console fallback: targets whichever TextField
// most recently received OS or Norigin focus.
// ---------------------------------------------------------------------------
let _activeSetter: ((v: string) => void) | null = null

;(window as Window & { bw?: { paste: (t: string) => void } }).bw = {
  paste: (t: string) => {
    if (_activeSetter) {
      _activeSetter(t)
    } else {
      console.warn('[bw] No active TextField — focus a field first.')
    }
  },
}

// ---------------------------------------------------------------------------
// PasteButton
// ---------------------------------------------------------------------------
interface PasteButtonProps {
  focusKey: string
  onChange?: (value: string) => void
}

function PasteButton({ focusKey: fk, onChange }: PasteButtonProps) {
  const [tooltip, setTooltip] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) onChange?.(text)
    } catch {
      if (timerRef.current) clearTimeout(timerRef.current)
      setTooltip(true)
      timerRef.current = setTimeout(() => setTooltip(false), 5000)
    }
  }, [onChange])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const { ref, focused } = useFocusable({
    focusKey: fk,
    onEnterPress: () => { void doPaste() },
  })

  return (
    <div className="paste-btn-wrap">
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`paste-btn${focused ? ' paste-btn--focused' : ''}`}
        onClick={() => { void doPaste() }}
        role="button"
        tabIndex={-1}
        aria-label="Paste from clipboard"
        title="Paste from clipboard"
      >
        📋
      </div>
      {tooltip && (
        <div className="paste-btn__tooltip" role="alert">
          Clipboard blocked — try in dev console:{' '}
          <code>bw.paste('your-text')</code>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// TextField
// ---------------------------------------------------------------------------
type InputMode = 'text' | 'url' | 'email' | 'numeric' | 'decimal' | 'tel' | 'search' | 'none'

interface TextFieldProps {
  label:      string
  value:      string
  active?:    boolean
  error?:     string
  inputMode?: InputMode
  /** Show the clipboard Paste button (default true). */
  paste?:     boolean
  onChange?:  (value: string) => void
  /** Called when the field receives Norigin *or* native OS focus. */
  onFocused?: () => void
  focusKey?:  string
}

export default function TextField({
  label,
  value,
  active,
  error,
  inputMode = 'text',
  paste = true,
  onChange,
  onFocused,
  focusKey: fk,
}: TextFieldProps) {
  const inputRef    = useRef<HTMLInputElement>(null)

  // Keep a stable ref so the module-level setter closure never goes stale.
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  // Stable setter identity — used for cleanup check on unmount.
  const stableSetter = useRef((v: string) => onChangeRef.current?.(v))

  const activateField = useCallback(() => {
    _activeSetter = stableSetter.current
  }, [])

  // Deregister only if THIS field's setter is still active (another field may
  // have focused between our last focus and our unmount).
  useEffect(() => {
    return () => {
      if (_activeSetter === stableSetter.current) _activeSetter = null
    }
  }, [])

  const { ref, focused } = useFocusable({
    focusKey: fk,
    onFocus: () => {
      activateField()
      onFocused?.()
      inputRef.current?.focus()
    },
  })

  useEffect(() => {
    if (active) inputRef.current?.focus()
  }, [active])

  const cls = [
    'text-field',
    active || focused ? 'text-field--active' : '',
    error             ? 'text-field--error'  : '',
  ].filter(Boolean).join(' ')

  const pasteKey = `paste-${fk ?? label.toLowerCase().replace(/\W+/g, '-')}`

  return (
    <div className="text-field-row">
      <div ref={ref as React.RefObject<HTMLDivElement>} className={cls}>
        <div className="text-field__label">{label}</div>
        <input
          ref={inputRef}
          className="text-field__input"
          type="text"
          inputMode={inputMode}
          value={value}
          placeholder="Type here or paste…"
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => {
            activateField()
            onFocused?.()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key.startsWith('Arrow')) {
              e.preventDefault()
              e.nativeEvent.stopImmediatePropagation()
            }
          }}
        />
        {error && <div className="text-field__error">{error}</div>}
      </div>
      {paste && <PasteButton focusKey={pasteKey} onChange={onChange} />}
    </div>
  )
}
