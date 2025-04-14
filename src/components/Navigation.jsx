import { Link } from 'react-router-dom'

function Navigation() {
  return (
    <nav className="navigation">
      <Link to="/">Home</Link>
      <Link to="/drives">Drives</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  )
}

export default Navigation