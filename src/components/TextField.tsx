interface TextFieldProps {
  label:   string
  value:   string
  active?: boolean
  error?:  string
}

export default function TextField({ label, value, active, error }: TextFieldProps) {
  const cls = [
    'text-field',
    active ? 'text-field--active' : '',
    error  ? 'text-field--error'  : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      <div className="text-field__label">{label}</div>
      <div className="text-field__value">
        {value
          ? <>{value}{active && <span className="text-field__cursor">|</span>}</>
          : <span className="text-field__placeholder">Type on keyboard below…</span>
        }
      </div>
      {error && <div className="text-field__error">{error}</div>}
    </div>
  )
}
