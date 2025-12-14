export function pickDestination({ primaryUrl, mode, destinations }) {
  if (mode !== 'rotate') {
    return primaryUrl
  }

  const active = Array.isArray(destinations) ? destinations.filter((d) => d && d.is_active) : []
  if (active.length === 0) return primaryUrl

  const weighted = active.map((d) => ({ ...d, weight: Number(d.weight || 1) }))
  const total = weighted.reduce((sum, d) => sum + (d.weight > 0 ? d.weight : 0), 0)

  if (total <= 0) return weighted[0].url

  let r = Math.random() * total
  for (const d of weighted) {
    const w = d.weight > 0 ? d.weight : 0
    if (r < w) return d.url
    r -= w
  }

  return weighted[weighted.length - 1].url
}
