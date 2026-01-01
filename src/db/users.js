import bcrypt from 'bcryptjs'
import { supabase } from '../supabase.js'

export async function getUserByUsername(username) {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (error) throw error
  return data || null
}

export async function createUser({ username, password }) {
  const password_hash = await bcrypt.hash(password, 12)

  const { data, error } = await supabase
    .from('app_users')
    .insert({ username, password_hash })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function verifyUserPassword({ user, password }) {
  return bcrypt.compare(password, user.password_hash)
}
