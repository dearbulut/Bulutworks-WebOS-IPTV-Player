import { useEffect } from 'react'
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation'
import { Route, routeUrl } from '../../router/routes'
import BrandLogo from '../../components/BrandLogo'

interface SourceCardProps {
  focusKey: string
  title:    string
  subtitle: string
  route:    Route
}

function SourceCard({ focusKey: fk, title, subtitle, route }: SourceCardProps) {
  const { ref, focused } = useFocusable({
    focusKey: fk,
    onEnterPress: () => { window.location.hash = routeUrl(route) },
  })

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`source-card${focused ? ' source-card--focused' : ''}`}
      onClick={() => { window.location.hash = routeUrl(route) }}
      role="button"
      tabIndex={-1}
    >
      <div className="source-card__title">{title}</div>
      <div className="source-card__subtitle">{subtitle}</div>
    </div>
  )
}

export default function SourceSelectScreen() {
  const { ref, focusKey, focusSelf } = useFocusable({
    isFocusBoundary: true,
    preferredChildFocusKey: 'source-m3u',
  })

  useEffect(() => { focusSelf() }, [focusSelf])

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref as React.RefObject<HTMLDivElement>} className="screen source-select">
        <BrandLogo />
        <h1 className="screen__title">Choose Source Type</h1>
        <div className="source-cards">
          <SourceCard
            focusKey="source-m3u"
            title="M3U Playlist URL"
            subtitle="Enter a direct .m3u or .m3u8 link"
            route={Route.OnboardingM3U}
          />
          <SourceCard
            focusKey="source-xtream"
            title="Xtream Codes"
            subtitle="Enter host, username & password"
            route={Route.OnboardingXtream}
          />
        </div>
      </div>
    </FocusContext.Provider>
  )
}
