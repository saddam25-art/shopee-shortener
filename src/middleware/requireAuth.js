import jwt from 'jsonwebtoken'

function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET
  if (!secret) {
    throw new Error('Server misconfigured: AUTH_JWT_SECRET missing')
  }
  return secret
}

function parseCookie(header) {
  const raw = String(header || '')
  if (!raw) return {}
  const out = {}
  const parts = raw.split(';')
  for (const part of parts) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const k = part.slice(0, idx).trim()
    const v = part.slice(idx + 1).trim()
    if (!k) continue
    out[k] = decodeURIComponent(v)
  }
  return out
}

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.session || parseCookie(req.headers.cookie).session

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const payload = jwt.verify(token, getJwtSecret())
    req.user = payload
    return next()
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
