import express from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { createUser, getUserByUsername, verifyUserPassword } from '../db/users.js'

export const authRouter = express.Router()

function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET
  if (!secret) {
    throw new Error('Server misconfigured: AUTH_JWT_SECRET missing')
  }
  return secret
}

function cookieOptions(req) {
  const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production'
  const forceSecure = String(process.env.AUTH_COOKIE_SECURE || '').toLowerCase()
  const secure = forceSecure ? forceSecure === 'true' || forceSecure === '1' : isProd

  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30,
  }
}

function publicUser(u) {
  return { id: u.id, username: u.username, created_at: u.created_at }
}

const RegisterSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9._-]+$/),
  password: z.string().min(6).max(72),
})

authRouter.post('/register', async (req, res) => {
  try {
    const body = RegisterSchema.parse(req.body)

    const existing = await getUserByUsername(body.username)
    if (existing) return res.status(409).json({ error: 'Username already exists' })

    const user = await createUser({ username: body.username, password: body.password })

    const token = jwt.sign({ sub: user.id, username: user.username }, getJwtSecret(), { expiresIn: '30d' })
    res.cookie('session', token, cookieOptions(req))

    return res.status(201).json({ user: publicUser(user) })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return res.status(400).json({ error: message })
  }
})

const LoginSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(72),
})

authRouter.post('/login', async (req, res) => {
  try {
    const body = LoginSchema.parse(req.body)
    const user = await getUserByUsername(body.username)
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const ok = await verifyUserPassword({ user, password: body.password })
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ sub: user.id, username: user.username }, getJwtSecret(), { expiresIn: '30d' })
    res.cookie('session', token, cookieOptions(req))

    return res.status(200).json({ user: publicUser(user) })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return res.status(400).json({ error: message })
  }
})

authRouter.post('/logout', async (req, res) => {
  res.clearCookie('session', { path: '/' })
  return res.status(200).json({ ok: true })
})

authRouter.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.session
    if (!token) return res.status(200).json({ user: null })

    const payload = jwt.verify(token, getJwtSecret())
    return res.status(200).json({ user: { id: payload.sub, username: payload.username } })
  } catch {
    return res.status(200).json({ user: null })
  }
})
