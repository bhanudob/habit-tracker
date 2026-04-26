import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { habitsStorage, logsStorage } from '../services/localStorage'

export default function TodayView() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState({})
  const [streaks, setStreaks] = useState({})
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
    const s = {}
    allHabits.forEach((h) => {
      s[h.id] = logsStorage.getStreak(h.id)
    })
    setStreaks(s)
  }, [dateStr])

  const handleToggle = (habitId) => {
    const newCompleted = !logs[habitId]?.completed
    const updated = {
      ...logs,
      [habitId]: { ...logs[habitId], completed: newCompleted },
    }
    setLogs(updated)
    logsStorage.log(habitId, dateStr, newCompleted, updated[habitId].notes)
    setStreaks((prev) => ({ ...prev, [habitId]: logsStorage.getStreak(habitId) }))
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
    if (newDateStr > todayStr) return
    setSelectedDate(newDate)
    setSearchParams({ date: newDateStr })
  }

  const completedCount = habits.filter((h) => logs[h.id]?.completed).length
  const displayDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Date selector */}
      <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
        <button
          onClick={() => handleDateChange(-1)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-slate-700">{isToday ? 'Today' : displayDate}</h1>
          <p className="text-xs text-slate-400">
            {selectedDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={() => handleDateChange(1)}
          disabled={isToday}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-default"
        >
          →
        </button>
      </div>

      {/* Daily progress bar */}
      {habits.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600">Daily Progress</span>
            <span className="text-sm font-bold text-teal-600">
              {completedCount}/{habits.length}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / habits.length) * 100}%` }}
            />
          </div>
          {completedCount === habits.length && habits.length > 0 && (
            <p className="text-xs text-teal-600 font-semibold mt-2 text-center">
              All done! Great work! 🎉
            </p>
          )}
        </div>
      )}

      {/* Habits list */}
      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-2">📝</div>
          <h2 className="text-lg font-semibold text-slate-700">No habits yet</h2>
          <p className="text-sm text-slate-400 mt-1">Create your first habit to get started</p>
          <button
            onClick={() => navigate('/add')}
            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors"
          >
            + Create Habit
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="bg-white rounded-xl p-4 shadow-sm border-l-4"
              style={{ borderLeftColor: habit.color || '#0d9488' }}
            >
              {/* Habit header */}
              <div className="flex items-start gap-3 mb-3">
                <button
                  onClick={() => handleToggle(habit.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    logs[habit.id]?.completed
                      ? 'bg-teal-600 border-teal-600'
                      : 'border-slate-300 hover:border-teal-400'
                  }`}
                >
                  {logs[habit.id]?.completed && (
                    <span className="text-white text-sm">✓</span>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`font-semibold truncate ${
                        logs[habit.id]?.completed
                          ? 'text-slate-400 line-through'
                          : 'text-slate-700'
                      }`}
                    >
                      {habit.name}
                    </h3>
                    {streaks[habit.id] > 0 && (
                      <span className="shrink-0 text-xs font-bold text-orange-500">
                        🔥 {streaks[habit.id]}
                      </span>
                    )}
                  </div>
                  {habit.description && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{habit.description}</p>
                  )}
                  <button
                    onClick={() => navigate(`/add/${habit.id}`)}
                    className="text-[10px] text-slate-300 hover:text-slate-500 transition-colors mt-0.5"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Notes field */}
              <textarea
                value={logs[habit.id]?.notes || ''}
                onChange={(e) => handleNotes(habit.id, e.target.value)}
                placeholder="Add notes..."
                className="w-full text-xs border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                rows={2}
              />
            </div>
          ))}
        </div>
      )}

      {/* Floating add button */}
      {habits.length > 0 && (
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
