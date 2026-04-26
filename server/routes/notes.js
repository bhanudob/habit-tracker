import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import { getNotes, createNote, deleteNote } from '../controllers/notesController.js'

const router = express.Router()

// All note routes require auth
router.use(verifyToken)

router.get('/', getNotes)
router.post('/', createNote)
router.delete('/:id', deleteNote)

export default router
