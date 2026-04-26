import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { habitsStorage, logsStorage, plansStorage } from '../services/localStorage'

function fmt12(time24) {
  if (!time24) return ''
  const [h, m] = time24.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function timeToMinutes(t) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

const PLAN_COLORS = ['#0d9488', '#9333ea', '#3b82f6', '#f59e0b', '#ec4899', '#10b981', '#f97316', '#ef4444']

export default function TodayView() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState({})
  const [streaks, setStreaks] = useState({})
  const [plans, setPlans] = useState([])
  const [selectedDate, setSelectedDate] = useState(() => {
    const dp = searchParams.get('date')
    if (dp) {
      const d = new Date(dp + 'T12:00:00')
      if (!isNaN(d.getTime())) return d
    }
    return new Date()
  })

  const todayStr = new Date().toISOString().split('T')[0]
  const dateStr = selectedDate.toISOString().split('T')[0]
  const isToday = dateStr === todayStr

  useEffect(() => {
    const allHabits = habitsStorage.getAll()
    setHabits(allHabits)
    setLogs(logsStorage.getForDate(dateStr))
    setPlans(plansStorage.getForDate(dateStr))
    const s = {}
    allHabits.forEach((h) => { s[h.id] = logsStorage.getStreak(h.id) })
    setStreaks(s)
  }, [dateStr])

  const handleToggleRoutine = (habitId) => {
    const newCompleted = !logs[habitId]?.completed
    const updated = { ...logs, [habitId]: { ...logs[habitId], completed: newCompleted } }
    setLogs(updated)
    logsStorage.log(habitId, dateStr, newCompleted, updated[habitId].notes)
    setStreaks((prev) => ({ ...prev, [habitId]: logsStorage.getStreak(habitId) }))
  }

  const handleTogglePlan = (planId) => {
    plansStorage.toggleComplete(planId)
    setPlans(plansStorage.getForDate(dateStr))
  }

  const handleDeletePlan = (planId) => {
    plansStorage.deleteItem(planId)
    setPlans(plansStorage.getForDate(dateStr))
  }

  const handleNotes = (habitId, notes) => {
    const updated = { ...logs, [habitId]: { ...logs[habitId], notes } }
    setLogs(updated)
    logsStorage.log(habitId, dateStr, updated[habitId].completed, notes)
  }

  const handleDateChange = (days) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    const newDateStr = newDate.toISOString().split('T')[0]
    setSelectedDate(newDate)
    setSearchParams({ date: newDateStr })
  }

  const completedRoutines = habits.filter((h) => logs[h.id]?.completed).length
  const completedPlans = plans.filter((p) => p.completed).length
  const totalItems = habits.length + plans.length
  const totalCompleted = completedRoutines + completedPlans

  const sortedPlans = [...plans].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

  const displayDate = selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Date selector */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm">
        <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <span className="text-slate-600 dark:text-slate-400">←</span>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-slate-700 dark:text-slate-200">{isToday ? 'Today' : displayDate}</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <span className="text-slate-600 dark:text-slate-400">→</span>
        </button>
      </div>

      {/* Daily progress bar */}
      {totalItems > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Daily Progress</span>
            <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{totalCompleted}/{totalItems}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${totalItems > 0 ? (totalCompleted / totalItems) * 100 : 0}%` }}
            />
          </div>
          {totalCompleted === totalItems && totalItems > 0 && (
            <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-2 text-center">All done! Great work! 🎉</p>
          )}
        </div>
      )}

      {/* Plan items */}
      {sortedPlans.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-1 mb-1">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Today's Plan</h2>
            <button onClick={() => navigate('/plan')} className="text-xs text-teal-600 dark:text-teal-400 font-semibold">Edit →</button>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden">
            {sortedPlans.map((plan, i) => (
              <div
                key={plan.id}
                className={`group flex items-center gap-3 px-4 py-3 ${i < sortedPlans.length - 1 ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}
              >
                <button
                  onClick={() => handleTogglePlan(plan.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    plan.completed ? 'border-teal-500 bg-teal-500' : 'border-slate-300 dark:border-slate-600 hover:border-teal-400'
                  }`}
                >
                  {plan.completed && <span className="text-white text-xs leading-none">✓</span>}
                </button>
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: PLAN_COLORS[i % PLAN_COLORS.length] }} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${plan.completed ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                    {plan.title}
                  </p>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                  {fmt12(plan.startTime)}{plan.endTime ? ` – ${fmt12(plan.endTime)}` : ''}
                </span>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="shrink-0 text-slate-300 dark:text-slate-700 hover:text-red-400 active:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {habits.length === 0 && plans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-2">📝</div>
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Nothing planned yet</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add a routine or describe your day in Plan</p>
          <div className="flex gap-2 mt-4">
            <button onClick={() => navigate('/add')} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors text-sm">
              + Add Routine
            </button>
            <button onClick={() => navigate('/plan')} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors text-sm">
              Plan My Day
            </button>
          </div>
        </div>
      )}

      {/* Routines */}
      {habits.length > 0 && (
        <div className="flex flex-col gap-1">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider px-1 mb-1">Routines</h2>
          <div className="flex flex-col gap-3">
            {habits.map((habit) => (
              <div key={habit.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border-l-4" style={{ borderLeftColor: habit.color || '#0d9488' }}>
                <div className="flex items-start gap-3 mb-3">
                  <button
                    onClick={() => handleToggleRoutine(habit.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      logs[habit.id]?.completed ? 'bg-teal-600 border-teal-600' : 'border-slate-300 dark:border-slate-600 hover:border-teal-400'
                    }`}
                  >
                    {logs[habit.id]?.completed && <span className="text-white text-sm">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`font-semibold truncate ${logs[habit.id]?.completed ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                        {habit.name}
                      </h3>
                      {streaks[habit.id] > 0 && (
                        <span className="shrink-0 text-xs font-bold text-orange-500">🔥 {streaks[habit.id]}</span>
                      )}
                    </div>
                    {habit.description && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{habit.description}</p>}
                    <button onClick={() => navigate(`/add/${habit.id}`)} className="text-[10px] text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors mt-0.5">
                      Edit
                    </button>
                  </div>
                </div>
                <textarea
                  value={logs[habit.id]?.notes || ''}
                  onChange={(e) => handleNotes(habit.id, e.target.value)}
                  placeholder="Add notes..."
                  className="w-full text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:placeholder-slate-600 rounded-lg p-2 outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                  rows={2}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {(habits.length > 0 || plans.length > 0) && (
        <button
          onClick={() => navigate('/add')}
          className="fixed bottom-24 right-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-colors text-lg"
        >
          +
        </button>
      )}
    </div>
  )
}
