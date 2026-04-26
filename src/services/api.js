/**
 * API Client - Centralized HTTP communication with backend
 *
 * KEY CONCEPT: API Client Pattern
 * Instead of fetch calls scattered everywhere, we centralize them here.
 * Benefits:
 * - Token management in one place (auto-inject Authorization header)
 * - Consistent error handling
 * - Easy to add features (logging, retry logic, etc.)
 * - Single source of truth for API base URL
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Helper to get stored JWT token from localStorage
 * localStorage = browser's persistent key-value storage (survives page refresh)
 */
const getToken = () => localStorage.getItem('habit_token')

/**
 * Helper to save token to localStorage
 */
const setToken = (token) => {
  localStorage.setItem('habit_token', token)
}

/**
 * Helper to remove token (logout)
 */
const removeToken = () => {
  localStorage.removeItem('habit_token')
}

/**
 * Make authenticated API request
 * KEY CONCEPT: Middleware pattern - wraps fetch with auth header
 */
const request = async (endpoint, options = {}) => {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Auto-inject JWT token in Authorization header for protected routes
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'API error')
  }

  return data
}

/**
 * AUTH ENDPOINTS
 */
export const authAPI = {
  // Register new user
  register: async (email, name, password) => {
    const response = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    })

    // Save tokens for future requests
    setToken(response.data.accessToken)
    localStorage.setItem('habit_refresh_token', response.data.refreshToken)

    return response.data
  },

  // Login existing user
  login: async (email, password) => {
    const response = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    // Save tokens
    setToken(response.data.accessToken)
    localStorage.setItem('habit_refresh_token', response.data.refreshToken)

    return response.data
  },

  // Get new access token using refresh token
  // KEY CONCEPT: Token refresh pattern - access token expired? get a new one
  refresh: async () => {
    const refreshToken = localStorage.getItem('habit_refresh_token')
    const response = await request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })

    setToken(response.data.accessToken)
    return response.data
  },

  // Logout (clear tokens)
  logout: () => {
    removeToken()
    localStorage.removeItem('habit_refresh_token')
  },
}

/**
 * HABITS ENDPOINTS
 */
export const habitsAPI = {
  // Get all habits for current user
  getAll: async () => {
    const response = await request('/habits', { method: 'GET' })
    return response.data
  },

  // Create new habit
  create: async (name, frequency, description, color) => {
    const response = await request('/habits', {
      method: 'POST',
      body: JSON.stringify({ name, frequency, description, color }),
    })
    return response.data
  },

  // Update habit
  update: async (id, updates) => {
    const response = await request(`/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
    return response.data
  },

  // Delete habit
  delete: async (id) => {
    const response = await request(`/habits/${id}`, {
      method: 'DELETE',
    })
    return response.data
  },

  // Log habit completion for a specific date
  log: async (id, date, completed, notes) => {
    const response = await request(`/habits/${id}/log`, {
      method: 'POST',
      body: JSON.stringify({ date, completed, notes }),
    })
    return response.data
  },
}

/**
 * NOTES ENDPOINTS
 */
export const notesAPI = {
  // Get all notes
  getAll: async () => {
    const response = await request('/notes', { method: 'GET' })
    return response.data
  },

  // Create note
  create: async (content) => {
    const response = await request('/notes', {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
    return response.data
  },

  // Delete note
  delete: async (id) => {
    const response = await request(`/notes/${id}`, {
      method: 'DELETE',
    })
    return response.data
  },
}

export { getToken, setToken, removeToken }
