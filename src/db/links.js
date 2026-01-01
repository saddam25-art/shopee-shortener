import { supabase } from '../supabase.js'

export async function getLinkBySlug(slug) {
  const { data, error } = await supabase
    .from('short_links')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const { data: destinations, error: destErr } = await supabase
    .from('short_link_destinations')
    .select('*')
    .eq('short_link_id', data.id)

  if (destErr) throw destErr

  return { link: data, destinations: destinations || [] }
}

export async function listLinks() {
  const { data, error } = await supabase
    .from('short_links')
    .select('*, short_link_counters(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createLink(payload) {
  const { data, error } = await supabase
    .from('short_links')
    .insert(payload)
    .select('*')
    .single()

  if (error) throw error

  await supabase
    .from('short_link_counters')
    .insert({
      short_link_id: data.id,
      total_clicks: 0,
      android_clicks: 0,
      ios_clicks: 0,
      desktop_clicks: 0,
    })

  return data
}

export async function updateLink(id, payload) {
  const { data, error } = await supabase
    .from('short_links')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function deleteLink(id) {
  const { error } = await supabase.from('short_links').delete().eq('id', id)
  if (error) throw error
}

export async function getLinkStats(shortLinkId) {
  const { data: counters, error: cErr } = await supabase
    .from('short_link_counters')
    .select('*')
    .eq('short_link_id', shortLinkId)
    .maybeSingle()

  if (cErr) throw cErr

  const storeRaw = String(process.env.STORE_RAW_CLICKS || '').toLowerCase() === 'true'
  if (!storeRaw) {
    return { counters: counters || null, recentClicks: [] }
  }

  const { data: clicks, error: clickErr } = await supabase
    .from('short_link_click_events')
    .select('id, device, referrer, created_at')
    .eq('short_link_id', shortLinkId)
    .order('created_at', { ascending: false })
    .limit(200)

  if (clickErr) throw clickErr

  return { counters: counters || null, recentClicks: clicks || [] }
}

export async function upsertDestinations(shortLinkId, destinations) {
  await supabase.from('short_link_destinations').delete().eq('short_link_id', shortLinkId)

  const rows = (Array.isArray(destinations) ? destinations : []).map((d) => ({
    short_link_id: shortLinkId,
    url: d.url,
    weight: d.weight ?? 1,
    is_active: d.is_active ?? true,
  }))

  if (rows.length === 0) return []

  const { data, error } = await supabase
    .from('short_link_destinations')
    .insert(rows)
    .select('*')

  if (error) throw error
  return data || []
}

export async function incrementCounters(shortLinkId, device) {
  const column =
    device === 'android' ? 'android_clicks' : device === 'ios' ? 'ios_clicks' : 'desktop_clicks'

  const { error } = await supabase.rpc('short_link_increment_counters', {
    p_short_link_id: shortLinkId,
    p_device_column: column,
  })

  if (error) throw error
}

export async function insertClickEvent({ shortLinkId, slug, device, referrer, ua, ipHash }) {
  const storeRaw = String(process.env.STORE_RAW_CLICKS || '').toLowerCase() === 'true'
  if (!storeRaw) return

  const { error } = await supabase.from('short_link_click_events').insert({
    short_link_id: shortLinkId,
    slug,
    device,
    referrer: referrer || null,
    ua: ua || null,
    ip_hash: ipHash || null,
  })

  if (error) throw error
}
