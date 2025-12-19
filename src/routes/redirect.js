import express from 'express'
import crypto from 'crypto'
import { getLinkBySlug, incrementCounters, insertClickEvent } from '../db/links.js'
import { detectDevice } from '../utils/device.js'
import { pickDestination } from '../utils/rotation.js'
import { mergeUtm } from '../utils/utm.js'
import { buildAndroidIntent, buildIosSchemeUrl, getAndroidFallbackUrl, getIosFallbackUrl } from '../utils/shopee.js'

export const redirectRouter = express.Router()

const shopeeExpandCache = new Map()

function isShopeeShortUrl(url) {
  try {
    const u = new URL(url)
    return u.hostname === 's.shopee.com.my'
  } catch {
    return false
  }
}

async function expandShopeeShortUrl(url) {
  const now = Date.now()
  const cached = shopeeExpandCache.get(url)
  if (cached && typeof cached.expiresAt === 'number' && cached.expiresAt > now && typeof cached.value === 'string') {
    return cached.value
  }

  const timeoutMs = Number(process.env.SHOPEE_EXPAND_TIMEOUT_MS || 2500)
  const ttlMs = Number(process.env.SHOPEE_EXPAND_TTL_MS || 86_400_000)

  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) ? timeoutMs : 2500)

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    const finalUrl = typeof res.url === 'string' && res.url ? res.url : url
    try {
      res.body?.cancel?.()
    } catch {
      // ignore
    }

    if (finalUrl !== url) {
      shopeeExpandCache.set(url, { value: finalUrl, expiresAt: now + (Number.isFinite(ttlMs) ? ttlMs : 86_400_000) })
    }

    return finalUrl
  } catch {
    return url
  } finally {
    clearTimeout(t)
  }
}

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
  ${safeImage ? `<meta property="og:image" content="${safeImage}" />
  <meta property="og:image:width" content="940" />
  <meta property="og:image:height" content="788" />
  <meta property="og:image:type" content="image/jpeg" />` : ''}
  <meta name="twitter:card" content="${safeImage ? 'summary_large_image' : 'summary'}" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  ${safeImage ? `<meta name="twitter:image" content="${safeImage}" />` : ''}
  <meta http-equiv="refresh" content="0;url=${safeDestination}" />
  <link rel="alternate" href="shopee://open?url=${encodeURIComponent(safeDestination)}" />
</head>
<body>
  <a href="${safeDestination}">Continue to Shopee</a>
  <script>window.location.replace("${safeDestination}");</script>
