import { Router } from 'express'
import { getLinkBySlug, incrementCounters, insertClickEvent } from '../db/links-local.js'

export const redirectRouterLocal = Router()

function detectDevice(ua) {
  if (!ua) return 'desktop'
  const lc = ua.toLowerCase()
  if (/android/i.test(lc)) return 'android'
  if (/iphone|ipad|ipod/i.test(lc)) return 'ios'
  return 'desktop'
}

function isSocialBot(ua) {
  if (!ua) return false
  return /(facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Pinterest|Slackbot|TelegramBot|WhatsApp|Discordbot)/i.test(ua)
}

function isInAppBrowser(req) {
  const ua = String(req.headers['user-agent'] || '')
  if (!ua) return false
  return /(FBAN|FBAV|Instagram|Line\b|TikTok|Twitter|LinkedInApp|Pinterest|Snapchat)/i.test(ua)
}

function buildAndroidIntentUrl(webUrl) {
  const fallback = encodeURIComponent(webUrl)
  return `intent://${webUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.shopee.my;S.browser_fallback_url=${fallback};end`
}

function buildIosSchemeUrl(webUrl) {
  return `shopee://`
}

redirectRouterLocal.get('/:slug', async (req, res) => {
  const slug = req.params.slug
  
  // Skip static routes
  if (['admin', 'link-master', 'go', 'health', 'images', 'api'].includes(slug)) {
    return res.status(404).send('Not found')
  }

  try {
    const result = await getLinkBySlug(slug)
    if (!result) {
      return res.status(404).send('Link not found')
    }

    const { link, destinations } = result
    const ua = req.headers['user-agent'] || ''
    const device = detectDevice(ua)
    const referrer = req.headers.referer || req.headers.referrer || ''

    // Increment counters
    await incrementCounters(link.id, device)
    await insertClickEvent({
      shortLinkId: link.id,
      slug,
      device,
      referrer,
      ua,
      ipHash: null
    })

    // If social bot, return OG meta tags
    if (isSocialBot(ua)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.status(200).send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta property="og:title" content="${link.og_title || 'Shopee'}" />
  <meta property="og:description" content="${link.og_description || ''}" />
  ${link.og_image_url ? `<meta property="og:image" content="${link.og_image_url}" />
  <meta property="og:image:width" content="940" />
  <meta property="og:image:height" content="788" />
  <meta property="og:image:type" content="image/jpeg" />` : ''}
  <meta property="og:url" content="${req.protocol}://${req.get('host')}/${slug}" />
  <meta http-equiv="refresh" content="0;url=${link.default_url}" />
</head>
<body></body>
</html>`)
    }

    // Determine target URL
    let targetUrl = link.default_url
    if (destinations.length > 0) {
      const active = destinations.filter(d => d.is_active)
      if (active.length > 0) {
        const totalWeight = active.reduce((sum, d) => sum + (d.weight || 1), 0)
        let rand = Math.random() * totalWeight
        for (const d of active) {
          rand -= d.weight || 1
          if (rand <= 0) {
            targetUrl = d.url
            break
          }
        }
      }
    }

    // Handle in-app browsers - force Shopee app open
    if (isInAppBrowser(req)) {
      if (device === 'android') {
        res.setHeader('X-Redirect-Mode', 'android-intent')
        return res.redirect(302, buildAndroidIntentUrl(targetUrl))
      } else if (device === 'ios') {
        res.setHeader('X-Redirect-Mode', 'ios-scheme')
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        return res.status(200).send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Opening Shopee...</title>
</head>
<body>
  <script>
    window.location.href = 'shopee://';
    setTimeout(function() { window.location.href = '${targetUrl}'; }, 1500);
  </script>
</body>
</html>`)
      }
    }

    // Normal redirect
    res.setHeader('X-Redirect-Mode', 'normal')
    return res.redirect(302, targetUrl)

  } catch (err) {
    console.error('Redirect error:', err)
    return res.status(500).send('Server error')
  }
})
