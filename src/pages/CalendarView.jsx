import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { habitsStorage, logsStorage, plansStorage } from '../services/localStorage'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const PLAN_COLORS = ['#0d9488', '#9333ea', '#3b82f6', '#f59e0b', '#ec4899', '#10b981', '#f97316', '#ef4444']

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

export default function CalendarView() {
  const navigate = useNavigate()
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [habits, setHabits] = useState([])
  const [monthLogs, setMonthLogs] = useState([])
  const [selectedHabit, setSelectedHabit] = useState('all')
  const [selectedDay, setSelectedDay] = useState(null) // dateStr for the detail sheet

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const todayStr = today.toISOString().split('T')[0]

  useEffect(() => {
    setHabits(habitsStorage.getAll())
    setMonthLogs(logsStorage.getForMonth(year, month))
  }, [year, month])

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function getDayInfo(day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayLogs = monthLogs.filter((l) => l.date === dateStr)
    const dayPlans = plansStorage.getForDate(dateStr)
    const hasPlans = dayPlans.length > 0

    if (selectedHabit === 'all') {
      const total = habits.length
      if (total === 0) return { dateStr, completed: 0, total: 0, ratio: 0, hasPlans }
      const completed = dayLogs.filter((l) => l.completed).length
      return { dateStr, completed, total, ratio: completed / total, hasPlans }
    } else {
      const log = dayLogs.find((l) => l.habitId === selectedHabit)
      const done = log?.completed ? 1 : 0
      return { dateStr, completed: done, total: 1, ratio: done, hasPlans }
    }
  }

  function getBgClass(ratio, isFuture) {
    if (isFuture || ratio === 0) return 'bg-slate-100'
    if (ratio >= 1) return 'bg-teal-500'
    if (ratio >= 0.5) return 'bg-teal-300'
    return 'bg-teal-100'
  }

  function getTextClass(ratio, isFuture) {
    if (isFuture) return 'text-slate-300'
    if (ratio >= 0.5) return 'text-white'
    return 'text-slate-700'
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const monthlyStats = habits.map((h) => ({
    ...h,
    count: monthLogs.filter((l) => l.habitId === h.id && l.completed).length,
  }))

  // Day detail sheet data
  const dayPlans = selectedDay
    ? [...plansStorage.getForDate(selectedDay)].sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      )
    : []
  const dayLogs = selectedDay ? logsStorage.getForDate(selectedDay) : {}
  const selectedDayLabel = selectedDay
    ? new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold text-teal-600">Calendar</h1>

      {/* Month navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-bold text-slate-700 text-lg">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Routine filter chips */}
      {habits.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setSelectedHabit('all')}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              selectedHabit === 'all' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 shadow-sm'
            }`}
          >
            All routines
          </button>
          {habits.map((h) => (
            <button
              key={h.id}
              onClick={() => setSelectedHabit(h.id)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedHabit === h.id ? 'text-white' : 'bg-white text-slate-600 shadow-sm'
              }`}
              style={selectedHabit === h.id ? { backgroundColor: h.color } : {}}
            >
              {h.name}
            </button>
          ))}
        </div>
      )}

      {/* Calendar grid */}
      <div className="bg-white rounded-xl p-3 shadow-sm">
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />
            const { dateStr, completed, total, ratio, hasPlans } = getDayInfo(day)
            const isFuture = dateStr > todayStr
            const isToday = dateStr === todayStr

            return (
              <button
                key={i}
                onClick={() => setSelectedDay(dateStr)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all relative ${
                  isFuture ? 'bg-slate-50' : getBgClass(ratio, false)
                } ${isToday ? 'ring-2 ring-teal-500 ring-offset-1' : ''} ${
                  selectedDay === dateStr ? 'ring-2 ring-purple-500 ring-offset-1' : ''
                } hover:opacity-80 cursor-pointer active:scale-95`}
              >
                <span className={`text-xs font-bold leading-none ${isFuture ? 'text-slate-400' : getTextClass(ratio, false)}`}>
                  {day}
                </span>
                {!isFuture && habits.length > 0 && completed > 0 && (
                  <span className={`text-[9px] leading-none mt-0.5 ${getTextClass(ratio, false)}`}>
                    {completed}/{total}
                  </span>
                )}
                {hasPlans && (
                  <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-purple-400" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 inline-block" />
          None
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-teal-100 inline-block" />
          Some
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-teal-500 inline-block" />
          All
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
          Has plan
        </span>
      </div>

      {/* Day detail sheet */}
      {selectedDay && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-700">{selectedDayLabel}</h3>
              {selectedDay === todayStr && (
                <span className="text-xs text-teal-600 font-semibold">Today</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/?date=${selectedDay}`)}
                className="text-xs text-teal-600 font-semibold bg-teal-50 px-2 py-1 rounded-lg"
              >
                Open →
              </button>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Plan timeline */}
          {dayPlans.length > 0 ? (
            <div className="px-4 pt-3 pb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Plan</p>
              <div className="flex flex-col gap-2">
                {dayPlans.map((plan, i) => (
                  <div key={plan.id} className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: PLAN_COLORS[i % PLAN_COLORS.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          plan.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                        }`}
                      >
                        {plan.title}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {fmt12(plan.startTime)}
                      {plan.endTime ? ` – ${fmt12(plan.endTime)}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 pt-3 pb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Plan</p>
              <p className="text-xs text-slate-400 italic">No plan for this day</p>
            </div>
          )}

          {/* Routines status */}
          {habits.length > 0 && (
            <div className="px-4 pt-2 pb-4 border-t border-slate-50 mt-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Routines</p>
              <div className="flex flex-col gap-1.5">
                {habits.map((h) => {
                  const done = dayLogs[h.id]?.completed
                  return (
                    <div key={h.id} className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                          done ? 'bg-teal-500' : 'bg-slate-100'
                        }`}
                      >
                        {done && <span className="text-white text-[10px]">✓</span>}
                      </div>
                      <span
                        className={`text-sm truncate ${
                          done ? 'text-slate-400 line-through' : 'text-slate-600'
                        }`}
                      >
                        {h.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monthly summary */}
      {habits.length > 0 ? (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-3">{MONTHS[month]} summary</h3>
          {monthlyStats.map((h) => (
            <div key={h.id} className="flex items-center gap-3 mb-2 last:mb-0">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
              <span className="text-sm text-slate-600 flex-1 truncate">{h.name}</span>
              <span className="text-sm font-bold text-slate-700">{h.count}d</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-2">📅</div>
          <h2 className="text-lg font-semibold text-slate-700">No routines yet</h2>
          <p className="text-sm text-slate-400 mt-1">Add routines to track them on the calendar</p>
          <button
            onClick={() => navigate('/add')}
            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors"
          >
            + Add Routine
          </button>
        </div>
      )}
    </div>
  )
}
