import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'

interface ButtonProps {
  children: React.ReactNode
  onPress: () => void
  focusKey?: string
}

export default function Button({ children, onPress, focusKey: fk }: ButtonProps) {
  const { ref, focused } = useFocusable({
    focusKey: fk,
    onEnterPress: onPress,
  })

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`btn${focused ? ' btn--focused' : ''}`}
      onClick={onPress}
      role="button"
      tabIndex={-1}
    >
      {children}
    </div>
  )
}
