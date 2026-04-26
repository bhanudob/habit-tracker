import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

function getStoredUser() {
  try {
    const u = localStorage.getItem('habit_user')
    return u ? JSON.parse(u) : null
  } catch {
    return null
  }
}

function getStoredAccounts() {
  try {
    const a = localStorage.getItem('habit_accounts')
    return a ? JSON.parse(a) : []
  } catch {
    return []
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const savedUser = getStoredUser()
    if (savedUser) setUser(savedUser)
    setLoading(false)
  }, [])

  const register = (email, name, password, username = '') => {
    setError(null)
    if (!email || !name || !password) throw new Error('All fields required')

    const accounts = getStoredAccounts()
    if (accounts.find((a) => a.email === email)) {
      const err = new Error('An account with this email already exists')
      setError(err.message)
      throw err
    }

    const trimmedUsername = username.trim().toLowerCase()
    if (trimmedUsername && accounts.find((a) => a.username === trimmedUsername)) {
      const err = new Error('That username is already taken')
      setError(err.message)
      throw err
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      username: trimmedUsername || null,
    }
    accounts.push({ email, name, password, id: newUser.id, username: trimmedUsername || null })
    localStorage.setItem('habit_accounts', JSON.stringify(accounts))
    localStorage.setItem('habit_user', JSON.stringify(newUser))
    localStorage.setItem('habit_token', 'local-' + newUser.id)
    setUser(newUser)
    return newUser
  }

  // identifier can be email or username
  const login = (identifier, password) => {
    setError(null)
    const accounts = getStoredAccounts()
    const isEmail = identifier.includes('@')
    const account = isEmail
      ? accounts.find((a) => a.email === identifier && a.password === password)
      : accounts.find((a) => a.username === identifier.toLowerCase() && a.password === password)

    if (!account) {
      const err = new Error(
        isEmail ? 'Invalid email or password' : 'Invalid username or password'
      )
      setError(err.message)
      throw err
    }

    const loggedInUser = {
      id: account.id,
      email: account.email,
      name: account.name,
      username: account.username || null,
    }
    localStorage.setItem('habit_user', JSON.stringify(loggedInUser))
    localStorage.setItem('habit_token', 'local-' + account.id)
    setUser(loggedInUser)
    return loggedInUser
  }

  const setUsername = (username) => {
    setError(null)
    const trimmed = username.trim().toLowerCase()
    if (!trimmed) throw new Error('Username cannot be empty')
    if (!/^[a-z0-9_]{3,20}$/.test(trimmed))
      throw new Error('3–20 characters, letters/numbers/underscores only')

    const accounts = getStoredAccounts()
    if (accounts.find((a) => a.username === trimmed && a.id !== user.id)) {
      const err = new Error('That username is already taken')
      setError(err.message)
      throw err
    }

    const updatedAccounts = accounts.map((a) =>
      a.id === user.id ? { ...a, username: trimmed } : a
    )
    localStorage.setItem('habit_accounts', JSON.stringify(updatedAccounts))

    const updatedUser = { ...user, username: trimmed }
    localStorage.setItem('habit_user', JSON.stringify(updatedUser))
    setUser(updatedUser)
    return updatedUser
  }

  const logout = () => {
    localStorage.removeItem('habit_user')
    localStorage.removeItem('habit_token')
    setUser(null)
    setError(null)
  }

  const isAuthenticated = !!user && !!localStorage.getItem('habit_token')

  return (
    <AuthContext.Provider
      value={{ user, loading, error, isAuthenticated, register, login, logout, setUsername }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
