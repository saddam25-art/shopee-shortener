import express from 'express'
import { nanoid } from 'nanoid'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { supabase } from '../supabase.js'

export const uploadsRouter = express.Router()

uploadsRouter.use(requireAdmin)

function sanitizeFileExt(contentType, filename) {
  const ct = String(contentType || '').toLowerCase()
  if (ct === 'image/png') return 'png'
  if (ct === 'image/webp') return 'webp'
  if (ct === 'image/gif') return 'gif'
  if (ct === 'image/jpeg' || ct === 'image/jpg') return 'jpg'

  const name = String(filename || '').toLowerCase()
  const m = name.match(/\.([a-z0-9]{2,5})$/)
  const ext = m ? m[1] : ''
  if (ext === 'png' || ext === 'webp' || ext === 'gif' || ext === 'jpg' || ext === 'jpeg') {
    return ext === 'jpeg' ? 'jpg' : ext
  }
  return 'jpg'
}

uploadsRouter.post('/og-image', async (req, res) => {
  try {
    const bucket = process.env.OG_IMAGE_BUCKET || 'og-images'

    const filename = req.body?.filename
    const contentType = req.body?.contentType
    const dataBase64 = req.body?.dataBase64

    if (typeof dataBase64 !== 'string' || dataBase64.length === 0) {
      return res.status(400).json({ error: 'dataBase64 is required' })
    }

    const ext = sanitizeFileExt(contentType, filename)
    const path = `admin/${new Date().toISOString().slice(0, 10)}/${nanoid(12)}.${ext}`

    const buffer = Buffer.from(dataBase64, 'base64')

    // Basic size guard (approx) to avoid excessive payloads
    const maxBytes = Number(process.env.OG_IMAGE_MAX_BYTES || 2_500_000)
    if (Number.isFinite(maxBytes) && buffer.length > maxBytes) {
      return res.status(413).json({ error: `Image too large. Max ${maxBytes} bytes` })
    }

    const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: typeof contentType === 'string' ? contentType : undefined,
      upsert: false,
    })

    if (uploadErr) {
      const message = uploadErr.message || 'Upload failed'
      return res.status(500).json({ error: message })
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    const publicUrl = data?.publicUrl

    if (!publicUrl) {
      return res.status(500).json({ error: 'Failed to get public URL' })
    }

    return res.status(201).json({ publicUrl, path, bucket })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
})
