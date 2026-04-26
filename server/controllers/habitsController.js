import { PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler.js'

const prisma = new PrismaClient()

export const getHabits = async (req, res, next) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.user.userId },
      orderBy: { order: 'asc' },
    })
    res.json({ success: true, data: habits })
  } catch (err) {
    next(err)
  }
}

export const createHabit = async (req, res, next) => {
  try {
    const { name, description, frequency, color } = req.body

    if (!name || !frequency) {
      throw new AppError('Name and frequency required', 400)
    }

    const habit = await prisma.habit.create({
      data: {
        userId: req.user.userId,
        name,
        description,
        frequency,
        color: color || '#0d9488',
      },
    })

    res.status(201).json({ success: true, data: habit })
  } catch (err) {
    next(err)
  }
}

export const updateHabit = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, description, frequency, color, active, order } = req.body

    const habit = await prisma.habit.findFirst({
      where: { id, userId: req.user.userId },
    })

    if (!habit) {
      throw new AppError('Habit not found', 404)
    }

    const updated = await prisma.habit.update({
      where: { id },
      data: { name, description, frequency, color, active, order },
    })

    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
}

export const deleteHabit = async (req, res, next) => {
  try {
    const { id } = req.params

    const habit = await prisma.habit.findFirst({
      where: { id, userId: req.user.userId },
    })

    if (!habit) {
      throw new AppError('Habit not found', 404)
    }

    await prisma.habit.delete({ where: { id } })
    res.json({ success: true, data: { id } })
  } catch (err) {
    next(err)
  }
}

export const logHabit = async (req, res, next) => {
  try {
    const { id } = req.params
    const { date, completed, notes } = req.body

    const habit = await prisma.habit.findFirst({
      where: { id, userId: req.user.userId },
    })

    if (!habit) {
      throw new AppError('Habit not found', 404)
    }

    const logDate = new Date(date).toISOString().split('T')[0]

    const log = await prisma.habitLog.upsert({
      where: { habitId_date: { habitId: id, date: new Date(logDate) } },
      update: { completed, notes },
      create: {
        habitId: id,
        userId: req.user.userId,
        date: new Date(logDate),
        completed,
        notes,
      },
    })

    res.json({ success: true, data: log })
  } catch (err) {
    next(err)
  }
}
