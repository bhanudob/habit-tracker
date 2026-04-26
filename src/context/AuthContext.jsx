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

  const register = (email, name, password) => {
    setError(null)
    if (!email || !name || !password) throw new Error('All fields required')

    const accounts = getStoredAccounts()
    if (accounts.find((a) => a.email === email)) {
      const err = new Error('An account with this email already exists')
      setError(err.message)
      throw err
    }

    const newUser = { id: Date.now().toString(), email, name }
    accounts.push({ email, name, password, id: newUser.id })
    localStorage.setItem('habit_accounts', JSON.stringify(accounts))
    localStorage.setItem('habit_user', JSON.stringify(newUser))
    localStorage.setItem('habit_token', 'local-' + newUser.id)
    setUser(newUser)
    return newUser
  }

  const login = (email, password) => {
    setError(null)
    const accounts = getStoredAccounts()
    const account = accounts.find((a) => a.email === email && a.password === password)
    if (!account) {
      const err = new Error('Invalid email or password')
      setError(err.message)
      throw err
    }
    const loggedInUser = { id: account.id, email: account.email, name: account.name }
    localStorage.setItem('habit_user', JSON.stringify(loggedInUser))
    localStorage.setItem('habit_token', 'local-' + account.id)
    setUser(loggedInUser)
    return loggedInUser
  }

  const logout = () => {
    localStorage.removeItem('habit_user')
    localStorage.removeItem('habit_token')
    setUser(null)
    setError(null)
  }

  const isAuthenticated = !!user && !!localStorage.getItem('habit_token')

  return (
    <AuthContext.Provider value={{ user, loading, error, isAuthenticated, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
