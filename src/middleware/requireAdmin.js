export function requireAdmin(req, res, next) {
  const header = req.headers['authorization'] || ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

  const apiKey = process.env.ADMIN_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured: ADMIN_API_KEY missing' })
  }

  if (!token || token !== apiKey) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  return next()
}
