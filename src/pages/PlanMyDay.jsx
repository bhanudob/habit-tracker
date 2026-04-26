import { useState, useEffect } from 'react'
import { parsePlan, hasApiKey, saveApiKey, clearApiKey } from '../services/planParser'
import { plansStorage } from '../services/localStorage'

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

const COLOR_CLASSES = [
  'bg-teal-500',
  'bg-purple-500',
  'bg-blue-500',
  'bg-orange-400',
  'bg-pink-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-400',
]

export default function PlanMyDay() {
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [text, setText] = useState('')
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [keySet, setKeySet] = useState(hasApiKey())

  useEffect(() => {
    setPlans(plansStorage.getForDate(selectedDate))
  }, [selectedDate])

  const handleParse = async () => {
    if (!text.trim()) return
    if (!hasApiKey()) {
      setShowSettings(true)
      return
    }
    setLoading(true)
    setError('')
    try {
      const items = await parsePlan(text, selectedDate)
      if (!items.length) {
        setError('No schedule items found. Try describing your plan with specific times.')
        return
      }
      const saved = plansStorage.saveForDate(selectedDate, items)
      setPlans(plansStorage.getForDate(selectedDate))
      setText('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveKey = () => {
    if (!apiKeyInput.trim()) return
    saveApiKey(apiKeyInput)
    setKeySet(true)
    setApiKeyInput('')
    setShowSettings(false)
  }

  const handleClearKey = () => {
    clearApiKey()
    setKeySet(false)
  }

  const handleDelete = (id) => {
    plansStorage.deleteItem(id)
    setPlans(plansStorage.getForDate(selectedDate))
  }

  const handleClearDay = () => {
    plansStorage.clearForDate(selectedDate)
    setPlans([])
  }

  const sorted = [...plans].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

  const displayDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex flex-col gap-4 p-4 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-700">Plan My Day</h1>
          <p className="text-xs text-slate-400">{displayDate}</p>
        </div>
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          title="API Key Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-slate-400">
            <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Anthropic API Key</h2>
          <p className="text-xs text-slate-400 mb-3">
            Your key is stored only in this browser.{' '}
            <a
              href="https://console.anthropic.com/keys"
              target="_blank"
              rel="noreferrer"
              className="text-teal-600 underline"
            >
              Get a key →
            </a>
          </p>
          {keySet ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600 font-semibold flex-1">Key saved ✓</span>
              <button
                onClick={handleClearKey}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
                placeholder="sk-ant-..."
                className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400"
              />
              <button
                onClick={handleSaveKey}
                className="bg-teal-600 text-white text-xs font-semibold rounded-lg px-3 py-2 hover:bg-teal-700 transition-colors"
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}

      {/* Date picker */}
      <div className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
          <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
        </svg>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="text-sm text-slate-700 font-medium outline-none flex-1 bg-transparent"
        />
      </div>

      {/* Text input */}
      <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-3">
        <label className="text-sm font-semibold text-slate-700">Describe your day</label>
        <p className="text-xs text-slate-400 -mt-2">
          Speak naturally — "5PM to 7PM coding, then dinner by 8:30, 9 to 11 Spring Boot…"
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your plan here..."
          rows={5}
          className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-400 resize-none text-slate-700 placeholder-slate-300"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          onClick={handleParse}
          disabled={loading || !text.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Parsing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 .75a8.25 8.25 0 00-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 00.577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 01-.937-.171.75.75 0 11.374-1.453 5.261 5.261 0 002.626 0 .75.75 0 11.374 1.452 6.712 6.712 0 01-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 00.577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0012 .75z" />
              </svg>
              Parse with AI
            </>
          )}
        </button>
      </div>

      {/* Timeline */}
      {sorted.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">
              Schedule — {sorted.length} item{sorted.length !== 1 ? 's' : ''}
            </h2>
            <button
              onClick={handleClearDay}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {sorted.map((item, i) => (
              <div key={item.id} className="flex items-start gap-3 group">
                {/* Time column */}
                <div className="flex flex-col items-end shrink-0 w-16 pt-1">
                  <span className="text-xs font-bold text-slate-600">{fmt12(item.startTime)}</span>
                  {item.endTime && (
                    <span className="text-[10px] text-slate-400">{fmt12(item.endTime)}</span>
                  )}
                </div>

                {/* Connector line + dot */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${COLOR_CLASSES[i % COLOR_CLASSES.length]}`} />
                  {i < sorted.length - 1 && (
                    <div className="w-px flex-1 bg-slate-100 my-1 min-h-[20px]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-700 leading-tight">{item.title}</p>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all shrink-0 mt-0.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {item.date !== selectedDate && (
                    <span className="text-[10px] text-purple-500 font-semibold">
                      {new Date(item.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sorted.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
          <div className="text-3xl mb-2">🗓️</div>
          <p className="text-sm font-medium">No plan yet for this day</p>
          <p className="text-xs mt-1">Describe your schedule above and tap Parse</p>
        </div>
      )}
    </div>
  )
}
