import { useState, useEffect } from 'react'
import { notesStorage } from '../services/localStorage'

export default function NotesRevisions() {
  const [notes, setNotes] = useState([])
  const [newNoteContent, setNewNoteContent] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setNotes(notesStorage.getAll())
  }, [])

  const handleCreateNote = (e) => {
    e.preventDefault()
    if (!newNoteContent.trim()) {
      setError('Note cannot be empty')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const newNote = notesStorage.create(newNoteContent.trim())
      setNotes([newNote, ...notes])
      setNewNoteContent('')
    } catch (err) {
      setError('Failed to create note')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteNote = (id) => {
    if (!window.confirm('Delete this note?')) return
    notesStorage.delete(id)
    setNotes(notes.filter((n) => n.id !== id))
  }

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold text-teal-600">Notes & Revisions</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Create note form */}
      <form onSubmit={handleCreateNote} className="flex flex-col gap-2 bg-white rounded-xl p-4 shadow-sm">
        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Write a note... what's on your mind?"
          disabled={submitting}
          rows={3}
          className="border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-slate-100 resize-none text-sm"
        />
        <button
          type="submit"
          disabled={submitting || !newNoteContent.trim()}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-lg py-2 transition-colors self-end px-4"
        >
          {submitting ? 'Saving...' : 'Save Note'}
        </button>
      </form>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-2">📓</div>
          <h2 className="text-lg font-semibold text-slate-700">No notes yet</h2>
          <p className="text-sm text-slate-400 mt-1">Start writing to capture your thoughts</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start gap-3 mb-2">
                <p className="text-xs text-slate-400">{formatDate(note.createdAt)}</p>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-red-500 hover:text-red-700 text-xs font-semibold hover:bg-red-50 px-2 py-1 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
