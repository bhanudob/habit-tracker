import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler.js'

const prisma = new PrismaClient()

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
  return { accessToken, refreshToken }
}

export const register = async (req, res, next) => {
  try {
    const { email, name, password } = req.body

    if (!email || !name || !password) {
      throw new AppError('Missing required fields', 400)
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new AppError('Email already registered', 400)
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword },
    })

    const { accessToken, refreshToken } = generateTokens(user.id)
    res.status(201).json({
      success: true,
      data: { user: { id: user.id, email, name }, accessToken, refreshToken },
    })
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw new AppError('Email and password required', 400)
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new AppError('Invalid credentials', 401)
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      throw new AppError('Invalid credentials', 401)
    }

    const { accessToken, refreshToken } = generateTokens(user.id)
    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        accessToken,
        refreshToken,
      },
    })
  } catch (err) {
    next(err)
  }
}

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400)
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const { accessToken: newAccessToken } = generateTokens(decoded.userId)

    res.json({
      success: true,
      data: { accessToken: newAccessToken },
    })
  } catch (err) {
    next(err)
  }
}
