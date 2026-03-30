/**
 * ProtectedRoute — redirects to /login if user is not authenticated.
 */
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../ui'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <Spinner size={24} />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}
