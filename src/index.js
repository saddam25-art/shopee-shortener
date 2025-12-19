import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { linksRouter } from './routes/links.js'
import { uploadsRouter } from './routes/uploads.js'
import { redirectRouter } from './routes/redirect.js'
import { authRouter } from './routes/auth.js'

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
  <title>Shopee Link Master</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; min-height: 100vh; background: linear-gradient(135deg, #fff7ed 0%, #fff 50%, #ffedd5 100%); }
    header { position: sticky; top: 0; z-index: 50; border-bottom: 1px solid #fed7aa; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); }
    .header-inner { max-width: 900px; margin: 0 auto; padding: 16px 20px; display: flex; align-items: center; gap: 12px; }
    .header-logo { width: 40px; height: 40px; background: #f97316; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .header-title { font-size: 1.25rem; font-weight: 700; color: #111; }
    .header-sub { font-size: 0.75rem; color: #666; }
    .back-btn { margin-left: auto; padding: 8px 16px; background: #f3f4f6; border-radius: 8px; text-decoration: none; color: #374151; font-size: 0.875rem; font-weight: 500; }
    .back-btn:hover { background: #e5e7eb; }
    main { max-width: 900px; margin: 0 auto; padding: 48px 20px; }
    .hero { text-align: center; margin-bottom: 48px; }
    .hero h2 { font-size: 2.5rem; font-weight: 700; color: #111; margin-bottom: 16px; }
    .hero p { font-size: 1.1rem; color: #666; max-width: 600px; margin: 0 auto; }
    .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 48px; }
    @media (max-width: 640px) { .features { grid-template-columns: 1fr; } }
    .feature-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; text-align: center; transition: box-shadow 0.2s; }
    .feature-card:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
    .feature-icon { font-size: 2rem; margin-bottom: 12px; }
    .feature-card h3 { font-size: 1rem; font-weight: 600; color: #111; margin-bottom: 8px; }
    .feature-card p { font-size: 0.875rem; color: #666; }
    .converter { background: #fff; border: 1px solid #e5e7eb; border-radius: 20px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); margin-bottom: 48px; }
    .converter h3 { font-size: 1.25rem; font-weight: 700; color: #111; margin-bottom: 24px; }
    label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 8px; }
    input[type="url"], input[type="text"] { width: 100%; padding: 14px 16px; border: 1px solid #d1d5db; border-radius: 12px; font-size: 1rem; margin-bottom: 16px; }
    input:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
    .btn-generate { width: 100%; padding: 14px; background: #f97316; color: #fff; border: none; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-generate:hover { background: #ea580c; }
    .btn-generate:active { transform: scale(0.98); }
    .btn-generate:disabled { opacity: 0.5; cursor: not-allowed; }
    .output { margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; }
    .output-row { display: flex; gap: 12px; }
    .output-row input { flex: 1; font-family: ui-monospace, monospace; font-size: 0.875rem; background: #f9fafb; }
    .btn-copy { padding: 14px 24px; background: #e5e7eb; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
    .btn-copy:hover { background: #d1d5db; }
    .btn-copy.copied { background: #dcfce7; color: #166534; }
    .tip { margin-top: 16px; padding: 16px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; }
    .tip p { font-size: 0.875rem; color: #9a3412; }
    .tip strong { color: #c2410c; }
    .error { color: #dc2626; font-size: 0.875rem; margin-top: -8px; margin-bottom: 16px; }
    .history { background: #fff; border: 1px solid #e5e7eb; border-radius: 20px; padding: 32px; }
    .history-header { display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
    .history h3 { font-size: 1.25rem; font-weight: 700; color: #111; }
    .history-toggle { font-size: 1.25rem; color: #666; transition: transform 0.2s; }
    .history-toggle.open { transform: rotate(180deg); }
    .history-list { margin-top: 20px; }
    .history-item { display: flex; align-items: center; gap: 12px; padding: 16px; background: #f9fafb; border-radius: 12px; margin-bottom: 12px; }
    .history-item-url { flex: 1; font-family: ui-monospace, monospace; font-size: 0.75rem; color: #374151; word-break: break-all; }
    .history-item-time { font-size: 0.75rem; color: #9ca3af; }
    .history-btn { padding: 8px 16px; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; }
    .history-btn-copy { background: #f3f4f6; color: #374151; }
    .history-btn-copy:hover { background: #e5e7eb; }
    .history-btn-del { background: transparent; color: #dc2626; }
    .history-btn-del:hover { background: #fef2f2; }
    .instructions { margin-top: 48px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 20px; padding: 32px; }
    .instructions h3 { font-size: 1.1rem; font-weight: 700; color: #1e40af; margin-bottom: 16px; }
    .instructions ol { padding-left: 0; list-style: none; }
    .instructions li { display: flex; gap: 12px; margin-bottom: 12px; font-size: 0.9rem; color: #1e40af; }
    .step-num { width: 24px; height: 24px; background: #3b82f6; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; flex-shrink: 0; }
    footer { border-top: 1px solid #e5e7eb; background: #f9fafb; padding: 32px 20px; text-align: center; margin-top: 48px; }
    footer p { font-size: 0.875rem; color: #6b7280; }
    .hide { display: none; }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <div class="header-logo">🛒</div>
      <div>
        <div class="header-title">Shopee Link Master</div>
        <div class="header-sub">Convert affiliate links for Facebook sharing</div>
      </div>
      <a href="/" class="back-btn">← Back</a>
    </div>
  </header>

  <main>
    <div class="hero">
      <h2>Create Facebook-Safe Shopee Links</h2>
      <p>Convert your Shopee affiliate links to open directly in the Shopee app without triggering external link warnings on Facebook.</p>
    </div>

    <div class="features">
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <h3>Instant Conversion</h3>
        <p>Convert links in seconds</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔒</div>
        <h3>Safe Sharing</h3>
        <p>No external warnings on Facebook</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📱</div>
        <h3>App Direct</h3>
        <p>Opens directly in Shopee app</p>
      </div>
    </div>

    <div class="converter">
      <h3>Generate Your Link</h3>
      <label for="shopee-url">Shopee Link</label>
      <input type="url" id="shopee-url" placeholder="Paste your Shopee affiliate link here..." />
      <div id="error-msg" class="error hide"></div>
      <button class="btn-generate" id="btn-generate">Generate Facebook-Safe Link</button>
      
      <div id="output" class="output hide">
        <label>Your Facebook-Safe Link</label>
        <div class="output-row">
          <input type="text" id="generated-url" readonly />
          <button class="btn-copy" id="btn-copy">Copy</button>
        </div>
        <p style="font-size: 0.75rem; color: #666; margin-top: 8px;">Share this link on Facebook - it bypasses external link warnings</p>
        <div class="tip">
          <p><strong>💡 How it works:</strong> This link redirects through our domain to open the Shopee app on your phone (if installed). Facebook won't show a warning since the link appears to be internal.</p>
        </div>
      </div>
    </div>

    <div class="history" id="history-section">
      <div class="history-header" id="history-toggle">
        <h3>Recent Links (<span id="history-count">0</span>)</h3>
        <span class="history-toggle" id="history-arrow">▼</span>
      </div>
      <div class="history-list hide" id="history-list"></div>
    </div>

    <div class="instructions">
      <h3>How to Use</h3>
      <ol>
        <li><span class="step-num">1</span><span>Paste your Shopee affiliate link in the input field above</span></li>
        <li><span class="step-num">2</span><span>Click "Generate Facebook-Safe Link" to create your converted link</span></li>
        <li><span class="step-num">3</span><span>Copy the generated link using the Copy button</span></li>
        <li><span class="step-num">4</span><span>Share the link on Facebook - it will open directly in Shopee app!</span></li>
      </ol>
    </div>
  </main>

  <footer>
    <p>© 2024 Shopee Link Master. Created to help your Shopee affiliate business grow.</p>
  </footer>

  <script>
    let linkHistory = JSON.parse(localStorage.getItem('shopee_link_history') || '[]');

    const inputEl = document.getElementById('shopee-url');
    const btnGenerate = document.getElementById('btn-generate');
    const outputEl = document.getElementById('output');
    const generatedEl = document.getElementById('generated-url');
    const btnCopy = document.getElementById('btn-copy');
    const errorEl = document.getElementById('error-msg');
    const historyToggle = document.getElementById('history-toggle');
    const historyList = document.getElementById('history-list');
    const historyCount = document.getElementById('history-count');
    const historyArrow = document.getElementById('history-arrow');

    function updateHistoryUI() {
      historyCount.textContent = linkHistory.length;
      if (linkHistory.length === 0) {
        document.getElementById('history-section').classList.add('hide');
        return;
      }
      document.getElementById('history-section').classList.remove('hide');
      historyList.innerHTML = linkHistory.map(item => \`
        <div class="history-item" data-id="\${item.id}">
          <div class="history-item-url">\${item.generatedUrl}</div>
          <div class="history-item-time">\${new Date(item.createdAt).toLocaleTimeString()}</div>
          <button class="history-btn history-btn-copy" onclick="copyHistoryItem('\${item.generatedUrl}')">Copy</button>
          <button class="history-btn history-btn-del" onclick="deleteHistoryItem('\${item.id}')">Delete</button>
        </div>
      \`).join('');
    }

    function copyHistoryItem(url) {
      navigator.clipboard.writeText(url);
    }

    function deleteHistoryItem(id) {
      linkHistory = linkHistory.filter(item => item.id !== id);
      localStorage.setItem('shopee_link_history', JSON.stringify(linkHistory));
      updateHistoryUI();
    }

    historyToggle.addEventListener('click', () => {
      historyList.classList.toggle('hide');
      historyArrow.classList.toggle('open');
    });

    btnGenerate.addEventListener('click', () => {
      errorEl.classList.add('hide');
      outputEl.classList.add('hide');
      const url = inputEl.value.trim();
      if (!url) {
        errorEl.textContent = 'Please enter a Shopee link';
        errorEl.classList.remove('hide');
        return;
      }
      if (!url.includes('shopee.') && !url.includes('shp.ee') && !url.includes('s.shopee')) {
        errorEl.textContent = 'Please enter a valid Shopee link';
        errorEl.classList.remove('hide');
        return;
      }
      const encoded = encodeURIComponent(url);
      const generated = window.location.origin + '/go?url=' + encoded;
      generatedEl.value = generated;
      outputEl.classList.remove('hide');
      
      const historyItem = {
        id: Date.now().toString(),
        originalUrl: url,
        generatedUrl: generated,
        createdAt: new Date().toISOString()
      };
      linkHistory = [historyItem, ...linkHistory.slice(0, 49)];
      localStorage.setItem('shopee_link_history', JSON.stringify(linkHistory));
      updateHistoryUI();
      inputEl.value = '';
    });

    btnCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(generatedEl.value);
      btnCopy.textContent = '✓ Copied!';
      btnCopy.classList.add('copied');
      setTimeout(() => {
        btnCopy.textContent = 'Copy';
        btnCopy.classList.remove('copied');
      }, 2000);
    });

    updateHistoryUI();
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
            <h2>Create Link</h2>
            <div class="row">
              <div>
                <label>Destination URL</label>
                <input id="primaryUrl" type="url" placeholder="https://..." required />
              </div>
              <div>
                <label>Title (optional)</label>
                <input id="title" type="text" placeholder="Internal title" />
              </div>
            </div>

            <div class="row3">
              <div>
                <label>Mode</label>
                <select id="mode">
                  <option value="single" selected>single</option>
                  <option value="rotate">rotate</option>
                </select>
              </div>
              <div>
                <label>Active</label>
                <select id="isActive">
                  <option value="true" selected>true</option>
                  <option value="false">false</option>
                </select>
              </div>
              <div>
                <label>Slug Length</label>
                <input type="text" value="(configured on server)" readonly />
              </div>
            </div>

            <div class="row">
              <div>
                <label>OG Title</label>
                <input id="ogTitle" type="text" placeholder="Shown in WhatsApp/FB preview" />
              </div>
              <div>
                <label>OG Image URL</label>
                <input id="ogImageUrl" type="url" placeholder="https://...jpg/png" />
              </div>
            </div>

            <div class="row">
              <div>
                <label>Upload Image (Supabase Storage)</label>
                <input id="ogImageFile" type="file" accept="image/*" />
              </div>
              <div>
                <label>&nbsp;</label>
                <div class="actions" style="margin-top: 0;">
                  <button id="uploadImage" type="button">Upload</button>
                  <span class="muted">Auto-resize to <code>940×788</code>.</span>
                </div>
              </div>
            </div>

            <label>OG Description</label>
            <textarea id="ogDescription" placeholder="Shown in preview"></textarea>

            <div class="actions">
              <button id="create" class="primary" type="button">Create</button>
              <button id="refresh" type="button">Refresh List</button>
              <button id="logout" class="ghost" type="button">Logout</button>
              <span id="status" class="status"></span>
            </div>
          </div>

          <div class="card hide" id="deepLinkCard">
            <h2>🚀 App Linking for Marketers</h2>
            <p class="muted" style="margin-bottom:12px">Instantly create deep links for any app and use in any marketing channel</p>
            
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
              <button type="button" class="app-btn" data-app="other" style="padding:12px 8px; border-radius:10px; border:2px solid rgba(255,255,255,.1); background:rgba(255,255,255,.05); cursor:pointer; text-align:center; transition:all .2s;">
                <div style="font-size:24px;">🔗</div>
                <div style="font-size:11px; margin-top:4px; color:inherit;">Other</div>
              </button>
            </div>
            
            <label id="deepLinkUrlLabel">App Link / URL</label>
            <input id="deepLinkUrl" type="url" placeholder="Paste your link here..." />
            <p class="muted" id="deepLinkHint" style="margin:6px 0 12px; font-size:11px;">Supports: shopee.com.my, s.shopee.com.my</p>
            
            <div class="actions">
              <button id="generateDeepLink" class="primary" type="button">⚡ Generate Deep Link</button>
            </div>
            <div id="deepLinkResult" class="hide" style="margin-top:12px; padding:12px; background:rgba(34,197,94,0.15); border:1px solid rgba(34,197,94,0.3); border-radius:12px;">
              <label style="color:#22c55e; margin:0 0 8px;">✅ Deep Link Ready!</label>
              <input id="deepLinkOutput" type="text" readonly style="background:rgba(0,0,0,0.3);" />
              <div class="actions" style="margin-top:8px;">
                <button id="copyDeepLink" type="button">📋 Copy</button>
                <a id="testDeepLink" href="#" target="_blank" style="padding:10px 14px; border-radius:12px; background:rgba(255,255,255,.08); color:inherit; text-decoration:none; font-size:13px;">🧪 Test</a>
              </div>
              <p class="muted" style="margin-top:10px; font-size:11px;">📱 Share this link on Facebook, Instagram, WhatsApp, Email, SMS - Opens app directly!</p>
            </div>
            <span id="deepLinkStatus" class="status"></span>
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
      $('linksCard').classList.toggle('hide', !signedIn);
      $('deepLinkCard').classList.toggle('hide', !signedIn);
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

    async function createLink() {
      setStatus('Creating...');
      try {
        const payload = {
          mode: $('mode').value,
          primary_url: $('primaryUrl').value.trim(),
          title: $('title').value.trim() || undefined,
          og_title: $('ogTitle').value.trim() || undefined,
          og_description: $('ogDescription').value.trim() || undefined,
          og_image_url: $('ogImageUrl').value.trim() || undefined,
          is_active: $('isActive').value === 'true',
        };

        if (!payload.primary_url) throw new Error('Destination URL is required');

        const res = await api('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data && data.error ? data.error : 'Create failed');

        const slug = data.link && data.link.slug ? data.link.slug : '';
        const url = trimTrailingSlash(baseUrl) + '/' + encodeURIComponent(slug);
        setStatus('Created: ' + url);
        await refreshList();
      } catch (e) {
        setStatus(String(e && e.message ? e.message : e));
      }
    }

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
        const TARGET_W = 940;
        const TARGET_H = 788;

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

    // App Linking for Marketers
    const APP_CONFIG = {
      shopee: {
        name: 'Shopee',
        icon: '🛒',
        hint: 'Supports: shopee.com.my, s.shopee.com.my',
        placeholder: 'https://shopee.com.my/... or https://s.shopee.com.my/...',
        validate: (url) => url.includes('shopee'),
        color: 'rgba(238,77,45,0.2)'
      },
      lazada: {
        name: 'Lazada',
        icon: '🛍️',
        hint: 'Supports: lazada.com.my, lzd.co',
        placeholder: 'https://www.lazada.com.my/... or https://lzd.co/...',
        validate: (url) => url.includes('lazada') || url.includes('lzd.co'),
        color: 'rgba(13,0,255,0.2)'
      },
      tiktok: {
        name: 'TikTok',
        icon: '🎵',
        hint: 'Supports: tiktok.com, vm.tiktok.com',
        placeholder: 'https://www.tiktok.com/... or https://vm.tiktok.com/...',
        validate: (url) => url.includes('tiktok'),
        color: 'rgba(0,0,0,0.3)'
      },
      instagram: {
        name: 'Instagram',
        icon: '📸',
        hint: 'Supports: instagram.com, instagr.am',
        placeholder: 'https://www.instagram.com/...',
        validate: (url) => url.includes('instagram') || url.includes('instagr.am'),
        color: 'rgba(225,48,108,0.2)'
      },
      facebook: {
        name: 'Facebook',
        icon: '📘',
        hint: 'Supports: facebook.com, fb.com, fb.me',
        placeholder: 'https://www.facebook.com/...',
        validate: (url) => url.includes('facebook') || url.includes('fb.com') || url.includes('fb.me'),
        color: 'rgba(24,119,242,0.2)'
      },
      youtube: {
        name: 'YouTube',
        icon: '▶️',
        hint: 'Supports: youtube.com, youtu.be',
        placeholder: 'https://www.youtube.com/... or https://youtu.be/...',
        validate: (url) => url.includes('youtube') || url.includes('youtu.be'),
        color: 'rgba(255,0,0,0.2)'
      },
      twitter: {
        name: 'X/Twitter',
        icon: '🐦',
        hint: 'Supports: twitter.com, x.com',
        placeholder: 'https://twitter.com/... or https://x.com/...',
        validate: (url) => url.includes('twitter') || url.includes('x.com'),
        color: 'rgba(29,161,242,0.2)'
      },
      other: {
        name: 'Other App',
        icon: '🔗',
        hint: 'Any URL - we will try to open it in the native app',
        placeholder: 'https://...',
        validate: (url) => url.startsWith('http'),
        color: 'rgba(128,128,128,0.2)'
      }
    };

    let selectedApp = 'shopee';

    function setDeepLinkStatus(msg) {
      $('deepLinkStatus').textContent = msg;
    }

    function updateAppUI() {
      const config = APP_CONFIG[selectedApp];
      $('deepLinkUrl').placeholder = config.placeholder;
      $('deepLinkHint').textContent = config.hint;
      
      document.querySelectorAll('.app-btn').forEach(btn => {
        const app = btn.dataset.app;
        const isSelected = app === selectedApp;
        btn.classList.toggle('selected', isSelected);
        btn.style.borderColor = isSelected ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.1)';
        btn.style.background = isSelected ? APP_CONFIG[app].color : 'rgba(255,255,255,.05)';
      });
    }

    document.querySelectorAll('.app-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedApp = btn.dataset.app;
        updateAppUI();
        $('deepLinkResult').classList.add('hide');
      });
    });

    $('generateDeepLink').addEventListener('click', async () => {
      const url = $('deepLinkUrl').value.trim();
      const btn = $('generateDeepLink');
      const config = APP_CONFIG[selectedApp];
      
      if (!url) {
        setDeepLinkStatus('Please enter a URL');
        return;
      }
      
      if (!config.validate(url)) {
        setDeepLinkStatus('Please enter a valid ' + config.name + ' link');
        return;
      }
      
      btn.disabled = true;
      btn.textContent = '⏳ Generating...';
      setDeepLinkStatus('');
      
      try {
        const res = await api('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            primary_url: url,
            og_title: config.name + ' Link',
            og_description: 'Tap to open in ' + config.name + ' app',
            mode: 'single',
            is_active: true,
            app_type: selectedApp
          })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create deep link');
        }
        
        const deepLinkUrl = baseUrl + '/go/' + data.link.slug;
        
        $('deepLinkOutput').value = deepLinkUrl;
        $('testDeepLink').href = deepLinkUrl;
        $('deepLinkResult').classList.remove('hide');
        setDeepLinkStatus('');
        
        await refreshList();
        
      } catch (e) {
        setDeepLinkStatus('Error: ' + (e.message || e));
      } finally {
        btn.disabled = false;
        btn.textContent = '⚡ Generate Deep Link';
      }
    });

    $('copyDeepLink').addEventListener('click', () => {
      const url = $('deepLinkOutput').value;
      navigator.clipboard.writeText(url).then(() => {
        $('copyDeepLink').textContent = '✓ Copied!';
        setTimeout(() => { $('copyDeepLink').textContent = '📋 Copy'; }, 2000);
      }).catch(() => {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        $('copyDeepLink').textContent = '✓ Copied!';
        setTimeout(() => { $('copyDeepLink').textContent = '📋 Copy'; }, 2000);
      });
    });

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

app.use('/api/links', linksRouter)
app.use('/api/uploads', uploadsRouter)
app.use('/api/auth', authRouter)

// redirect router should be last
app.use('/', redirectRouter)

const port = Number(process.env.PORT || 8080)
app.listen(port, () => {
  console.log(`Shortener server listening on :${port}`)
})
