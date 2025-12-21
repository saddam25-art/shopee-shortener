import bcrypt from 'bcryptjs'
import { db } from './local-db.js'

export async function getUserByUsername(username) {
  const user = db.prepare('SELECT * FROM app_users WHERE username = ?').get(username)
  return user || null
}

export async function createUser({ username, password }) {
  const password_hash = await bcrypt.hash(password, 12)

  const stmt = db.prepare('INSERT INTO app_users (username, password_hash) VALUES (?, ?)')
  const result = stmt.run(username, password_hash)

  return db.prepare('SELECT * FROM app_users WHERE id = ?').get(result.lastInsertRowid)
}

export async function verifyUserPassword({ user, password }) {
  return bcrypt.compare(password, user.password_hash)
}
