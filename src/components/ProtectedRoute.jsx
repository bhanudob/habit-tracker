/**
 * ProtectedRoute - Guards routes that require authentication
 *
 * KEY CONCEPT: Route guards / Authorization
 * Problem: Anyone can access any URL (e.g., /add even if not logged in)
 * Solution: ProtectedRoute checks authentication before rendering page
 *
 * Flow: User tries to access /add
 * → ProtectedRoute checks: isAuthenticated?
 * → No? Redirect to /login
 * → Yes? Show the page
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  // Still checking auth status, show loading or nothing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Authenticated, show the page
  return children
}
