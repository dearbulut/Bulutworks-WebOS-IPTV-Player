import { useEffect } from 'react'
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation'
import { useSettingsStore } from '../stores/useSettingsStore'
import { Route, routeUrl } from '../router/routes'
import Button from '../components/Button'
import BrandLogo from '../components/BrandLogo'

export default function HomePlaceholderScreen() {
  const setSource = useSettingsStore((s) => s.setSource)
  const { ref, focusKey, focusSelf } = useFocusable({
    isFocusBoundary: true,
    preferredChildFocusKey: 'btn-change-source',
  })

  useEffect(() => { focusSelf() }, [focusSelf])

  const handleChangeSource = () => {
    setSource(null)
    window.location.hash = routeUrl(Route.OnboardingSource)
  }

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref as React.RefObject<HTMLDivElement>} className="screen home-placeholder">
        <BrandLogo />
        <div className="home-placeholder__message">
          Connected. Live TV coming in S3.
        </div>
        <Button focusKey="btn-change-source" onPress={handleChangeSource}>
          Change Source
        </Button>
      </div>
    </FocusContext.Provider>
  )
}
