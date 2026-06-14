import { useEffect, useRef } from 'react'
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'

type InputMode = 'text' | 'url' | 'email' | 'numeric' | 'decimal' | 'tel' | 'search' | 'none'

interface TextFieldProps {
  label:      string
  value:      string
  active?:    boolean
  error?:     string
  inputMode?: InputMode
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
  onChange,
  onFocused,
  focusKey: fk,
}: TextFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const { ref, focused } = useFocusable({
    focusKey: fk,
    onFocus: () => {
      onFocused?.()
      // Sync OS focus so physical keyboard / paste targets this input immediately.
      inputRef.current?.focus()
    },
  })

  // When parent advances the active field (XtreamEntry's DONE key), pull OS focus here
  // so physical keyboard follows without requiring a click.
  useEffect(() => {
    if (active) inputRef.current?.focus()
  }, [active])

  const cls = [
    'text-field',
    active || focused ? 'text-field--active' : '',
    error             ? 'text-field--error'  : '',
  ].filter(Boolean).join(' ')

  return (
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
        onFocus={() => onFocused?.()}
        onKeyDown={(e) => {
          // Stop Enter and Arrow keys from reaching Norigin's document-level listener.
          // Without this, Enter would also fire onEnterPress on whichever OSK key has
          // Norigin focus, and Arrow keys would shift Norigin focus while the user types.
          if (e.key === 'Enter' || e.key.startsWith('Arrow')) {
            e.preventDefault()
            e.nativeEvent.stopImmediatePropagation()
          }
        }}
      />
      {error && <div className="text-field__error">{error}</div>}
    </div>
  )
}
