import { useEffect } from 'react'
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation'

interface OnScreenKeyboardProps {
  value:     string
  onChange:  (value: string) => void
  onDone?:   () => void
  focusKey?: string
}

const ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ['.com', '://', '.', '-', '_', 'SPACE', 'DEL', 'DONE'],
]

function keyLabel(k: string): string {
  if (k === 'SPACE') return 'SPC'
  if (k === 'DEL')   return '⌫'
  if (k === 'DONE')  return '✓'
  return k
}

interface KeyProps {
  value:   string
  onPress: (value: string) => void
}

function Key({ value, onPress }: KeyProps) {
  const { ref, focused } = useFocusable({
    onEnterPress: () => onPress(value),
  })

  const cls = [
    'osk-key',
    focused        ? 'osk-key--focused' : '',
    value.length > 1 && value !== 'DEL' && value !== 'DONE' ? 'osk-key--wide' : '',
    value === 'DONE' ? 'osk-key--done' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cls}
      onClick={() => onPress(value)}
      role="button"
      tabIndex={-1}
    >
      {keyLabel(value)}
    </div>
  )
}

export default function OnScreenKeyboard({ value, onChange, onDone, focusKey: fk }: OnScreenKeyboardProps) {
  const { ref, focusKey, focusSelf } = useFocusable({
    focusKey: fk,
    isFocusBoundary: true,
    preferredChildFocusKey: 'osk-key-q',
  })

  useEffect(() => { focusSelf() }, [focusSelf])

  const handlePress = (key: string) => {
    if (key === 'DEL')   { onChange(value.slice(0, -1)); return }
    if (key === 'SPACE') { onChange(value + ' ');         return }
    if (key === 'DONE')  { onDone?.();                    return }
    onChange(value + key)
  }

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref as React.RefObject<HTMLDivElement>} className="osk">
        {ROWS.map((row, ri) => (
          <div key={ri} className="osk-row">
            {row.map((k) => (
              <Key
                key={k}
                value={k}
                onPress={handlePress}
              />
            ))}
          </div>
        ))}
      </div>
    </FocusContext.Provider>
  )
}
