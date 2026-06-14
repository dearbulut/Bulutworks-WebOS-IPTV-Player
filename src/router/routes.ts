export enum Route {
  Splash           = 'splash',
  OnboardingSource = 'onboarding-source',
  OnboardingM3U    = 'onboarding-m3u',
  OnboardingXtream = 'onboarding-xtream',
  Home             = 'home',
  Live             = 'live',
}

export function routeUrl(route: Route): string {
  return `#/${route}`
}

export function currentRoute(): Route {
  const hash = window.location.hash.replace(/^#\//, '')
  return (hash as Route) || Route.Splash
}
