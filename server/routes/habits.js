import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  logHabit,
} from '../controllers/habitsController.js'

const router = express.Router()

// All habit routes require auth
router.use(verifyToken)

router.get('/', getHabits)
router.post('/', createHabit)
router.put('/:id', updateHabit)
router.delete('/:id', deleteHabit)
router.post('/:id/log', logHabit)

export default router
