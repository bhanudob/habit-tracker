/**
 * Auth Context - Global authentication state management
 *
 * KEY CONCEPT: React Context API
 * Problem: Without Context, you'd pass auth data through every component (prop drilling)
 * Solution: Context stores auth state globally, accessible via useAuth hook
 *
 * Think of it like: Context = global state, useAuth = easy way to access it
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, getToken } from '../services/api'

// Create context object
const AuthContext = createContext()

/**
 * AuthProvider - Wraps app to provide auth state to all children
 * Parent component that manages all auth logic
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * On app load: check if token exists in localStorage
   * If yes, user was previously logged in (restore session)
   * KEY CONCEPT: Session persistence - user stays logged in after page refresh
   */
  useEffect(() => {
    const token = getToken()
    if (token) {
      // Token exists, assume user is logged in
      // (In production, you'd validate token with backend)
      const savedUser = localStorage.getItem('habit_user')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    }
    setLoading(false)
  }, [])

  // Register new user
  const register = async (email, name, password) => {
    try {
      setError(null)
      setLoading(true)

      const response = await authAPI.register(email, name, password)

      // Save user info
      setUser(response.user)
      localStorage.setItem('habit_user', JSON.stringify(response.user))

      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Login user
  const login = async (email, password) => {
    try {
      setError(null)
      setLoading(true)

      const response = await authAPI.login(email, password)

      // Save user info
      setUser(response.user)
      localStorage.setItem('habit_user', JSON.stringify(response.user))

      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Logout user
  const logout = () => {
    authAPI.logout()
    setUser(null)
    localStorage.removeItem('habit_user')
    setError(null)
  }

  // Check if user is authenticated
  const isAuthenticated = !!user && !!getToken()

  // Provide to all children
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Custom hook to use auth context
 * Usage: const { user, login, logout } = useAuth()
 * Easier than useContext(AuthContext)
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
