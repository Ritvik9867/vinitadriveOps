import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'

function Layout() {
  return (
    <div className="layout">
      <Navigation />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout