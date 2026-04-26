function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function readHabits() {
  return JSON.parse(localStorage.getItem('ht_habits') || '[]')
}
function writeHabits(data) {
  localStorage.setItem('ht_habits', JSON.stringify(data))
}

function readLogs() {
  return JSON.parse(localStorage.getItem('ht_logs') || '[]')
}
function writeLogs(data) {
  localStorage.setItem('ht_logs', JSON.stringify(data))
}

function readNotes() {
  return JSON.parse(localStorage.getItem('ht_notes') || '[]')
}
function writeNotes(data) {
  localStorage.setItem('ht_notes', JSON.stringify(data))
}

export const habitsStorage = {
  getAll: () => readHabits(),
  getById: (id) => readHabits().find((h) => h.id === id) || null,
  create: (name, frequency, description, color) => {
    const habits = readHabits()
    const habit = {
      id: genId(),
      name,
      frequency: frequency || 'daily',
      description: description || '',
      color: color || '#0d9488',
      createdAt: new Date().toISOString(),
    }
    habits.push(habit)
    writeHabits(habits)
    return habit
  },
  update: (id, updates) => {
    const habits = readHabits().map((h) => (h.id === id ? { ...h, ...updates } : h))
    writeHabits(habits)
    return habits.find((h) => h.id === id)
  },
  delete: (id) => {
    writeHabits(readHabits().filter((h) => h.id !== id))
    writeLogs(readLogs().filter((l) => l.habitId !== id))
  },
}

export const logsStorage = {
  getForDate: (dateStr) => {
    const habits = readHabits()
    const logs = readLogs()
    const map = {}
    habits.forEach((h) => {
      map[h.id] = { completed: false, notes: '' }
    })
    logs
      .filter((l) => l.date === dateStr)
      .forEach((l) => {
        map[l.habitId] = { completed: l.completed, notes: l.notes || '' }
      })
    return map
  },
  log: (habitId, date, completed, notes) => {
    const logs = readLogs()
    const idx = logs.findIndex((l) => l.habitId === habitId && l.date === date)
    const entry = {
      id: genId(),
      habitId,
      date,
      completed,
      notes: notes || '',
      updatedAt: new Date().toISOString(),
    }
    if (idx >= 0) {
      logs[idx] = { ...logs[idx], ...entry }
    } else {
      logs.push(entry)
    }
    writeLogs(logs)
    return entry
  },
  getAll: () => readLogs(),
  getStreak: (habitId) => {
    const completed = new Set(
      readLogs()
        .filter((l) => l.habitId === habitId && l.completed)
        .map((l) => l.date)
    )
    const today = new Date()
    let streak = 0
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      if (completed.has(ds)) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    return streak
  },
  getForDateRange: (startStr, endStr) =>
    readLogs().filter((l) => l.date >= startStr && l.date <= endStr),
  getForMonth: (year, month) => {
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const end = `${year}-${String(month + 1).padStart(2, '0')}-31`
    return readLogs().filter((l) => l.date >= start && l.date <= end)
  },
}

function readPlans() {
  return JSON.parse(localStorage.getItem('ht_plans') || '[]')
}
function writePlans(data) {
  localStorage.setItem('ht_plans', JSON.stringify(data))
}

export const plansStorage = {
  getForDate: (dateStr) => readPlans().filter((p) => p.date === dateStr),
  getAll: () => readPlans(),
  saveForDate: (dateStr, items) => {
    const plans = readPlans().filter((p) => p.date !== dateStr)
    const stamped = items.map((item) => ({ ...item, id: genId(), savedAt: new Date().toISOString() }))
    writePlans([...plans, ...stamped])
    return stamped
  },
  deleteItem: (id) => writePlans(readPlans().filter((p) => p.id !== id)),
  clearForDate: (dateStr) => writePlans(readPlans().filter((p) => p.date !== dateStr)),
}

export const notesStorage = {
  getAll: () => [...readNotes()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  create: (content) => {
    const notes = readNotes()
    const note = { id: genId(), content, createdAt: new Date().toISOString() }
    notes.push(note)
    writeNotes(notes)
    return note
  },
  delete: (id) => {
    writeNotes(readNotes().filter((n) => n.id !== id))
  },
}
