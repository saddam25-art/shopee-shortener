export function mergeUtm(urlString, utmDefaults, utmOverrides) {
  const url = new URL(urlString)
  const defaults = utmDefaults && typeof utmDefaults === 'object' ? utmDefaults : {}
  const overrides = utmOverrides && typeof utmOverrides === 'object' ? utmOverrides : {}

  const mapping = {
    utm_source: 'source',
    utm_medium: 'medium',
    utm_campaign: 'campaign',
    utm_content: 'content',
    utm_term: 'term',
  }

  for (const [param, key] of Object.entries(mapping)) {
    const existing = url.searchParams.get(param)
    if (existing) continue

    const value = overrides[key] ?? defaults[key]
    if (value) url.searchParams.set(param, String(value))
  }

  return url.toString()
}
