import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'
import BottomNav from '../components/BottomNav'

export default function AppLayout() {
  const { user, logout, setUsername } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleSetUsername = async () => {
    setUsernameError('')
    try {
      setSaving(true)
      setUsername(usernameInput)
      setShowUsernamePrompt(false)
      setUsernameInput('')
    } catch (err) {
      setUsernameError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const displayName = user?.username ? `@${user.username}` : user?.name || 'User'

  return (
    <div className="flex flex-col min-h-svh max-w-lg mx-auto bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex justify-between items-center">
        <div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Welcome</p>
          <button
            onClick={() => setShowUsernamePrompt((s) => !s)}
            className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            {displayName}
            {!user?.username && (
              <span className="text-[10px] text-purple-500 font-bold bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded-full ml-1">
                set @
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.166 17.834a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 001.061-1.06l-1.59-1.591zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.166 6.166a.75.75 0 001.06 1.06l1.591-1.59a.75.75 0 10-1.06-1.061l-1.591 1.59z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.006z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-600 font-semibold hover:bg-red-50 dark:hover:bg-red-950 px-3 py-1 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Set username inline panel */}
      {showUsernamePrompt && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex flex-col gap-2">
          {user?.username ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your username is{' '}
              <span className="font-bold text-purple-600">@{user.username}</span>. Use it to log in
              instead of your email.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Set a username</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Use it to log in instead of your email. 3–20 chars, letters/numbers/underscores.
              </p>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">@</span>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) =>
                      setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleSetUsername()}
                    placeholder="your_username"
                    autoFocus
                    maxLength={20}
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-lg pl-7 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <button
                  onClick={handleSetUsername}
                  disabled={saving || usernameInput.length < 3}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg px-3 py-2 transition-colors shrink-0"
                >
                  {saving ? '...' : 'Save'}
                </button>
                <button
                  onClick={() => { setShowUsernamePrompt(false); setUsernameError('') }}
                  className="text-slate-400 hover:text-slate-600 text-lg leading-none px-1"
                >
                  ✕
                </button>
              </div>
              {usernameError && <p className="text-xs text-red-500">{usernameError}</p>}
            </>
          )}
        </div>
      )}

      <main className="flex-1 flex flex-col pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
