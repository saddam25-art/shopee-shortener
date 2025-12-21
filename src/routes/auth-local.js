import { Router } from 'express'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { getUserByUsername, createUser, verifyUserPassword } from '../db/users-local.js'

export const authRouterLocal = Router()

const JWT_SECRET = process.env.AUTH_JWT_SECRET || 'local-secret-key-change-me'
const COOKIE_NAME = 'auth_token'

const authSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
})

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}

authRouterLocal.post('/register', async (req, res) => {
  const parsed = authSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }

  try {
    const existing = await getUserByUsername(parsed.data.username)
    if (existing) {
      return res.status(400).json({ error: 'Username already taken' })
    }

    const user = await createUser(parsed.data)
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
    setAuthCookie(res, token)

    return res.status(201).json({ user: { id: user.id, username: user.username } })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

authRouterLocal.post('/login', async (req, res) => {
  const parsed = authSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }

  try {
    const user = await getUserByUsername(parsed.data.username)
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    const valid = await verifyUserPassword({ user, password: parsed.data.password })
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
    setAuthCookie(res, token)

    return res.json({ user: { id: user.id, username: user.username } })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

authRouterLocal.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME)
  return res.json({ ok: true })
})

authRouterLocal.get('/me', (req, res) => {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return res.json({ user: { id: decoded.userId, username: decoded.username } })
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
})
