import { init } from '@noriginmedia/norigin-spatial-navigation'
import Router from './router/Router'

// Initialize spatial navigation once at module load, before any component renders.
init({ debug: false })

export default function App() {
  return <Router />
}
