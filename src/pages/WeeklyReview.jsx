import { useState, useEffect } from 'react'
import { habitsStorage, logsStorage } from '../services/localStorage'

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function toDateStr(date) {
  return date.toISOString().split('T')[0]
}

export default function WeeklyReview() {
  const [habits, setHabits] = useState([])
  const [weekLogs, setWeekLogs] = useState([])
  const [weekStart, setWeekStart] = useState(getMonday(new Date()))

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const startStr = toDateStr(weekStart)
  const endStr = toDateStr(weekEnd)
  const todayStr = toDateStr(new Date())
  const isCurrentWeek = startStr <= todayStr && todayStr <= endStr

  useEffect(() => {
    setHabits(habitsStorage.getAll())
    setWeekLogs(logsStorage.getForDateRange(startStr, endStr))
  }, [startStr, endStr])

  const handlePrevWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
  }

  const handleNextWeek = () => {
    if (isCurrentWeek) return
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
  }

  const formatRange = () =>
    `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  function getHabitStats(habitId) {
    const logs = weekLogs.filter((l) => l.habitId === habitId)
    const completedDates = new Set(logs.filter((l) => l.completed).map((l) => l.date))
    // Count only days up to today for current week
    const daysDone = completedDates.size
    const daysTotal = isCurrentWeek
      ? Math.min(7, Math.ceil((new Date(todayStr) - weekStart) / 86400000) + 1)
      : 7
    const pct = daysTotal > 0 ? Math.round((daysDone / daysTotal) * 100) : 0
    return { completedDates, daysDone, pct }
  }

  const totalHabits = habits.length
  const avgPct =
    totalHabits > 0
      ? Math.round(habits.reduce((sum, h) => sum + getHabitStats(h.id).pct, 0) / totalHabits)
      : 0

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold text-purple-600">Weekly Review</h1>

      {/* Week navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
        <button
          onClick={handlePrevWeek}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">
            {isCurrentWeek ? 'This week' : 'Week of'}
          </p>
          <p className="font-bold text-slate-700">{formatRange()}</p>
        </div>
        <button
          onClick={handleNextWeek}
          disabled={isCurrentWeek}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-default"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Overall stats */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
        <p className="text-sm text-slate-600 mb-2 text-center">Overall Completion</p>
        <div className="text-center mb-3">
          <span className="text-4xl font-bold text-purple-600">{avgPct}%</span>
        </div>
        <div className="w-full bg-purple-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-purple-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${avgPct}%` }}
          />
        </div>
      </div>

      {/* Per-habit breakdown */}
      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-2">📊</div>
          <h2 className="text-lg font-semibold text-slate-700">No habits to review</h2>
          <p className="text-sm text-slate-400 mt-1">Create habits to see your weekly progress</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {habits.map((habit) => {
            const { completedDates, daysDone, pct } = getHabitStats(habit.id)
            return (
              <div key={habit.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-700 truncate">{habit.name}</h3>
                    <p className="text-xs text-slate-400 capitalize">{habit.frequency}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-lg font-bold text-slate-700">{pct}%</p>
                    <p className="text-xs text-slate-400">{daysDone}/7 days</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ backgroundColor: habit.color || '#0d9488', width: `${pct}%` }}
                  />
                </div>

                {/* Daily grid Mon–Sun */}
                <div className="flex gap-1">
                  {[...Array(7)].map((_, i) => {
                    const d = new Date(weekStart)
                    d.setDate(d.getDate() + i)
                    const ds = toDateStr(d)
                    const isFuture = ds > todayStr
                    const done = completedDates.has(ds)
                    return (
                      <div
                        key={i}
                        className="flex-1 aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold"
                        style={{
                          backgroundColor: isFuture
                            ? '#f8fafc'
                            : done
                            ? habit.color || '#0d9488'
                            : '#f1f5f9',
                          color: done && !isFuture ? 'white' : isFuture ? '#cbd5e1' : '#94a3b8',
                          border: isFuture ? '1px dashed #e2e8f0' : 'none',
                        }}
                      >
                        {d.toLocaleDateString('en-US', { weekday: 'short' })[0]}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Weekly Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Consistency beats perfection — aim for 70%+ completion</li>
          <li>• Review your notes to identify patterns</li>
          <li>• Adjust difficulty if habits feel too easy or hard</li>
        </ul>
      </div>
    </div>
  )
}
