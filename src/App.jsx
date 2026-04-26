import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import TodayView from './pages/TodayView'
import AddEditBlock from './pages/AddEditBlock'
import NotesRevisions from './pages/NotesRevisions'
import WeeklyReview from './pages/WeeklyReview'
import CalendarView from './pages/CalendarView'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth routes - accessible to everyone */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected app routes - require authentication */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<TodayView />} />
            <Route path="/add" element={<AddEditBlock />} />
            <Route path="/add/:id" element={<AddEditBlock />} />
            <Route path="/notes" element={<NotesRevisions />} />
            <Route path="/weekly" element={<WeeklyReview />} />
            <Route path="/calendar" element={<CalendarView />} />
          </Route>

          {/* Fallback - redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
