import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { nanoid } from 'nanoid'

import { linksRouter } from './routes/links.js'
import { uploadsRouter } from './routes/uploads.js'
import { redirectRouter } from './routes/redirect.js'
import { authRouter } from './routes/auth.js'
import { createLink } from './db/links.js'

const app = express()

app.disable('x-powered-by')

app.use(cors())
app.use(cookieParser())
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '6mb' }))

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SADDAM Shortlink</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; min-height: 100vh; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: #fff; }
    .container { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
    .logo { width: 80px; height: 80px; background: linear-gradient(135deg, #f59e0b, #fbbf24); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 24px; box-shadow: 0 20px 40px rgba(245,158,11,0.3); }
    h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 12px; background: linear-gradient(135deg, #fff, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    p { font-size: 1.1rem; opacity: 0.8; margin-bottom: 40px; text-align: center; max-width: 500px; }
    .buttons { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; }
    .btn { display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; border-radius: 14px; font-size: 1rem; font-weight: 600; text-decoration: none; transition: all 0.3s ease; border: none; cursor: pointer; }
    .btn-primary { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #111; box-shadow: 0 10px 30px rgba(245,158,11,0.3); }
    .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(245,158,11,0.4); }
    .btn-secondary { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px); }
    .btn-secondary:hover { background: rgba(255,255,255,0.15); transform: translateY(-3px); }
    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 60px; max-width: 800px; width: 100%; }
    .feature { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; text-align: center; backdrop-filter: blur(10px); }
    .feature-icon { font-size: 32px; margin-bottom: 12px; }
    .feature h3 { font-size: 1rem; margin-bottom: 8px; }
    .feature p { font-size: 0.85rem; opacity: 0.7; margin-bottom: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🔗</div>
    <h1>SADDAM Shortlink</h1>
    <p>Create short links with custom OG images for Shopee affiliate marketing. Direct app open from Facebook!</p>
    <div class="buttons">
      <a href="/deeplink" class="btn btn-primary">🚀 Deep Link Generator</a>
      <a href="/link-master" class="btn btn-secondary">🛒 Link Master</a>
      <a href="/admin" class="btn btn-secondary">⚙️ Admin Panel</a>
    </div>
    <div class="features">
      <div class="feature">
        <div class="feature-icon">⚡</div>
        <h3>Instant Conversion</h3>
        <p>Convert Shopee links in seconds</p>
      </div>
      <div class="feature">
        <div class="feature-icon">📱</div>
        <h3>Direct App Open</h3>
        <p>Opens Shopee app from Facebook</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🖼️</div>
        <h3>Custom OG Images</h3>
        <p>Beautiful social previews</p>
      </div>
    </div>
  </div>
</body>
</html>`)
})

app.get('/link-master', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>👑 Link Master - 3 Steps to Success</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; min-height: 100vh; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: #fff; }
    header { border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); backdrop-filter: blur(12px); }
    .header-inner { max-width: 900px; margin: 0 auto; padding: 16px 20px; display: flex; align-items: center; gap: 12px; }
    .header-logo { font-size: 28px; }
    .header-title { font-size: 1.25rem; font-weight: 700; }
    .header-sub { font-size: 0.75rem; color: rgba(255,255,255,0.6); }
    .back-btn { margin-left: auto; padding: 8px 16px; background: rgba(255,255,255,0.1); border-radius: 8px; text-decoration: none; color: #fff; font-size: 0.875rem; }
    .back-btn:hover { background: rgba(255,255,255,0.2); }
    main { max-width: 900px; margin: 0 auto; padding: 32px 20px; }
    .hero { text-align: center; margin-bottom: 32px; }
    .hero h2 { font-size: 1.8rem; font-weight: 700; margin-bottom: 10px; background: linear-gradient(90deg, #ffd700, #ffaa00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { font-size: 0.95rem; color: rgba(255,255,255,0.7); }
    .steps-container { display: flex; flex-direction: column; gap: 20px; }
    .step-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 24px; }
    .step-card.step1 { border-color: rgba(139,92,246,0.5); background: rgba(139,92,246,0.1); }
    .step-card.step2 { border-color: rgba(24,119,242,0.5); background: rgba(24,119,242,0.1); }
    .step-card.step3 { border-color: rgba(238,77,45,0.5); background: rgba(238,77,45,0.1); }
    .step-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .step-num { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700; }
    .step-card.step1 .step-num { background: #8b5cf6; }
    .step-card.step2 .step-num { background: #1877f2; }
    .step-card.step3 .step-num { background: #ee4d2d; }
    .step-title { font-weight: 700; font-size: 1.1rem; }
    .step-desc { font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-bottom: 16px; }
    input[type="url"] { width: 100%; padding: 14px 16px; border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; font-size: 1rem; background: rgba(0,0,0,0.3); color: #fff; }
    input:focus { outline: none; border-color: #ffd700; }
    input::placeholder { color: rgba(255,255,255,0.4); }
    .input-row { display: flex; gap: 12px; }
    .input-row input { flex: 1; }
    .btn { padding: 14px 24px; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-purple { background: #8b5cf6; color: #fff; }
    .btn-purple:hover { background: #7c3aed; }
    .btn-copy { background: rgba(255,255,255,0.15); color: #fff; }
    .btn-copy:hover { background: rgba(255,255,255,0.25); }
    .btn-generate { width: 100%; padding: 16px; background: linear-gradient(90deg, #ffd700, #ffaa00); color: #000; font-size: 1.1rem; font-weight: 700; margin-top: 12px; }
    .btn-generate:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,215,0,0.3); }
    .output { margin-top: 16px; padding: 16px; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.4); border-radius: 12px; }
    .output-label { color: #22c55e; font-weight: 600; margin-bottom: 10px; display: block; font-size: 0.9rem; }
    .output-row { display: flex; gap: 10px; }
    .output-row input { flex: 1; background: rgba(0,0,0,0.4); border-color: rgba(34,197,94,0.3); font-size: 0.9rem; }
    .btn-green { background: #22c55e; color: #fff; }
    .btn-green:hover { background: #16a34a; }
    .output-tip { margin-top: 10px; font-size: 0.75rem; color: rgba(255,255,255,0.5); }
    .arrow-down { text-align: center; font-size: 1.5rem; color: rgba(255,255,255,0.3); margin: -8px 0; }
    .error { color: #ef4444; font-size: 0.85rem; margin-top: 10px; padding: 12px; background: rgba(239,68,68,0.1); border-radius: 8px; }
    .final-output { margin-top: 24px; padding: 24px; background: rgba(255,215,0,0.1); border: 2px solid rgba(255,215,0,0.4); border-radius: 16px; }
    .final-label { color: #ffd700; font-weight: 700; margin-bottom: 12px; display: block; font-size: 1rem; }
    .hide { display: none !important; }
    footer { border-top: 1px solid rgba(255,255,255,0.1); padding: 20px; text-align: center; margin-top: 40px; }
    footer p { font-size: 0.75rem; color: rgba(255,255,255,0.4); }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <div class="header-logo">👑</div>
      <div>
        <div class="header-title">Link Master</div>
        <div class="header-sub">3 Steps to Maximum Affiliate Conversions</div>
      </div>
      <a href="/" class="back-btn">← Back</a>
    </div>
  </header>

  <main>
    <div class="hero">
      <h2>👑 Link Master System</h2>
      <p>Create shortlink → Post on Facebook → Combine with Shopee = Maximum Profit!</p>
    </div>

    <div class="steps-container">
      <!-- STEP 1: Create Shortlink -->
      <div class="step-card step1">
        <div class="step-header">
          <span class="step-num">1</span>
          <span class="step-title">🔗 Create Shortlink First</span>
        </div>
        <p class="step-desc">Paste any URL to create a shortlink. Use this shortlink for your Facebook post.</p>
        <input type="url" id="any-url" placeholder="Paste any URL here..." style="margin-bottom:12px;" />
        
        <div class="slug-options" style="margin-bottom:12px;">
          <label style="font-size:0.85rem; color:rgba(255,255,255,0.8); margin-bottom:8px; display:block;">Slug Option:</label>
          <div style="display:flex; gap:16px; margin-bottom:10px;">
            <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:0.9rem;">
              <input type="radio" name="slug-type" value="auto" checked style="accent-color:#8b5cf6;" />
              <span>🎲 Auto Slug</span>
            </label>
            <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:0.9rem;">
              <input type="radio" name="slug-type" value="manual" style="accent-color:#8b5cf6;" />
              <span>✏️ Manual Slug</span>
            </label>
          </div>
          <div id="manual-slug-box" class="hide" style="margin-top:8px;">
            <input type="text" id="manual-slug" placeholder="Enter custom slug (min 2 characters)" style="width:100%; padding:12px 14px; border:1px solid rgba(139,92,246,0.5); border-radius:10px; background:rgba(139,92,246,0.15); color:#fff; font-size:0.95rem;" />
            <p style="font-size:0.7rem; color:rgba(255,255,255,0.5); margin-top:6px;">⚠️ Letters, numbers only. Min 2 characters. Spaces auto-convert to dash (-).</p>
          </div>
        </div>
        
        <button class="btn btn-purple" id="btn-step1" style="width:100%;">🔗 Create Shortlink</button>
        <div id="step1-output" class="output hide">
          <span class="output-label">✅ Shortlink Created!</span>
          <div class="output-row">
            <input type="url" id="step1-result" readonly />
            <button class="btn btn-copy" id="copy-step1">📋 Copy</button>
          </div>
          <p class="output-tip">📱 Post this shortlink on your Facebook page, then continue to Step 2</p>
        </div>
        <div id="step1-error" class="error hide"></div>
      </div>

      <div class="arrow-down">↓</div>

      <!-- STEP 2: Post on Facebook -->
      <div class="step-card step2">
        <div class="step-header">
          <span class="step-num">2</span>
          <span class="step-title">📘 Post on Facebook</span>
        </div>
        <p class="step-desc">Post the shortlink from Step 1 on your Facebook page. Then copy the Facebook post URL for Step 3.</p>
        <div style="background:rgba(24,119,242,0.2); border-radius:10px; padding:14px; font-size:0.85rem; color:rgba(255,255,255,0.8);">
          💡 <strong>Tip:</strong> After posting, click on the post's timestamp to get the direct URL.
        </div>
      </div>

      <div class="arrow-down">↓</div>

      <!-- STEP 3: Create Link Master -->
      <div class="step-card step3">
        <div class="step-header">
          <span class="step-num">3</span>
          <span class="step-title">👑 Create Link Master</span>
        </div>
        <p class="step-desc">Enter both URLs below to create your Link Master.</p>
        
        <label style="font-size:0.8rem; color:rgba(255,255,255,0.7); margin-bottom:6px; display:block;">📘 Facebook Post URL (from Step 2) <span style="color:#ef4444;">*Required</span></label>
        <input type="url" id="fb-url-final" placeholder="Paste your Facebook post URL here..." style="margin-bottom:14px;" />
        
        <label style="font-size:0.8rem; color:rgba(255,255,255,0.7); margin-bottom:6px; display:block;">🛒 Shopee Affiliate URL (Final Destination) <span style="color:#ef4444;">*Required</span></label>
        <input type="url" id="shopee-url" placeholder="https://shopee.com.my/... or https://s.shopee.com.my/..." />
        
        <div id="final-error" class="error hide"></div>
        <button class="btn btn-generate" id="btn-final">👑 Create Link Master</button>
        
        <div id="final-output" class="final-output hide">
          <span class="final-label">👑 Link Master Ready!</span>
          <div class="output-row">
            <input type="url" id="final-result" readonly />
            <button class="btn btn-green" id="copy-final">📋 Copy</button>
          </div>
          <p class="output-tip">🎯 Share this link anywhere! Shows Facebook preview → Opens Shopee app!</p>
        </div>
      </div>
    </div>
  </main>

  <footer>
    <p>© 2024 Link Master. Maximize your Shopee affiliate conversions.</p>
  </footer>

  <script>
    // Toggle manual slug input
    document.querySelectorAll('input[name="slug-type"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const manualBox = document.getElementById('manual-slug-box');
        if (e.target.value === 'manual') {
          manualBox.classList.remove('hide');
        } else {
          manualBox.classList.add('hide');
          document.getElementById('manual-slug').value = '';
        }
      });
    });
    
    // Auto-convert spaces to dashes in manual slug
    document.getElementById('manual-slug').addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/ /g, '-').toLowerCase();
    });

    // Step 1: Create basic shortlink
    document.getElementById('btn-step1').addEventListener('click', async () => {
      const url = document.getElementById('any-url').value.trim();
      const slugType = document.querySelector('input[name="slug-type"]:checked').value;
      const manualSlug = document.getElementById('manual-slug').value.trim().toLowerCase();
      const btn = document.getElementById('btn-step1');
      const output = document.getElementById('step1-output');
      const result = document.getElementById('step1-result');
      const error = document.getElementById('step1-error');
      
      error.classList.add('hide');
      output.classList.add('hide');
      
      if (!url) {
        error.textContent = 'Please enter a URL';
        error.classList.remove('hide');
        return;
      }
      
      // Validate manual slug
      if (slugType === 'manual') {
        if (!manualSlug) {
          error.textContent = 'Please enter a custom slug';
          error.classList.remove('hide');
          return;
        }
        if (manualSlug.length < 2) {
          error.textContent = 'Slug must be at least 2 characters';
          error.classList.remove('hide');
          return;
        }
        if (!/^[a-z0-9-]+$/.test(manualSlug)) {
          error.textContent = 'Slug can only contain letters, numbers, and dash (-)';
          error.classList.remove('hide');
          return;
        }
      }
      
      btn.disabled = true;
      btn.textContent = '⏳ Creating...';
      
      try {
        const payload = { url };
        if (slugType === 'manual') {
          payload.custom_slug = manualSlug;
        }
        
        const res = await fetch('/api/shortlink', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        result.value = data.url;
        output.classList.remove('hide');
      } catch (e) {
        error.textContent = e.message;
        error.classList.remove('hide');
      } finally {
        btn.disabled = false;
        btn.textContent = '🔗 Create Shortlink';
      }
    });
    
    document.getElementById('copy-step1').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('step1-result').value);
      document.getElementById('copy-step1').textContent = '✓ Copied!';
      setTimeout(() => { document.getElementById('copy-step1').textContent = '📋 Copy'; }, 2000);
    });

    // Final Step: Create Link Master
    document.getElementById('btn-final').addEventListener('click', async () => {
      const fbUrl = document.getElementById('fb-url-final').value.trim();
      const shopeeUrl = document.getElementById('shopee-url').value.trim();
      const btn = document.getElementById('btn-final');
      const output = document.getElementById('final-output');
      const result = document.getElementById('final-result');
      const error = document.getElementById('final-error');
      
      error.classList.add('hide');
      output.classList.add('hide');
      
      if (!fbUrl) {
        error.textContent = 'Please enter your Facebook post URL (Step 2)';
        error.classList.remove('hide');
        return;
      }
      
      if (!fbUrl.includes('facebook.com') && !fbUrl.includes('fb.com') && !fbUrl.includes('fb.me')) {
        error.textContent = 'Please enter a valid Facebook URL';
        error.classList.remove('hide');
        return;
      }
      
      if (!shopeeUrl) {
        error.textContent = 'Please enter your Shopee affiliate URL';
        error.classList.remove('hide');
        return;
      }
      
      if (!shopeeUrl.includes('shopee')) {
        error.textContent = 'Please enter a valid Shopee URL';
        error.classList.remove('hide');
        return;
      }
      
      btn.disabled = true;
      btn.textContent = '⏳ Creating...';
      
      try {
        const res = await fetch('/api/link-master', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ facebook_url: fbUrl, shopee_url: shopeeUrl })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        result.value = data.url;
        output.classList.remove('hide');
      } catch (e) {
        error.textContent = e.message;
        error.classList.remove('hide');
      } finally {
        btn.disabled = false;
        btn.textContent = '👑 Create Link Master';
      }
    });
    
    document.getElementById('copy-final').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('final-result').value);
      document.getElementById('copy-final').textContent = '✓ Copied!';
      setTimeout(() => { document.getElementById('copy-final').textContent = '📋 Copy'; }, 2000);
    });
  </script>
</body>
</html>`)
})

