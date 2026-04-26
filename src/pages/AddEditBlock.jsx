import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { habitsStorage } from '../services/localStorage'

const FREQUENCIES = [
  { value: 'daily', label: '📅 Daily' },
  { value: 'weekly', label: '📆 Weekly' },
  { value: 'monthly', label: '📊 Monthly' },
]

const COLORS = ['#0d9488','#9333ea','#f59e0b','#ef4444','#3b82f6','#10b981','#ec4899','#8b5cf6']

export default function AddEditBlock() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [color, setColor] = useState('#0d9488')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      const habit = habitsStorage.getById(id)
      if (habit) {
        setName(habit.name); setDescription(habit.description || '')
        setFrequency(habit.frequency || 'daily'); setColor(habit.color || '#0d9488')
      } else { navigate('/') }
    }
  }, [id, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Routine name is required'); return }
    setLoading(true)
    try {
      if (id) { habitsStorage.update(id, { name, description, frequency, color }) }
      else { habitsStorage.create(name, frequency, description, color) }
      navigate('/')
    } catch (err) {
      setError('Failed to save routine'); console.error(err)
    } finally { setLoading(false) }
  }

  const handleDelete = () => {
    if (!id) return
    if (!window.confirm('Are you sure you want to delete this routine?')) return
    habitsStorage.delete(id); navigate('/')
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold text-purple-600">{id ? 'Edit Routine' : 'New Routine'}</h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Routine Name *</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Morning Run" disabled={loading}
            className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-slate-100 dark:disabled:bg-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
          <textarea
            value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this routine about? (optional)" disabled={loading} rows={2}
            className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-slate-100 dark:disabled:bg-slate-900 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Frequency</label>
          <div className="flex gap-2">
            {FREQUENCIES.map((freq) => (
              <button
                key={freq.value} type="button" onClick={() => setFrequency(freq.value)} disabled={loading}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  frequency === freq.value ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                } disabled:opacity-50`}
              >
                {freq.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Color</label>
          <div className="flex gap-3 flex-wrap">
            {COLORS.map((col) => (
              <button
                key={col} type="button" onClick={() => setColor(col)} disabled={loading}
                className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${color === col ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-600 scale-110' : ''} disabled:opacity-50`}
                style={{ backgroundColor: col }}
              />
            ))}
          </div>
        </div>
        <div className="border-l-4 rounded-lg p-3 bg-slate-50 dark:bg-slate-800" style={{ borderLeftColor: color }}>
          <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{name || 'Routine name'}</p>
          {description && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>}
        </div>
        <button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-lg py-3 transition-colors mt-2">
          {loading ? 'Saving...' : id ? 'Update Routine' : 'Create Routine'}
        </button>
      </form>

      {id && (
        <button onClick={handleDelete} disabled={loading} className="text-red-600 hover:text-red-700 font-semibold hover:bg-red-50 dark:hover:bg-red-950 rounded-lg py-2 transition-colors disabled:opacity-50">
          Delete Routine
        </button>
      )}
      <button onClick={() => navigate('/')} disabled={loading} className="text-slate-600 dark:text-slate-400 hover:text-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg py-2 transition-colors disabled:opacity-50">
        Cancel
      </button>
    </div>
  )
}
