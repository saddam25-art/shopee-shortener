import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import {
  listLinks,
  createLink,
  updateLink,
  deleteLink,
} from '../db/links-local.js'

export const linksRouterLocal = Router()

const linkSchema = z.object({
  slug: z.string().min(1).max(100),
  default_url: z.string().url(),
  og_title: z.string().max(200).nullish(),
  og_description: z.string().max(500).nullish(),
  og_image_url: z.string().nullish(),
  is_active: z.boolean().optional(),
})

linksRouterLocal.use(requireAuth)

linksRouterLocal.get('/', async (req, res) => {
  try {
    const links = await listLinks()
    return res.json(links)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

linksRouterLocal.post('/', async (req, res) => {
  const parsed = linkSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }
  try {
    const link = await createLink(parsed.data)
    return res.status(201).json(link)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

linksRouterLocal.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const parsed = linkSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }
  try {
    const link = await updateLink(id, parsed.data)
    return res.json(link)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

linksRouterLocal.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  try {
    await deleteLink(id)
    return res.status(204).send()
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})
