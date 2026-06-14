import { useEffect, useRef } from 'react'
import { useSettingsStore } from '../stores/useSettingsStore'
import { Route, routeUrl } from '../router/routes'
import BrandLogo from '../components/BrandLogo'

const MIN_MS = 1500

export default function SplashScreen() {
  const source   = useSettingsStore((s) => s.source)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const elapsed   = Date.now() - startRef.current
    const remaining = Math.max(0, MIN_MS - elapsed)
    const t = setTimeout(() => {
      window.location.hash = routeUrl(source ? Route.Home : Route.OnboardingSource)
    }, remaining)
    return () => clearTimeout(t)
  }, [source])

  return (
    <div className="splash">
      <BrandLogo size="large" />
      <div className="splash__tagline">Open-source IPTV for LG webOS</div>
    </div>
  )
}
