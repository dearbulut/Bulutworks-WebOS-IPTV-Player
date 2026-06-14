import { useEffect } from 'react'
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation'
import { useSettingsStore } from '../stores/useSettingsStore'
import { Route, routeUrl } from '../router/routes'
import BrandLogo from '../components/BrandLogo'

interface HomeCardProps {
  focusKey: string
  title:    string
  subtitle: string
  disabled?: boolean
  onPress?: () => void
}

function HomeCard({ focusKey: fk, title, subtitle, disabled, onPress }: HomeCardProps) {
  const { ref, focused } = useFocusable({
    focusKey: fk,
    onEnterPress: () => { if (!disabled) onPress?.() },
  })

  const cls = [
    'home-card',
    focused && !disabled ? 'home-card--focused' : '',
    disabled             ? 'home-card--disabled' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cls}
      onClick={() => { if (!disabled) onPress?.() }}
      role="button"
      tabIndex={-1}
      aria-disabled={disabled}
    >
      <div className="home-card__title">{title}</div>
      <div className="home-card__subtitle">{subtitle}</div>
    </div>
  )
}

export default function HomeScreen() {
  const setSource = useSettingsStore((s) => s.setSource)
  const { ref, focusKey, focusSelf } = useFocusable({
    isFocusBoundary: true,
    preferredChildFocusKey: 'home-live',
  })
  useEffect(() => { focusSelf() }, [focusSelf])

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref as React.RefObject<HTMLDivElement>} className="screen home-screen">
        <BrandLogo />
        <div className="home-cards">
          <HomeCard
            focusKey="home-live"
            title="Live TV"
            subtitle="Browse and watch live channels"
            onPress={() => { window.location.hash = routeUrl(Route.Live) }}
          />
          <HomeCard
            focusKey="home-movies"
            title="Movies"
            subtitle="Coming in S3"
            disabled
          />
          <HomeCard
            focusKey="home-series"
            title="Series"
            subtitle="Coming in S3"
            disabled
          />
          <HomeCard
            focusKey="home-source"
            title="Change Source"
            subtitle="Switch M3U or Xtream provider"
            onPress={() => {
              setSource(null)
              window.location.hash = routeUrl(Route.OnboardingSource)
            }}
          />
        </div>
      </div>
    </FocusContext.Provider>
  )
}