app.get('/go', (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('Missing url parameter');
  }
  const decoded = decodeURIComponent(url);
  if (!decoded.includes('shopee.') && !decoded.includes('shp.ee') && !decoded.includes('s.shopee')) {
    return res.status(400).send('Invalid Shopee link');
  }
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Opening Shopee...</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, sans-serif; min-height: 100vh; background: linear-gradient(135deg, #fff7ed, #ffedd5); display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { text-align: center; }
    .spinner { width: 64px; height: 64px; background: #f97316; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; animation: pulse 1s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .spinner svg { width: 32px; height: 32px; animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    h2 { font-size: 1.5rem; color: #111; margin-bottom: 8px; }
    p { color: #666; margin-bottom: 24px; }
    .tip { max-width: 400px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; text-align: left; }
    .tip p { font-size: 0.875rem; color: #1e40af; margin: 0; }
    .error { display: none; max-width: 400px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; }
    .error p { color: #dc2626; font-size: 0.875rem; margin: 0 0 12px; }
    .error a { display: inline-block; padding: 10px 20px; background: #dc2626; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner">
      <svg viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" stroke="rgba(255,255,255,0.3)" stroke-width="5" fill="none"/>
        <circle cx="25" cy="25" r="20" stroke="#fff" stroke-width="5" fill="none" stroke-dasharray="100" stroke-dashoffset="75"/>
      </svg>
    </div>
    <h2 id="status">Opening Shopee...</h2>
    <p>Redirecting you to the Shopee app</p>
    <div class="tip" id="tip">
      <p><strong>If nothing happens:</strong> Make sure you have the Shopee app installed. The page will redirect in a moment.</p>
    </div>
    <div class="error" id="error">
      <p id="error-msg"></p>
      <a href="/">← Back to Home</a>
    </div>
  </div>
  <script>
    const targetUrl = decodeURIComponent('${encodeURIComponent(decoded)}');
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    function showError(msg) {
      document.getElementById('tip').style.display = 'none';
      document.getElementById('error').style.display = 'block';
      document.getElementById('error-msg').textContent = msg;
    }

    try {
      if (isIOS) {
        const link = document.createElement('a');
        link.href = 'shopee://';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => { window.location.href = targetUrl; }, 1500);
      } else if (isAndroid) {
        window.location.href = targetUrl;
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = 'shopee://' + targetUrl.replace(/^https?:\/\//, '');
          link.click();
        }, 500);
      } else {
        window.location.href = targetUrl;
      }
    } catch (err) {
      showError('Error: ' + err.message);
    }
  </script>
</body>
</html>`);
})

app.get('/admin', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SADDAM Shortlink</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 0; }
    .bg { min-height: 100vh; background: radial-gradient(1200px 600px at 10% 0%, rgba(255,215,0,.10), transparent 50%), radial-gradient(900px 500px at 90% 10%, rgba(59,130,246,.18), transparent 60%), linear-gradient(180deg, rgba(17,24,39,1), rgba(3,7,18,1)); padding: 28px 16px; }
    .wrap { max-width: 1040px; margin: 0 auto; }
    .brand { display:flex; align-items:center; justify-content:space-between; gap: 12px; margin-bottom: 16px; }
    .brand h1 { font-size: 18px; margin: 0; letter-spacing: .5px; }
    .chip { font-size: 12px; opacity: .85; border: 1px solid rgba(255,255,255,.14); padding: 6px 10px; border-radius: 999px; background: rgba(255,255,255,.06); }
    .grid { display:grid; grid-template-columns: 1.05fr .95fr; gap: 14px; }
    @media (max-width: 900px){ .grid { grid-template-columns: 1fr; } }
    .card { border: 1px solid rgba(255,255,255,.12); border-radius: 16px; padding: 16px; margin: 12px 0; background: rgba(255,255,255,.06); backdrop-filter: blur(12px); box-shadow: 0 14px 35px rgba(0,0,0,.35); }
    h2 { margin:0 0 10px; font-size: 15px; }
    label { display: block; font-size: 12px; opacity: .85; margin: 10px 0 6px; }
    input, textarea, select { width: 100%; padding: 11px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,.14); background: rgba(0,0,0,.15); color: inherit; }
    textarea { min-height: 84px; resize: vertical; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    button { padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.08); cursor: pointer; color: inherit; }
    button.primary { background: linear-gradient(135deg, #f59e0b, #fbbf24); border-color: rgba(255,255,255,.0); color: #111827; font-weight: 700; }
    button.ghost { background: transparent; }
    .actions { display: flex; gap: 10px; align-items: center; margin-top: 12px; flex-wrap: wrap; }
    .muted { opacity: .78; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 10px; border-bottom: 1px solid rgba(255,255,255,.10); font-size: 13px; vertical-align: top; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .status { white-space: pre-wrap; font-size: 12px; }
    .ogThumb { width: 320px; height: 320px; object-fit: contain; background: white; border: 1px solid rgba(0,0,0,.15); border-radius: 12px; display: block; }
    .hide { display: none; }
  </style>
</head>
<body>
  <div class="bg">
    <div class="wrap">
      <div class="brand">
        <h1>SADDAM_Shortlink</h1>
        <div class="chip" id="meChip">Not signed in</div>
      </div>

      <div class="grid">
        <div>
          <div class="card" id="authCard">
            <h2>Sign in</h2>
            <div class="row">
              <div>
                <label>User ID</label>
                <input id="authUser" type="text" placeholder="your_id" autocomplete="username" />
              </div>
              <div>
                <label>Password</label>
                <input id="authPass" type="password" placeholder="••••••••" autocomplete="current-password" />
              </div>
            </div>
            <div class="actions">
              <button id="login" class="primary" type="button">Login</button>
              <button id="register" type="button">Register</button>
              <span class="muted">Public register enabled.</span>
            </div>
            <span id="authStatus" class="status"></span>
          </div>

          <div class="card hide" id="createCard">
            <h2>🚀 App Linking for Marketers</h2>
            <p class="muted" style="margin-bottom:16px">Instantly create deep links for any app. No SDK required.</p>
            
            <label>Select App</label>
            <div class="app-grid" style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:16px;">
              <button type="button" class="app-btn selected" data-app="shopee" style="padding:12px 8px; border-radius:10px; border:2px solid rgba(255,255,255,.2); background:rgba(238,77,45,0.2); cursor:pointer; text-align:center; transition:all .2s;">
                <div style="font-size:24px;">🛒</div>
                <div style="font-size:11px; margin-top:4px; color:inherit;">Shopee</div>
              </button>
              <button type="button" class="app-btn" data-app="lazada" style="padding:12px 8px; border-radius:10px; border:2px solid rgba(255,255,255,.1); background:rgba(255,255,255,.05); cursor:pointer; text-align:center; transition:all .2s;">
                <div style="font-size:24px;">🛍️</div>
                <div style="font-size:11px; margin-top:4px; color:inherit;">Lazada</div>
              </button>
              <button type="button" class="app-btn" data-app="tiktok" style="padding:12px 8px; border-radius:10px; border:2px solid rgba(255,255,255,.1); background:rgba(255,255,255,.05); cursor:pointer; text-align:center; transition:all .2s;">
                <div style="font-size:24px;">🎵</div>
                <div style="font-size:11px; margin-top:4px; color:inherit;">TikTok</div>
              </button>
              <button type="button" class="app-btn" data-app="instagram" style="padding:12px 8px; border-radius:10px; border:2px solid rgba(255,255,255,.1); background:rgba(255,255,255,.05); cursor:pointer; text-align:center; transition:all .2s;">
                <div style="font-size:24px;">📸</div>
                <div style="font-size:11px; margin-top:4px; color:inherit;">Instagram</div>
              </button>
              <button type="button" class="app-btn" data-app="facebook" style="padding:12px 8px; border-radius:10px; border:2px solid rgba(255,255,255,.1); background:rgba(255,255,255,.05); cursor:pointer; text-align:center; transition:all .2s;">
                <div style="font-size:24px;">📘</div>
                <div style="font-size:11px; margin-top:4px; color:inherit;">Facebook</div>
              </button>
              <button type="button" class="app-btn" data-app="youtube" style="padding:12px 8px; border-radius:10px; border:2px solid rgba(255,255,255,.1); background:rgba(255,255,255,.05); cursor:pointer; text-align:center; transition:all .2s;">
                <div style="font-size:24px;">▶️</div>
                <div style="font-size:11px; margin-top:4px; color:inherit;">YouTube</div>
              </button>
              <button type="button" class="app-btn" data-app="twitter" style="padding:12px 8px; border-radius:10px; border:2px solid rgba(255,255,255,.1); background:rgba(255,255,255,.05); cursor:pointer; text-align:center; transition:all .2s;">
                <div style="font-size:24px;">🐦</div>
                <div style="font-size:11px; margin-top:4px; color:inherit;">X/Twitter</div>
              </button>
            </div>
            
            <label id="deepLinkUrlLabel">Destination URL</label>
            <input id="primaryUrl" type="url" placeholder="Paste your app link here..." />
            <p class="muted" id="deepLinkHint" style="margin:6px 0 16px; font-size:11px;">Supports: shopee.com.my, s.shopee.com.my</p>
            
            <div style="border-top:1px solid rgba(255,255,255,.1); padding-top:16px; margin-top:8px;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; cursor:pointer;" onclick="document.getElementById('advancedOptions').classList.toggle('hide'); this.querySelector('span').textContent = document.getElementById('advancedOptions').classList.contains('hide') ? '▶' : '▼';">
                <span style="font-size:10px;">▶</span>
                <label style="margin:0; cursor:pointer; font-size:12px;">Advanced Options (OG Image for Social Preview)</label>
              </div>
              <div id="advancedOptions" class="hide">
                <div class="row" style="margin-bottom:12px;">
                  <div>
                    <label style="font-size:11px;">OG Title</label>
                    <input id="ogTitle" type="text" placeholder="Preview title" style="padding:8px 10px;" />
                  </div>
                  <div>
                    <label style="font-size:11px;">OG Description</label>
                    <input id="ogDescription" type="text" placeholder="Preview description" style="padding:8px 10px;" />
                  </div>
                </div>
                <div class="row">
                  <div>
                    <label style="font-size:11px;">Upload Image</label>
                    <input id="ogImageFile" type="file" accept="image/*" style="padding:6px;" />
                  </div>
                  <div>
                    <label style="font-size:11px;">&nbsp;</label>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <button id="uploadImage" type="button" style="padding:8px 12px;">Upload</button>
                      <span class="muted" style="font-size:10px;">1200×630px</span>
                    </div>
                  </div>
                </div>
                <input id="ogImageUrl" type="hidden" />
              </div>
            </div>
            
            <div class="actions" style="margin-top:16px;">
              <button id="create" class="primary" type="button">⚡ Create Deep Link</button>
              <button id="refresh" type="button">Refresh</button>
              <button id="logout" class="ghost" type="button">Logout</button>
            </div>
            
            <div id="createResult" class="hide" style="margin-top:16px; padding:16px; background:rgba(34,197,94,0.15); border:1px solid rgba(34,197,94,0.3); border-radius:12px;">
              <label style="color:#22c55e; margin:0 0 8px; display:block;">✅ Deep Link Ready!</label>
              <input id="createdLinkOutput" type="text" readonly style="background:rgba(0,0,0,0.3); margin-bottom:8px;" />
              <div style="display:flex; gap:8px;">
                <button id="copyCreatedLink" type="button">📋 Copy Link</button>
                <a id="testCreatedLink" href="#" target="_blank" style="padding:10px 14px; border-radius:12px; background:rgba(255,255,255,.08); color:inherit; text-decoration:none; font-size:13px; border:1px solid rgba(255,255,255,.14);">🧪 Test</a>
              </div>
              <p class="muted" style="margin-top:10px; font-size:11px;">📱 Share on Facebook, Instagram, WhatsApp - Opens app directly!</p>
            </div>
            <span id="status" class="status" style="margin-top:10px; display:block;"></span>
          </div>

          <div class="card hide" id="linkMasterCard">
            <h2>👑 Link Master</h2>
            <p class="muted" style="margin-bottom:16px">Facebook Post + Shopee Affiliate = Maximum Reach!</p>
            
            <div style="background:rgba(24,119,242,0.1); border:1px solid rgba(24,119,242,0.3); border-radius:12px; padding:16px; margin-bottom:16px;">
              <label style="color:#1877f2; margin-bottom:8px; display:block;">📘 Step 1: Facebook Post URL</label>
              <input id="lmFacebookUrl" type="url" placeholder="https://www.facebook.com/..." style="margin-bottom:8px;" />
              <p class="muted" style="font-size:10px; margin:0;">Paste the Facebook post URL that contains your product promotion</p>
            </div>
            
            <div style="background:rgba(238,77,45,0.1); border:1px solid rgba(238,77,45,0.3); border-radius:12px; padding:16px; margin-bottom:16px;">
              <label style="color:#ee4d2d; margin-bottom:8px; display:block;">🛒 Step 2: Shopee Affiliate URL</label>
              <input id="lmShopeeUrl" type="url" placeholder="https://shopee.com.my/... or https://s.shopee.com.my/..." style="margin-bottom:8px;" />
              <p class="muted" style="font-size:10px; margin:0;">This is where users will be redirected (opens Shopee app directly)</p>
            </div>
            
            <div class="actions">
              <button id="createLinkMaster" class="primary" type="button">👑 Create Link Master</button>
            </div>
            
            <div id="linkMasterResult" class="hide" style="margin-top:16px; padding:16px; background:rgba(255,215,0,0.15); border:1px solid rgba(255,215,0,0.4); border-radius:12px;">
              <label style="color:#ffd700; margin:0 0 8px; display:block;">👑 Link Master Ready!</label>
              <input id="linkMasterOutput" type="text" readonly style="background:rgba(0,0,0,0.3); margin-bottom:8px;" />
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button id="copyLinkMaster" type="button">📋 Copy</button>
                <a id="testLinkMaster" href="#" target="_blank" style="padding:10px 14px; border-radius:12px; background:rgba(255,255,255,.08); color:inherit; text-decoration:none; font-size:13px; border:1px solid rgba(255,255,255,.14);">🧪 Test</a>
              </div>
              <p class="muted" style="margin-top:10px; font-size:11px;">✨ Shows Facebook preview → Opens Shopee app!</p>
            </div>
            <span id="linkMasterStatus" class="status" style="margin-top:10px; display:block;"></span>
          </div>
        </div>

        <div>
          <div class="card hide" id="linksCard">
            <h2>Links</h2>
            <div style="overflow:auto">
              <table>
                <thead>
                  <tr>
                    <th>Slug</th>
                    <th>Destination</th>
                    <th>Preview</th>
                    <th>Clicks</th>
                  </tr>
                </thead>
                <tbody id="links"></tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <h2>Base URL</h2>
            <label>Readonly</label>
            <input id="baseUrl" type="text" readonly />
            <div class="muted" style="margin-top:10px">Tip: After you login once, your session is stored securely in a cookie.</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const $ = (id) => document.getElementById(id);
    const baseUrl = window.location.origin;
    $('baseUrl').value = baseUrl;

    function trimTrailingSlash(u) {
      return u && u.endsWith('/') ? u.slice(0, -1) : u;
    }

    function setStatus(msg) {
      $('status').textContent = msg;
    }

    function setAuthStatus(msg) {
      $('authStatus').textContent = msg;
    }

    async function api(path, options = {}) {
      const headers = Object.assign({}, options.headers || {});
      return fetch(path, Object.assign({}, options, { headers, credentials: 'include' }));
    }

    function setSignedIn(user) {
      const signedIn = !!user;
      $('authCard').classList.toggle('hide', signedIn);
      $('createCard').classList.toggle('hide', !signedIn);
      $('linkMasterCard').classList.toggle('hide', !signedIn);
      $('linksCard').classList.toggle('hide', !signedIn);
      $('meChip').textContent = signedIn ? ('Signed in: ' + user.username) : 'Not signed in';
    }

    async function refreshMe() {
      try {
        const res = await api('/api/auth/me', { method: 'GET' });
        const data = await res.json();
        setSignedIn(data && data.user ? data.user : null);
        return data && data.user ? data.user : null;
      } catch {
        setSignedIn(null);
        return null;
      }
    }

    async function loginOrRegister(kind) {
      setAuthStatus(kind === 'login' ? 'Logging in...' : 'Registering...');
      try {
        const username = $('authUser').value.trim();
        const password = $('authPass').value;
        if (!username || !password) throw new Error('User ID and password are required');

        const res = await api('/api/auth/' + kind, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data && data.error ? data.error : 'Auth failed');

        setAuthStatus('');
        await refreshMe();
        await refreshList();
      } catch (e) {
        setAuthStatus(String(e && e.message ? e.message : e));
      }
    }

    async function refreshList() {
      setStatus('Loading...');
      try {
        const res = await api('/api/links', { method: 'GET' });
        const data = await res.json();
        if (!res.ok) throw new Error(data && data.error ? data.error : 'Failed to list links');

        const tbody = $('links');
        tbody.innerHTML = '';
        for (const row of (data.links || [])) {
          const slug = row.slug;
          const shortUrl = trimTrailingSlash(baseUrl) + '/' + encodeURIComponent(slug);
          const clicks = row.short_link_counters ? row.short_link_counters.total_clicks : '';

          const preview =
            (row.og_image_url
              ? '<div style="margin-bottom:6px"><a href="' +
                row.og_image_url +
                '" target="_blank" rel="noreferrer"><img class="ogThumb" src="' +
                row.og_image_url +
                '" alt="OG image" /></a></div>'
              : '') +
            '<div class="muted">' +
            (row.og_image_url ? 'image ' : '') +
            (row.og_title ? 'title ' : '') +
            (row.og_description ? 'desc' : '') +
            '</div>';

          const tr = document.createElement('tr');
          tr.innerHTML =
            '<td><code>' +
            slug +
            '</code><div class="muted"><a href="' +
            shortUrl +
            '" target="_blank" rel="noreferrer">open</a></div></td>' +
            '<td><a href="' +
            row.primary_url +
            '" target="_blank" rel="noreferrer">destination</a></td>' +
            '<td>' +
            preview +
            '</td>' +
            '<td>' +
            (clicks ?? '') +
            '</td>';
          tbody.appendChild(tr);
        }
        setStatus('');
      } catch (e) {
        setStatus(String(e && e.message ? e.message : e));
      }
    }

    // App configurations
    const APP_CONFIG = {
      shopee: { name: 'Shopee', hint: 'Supports: shopee.com.my, s.shopee.com.my', validate: (url) => url.includes('shopee'), color: 'rgba(238,77,45,0.2)' },
      lazada: { name: 'Lazada', hint: 'Supports: lazada.com.my, lzd.co', validate: (url) => url.includes('lazada') || url.includes('lzd.co'), color: 'rgba(13,0,255,0.2)' },
      tiktok: { name: 'TikTok', hint: 'Supports: tiktok.com, vm.tiktok.com', validate: (url) => url.includes('tiktok'), color: 'rgba(0,0,0,0.3)' },
      instagram: { name: 'Instagram', hint: 'Supports: instagram.com', validate: (url) => url.includes('instagram'), color: 'rgba(225,48,108,0.2)' },
      facebook: { name: 'Facebook', hint: 'Supports: facebook.com, fb.me', validate: (url) => url.includes('facebook') || url.includes('fb.'), color: 'rgba(24,119,242,0.2)' },
      youtube: { name: 'YouTube', hint: 'Supports: youtube.com, youtu.be', validate: (url) => url.includes('youtube') || url.includes('youtu.be'), color: 'rgba(255,0,0,0.2)' },
      twitter: { name: 'X/Twitter', hint: 'Supports: twitter.com, x.com', validate: (url) => url.includes('twitter') || url.includes('x.com'), color: 'rgba(0,0,0,0.3)' }
    };
    let selectedApp = 'shopee';

    function updateAppUI() {
      const config = APP_CONFIG[selectedApp];
      if (config) {
        $('deepLinkHint').textContent = config.hint;
      }
      document.querySelectorAll('.app-btn').forEach(btn => {
        const app = btn.dataset.app;
        const isSelected = app === selectedApp;
        btn.style.borderColor = isSelected ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.1)';
        btn.style.background = isSelected ? (APP_CONFIG[app]?.color || 'rgba(255,255,255,.1)') : 'rgba(255,255,255,.05)';
      });
    }

    document.querySelectorAll('.app-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedApp = btn.dataset.app;
        updateAppUI();
        $('createResult').classList.add('hide');
      });
    });

    async function createLink() {
      const url = $('primaryUrl').value.trim();
      const config = APP_CONFIG[selectedApp];
      
      if (!url) {
        setStatus('Please enter a destination URL');
        return;
      }
      
      if (config && !config.validate(url)) {
        setStatus('Please enter a valid ' + config.name + ' link');
        return;
      }

      setStatus('Creating deep link...');
      $('create').disabled = true;
      
      try {
        const payload = {
          mode: 'single',
          primary_url: url,
          og_title: $('ogTitle').value.trim() || (config ? config.name + ' Link' : 'Link'),
          og_description: $('ogDescription').value.trim() || (config ? 'Tap to open in ' + config.name + ' app' : 'Open link'),
          og_image_url: $('ogImageUrl').value.trim() || undefined,
          is_active: true,
        };

        const res = await api('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data && data.error ? data.error : 'Create failed');

        const slug = data.link && data.link.slug ? data.link.slug : '';
        const deepLinkUrl = trimTrailingSlash(baseUrl) + '/go/' + encodeURIComponent(slug);
        
        $('createdLinkOutput').value = deepLinkUrl;
        $('testCreatedLink').href = deepLinkUrl;
        $('createResult').classList.remove('hide');
        setStatus('');
        await refreshList();
      } catch (e) {
        setStatus(String(e && e.message ? e.message : e));
      } finally {
        $('create').disabled = false;
      }
    }

    $('copyCreatedLink').addEventListener('click', () => {
      const url = $('createdLinkOutput').value;
      navigator.clipboard.writeText(url).then(() => {
        $('copyCreatedLink').textContent = '✓ Copied!';
        setTimeout(() => { $('copyCreatedLink').textContent = '📋 Copy Link'; }, 2000);
      });
    });

    // Link Master functionality
    function setLinkMasterStatus(msg) {
      $('linkMasterStatus').textContent = msg;
    }

    async function createLinkMaster() {
      const fbUrl = $('lmFacebookUrl').value.trim();
      const shopeeUrl = $('lmShopeeUrl').value.trim();
      
      if (!fbUrl) {
        setLinkMasterStatus('Please enter Facebook Post URL');
        return;
      }
      
      if (!fbUrl.includes('facebook.com') && !fbUrl.includes('fb.com') && !fbUrl.includes('fb.me')) {
        setLinkMasterStatus('Please enter a valid Facebook URL');
        return;
      }
      
      if (!shopeeUrl) {
        setLinkMasterStatus('Please enter Shopee Affiliate URL');
        return;
      }
      
      if (!shopeeUrl.includes('shopee')) {
        setLinkMasterStatus('Please enter a valid Shopee URL');
        return;
      }

      setLinkMasterStatus('Creating Link Master...');
      $('createLinkMaster').disabled = true;
      
      try {
        const payload = {
          mode: 'single',
          primary_url: shopeeUrl,
          og_title: 'Shopee Deal',
          og_description: 'Tap to view this amazing deal!',
          is_active: true,
          facebook_url: fbUrl
        };

        const res = await api('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data && data.error ? data.error : 'Create failed');

        const slug = data.link && data.link.slug ? data.link.slug : '';
        const linkMasterUrl = trimTrailingSlash(baseUrl) + '/go/' + encodeURIComponent(slug);
        
        $('linkMasterOutput').value = linkMasterUrl;
        $('testLinkMaster').href = linkMasterUrl;
        $('linkMasterResult').classList.remove('hide');
        setLinkMasterStatus('');
        await refreshList();
      } catch (e) {
        setLinkMasterStatus(String(e && e.message ? e.message : e));
      } finally {
        $('createLinkMaster').disabled = false;
      }
    }

    $('createLinkMaster').addEventListener('click', createLinkMaster);
    
    $('copyLinkMaster').addEventListener('click', () => {
      const url = $('linkMasterOutput').value;
      navigator.clipboard.writeText(url).then(() => {
        $('copyLinkMaster').textContent = '✓ Copied!';
        setTimeout(() => { $('copyLinkMaster').textContent = '📋 Copy'; }, 2000);
      });
    });

    $('refresh').addEventListener('click', refreshList);
    $('create').addEventListener('click', createLink);
    $('login').addEventListener('click', () => loginOrRegister('login'));
    $('register').addEventListener('click', () => loginOrRegister('register'));
    $('logout').addEventListener('click', async () => {
      try {
        await api('/api/auth/logout', { method: 'POST' });
      } catch {
        // ignore
      }
      setStatus('');
      setAuthStatus('Logged out.');
      await refreshMe();
    });

    async function uploadOgImage() {
      const fileInput = $('ogImageFile');
      const file = fileInput && fileInput.files ? fileInput.files[0] : null;
      if (!file) {
        setStatus('Select an image file first.');
        return;
      }

      setStatus('Uploading image...');

      try {
        const TARGET_W = 1200;
        const TARGET_H = 630;

        const imgUrl = URL.createObjectURL(file);
        const img = new Image();
        img.decoding = 'async';
        img.src = imgUrl;
        await new Promise((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
        });
        URL.revokeObjectURL(imgUrl);

        const canvas = document.createElement('canvas');
        canvas.width = TARGET_W;
        canvas.height = TARGET_H;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported');

        // Contain (no crop): fit inside 1080x1440 and pad the rest
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, TARGET_W, TARGET_H);

        const scale = Math.min(TARGET_W / img.width, TARGET_H / img.height);
        const dw = Math.round(img.width * scale);
        const dh = Math.round(img.height * scale);
        const dx = Math.round((TARGET_W - dw) / 2);
        const dy = Math.round((TARGET_H - dh) / 2);
        ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dw, dh);

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
        if (!blob) throw new Error('Failed to encode image');

        const buf = await blob.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = '';
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
          binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
        }
        const dataBase64 = btoa(binary);

        const res = await api('/api/uploads/og-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: 'og-image.jpg',
            contentType: 'image/jpeg',
            dataBase64,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data && data.error ? data.error : 'Upload failed');

        $('ogImageUrl').value = data.publicUrl;
        setStatus('Uploaded: ' + data.publicUrl);
      } catch (e) {
        setStatus(String(e && e.message ? e.message : e));
      }
    }

    $('uploadImage').addEventListener('click', uploadOgImage);

    (async () => {
      const user = await refreshMe();
      if (user) {
        await refreshList();
      }
    })();
  </script>
</body>
</html>`)
})

app.get('/deeplink', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Deep Link Generator - Open Shopee App Directly</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 24px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
    .logo { width: 80px; height: 80px; background: linear-gradient(135deg, #ee4d2d, #f53d2d); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 40px; margin: 0 auto 24px; }
    h1 { text-align: center; font-size: 2rem; font-weight: 800; margin-bottom: 8px; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { text-align: center; color: #666; margin-bottom: 32px; }
    .form-group { margin-bottom: 24px; }
    label { display: block; font-weight: 600; margin-bottom: 8px; color: #333; }
    input[type="text"], input[type="url"] { width: 100%; padding: 16px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 1rem; transition: all 0.3s; }
    input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
    .btn { display: block; width: 100%; padding: 18px; background: linear-gradient(135deg, #ee4d2d, #f53d2d); color: white; border: none; border-radius: 12px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: all 0.3s; }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(238,77,45,0.3); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .result { margin-top: 32px; padding: 24px; background: #f0fdf4; border: 2px solid #86efac; border-radius: 16px; display: none; }
    .result.show { display: block; }
    .result h3 { color: #166534; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .result-url { background: white; padding: 16px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 0.9rem; margin-bottom: 16px; border: 1px solid #d1d5db; }
    .copy-btn { background: #166534; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-right: 8px; }
    .copy-btn:hover { background: #14532d; }
    .test-btn { background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }
    .test-btn:hover { background: #5a67d8; }
    .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 32px; padding-top: 32px; border-top: 1px solid #e5e7eb; }
    .feature { text-align: center; padding: 16px; }
    .feature-icon { font-size: 32px; margin-bottom: 8px; }
    .feature h4 { font-size: 0.9rem; color: #333; margin-bottom: 4px; }
    .feature p { font-size: 0.8rem; color: #666; }
    .how-it-works { margin-top: 32px; padding: 24px; background: #f8fafc; border-radius: 16px; }
    .how-it-works h3 { margin-bottom: 16px; color: #333; }
    .steps { display: flex; flex-direction: column; gap: 12px; }
    .step { display: flex; align-items: flex-start; gap: 12px; }
    .step-num { width: 28px; height: 28px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
    .step-text { color: #444; line-height: 1.5; }
    @media (max-width: 640px) { .features { grid-template-columns: 1fr; } .card { padding: 24px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">🚀</div>
      <h1>Deep Link Generator</h1>
      <p class="subtitle">Create links that open Shopee app directly from Facebook, Instagram & more!</p>
      
      <div class="form-group">
        <label for="shopeeUrl">🔗 Shopee Link</label>
        <input type="url" id="shopeeUrl" placeholder="https://shopee.com.my/... or https://s.shopee.com.my/..." />
      </div>
      
      <div class="form-group">
        <label for="customSlug">✨ Custom Slug (optional)</label>
        <input type="text" id="customSlug" placeholder="my-promo" />
      </div>
      
      <button class="btn" id="generateBtn" onclick="generateDeepLink()">⚡ Generate Deep Link</button>
      
      <div class="result" id="result">
        <h3>✅ Deep Link Ready!</h3>
        <div class="result-url" id="resultUrl"></div>
        <button class="copy-btn" onclick="copyLink()">📋 Copy Link</button>
        <a class="test-btn" id="testLink" href="#" target="_blank">🧪 Test Link</a>
      </div>
      
      <div class="features">
        <div class="feature">
          <div class="feature-icon">📱</div>
          <h4>Direct App Open</h4>
          <p>Opens Shopee app without permission prompts</p>
        </div>
        <div class="feature">
          <div class="feature-icon">🎯</div>
          <h4>Smart Detection</h4>
          <p>Auto-detects Android/iOS devices</p>
        </div>
        <div class="feature">
          <div class="feature-icon">📊</div>
          <h4>Click Tracking</h4>
          <p>Track all clicks & conversions</p>
        </div>
      </div>
      
      <div class="how-it-works">
        <h3>🔧 How It Works</h3>
        <div class="steps">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-text"><strong>Paste your Shopee link</strong> - Works with product links, affiliate links, or short links</div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-text"><strong>Generate deep link</strong> - We create a special URL that can open the Shopee app</div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-text"><strong>Share on Facebook</strong> - When users click, they go directly to the Shopee app!</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    async function generateDeepLink() {
      const shopeeUrl = document.getElementById('shopeeUrl').value.trim();
      const customSlug = document.getElementById('customSlug').value.trim();
      const btn = document.getElementById('generateBtn');
      
      if (!shopeeUrl) {
        alert('Please enter a Shopee link');
        return;
      }
      
      if (!shopeeUrl.includes('shopee')) {
        alert('Please enter a valid Shopee link');
        return;
      }
      
      btn.disabled = true;
      btn.textContent = '⏳ Generating...';
      
      try {
        // Create a deep link entry via API
        const res = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            primary_url: shopeeUrl,
            og_title: 'Shopee Deal',
            og_description: 'Tap to open in Shopee app',
            mode: 'single',
            is_active: true
          })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create deep link');
        }
        
        const baseUrl = window.location.origin;
        const deepLinkUrl = baseUrl + '/go/' + data.slug;
        
        document.getElementById('resultUrl').textContent = deepLinkUrl;
        document.getElementById('testLink').href = deepLinkUrl;
        document.getElementById('result').classList.add('show');
        
      } catch (e) {
        alert('Error: ' + e.message);
      } finally {
        btn.disabled = false;
        btn.textContent = '⚡ Generate Deep Link';
      }
    }
    
    function copyLink() {
      const url = document.getElementById('resultUrl').textContent;
      navigator.clipboard.writeText(url).then(() => {
        alert('✅ Link copied to clipboard!');
      }).catch(() => {
        // Fallback
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('✅ Link copied to clipboard!');
      });
    }
  </script>
</body>
</html>`)
})

app.get('/health', (req, res) => {
  return res.json({ ok: true })
})

app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  return res.status(200).send(`User-agent: facebookexternalhit
Allow: /

User-agent: Facebot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /

User-agent: TelegramBot
Allow: /

User-agent: *
Allow: /
`)
})

// Public Shortlink API (no auth required) - Step 1
app.post('/api/shortlink', async (req, res) => {
  try {
    const { url, custom_slug } = req.body
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }
    
    // Validate custom slug if provided
    if (custom_slug) {
      const slug = custom_slug.toLowerCase().trim().replace(/ /g, '-')
      if (slug.length < 2) {
        return res.status(400).json({ error: 'Slug must be at least 2 characters' })
      }
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return res.status(400).json({ error: 'Slug can only contain letters, numbers, and dash (-)' })
      }
      
      // Try to create with custom slug
      try {
        const link = await createLink({
          slug,
          title: 'Shortlink',
          og_title: null,
          og_description: null,
          og_image_url: null,
          is_active: true,
          mode: 'single',
          primary_url: url,
          facebook_url: null,
          android_url: null,
          ios_url: null,
          desktop_url: null,
          utm_defaults: {},
        })
        
        const baseUrl = process.env.BASE_URL || 'https://see--moor.re'
        const resultUrl = baseUrl + '/' + link.slug
        return res.status(201).json({ url: resultUrl, slug: link.slug })
      } catch (err) {
        const code = err && typeof err === 'object' && 'code' in err ? err.code : null
        if (code === '23505') {
          return res.status(400).json({ error: 'Slug "' + slug + '" already exists. Please choose another.' })
        }
        throw err
      }
    }
    
    // Auto-generate slug
    const slugLength = 7
    let link
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const slug = nanoid(slugLength)
        link = await createLink({
          slug,
          title: 'Shortlink',
          og_title: null,
          og_description: null,
          og_image_url: null,
          is_active: true,
          mode: 'single',
          primary_url: url,
          facebook_url: null,
          android_url: null,
          ios_url: null,
          desktop_url: null,
          utm_defaults: {},
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
    
    const baseUrl = process.env.BASE_URL || 'https://see--moor.re'
    const resultUrl = baseUrl + '/' + link.slug
    
    return res.status(201).json({ url: resultUrl, slug: link.slug })
  } catch (e) {
    console.error('Shortlink error:', e)
    return res.status(500).json({ error: 'Failed to create shortlink' })
  }
})

// Public Link Master API (no auth required)
app.post('/api/link-master', async (req, res) => {
  try {
    const { facebook_url, shopee_url } = req.body
    
    if (!facebook_url || !shopee_url) {
      return res.status(400).json({ error: 'Both facebook_url and shopee_url are required' })
    }
    
    if (!facebook_url.includes('facebook.com') && !facebook_url.includes('fb.com') && !facebook_url.includes('fb.me')) {
      return res.status(400).json({ error: 'Invalid Facebook URL' })
    }
    
    if (!shopee_url.includes('shopee')) {
      return res.status(400).json({ error: 'Invalid Shopee URL' })
    }
    
    const slugLength = 7
    let link
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const slug = nanoid(slugLength)
        link = await createLink({
          slug,
          title: 'Link Master',
          og_title: 'Shopee Deal',
          og_description: 'Tap to view this amazing deal!',
          og_image_url: null,
          is_active: true,
          mode: 'single',
          primary_url: shopee_url,
          facebook_url: facebook_url,
          android_url: null,
          ios_url: null,
          desktop_url: null,
          utm_defaults: {},
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
    
    const baseUrl = process.env.BASE_URL || 'https://see--moor.re'
    const url = baseUrl + '/go/' + link.slug
    
    return res.status(201).json({ url, slug: link.slug })
  } catch (e) {
    console.error('Link Master error:', e)
    return res.status(500).json({ error: 'Failed to create link' })
  }
})

app.use('/api/links', linksRouter)
app.use('/api/uploads', uploadsRouter)
app.use('/api/auth', authRouter)

// redirect router should be last
app.use('/', redirectRouter)

const port = Number(process.env.PORT || 8080)
app.listen(port, () => {
  console.log(`Shortener server listening on :${port}`)
})
