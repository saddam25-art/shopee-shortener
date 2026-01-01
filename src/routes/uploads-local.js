import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { requireAuth } from '../middleware/requireAuth.js'
import { uploadImage } from '../storage-local.js'

export const uploadsRouterLocal = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})

uploadsRouterLocal.use(requireAuth)

uploadsRouterLocal.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const ext = path.extname(req.file.originalname) || '.png'
    const filename = `${uuidv4()}${ext}`
    
    const url = await uploadImage(req.file.buffer, filename)
    
    return res.json({ url })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})