</body>
</html>`
}

function isInAppBrowser(req) {
  const ua = String(req.headers['user-agent'] || '')
  if (!ua) return false

  // These in-app browsers often show a permission prompt when we attempt to open an external app.
  // So we should avoid Shopee deep-linking (intent / scheme) and redirect to normal web URL.
  return /(FBAN|FBAV|Instagram|Line\b|TikTok|Twitter|LinkedInApp|Pinterest|Snapchat)/i.test(ua)
}

function shouldForceAppOpenInInAppBrowser() {
  // Default to TRUE - always try to open Shopee app even in FB/IG in-app browsers.
  // Set FORCE_SHOPEE_APP_OPEN_INAPP=false to disable.
  const v = String(process.env.FORCE_SHOPEE_APP_OPEN_INAPP ?? 'true').toLowerCase()
  return v !== '0' && v !== 'false' && v !== 'no'
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
      const title = link.og_title || process.env.OG_TITLE || link.title || 'Link'
      const description = link.og_description || process.env.OG_DESCRIPTION || 'Open link'
      const imageUrl = link.og_image_url || process.env.OG_IMAGE_URL || ''

      const picked = pickDestination({
        primaryUrl: link.primary_url,
        mode: link.mode,
        destinations,
      })

      // Use the Shopee destination URL as og:url so Facebook directs users to Shopee app directly
      const html = renderOgPreviewHtml({
        title,
        description,
        imageUrl,
        canonicalUrl: picked,  // Set og:url to Shopee link for direct app open
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

    // Tracking data
    const referrer = req.headers['referer'] || req.headers['referrer'] || ''
    const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || req.socket.remoteAddress || ''
    const ipHash = ip ? sha256(ip) : null

    // In-app browsers (Facebook/Instagram/etc.) block Android Intent URLs.
    // Use a landing page with JavaScript to open Shopee app directly.
    if (isInAppBrowser(req)) {
      let targetUrl = webUrl
      if (isShopeeShortUrl(targetUrl)) {
        targetUrl = await expandShopeeShortUrl(targetUrl)
      }
      
      // Track the click
      await incrementCounters(link.id, device)
      await insertClickEvent({ shortLinkId: link.id, slug, device, referrer, ua, ipHash })
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      res.setHeader('X-Redirect-Mode', 'inapp-force-app')
      
      // Build different URLs for different approaches
      const shopeeScheme = `shopee://open?url=${encodeURIComponent(targetUrl)}`
      
      // Android Intent URL - this can bypass Facebook's in-app browser restrictions
      const parsedUrl = new URL(targetUrl)
      const intentUrl = `intent://${parsedUrl.host}${parsedUrl.pathname}${parsedUrl.search}#Intent;scheme=https;package=com.shopee.my;S.browser_fallback_url=${encodeURIComponent(targetUrl)};end`
      
      return res.status(200).send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Opening Shopee...</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; min-height: 100vh; background: linear-gradient(135deg, #ee4d2d 0%, #f53d2d 100%); display: flex; align-items: center; justify-content: center; }
    .container { text-align: center; padding: 24px; width: 100%; max-width: 400px; }
    .logo { width: 80px; height: 80px; background: white; border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-size: 40px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
    h1 { color: white; font-size: 22px; margin-bottom: 12px; font-weight: 600; }
    p { color: rgba(255,255,255,0.9); font-size: 15px; margin-bottom: 32px; line-height: 1.5; }
    .btn { display: block; width: 100%; padding: 16px 24px; background: white; color: #ee4d2d; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); margin-bottom: 12px; }
    .btn:active { transform: scale(0.98); }
    .btn-secondary { background: rgba(255,255,255,0.15); color: white; box-shadow: none; border: 1px solid rgba(255,255,255,0.3); }
    .loading { display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .hide { display: none !important; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🛒</div>
    <div class="loading" id="loader"></div>
    <h1 id="title">Opening Shopee...</h1>
    <p id="desc">Please wait, redirecting you to Shopee app...</p>
    <a href="${targetUrl}" class="btn" id="openBtn" style="display:none;">🛒 Open Shopee Now</a>
    <a href="${targetUrl}" class="btn btn-secondary" id="webBtn" style="display:none;">Open in Browser</a>
  </div>
  
  <script>
    (function() {
      var intentUrl = ${JSON.stringify(intentUrl)};
      var schemeUrl = ${JSON.stringify(shopeeScheme)};
      var webUrl = ${JSON.stringify(targetUrl)};
      var ua = navigator.userAgent || '';
      var isAndroid = /android/i.test(ua);
      var isIOS = /iphone|ipad|ipod/i.test(ua);
      var isFB = /FBAN|FBAV/i.test(ua);
      var isIG = /Instagram/i.test(ua);
      
      function showButtons() {
        document.getElementById('loader').classList.add('hide');
        document.getElementById('title').textContent = 'Tap to Open Shopee';
        document.getElementById('desc').textContent = 'Tap the button below to open in Shopee app';
        document.getElementById('openBtn').style.display = 'block';
        document.getElementById('webBtn').style.display = 'block';
        
        // Set correct URL on button
        if (isAndroid) {
          document.getElementById('openBtn').href = intentUrl;
        } else if (isIOS) {
          document.getElementById('openBtn').href = schemeUrl;
        }
      }
      
      function tryOpenApp() {
        if (isAndroid) {
          // Android: Use Intent URL - works better in Facebook WebView
          window.location.href = intentUrl;
        } else if (isIOS) {
          // iOS: Try scheme
          window.location.href = schemeUrl;
        } else {
          // Desktop: Direct to web
          window.location.href = webUrl;
          return;
        }
        
        // Show buttons after delay if still on page
        setTimeout(showButtons, 1500);
      }
      
      // Start immediately
      tryOpenApp();
      
    })();
  </script>
</body>
</html>`)
    }

    // Track click and redirect
    await incrementCounters(link.id, device)
    await insertClickEvent({ shortLinkId: link.id, slug, device, referrer, ua, ipHash })

    // Redirect logic
    if (device === 'android') {
      const intent = buildAndroidIntent({ webUrl })
      res.setHeader('X-Redirect-Mode', 'android-intent')
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

      res.setHeader('X-Redirect-Mode', 'ios-landing')
      res.setHeader('Cache-Control', 'no-store')
      return res.redirect(302, landing.toString())
    }

    // Desktop
    res.setHeader('X-Redirect-Mode', 'web')
    res.setHeader('Cache-Control', 'no-store')
    return res.redirect(302, webUrl)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return res.status(500).send(message)
  }
})

// App configurations for deep linking
const APP_CONFIGS = {
  shopee: {
    name: 'Shopee',
    icon: '🛒',
    color1: '#ee4d2d',
    color2: '#f53d2d',
    androidPackage: 'com.shopee.my',
    iosScheme: 'shopee://',
    detect: (url) => url.includes('shopee')
  },
  lazada: {
    name: 'Lazada',
    icon: '🛍️',
    color1: '#0d00ff',
    color2: '#1a0dff',
    androidPackage: 'com.lazada.android',
    iosScheme: 'lazada://',
    detect: (url) => url.includes('lazada') || url.includes('lzd.co')
  },
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    color1: '#000000',
    color2: '#161823',
    androidPackage: 'com.zhiliaoapp.musically',
    iosScheme: 'snssdk1128://',
    detect: (url) => url.includes('tiktok')
  },
  instagram: {
    name: 'Instagram',
    icon: '📸',
    color1: '#e1306c',
    color2: '#f77737',
    androidPackage: 'com.instagram.android',
    iosScheme: 'instagram://',
    detect: (url) => url.includes('instagram') || url.includes('instagr.am')
  },
  facebook: {
    name: 'Facebook',
    icon: '📘',
    color1: '#1877f2',
    color2: '#0d65d9',
    androidPackage: 'com.facebook.katana',
    iosScheme: 'fb://',
    detect: (url) => url.includes('facebook') || url.includes('fb.com') || url.includes('fb.me')
  },
  youtube: {
    name: 'YouTube',
    icon: '▶️',
    color1: '#ff0000',
    color2: '#cc0000',
    androidPackage: 'com.google.android.youtube',
    iosScheme: 'youtube://',
    detect: (url) => url.includes('youtube') || url.includes('youtu.be')
  },
  twitter: {
    name: 'X',
    icon: '🐦',
    color1: '#000000',
    color2: '#14171a',
    androidPackage: 'com.twitter.android',
    iosScheme: 'twitter://',
    detect: (url) => url.includes('twitter') || url.includes('x.com')
  }
}

function detectAppType(url) {
  for (const [key, config] of Object.entries(APP_CONFIGS)) {
    if (config.detect(url)) return key
  }
  return 'other'
}

// Deep link route - aggressive app opening for Facebook/Instagram
redirectRouter.get('/go/:slug', async (req, res) => {
  try {
    const slug = req.params.slug
    const record = await getLinkBySlug(slug)

    if (!record) {
      return res.status(404).send('Not Found')
    }

    const { link, destinations } = record
    const { device, ua } = detectDevice(req)

    const picked = pickDestination({
      primaryUrl: link.primary_url,
      mode: link.mode,
      destinations,
    })

    let targetUrl = picked
    if (isShopeeShortUrl(targetUrl)) {
      targetUrl = await expandShopeeShortUrl(targetUrl)
    }

    // Track click
    const referrer = req.headers['referer'] || req.headers['referrer'] || ''
    const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || req.socket.remoteAddress || ''
    const ipHash = ip ? sha256(ip) : null
    await incrementCounters(link.id, device)
    await insertClickEvent({ shortLinkId: link.id, slug, device, referrer, ua, ipHash })

    // Detect app type from URL
    const appType = detectAppType(targetUrl)
    const appConfig = APP_CONFIGS[appType] || {
      name: 'App',
      icon: '🔗',
      color1: '#667eea',
      color2: '#764ba2',
      androidPackage: null,
      iosScheme: null
    }

    // Build app URLs
    const parsedUrl = new URL(targetUrl)
    const iosScheme = appConfig.iosScheme ? `${appConfig.iosScheme}app/open?url=${encodeURIComponent(targetUrl)}` : targetUrl
    const intentUrl = appConfig.androidPackage 
      ? `intent://${parsedUrl.host}${parsedUrl.pathname}${parsedUrl.search}#Intent;scheme=https;package=${appConfig.androidPackage};S.browser_fallback_url=${encodeURIComponent(targetUrl)};end`
      : targetUrl

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Redirect-Mode', 'deeplink')
    res.setHeader('X-App-Type', appType)

    // Aggressive deep link landing page
    return res.status(200).send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <title>Opening ${escapeHtml(appConfig.name)}...</title>
  <meta property="og:title" content="${escapeHtml(link.og_title || appConfig.name + ' Link')}" />
  <meta property="og:description" content="${escapeHtml(link.og_description || 'Tap to open in ' + appConfig.name + ' app')}" />
  <meta property="og:url" content="${escapeHtml(targetUrl)}" />
  ${link.og_image_url ? `<meta property="og:image" content="${escapeHtml(link.og_image_url)}" />
  <meta property="og:image:width" content="940" />
  <meta property="og:image:height" content="788" />` : ''}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-height: 100vh; background: linear-gradient(135deg, ${appConfig.color1} 0%, ${appConfig.color2} 100%); display: flex; align-items: center; justify-content: center; }
    .container { text-align: center; padding: 32px 24px; width: 100%; max-width: 400px; }
    .logo { width: 100px; height: 100px; background: white; border-radius: 24px; margin: 0 auto 28px; display: flex; align-items: center; justify-content: center; font-size: 56px; box-shadow: 0 12px 40px rgba(0,0,0,0.25); animation: pulse 2s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    h1 { color: white; font-size: 26px; margin-bottom: 12px; font-weight: 700; }
    p { color: rgba(255,255,255,0.9); font-size: 16px; margin-bottom: 36px; line-height: 1.6; }
    .btn { display: block; width: 100%; padding: 18px 28px; background: white; color: ${appConfig.color1}; border-radius: 16px; text-decoration: none; font-weight: 800; font-size: 18px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); margin-bottom: 14px; transition: transform 0.2s; }
    .btn:active { transform: scale(0.98); }
    .btn-secondary { background: rgba(255,255,255,0.2); color: white; box-shadow: none; border: 2px solid rgba(255,255,255,0.4); font-weight: 600; }
    .loading { display: inline-block; width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .hide { display: none !important; }
    .timer { color: rgba(255,255,255,0.7); font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">${appConfig.icon}</div>
    <div class="loading" id="loader"></div>
    <h1 id="title">Opening ${escapeHtml(appConfig.name)} App...</h1>
    <p id="desc">Please wait, we're taking you to ${escapeHtml(appConfig.name)}...</p>
    <a href="${escapeHtml(targetUrl)}" class="btn" id="openBtn" style="display:none;">${appConfig.icon} Open ${escapeHtml(appConfig.name)} Now</a>
    <a href="${escapeHtml(targetUrl)}" class="btn btn-secondary" id="webBtn" style="display:none;">🌐 Open in Browser</a>
    <div class="timer" id="timer"></div>
  </div>
  
  <script>
    (function() {
      var intentUrl = ${JSON.stringify(intentUrl)};
      var schemeUrl = ${JSON.stringify(iosScheme)};
      var webUrl = ${JSON.stringify(targetUrl)};
      var appName = ${JSON.stringify(appConfig.name)};
      var ua = navigator.userAgent || '';
      var isAndroid = /android/i.test(ua);
      var isIOS = /iphone|ipad|ipod/i.test(ua);
      var isFB = /FBAN|FBAV/i.test(ua);
      var isIG = /Instagram/i.test(ua);
      var attempts = 0;
      var maxAttempts = 3;
      
      function showButtons() {
        document.getElementById('loader').classList.add('hide');
        document.getElementById('title').textContent = 'Tap to Open ' + appName;
        document.getElementById('desc').textContent = 'Tap the button below to open ' + appName + ' app directly';
        document.getElementById('openBtn').style.display = 'block';
        document.getElementById('webBtn').style.display = 'block';
        document.getElementById('timer').textContent = '';
        
        if (isAndroid) {
          document.getElementById('openBtn').href = intentUrl;
        } else if (isIOS) {
          document.getElementById('openBtn').href = schemeUrl;
        }
      }
      
      function tryOpenApp() {
        attempts++;
        
        if (isAndroid) {
          // Android: Try Intent URL first (best for Facebook WebView)
          var iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = intentUrl;
          document.body.appendChild(iframe);
          
          // Also try direct location change
          setTimeout(function() {
            window.location.href = intentUrl;
          }, 100);
          
        } else if (isIOS) {
          // iOS: Try scheme URL
          window.location.href = schemeUrl;
          
          // Fallback: try opening in new window
          setTimeout(function() {
            var a = document.createElement('a');
            a.href = schemeUrl;
            a.click();
          }, 300);
          
        } else {
          // Desktop: Direct to web
          window.location.href = webUrl;
          return;
        }
        
        // Show buttons after delay
        setTimeout(function() {
          if (attempts < maxAttempts) {
            document.getElementById('timer').textContent = 'Retrying... (' + attempts + '/' + maxAttempts + ')';
            tryOpenApp();
          } else {
            showButtons();
          }
        }, 1200);
      }
      
      // Start immediately
      tryOpenApp();
      
    })();
  </script>
</body>
</html>`)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return res.status(500).send(message)
  }
})
