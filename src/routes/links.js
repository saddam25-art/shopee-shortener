import express from 'express'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { requireAuth } from '../middleware/requireAuth.js'
import { createLink, deleteLink, getLinkStats, listLinks, updateLink, upsertDestinations } from '../db/links.js'

export const linksRouter = express.Router()

linksRouter.use(requireAuth)

function getSlugLength() {
  const raw = process.env.SLUG_LENGTH
  const n = raw ? Number(raw) : 12
  if (!Number.isFinite(n)) return 12
  return Math.max(8, Math.min(64, Math.floor(n)))
}

linksRouter.get('/', async (req, res) => {
  try {
    const links = await listLinks()
    return res.json({ links })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
})

linksRouter.get('/:id/stats', async (req, res) => {
  try {
    const stats = await getLinkStats(req.params.id)
    return res.json(stats)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
})

const DestinationSchema = z.object({
  url: z.string().url(),
  weight: z.number().int().positive().optional(),
  is_active: z.boolean().optional(),
})

const CreateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  og_title: z.string().min(1).max(200).optional(),
  og_description: z.string().min(1).max(500).optional(),
  og_image_url: z.string().url().optional(),
  primary_url: z.string().url(),
  android_url: z.string().url().optional(),
  ios_url: z.string().url().optional(),
  desktop_url: z.string().url().optional(),
  mode: z.enum(['single', 'rotate']).default('single'),
  is_active: z.boolean().default(true),
  utm_defaults: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
      content: z.string().optional(),
      term: z.string().optional(),
    })
    .optional(),
  destinations: z.array(DestinationSchema).optional(),
})

linksRouter.post('/', async (req, res) => {
  try {
    const body = CreateSchema.parse(req.body)

    const slugLength = getSlugLength()
    let link
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const slug = nanoid(slugLength)
        link = await createLink({
          slug,
          title: body.title || null,
          og_title: body.og_title || null,
          og_description: body.og_description || null,
          og_image_url: body.og_image_url || null,
          is_active: body.is_active,
          mode: body.mode,
          primary_url: body.primary_url,
          android_url: body.android_url || null,
          ios_url: body.ios_url || null,
          desktop_url: body.desktop_url || null,
          utm_defaults: body.utm_defaults || {},
        })
        break
      } catch (err) {
        const code = err && typeof err === 'object' && 'code' in err ? err.code : null
        if (code === '23505' && attempt < 4) continue
        throw err
      }
    }

    if (!link) {
      return res.status(500).json({ error: 'Failed to generate unique slug' })
    }

    if (body.mode === 'rotate') {
      await upsertDestinations(link.id, body.destinations || [])
    }

    return res.status(201).json({ link })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return res.status(400).json({ error: message })
  }
})

const UpdateSchema = CreateSchema.partial().extend({
  destinations: z.array(DestinationSchema).optional(),
})

linksRouter.put('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const body = UpdateSchema.parse(req.body)

    const updated = await updateLink(id, {
      ...(body.title !== undefined ? { title: body.title || null } : {}),
      ...(body.og_title !== undefined ? { og_title: body.og_title || null } : {}),
      ...(body.og_description !== undefined ? { og_description: body.og_description || null } : {}),
      ...(body.og_image_url !== undefined ? { og_image_url: body.og_image_url || null } : {}),
      ...(body.is_active !== undefined ? { is_active: body.is_active } : {}),
      ...(body.mode !== undefined ? { mode: body.mode } : {}),
      ...(body.primary_url !== undefined ? { primary_url: body.primary_url } : {}),
      ...(body.android_url !== undefined ? { android_url: body.android_url || null } : {}),
      ...(body.ios_url !== undefined ? { ios_url: body.ios_url || null } : {}),
      ...(body.desktop_url !== undefined ? { desktop_url: body.desktop_url || null } : {}),
      ...(body.utm_defaults !== undefined ? { utm_defaults: body.utm_defaults || {} } : {}),
    })

    if (body.mode === 'rotate' || body.destinations) {
      await upsertDestinations(id, body.destinations || [])
    }

    return res.json({ link: updated })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return res.status(400).json({ error: message })
  }
})

linksRouter.delete('/:id', async (req, res) => {
  try {
    await deleteLink(req.params.id)
    return res.status(204).end()
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
})
