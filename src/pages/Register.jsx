import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) { setError('Name, email and password are required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (username && !/^[a-z0-9_]{3,20}$/.test(username.toLowerCase())) {
      setError('Username: 3–20 chars, letters/numbers/underscores only'); return
    }
    try {
      setLoading(true)
      await register(email, name, password, username)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-slate-100 dark:disabled:bg-slate-900"

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-6">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-8 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-200 text-center">Create account</h1>
        <p className="text-slate-400 dark:text-slate-500 text-sm text-center">Start planning your day</p>

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} className={inputCls} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className={inputCls} />
          <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className={inputCls} />
          <div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">@</span>
              <input
                type="text"
                placeholder="username (optional)"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                disabled={loading}
                autoCapitalize="none"
                autoCorrect="off"
                maxLength={20}
                className={inputCls.replace('px-4', 'pl-8 pr-4')}
              />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 px-1">
              Set now or later — use this to log in without your email
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-xl py-3 transition-colors mt-1"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 dark:text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
