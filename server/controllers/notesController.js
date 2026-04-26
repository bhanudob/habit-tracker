import { PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler.js'

const prisma = new PrismaClient()

export const getNotes = async (req, res, next) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: 'desc' },
    })
    res.json({ success: true, data: notes })
  } catch (err) {
    next(err)
  }
}

export const createNote = async (req, res, next) => {
  try {
    const { content } = req.body

    if (!content) {
      throw new AppError('Content required', 400)
    }

    const note = await prisma.note.create({
      data: {
        userId: req.user.userId,
        content,
      },
    })

    res.status(201).json({ success: true, data: note })
  } catch (err) {
    next(err)
  }
}

export const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params

    const note = await prisma.note.findFirst({
      where: { id, userId: req.user.userId },
    })

    if (!note) {
      throw new AppError('Note not found', 404)
    }

    await prisma.note.delete({ where: { id } })
    res.json({ success: true, data: { id } })
  } catch (err) {
    next(err)
  }
}
