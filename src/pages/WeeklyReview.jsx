import { useState, useEffect } from 'react'
import { habitsStorage, logsStorage } from '../services/localStorage'

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function toDateStr(date) { return date.toISOString().split('T')[0] }

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

  const handlePrevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d) }
  const handleNextWeek = () => { if (isCurrentWeek) return; const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d) }
  const formatRange = () => `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  function getHabitStats(habitId) {
    const logs = weekLogs.filter((l) => l.habitId === habitId)
    const completedDates = new Set(logs.filter((l) => l.completed).map((l) => l.date))
    const daysDone = completedDates.size
    const daysTotal = isCurrentWeek ? Math.min(7, Math.ceil((new Date(todayStr) - weekStart) / 86400000) + 1) : 7
    const pct = daysTotal > 0 ? Math.round((daysDone / daysTotal) * 100) : 0
    return { completedDates, daysDone, pct }
  }

  const totalHabits = habits.length
  const avgPct = totalHabits > 0 ? Math.round(habits.reduce((sum, h) => sum + getHabitStats(h.id).pct, 0) / totalHabits) : 0

  const navBtn = "p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Weekly Review</h1>

      <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl px-4 py-3 shadow-sm">
        <button onClick={handlePrevWeek} className={navBtn}>
          <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">{isCurrentWeek ? 'This week' : 'Week of'}</p>
          <p className="font-bold text-slate-700 dark:text-slate-200">{formatRange()}</p>
        </div>
        <button onClick={handleNextWeek} disabled={isCurrentWeek} className={navBtn + ' disabled:opacity-30 disabled:cursor-default'}>
          <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-slate-900 rounded-xl p-4">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 text-center">Overall Completion</p>
        <div className="text-center mb-3">
          <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">{avgPct}%</span>
        </div>
        <div className="w-full bg-purple-200 dark:bg-purple-900 rounded-full h-2.5 overflow-hidden">
          <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${avgPct}%` }} />
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-2">📊</div>
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No routines to review</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add routines to see your weekly progress</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {habits.map((habit) => {
            const { completedDates, daysDone, pct } = getHabitStats(habit.id)
            return (
              <div key={habit.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 truncate">{habit.name}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{habit.frequency}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{pct}%</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{daysDone}/7 days</p>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
                  <div className="h-full rounded-full transition-all duration-500" style={{ backgroundColor: habit.color || '#0d9488', width: `${pct}%` }} />
                </div>
                <div className="flex gap-1">
                  {[...Array(7)].map((_, i) => {
                    const d = new Date(weekStart); d.setDate(d.getDate() + i)
                    const ds = toDateStr(d)
                    const isFuture = ds > todayStr
                    const done = completedDates.has(ds)
                    return (
                      <div
                        key={i}
                        className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold ${
                          isFuture
                            ? 'bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600'
                            : done
                            ? 'text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                        style={!isFuture && done ? { backgroundColor: habit.color || '#0d9488' } : {}}
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

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Weekly Tips</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Consistency beats perfection — aim for 70%+ completion</li>
          <li>• Review your notes to identify patterns</li>
          <li>• Adjust difficulty if routines feel too easy or hard</li>
        </ul>
      </div>
    </div>
  )
}
