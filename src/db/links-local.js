import { db } from './local-db.js'

export async function getLinkBySlug(slug) {
  const link = db.prepare('SELECT * FROM short_links WHERE slug = ? AND is_active = 1').get(slug)
  if (!link) return null

  const destinations = db.prepare('SELECT * FROM short_link_destinations WHERE short_link_id = ?').all(link.id)
  return { link, destinations: destinations || [] }
}

export async function listLinks() {
  const links = db.prepare(`
    SELECT sl.*, slc.total_clicks, slc.android_clicks, slc.ios_clicks, slc.desktop_clicks
    FROM short_links sl
    LEFT JOIN short_link_counters slc ON sl.id = slc.short_link_id
    ORDER BY sl.created_at DESC
  `).all()

  return links.map(link => ({
    ...link,
    is_active: Boolean(link.is_active),
    short_link_counters: [{
      total_clicks: link.total_clicks || 0,
      android_clicks: link.android_clicks || 0,
      ios_clicks: link.ios_clicks || 0,
      desktop_clicks: link.desktop_clicks || 0
    }]
  }))
}

export async function createLink(payload) {
  const stmt = db.prepare(`
    INSERT INTO short_links (slug, default_url, og_title, og_description, og_image_url, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  
  const result = stmt.run(
    payload.slug,
    payload.default_url,
    payload.og_title || null,
    payload.og_description || null,
    payload.og_image_url || null,
    payload.is_active !== false ? 1 : 0
  )

  const link = db.prepare('SELECT * FROM short_links WHERE id = ?').get(result.lastInsertRowid)

  db.prepare(`
    INSERT INTO short_link_counters (short_link_id, total_clicks, android_clicks, ios_clicks, desktop_clicks)
    VALUES (?, 0, 0, 0, 0)
  `).run(link.id)

  return link
}

export async function updateLink(id, payload) {
  const sets = []
  const values = []

  if (payload.slug !== undefined) { sets.push('slug = ?'); values.push(payload.slug) }
  if (payload.default_url !== undefined) { sets.push('default_url = ?'); values.push(payload.default_url) }
  if (payload.og_title !== undefined) { sets.push('og_title = ?'); values.push(payload.og_title) }
  if (payload.og_description !== undefined) { sets.push('og_description = ?'); values.push(payload.og_description) }
  if (payload.og_image_url !== undefined) { sets.push('og_image_url = ?'); values.push(payload.og_image_url) }
  if (payload.is_active !== undefined) { sets.push('is_active = ?'); values.push(payload.is_active ? 1 : 0) }
  
  sets.push("updated_at = datetime('now')")
  values.push(id)

  db.prepare(`UPDATE short_links SET ${sets.join(', ')} WHERE id = ?`).run(...values)
  
  return db.prepare('SELECT * FROM short_links WHERE id = ?').get(id)
}

export async function deleteLink(id) {
  db.prepare('DELETE FROM short_links WHERE id = ?').run(id)
}

export async function getLinkStats(shortLinkId) {
  const counters = db.prepare('SELECT * FROM short_link_counters WHERE short_link_id = ?').get(shortLinkId)
  
  const storeRaw = String(process.env.STORE_RAW_CLICKS || '').toLowerCase() === 'true'
  if (!storeRaw) {
    return { counters: counters || null, recentClicks: [] }
  }

  const clicks = db.prepare(`
    SELECT id, device, referrer, created_at 
    FROM short_link_click_events 
    WHERE short_link_id = ? 
    ORDER BY created_at DESC 
    LIMIT 200
  `).all(shortLinkId)

  return { counters: counters || null, recentClicks: clicks || [] }
}

export async function upsertDestinations(shortLinkId, destinations) {
  db.prepare('DELETE FROM short_link_destinations WHERE short_link_id = ?').run(shortLinkId)

  const rows = (Array.isArray(destinations) ? destinations : []).map((d) => ({
    short_link_id: shortLinkId,
    url: d.url,
    weight: d.weight ?? 1,
    is_active: d.is_active !== false ? 1 : 0,
  }))

  if (rows.length === 0) return []

  const stmt = db.prepare(`
    INSERT INTO short_link_destinations (short_link_id, url, weight, is_active)
    VALUES (?, ?, ?, ?)
  `)

  for (const row of rows) {
    stmt.run(row.short_link_id, row.url, row.weight, row.is_active)
  }

  return db.prepare('SELECT * FROM short_link_destinations WHERE short_link_id = ?').all(shortLinkId)
}

export async function incrementCounters(shortLinkId, device) {
  const column = device === 'android' ? 'android_clicks' : device === 'ios' ? 'ios_clicks' : 'desktop_clicks'

  db.prepare(`
    UPDATE short_link_counters 
    SET total_clicks = total_clicks + 1, ${column} = ${column} + 1 
    WHERE short_link_id = ?
  `).run(shortLinkId)
}

export async function insertClickEvent({ shortLinkId, slug, device, referrer, ua, ipHash }) {
  const storeRaw = String(process.env.STORE_RAW_CLICKS || '').toLowerCase() === 'true'
  if (!storeRaw) return

  db.prepare(`
    INSERT INTO short_link_click_events (short_link_id, slug, device, referrer, ua, ip_hash)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(shortLinkId, slug, device, referrer || null, ua || null, ipHash || null)
}
