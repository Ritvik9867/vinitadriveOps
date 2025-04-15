import { Navigate, useLocation } from 'react-router-dom'

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const token = localStorage.getItem('token')

  if (!user || !token) {
    // Not logged in, redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Role not authorized, redirect to home page
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute