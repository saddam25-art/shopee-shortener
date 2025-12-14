import express from 'express'
import crypto from 'crypto'
import { getLinkBySlug, incrementCounters, insertClickEvent } from '../db/links.js'
import { detectDevice } from '../utils/device.js'
import { pickDestination } from '../utils/rotation.js'
import { mergeUtm } from '../utils/utm.js'
import { buildAndroidIntent, buildIosSchemeUrl, getAndroidFallbackUrl, getIosFallbackUrl } from '../utils/shopee.js'

export const redirectRouter = express.Router()

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function isSocialPreviewBot(req) {
  const ua = String(req.headers['user-agent'] || '')
  if (!ua) return false

  return /(facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|whatsapp|pinterest|embedly|quora link preview|googlebot|bingbot)/i.test(
    ua,
  )
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderOgPreviewHtml({ title, description, imageUrl, canonicalUrl, destinationUrl }) {
  const safeTitle = escapeHtml(title || '')
  const safeDescription = escapeHtml(description || '')
  const safeCanonical = escapeHtml(canonicalUrl || '')
  const safeDestination = escapeHtml(destinationUrl || '')
  const safeImage = imageUrl ? escapeHtml(imageUrl) : ''

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:url" content="${safeCanonical}" />
  ${safeImage ? `<meta property="og:image" content="${safeImage}" />` : ''}
  <meta name="twitter:card" content="${safeImage ? 'summary_large_image' : 'summary'}" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  ${safeImage ? `<meta name="twitter:image" content="${safeImage}" />` : ''}
</head>
<body>
  <a href="${safeDestination}">Continue</a>
</body>
</html>`
}

redirectRouter.get('/_fallback/android', (req, res) => {
  return res.redirect(302, getAndroidFallbackUrl())
})

redirectRouter.get('/r/:slug/ios', async (req, res) => {
  const slug = req.params.slug
  const target = req.query.t
  const fallback = req.query.f

  if (typeof target !== 'string' || typeof fallback !== 'string') {
    return res.status(400).send('Bad Request')
  }

  const scheme = buildIosSchemeUrl({ webUrl: target })

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  // No iframe; tiny landing page to try app open then fallback.
  return res.status(200).send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Redirecting…</title>
</head>
<body>
  <script>
    (function(){
      var start = Date.now();
      var fallback = ${JSON.stringify(fallback)};
      var scheme = ${JSON.stringify(scheme)};

      // If Shopee supports universal links for this URL, Safari may open app directly.
      // If not, try URL scheme and then fallback to App Store/web.
      window.location.href = scheme;

      setTimeout(function(){
        // If the browser is still here after ~1.2s, assume app not installed / scheme blocked.
        if (Date.now() - start < 2000) {
          window.location.href = fallback;
        }
      }, 1200);
    })();
  </script>
</body>
</html>`) 
})

redirectRouter.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug
    const record = await getLinkBySlug(slug)

    if (!record) {
      return res.status(404).send('Not Found')
    }

    const { link, destinations } = record

    // Social preview bots (WhatsApp/FB/Telegram/etc.) need an HTML page with OG tags.
    // Do not count these as real clicks.
    if (isSocialPreviewBot(req)) {
      const baseUrl = process.env.SHORTENER_BASE_URL || `${req.protocol}://${req.get('host')}`
      const canonicalUrl = `${baseUrl.replace(/\/$/, '')}/${encodeURIComponent(slug)}`

      const title = process.env.OG_TITLE || link.title || 'Link'
      const description = process.env.OG_DESCRIPTION || 'Open link'
      const imageUrl = process.env.OG_IMAGE_URL || ''

      const picked = pickDestination({
        primaryUrl: link.primary_url,
        mode: link.mode,
        destinations,
      })

      const html = renderOgPreviewHtml({
        title,
        description,
        imageUrl,
        canonicalUrl,
        destinationUrl: picked,
      })

      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).send(html)
    }

    const { device, ua } = detectDevice(req)

    // Device-specific URL overrides take priority over rotation/primary.
    // All of these are expected to be normal https web URLs.
    const overrideUrl =
      device === 'android'
        ? link.android_url
        : device === 'ios'
          ? link.ios_url
          : link.desktop_url

    const picked = overrideUrl
      ? overrideUrl
      : pickDestination({
          primaryUrl: link.primary_url,
          mode: link.mode,
          destinations,
        })

    // Allow passing utm_* via query; also apply defaults if missing
    const utmOverrides = {
      source: req.query.utm_source,
      medium: req.query.utm_medium,
      campaign: req.query.utm_campaign,
      content: req.query.utm_content,
      term: req.query.utm_term,
    }

    const webUrl = mergeUtm(picked, link.utm_defaults || {}, utmOverrides)

    // Tracking
    const referrer = req.headers['referer'] || req.headers['referrer']
    const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || req.socket.remoteAddress || ''
    const ipHash = ip ? sha256(ip) : null

    await incrementCounters(link.id, device)
    await insertClickEvent({ shortLinkId: link.id, slug, device, referrer, ua, ipHash })

    // Redirect logic
    if (device === 'android') {
      const intent = buildAndroidIntent({ webUrl })
      res.setHeader('Cache-Control', 'no-store')
      return res.redirect(302, intent)
    }

    if (device === 'ios') {
      // Prefer universal link by first trying the webUrl in Safari, but to guarantee app-open attempt,
      // use a small landing page that attempts the scheme then falls back.
      const fallback = getIosFallbackUrl()
      const baseUrl = process.env.SHORTENER_BASE_URL || `${req.protocol}://${req.get('host')}`
      const landing = new URL(`${baseUrl}/r/${slug}/ios`)
      landing.searchParams.set('t', webUrl)
      landing.searchParams.set('f', fallback)

      res.setHeader('Cache-Control', 'no-store')
      return res.redirect(302, landing.toString())
    }

    // Desktop
    res.setHeader('Cache-Control', 'no-store')
    return res.redirect(302, webUrl)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return res.status(500).send(message)
  }
})
