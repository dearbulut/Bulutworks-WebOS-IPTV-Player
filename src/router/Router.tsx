import { useEffect, useState } from 'react'
import { Route, currentRoute } from './routes'
import SplashScreen from '../screens/SplashScreen'
import SourceSelectScreen from '../screens/onboarding/SourceSelectScreen'
import M3UEntryScreen from '../screens/onboarding/M3UEntryScreen'
import XtreamEntryScreen from '../screens/onboarding/XtreamEntryScreen'
import HomeScreen from '../screens/HomeScreen'
import LiveScreen from '../screens/live/LiveScreen'

export default function Router() {
  const [route, setRoute] = useState<Route>(currentRoute)

  useEffect(() => {
    const onHashChange = () => setRoute(currentRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  switch (route) {
    case Route.Splash:           return <SplashScreen />
    case Route.OnboardingSource: return <SourceSelectScreen />
    case Route.OnboardingM3U:    return <M3UEntryScreen />
    case Route.OnboardingXtream: return <XtreamEntryScreen />
    case Route.Home:             return <HomeScreen />
    case Route.Live:             return <LiveScreen />
    default:                     return <SplashScreen />
  }
}
