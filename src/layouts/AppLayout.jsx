import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex flex-col min-h-svh max-w-lg mx-auto bg-slate-50">
      {/* Header with user info and logout */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center">
        <div>
          <h2 className="text-sm text-slate-500">Welcome</h2>
          <p className="font-semibold text-slate-700">{user?.name || 'User'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-700 font-semibold hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 flex flex-col pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
