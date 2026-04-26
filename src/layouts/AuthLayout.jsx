import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="flex flex-col min-h-svh max-w-lg mx-auto bg-gradient-to-br from-teal-50 to-purple-50">
      <div className="flex flex-col items-center pt-16 pb-4 px-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center shadow-md mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8">
            <path fillRule="evenodd" d="M2.25 4.125c0-1.036.84-1.875 1.875-1.875h5.25c1.036 0 1.875.84 1.875 1.875V17.25a4.5 4.5 0 11-9 0V4.125zm4.5 14.25a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" clipRule="evenodd" />
            <path d="M10.719 21.75h9.156c1.036 0 1.875-.84 1.875-1.875v-5.25c0-1.036-.84-1.875-1.875-1.875h-.14l-8.742 8.743c-.09.089-.18.175-.274.257zM12.738 17.625l6.474-6.474a1.875 1.875 0 000-2.651L15.5 4.787a1.875 1.875 0 00-2.651 0l-.1.099V17.25c0 .126-.003.251-.01.375z" />
          </svg>
        </div>
        <h1 className="text-xl font-extrabold text-slate-700">Habit Tracker</h1>
        <p className="text-slate-400 text-sm">Build better habits, one day at a time.</p>
      </div>
      <Outlet />
    </div>
  )
}
