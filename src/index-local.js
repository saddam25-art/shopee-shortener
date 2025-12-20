import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import readline from 'readline'
import fs from 'fs'
import { fileURLToPath } from 'url'

import { linksRouterLocal } from './routes/links-local.js'
import { uploadsRouterLocal } from './routes/uploads-local.js'
import { redirectRouterLocal } from './routes/redirect-local.js'
import { authRouterLocal } from './routes/auth-local.js'
import { getImagesDir } from './db/local-db.js'
import { checkLicense, saveLicense, validateLicenseKey } from './license.js'

// License validation - runs before server starts
function startWithLicenseCheck() {
  const licenseResult = checkLicense()
  
  if (licenseResult.valid) {
    console.log('✅ License valid')
    startServer()
    return
  }
  
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║        SADDAM Shortlink - License Required             ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log('')
  console.log('Your Machine ID:', licenseResult.machineId)
  console.log('')
  console.log('Please contact admin to get a license key for this computer.')
  console.log('')
  
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  
  rl.question('Enter License Key: ', (key) => {
    rl.close()
    const validation = validateLicenseKey(key, licenseResult.machineId)
    
    if (validation.valid) {
      saveLicense(key)
      console.log('\n✅ License activated successfully!\n')
      startServer()
    } else {
      console.log('\n❌ Invalid license key:', validation.error)
      console.log('\nExiting...')
      process.exit(1)
    }
  })
}

function startServer() {

// Create Express app
const app = express()

app.disable('x-powered-by')
app.use(cors())
app.use(cookieParser())
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '6mb' }))
app.use('/images', express.static(getImagesDir()))

// Landing page
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SADDAM Shortlink - Local</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, sans-serif; min-height: 100vh; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: #fff; }
    .container { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
    .logo { width: 80px; height: 80px; background: linear-gradient(135deg, #f59e0b, #fbbf24); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 24px; box-shadow: 0 20px 40px rgba(245,158,11,0.3); }
    h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 12px; background: linear-gradient(135deg, #fff, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .badge { display: inline-block; padding: 6px 12px; background: rgba(34,197,94,0.2); border: 1px solid rgba(34,197,94,0.4); border-radius: 20px; font-size: 0.75rem; color: #4ade80; margin-bottom: 16px; }
    p { font-size: 1.1rem; opacity: 0.8; margin-bottom: 40px; text-align: center; max-width: 500px; }
    .buttons { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; }
    .btn { display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; border-radius: 14px; font-size: 1rem; font-weight: 600; text-decoration: none; transition: all 0.3s ease; }
    .btn-primary { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #111; box-shadow: 0 10px 30px rgba(245,158,11,0.3); }
    .btn-primary:hover { transform: translateY(-3px); }
    .btn-secondary { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); }
    .btn-secondary:hover { background: rgba(255,255,255,0.15); transform: translateY(-3px); }
    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 60px; max-width: 800px; width: 100%; }
    .feature { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; text-align: center; }
    .feature-icon { font-size: 32px; margin-bottom: 12px; }
    .feature h3 { font-size: 1rem; margin-bottom: 8px; }
    .feature p { font-size: 0.85rem; opacity: 0.7; margin-bottom: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🔗</div>
    <h1>SADDAM Shortlink</h1>
    <div class="badge">💾 LOCAL VERSION</div>
    <p>Create short links with custom OG images for Shopee affiliate marketing. All data stored locally!</p>
    <div class="buttons">
      <a href="/link-master" class="btn btn-primary">🛒 Link Master</a>
      <a href="/admin" class="btn btn-secondary">⚙️ Admin Panel</a>
    </div>
    <div class="features">
      <div class="feature"><div class="feature-icon">💾</div><h3>Local Storage</h3><p>All data stored on your computer</p></div>
      <div class="feature"><div class="feature-icon">🔒</div><h3>Offline Mode</h3><p>Works without internet</p></div>
      <div class="feature"><div class="feature-icon">⚡</div><h3>Fast & Private</h3><p>No cloud dependencies</p></div>
    </div>
  </div>
</body>
</html>`)
})

// Link Master page
app.get('/link-master', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Shopee Link Master - Local</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, sans-serif; min-height: 100vh; background: linear-gradient(135deg, #fff7ed 0%, #fff 50%, #ffedd5 100%); }
    header { position: sticky; top: 0; z-index: 50; border-bottom: 1px solid #fed7aa; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); }
    .header-inner { max-width: 900px; margin: 0 auto; padding: 16px 20px; display: flex; align-items: center; gap: 12px; }
    .header-logo { width: 40px; height: 40px; background: #f97316; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .header-title { font-size: 1.25rem; font-weight: 700; color: #111; }
    .header-sub { font-size: 0.75rem; color: #666; }
    .back-btn { margin-left: auto; padding: 8px 16px; background: #f3f4f6; border-radius: 8px; text-decoration: none; color: #374151; font-size: 0.875rem; font-weight: 500; }
    main { max-width: 900px; margin: 0 auto; padding: 48px 20px; }
    .hero { text-align: center; margin-bottom: 48px; }
    .hero h2 { font-size: 2.5rem; font-weight: 700; color: #111; margin-bottom: 16px; }
    .hero p { font-size: 1.1rem; color: #666; max-width: 600px; margin: 0 auto; }
    .converter { background: #fff; border: 1px solid #e5e7eb; border-radius: 20px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); }
    .converter h3 { font-size: 1.25rem; font-weight: 700; color: #111; margin-bottom: 24px; }
    label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 8px; }
    input[type="url"], input[type="text"] { width: 100%; padding: 14px 16px; border: 1px solid #d1d5db; border-radius: 12px; font-size: 1rem; margin-bottom: 16px; }
    input:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
    .btn-generate { width: 100%; padding: 14px; background: #f97316; color: #fff; border: none; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; }
    .btn-generate:hover { background: #ea580c; }
    .output { margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; }
    .output-row { display: flex; gap: 12px; }
    .output-row input { flex: 1; font-family: ui-monospace, monospace; font-size: 0.875rem; background: #f9fafb; }
    .btn-copy { padding: 14px 24px; background: #e5e7eb; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; }
    .btn-copy.copied { background: #dcfce7; color: #166534; }
    .error { color: #dc2626; font-size: 0.875rem; margin-top: -8px; margin-bottom: 16px; }
    .hide { display: none; }
  </style>
</head>
<body>
  <header><div class="header-inner"><div class="header-logo">🛒</div><div><div class="header-title">Shopee Link Master</div><div class="header-sub">Local Version</div></div><a href="/" class="back-btn">← Back</a></div></header>
  <main>
    <div class="hero"><h2>Create Facebook-Safe Shopee Links</h2><p>Convert your Shopee affiliate links to open directly in the Shopee app.</p></div>
    <div class="converter">
      <h3>Generate Your Link</h3>
      <label for="shopee-url">Shopee Link</label>
      <input type="url" id="shopee-url" placeholder="Paste your Shopee affiliate link here..." />
      <div id="error-msg" class="error hide"></div>
      <button class="btn-generate" id="btn-generate">Generate Facebook-Safe Link</button>
      <div id="output" class="output hide">
        <label>Your Facebook-Safe Link</label>
        <div class="output-row"><input type="text" id="generated-url" readonly /><button class="btn-copy" id="btn-copy">Copy</button></div>
      </div>
    </div>
  </main>
  <script>
    const inputEl = document.getElementById('shopee-url');
    const btnGenerate = document.getElementById('btn-generate');
    const outputEl = document.getElementById('output');
    const generatedEl = document.getElementById('generated-url');
    const btnCopy = document.getElementById('btn-copy');
    const errorEl = document.getElementById('error-msg');
    btnGenerate.addEventListener('click', () => {
      errorEl.classList.add('hide'); outputEl.classList.add('hide');
      const url = inputEl.value.trim();
      if (!url) { errorEl.textContent = 'Please enter a Shopee link'; errorEl.classList.remove('hide'); return; }
      if (!url.includes('shopee.') && !url.includes('shp.ee') && !url.includes('s.shopee')) { errorEl.textContent = 'Please enter a valid Shopee link'; errorEl.classList.remove('hide'); return; }
      generatedEl.value = window.location.origin + '/go?url=' + encodeURIComponent(url);
      outputEl.classList.remove('hide'); inputEl.value = '';
    });
    btnCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(generatedEl.value);
      btnCopy.textContent = '✓ Copied!'; btnCopy.classList.add('copied');
      setTimeout(() => { btnCopy.textContent = 'Copy'; btnCopy.classList.remove('copied'); }, 2000);
    });
  </script>
</body>
</html>`)
})

// Go redirect
app.get('/go', (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing url parameter');
  const decoded = decodeURIComponent(url);
  if (!decoded.includes('shopee.') && !decoded.includes('shp.ee') && !decoded.includes('s.shopee')) {
    return res.status(400).send('Invalid Shopee link');
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(`<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Opening Shopee...</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:ui-sans-serif,system-ui,sans-serif;min-height:100vh;background:linear-gradient(135deg,#fff7ed,#ffedd5);display:flex;align-items:center;justify-content:center;padding:20px}.card{text-align:center}h2{font-size:1.5rem;color:#111;margin-bottom:8px}p{color:#666}</style>
</head><body><div class="card"><h2>Opening Shopee...</h2><p>Redirecting you to the Shopee app</p></div>
<script>
const targetUrl = decodeURIComponent('${encodeURIComponent(decoded)}');
const ua = navigator.userAgent.toLowerCase();
const isIOS = /iphone|ipad|ipod/.test(ua);
const isAndroid = /android/.test(ua);
if (isIOS) { window.location.href = 'shopee://'; setTimeout(() => { window.location.href = targetUrl; }, 1500); }
else if (isAndroid) { window.location.href = targetUrl; setTimeout(() => { const a = document.createElement('a'); a.href = 'shopee://' + targetUrl.replace(/^https?:\\/\\//, ''); a.click(); }, 500); }
else { window.location.href = targetUrl; }
</script></body></html>`);
})

// Admin page
app.get('/admin', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SADDAM Shortlink - Local Admin</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; }
    .bg { min-height: 100vh; background: radial-gradient(1200px 600px at 10% 0%, rgba(255,215,0,.10), transparent 50%), radial-gradient(900px 500px at 90% 10%, rgba(59,130,246,.18), transparent 60%), linear-gradient(180deg, rgba(17,24,39,1), rgba(3,7,18,1)); padding: 28px 16px; }
    .wrap { max-width: 1040px; margin: 0 auto; }
    .brand { display:flex; align-items:center; justify-content:space-between; gap: 12px; margin-bottom: 16px; }
    .brand h1 { font-size: 18px; margin: 0; }
    .chip { font-size: 12px; border: 1px solid rgba(255,255,255,.14); padding: 6px 10px; border-radius: 999px; background: rgba(255,255,255,.06); }
    .local-badge { background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.4); color: #4ade80; }
    .grid { display:grid; grid-template-columns: 1.05fr .95fr; gap: 14px; }
    @media (max-width: 900px){ .grid { grid-template-columns: 1fr; } }
    .card { border: 1px solid rgba(255,255,255,.12); border-radius: 16px; padding: 16px; margin: 12px 0; background: rgba(255,255,255,.06); backdrop-filter: blur(12px); }
    h2 { margin:0 0 10px; font-size: 15px; }
    label { display: block; font-size: 12px; opacity: .85; margin: 10px 0 6px; }
    input, textarea { width: 100%; padding: 11px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,.14); background: rgba(0,0,0,.15); color: inherit; }
    textarea { min-height: 84px; resize: vertical; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    button { padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.08); cursor: pointer; color: inherit; }
    button.primary { background: linear-gradient(135deg, #f59e0b, #fbbf24); border-color: transparent; color: #111827; font-weight: 700; }
    .actions { display: flex; gap: 10px; align-items: center; margin-top: 12px; flex-wrap: wrap; }
    .muted { opacity: .78; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 10px; border-bottom: 1px solid rgba(255,255,255,.10); font-size: 13px; }
    .status { white-space: pre-wrap; font-size: 12px; }
    .ogThumb { width: 320px; height: 320px; object-fit: contain; background: white; border-radius: 12px; display: block; }
    .hide { display: none; }
    .auth-box { max-width: 400px; margin: 60px auto; }
    .auth-box h2 { text-align: center; margin-bottom: 20px; font-size: 22px; }
    .auth-toggle { text-align: center; margin-top: 16px; font-size: 13px; }
    .auth-toggle a { color: #fbbf24; cursor: pointer; }
    .back-link { display: inline-block; margin-bottom: 20px; color: #fbbf24; text-decoration: none; font-size: 14px; }
  </style>
</head>
<body class="bg">
  <div class="wrap">
    <a href="/" class="back-link">← Back to Home</a>
    <div class="brand"><h1>🔗 SADDAM Shortlink</h1><div style="display:flex;gap:8px;"><span class="chip local-badge">💾 LOCAL</span><span class="chip" id="userChip" style="display:none;"></span><button id="logoutBtn" class="chip" style="display:none;cursor:pointer;">Logout</button></div></div>
    <div id="authSection" class="auth-box card">
      <h2 id="authTitle">Login</h2>
      <div id="authError" class="status" style="color:#f87171;margin-bottom:12px;"></div>
      <label>Username</label><input type="text" id="authUser" autocomplete="username" />
      <label>Password</label><input type="password" id="authPass" autocomplete="current-password" />
      <div class="actions" style="margin-top:16px;"><button class="primary" id="authSubmit" style="flex:1;">Login</button></div>
      <div class="auth-toggle"><span id="authToggleText">No account?</span> <a id="authToggleLink">Register</a></div>
    </div>
    <div id="mainSection" class="hide">
      <div class="grid">
        <div><div class="card">
          <h2 id="formTitle">Create New Link</h2>
          <input type="hidden" id="editId" />
          <label>Slug</label><input id="slug" placeholder="my-link" />
          <label>Default URL</label><textarea id="defaultUrl" placeholder="https://shopee..."></textarea>
          <div class="row"><div><label>OG Title</label><input id="ogTitle" /></div><div><label>OG Description</label><input id="ogDesc" /></div></div>
          <label>OG Image</label><input type="file" id="ogFile" accept="image/*" />
          <p class="muted" style="margin:6px 0 0;">Image will be resized to 1200×630 px</p>
          <img id="ogPreview" class="ogThumb hide" style="margin-top:12px;" />
          <input type="hidden" id="ogImageUrl" />
          <div class="actions"><button class="primary" id="saveBtn">Save Link</button><button id="cancelBtn" class="hide">Cancel</button></div>
          <div id="formStatus" class="status" style="margin-top:10px;"></div>
        </div></div>
        <div><div class="card">
          <h2>Links</h2>
          <table><thead><tr><th>Slug</th><th>Clicks</th><th></th></tr></thead><tbody id="linksBody"></tbody></table>
          <div id="listStatus" class="status" style="margin-top:10px;"></div>
        </div></div>
      </div>
    </div>
  </div>
  <script>
    const BASE = '';
    let isRegister = false;
    const authSection = document.getElementById('authSection'), mainSection = document.getElementById('mainSection');
    const authTitle = document.getElementById('authTitle'), authError = document.getElementById('authError');
    const authUser = document.getElementById('authUser'), authPass = document.getElementById('authPass');
    const authSubmit = document.getElementById('authSubmit'), authToggleText = document.getElementById('authToggleText');
    const authToggleLink = document.getElementById('authToggleLink'), userChip = document.getElementById('userChip');
    const logoutBtn = document.getElementById('logoutBtn');
    function showAuth() { authSection.classList.remove('hide'); mainSection.classList.add('hide'); userChip.style.display='none'; logoutBtn.style.display='none'; }
    function showMain(username) { authSection.classList.add('hide'); mainSection.classList.remove('hide'); userChip.textContent=username; userChip.style.display=''; logoutBtn.style.display=''; loadLinks(); }
    authToggleLink.onclick = () => { isRegister = !isRegister; authTitle.textContent = isRegister ? 'Register' : 'Login'; authSubmit.textContent = isRegister ? 'Register' : 'Login'; authToggleText.textContent = isRegister ? 'Have an account?' : 'No account?'; authToggleLink.textContent = isRegister ? 'Login' : 'Register'; authError.textContent = ''; };
    authSubmit.onclick = async () => { authError.textContent = ''; const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'; const res = await fetch(BASE + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ username: authUser.value, password: authPass.value }) }); const data = await res.json(); if (!res.ok) { authError.textContent = data.error || 'Error'; return; } showMain(data.user?.username || authUser.value); };
    logoutBtn.onclick = async () => { await fetch(BASE + '/api/auth/logout', { method: 'POST', credentials: 'include' }); showAuth(); };
    (async () => { const res = await fetch(BASE + '/api/auth/me', { credentials: 'include' }); if (res.ok) { const d = await res.json(); showMain(d.user.username); } else { showAuth(); } })();
    const slugEl = document.getElementById('slug'), defaultUrlEl = document.getElementById('defaultUrl');
    const ogTitleEl = document.getElementById('ogTitle'), ogDescEl = document.getElementById('ogDesc');
    const ogFileEl = document.getElementById('ogFile'), ogPreviewEl = document.getElementById('ogPreview');
    const ogImageUrlEl = document.getElementById('ogImageUrl'), editIdEl = document.getElementById('editId');
    const formTitleEl = document.getElementById('formTitle'), saveBtnEl = document.getElementById('saveBtn');
    const cancelBtnEl = document.getElementById('cancelBtn'), formStatusEl = document.getElementById('formStatus');
    const linksBodyEl = document.getElementById('linksBody'), listStatusEl = document.getElementById('listStatus');
    ogFileEl.addEventListener('change', async (e) => { const file = e.target.files[0]; if (!file) return; formStatusEl.textContent = 'Resizing...'; const resized = await resizeImage(file, 1200, 630); formStatusEl.textContent = 'Uploading...'; const fd = new FormData(); fd.append('file', resized, file.name.replace(/\\.[^.]+$/, '.png')); const res = await fetch(BASE + '/api/uploads', { method: 'POST', credentials: 'include', body: fd }); const data = await res.json(); if (!res.ok) { formStatusEl.textContent = data.error || 'Upload failed'; return; } ogImageUrlEl.value = data.url; ogPreviewEl.src = data.url; ogPreviewEl.classList.remove('hide'); formStatusEl.textContent = 'Uploaded!'; });
    function resizeImage(file, maxW, maxH) { return new Promise((resolve) => { const img = new Image(); img.onload = () => { const canvas = document.createElement('canvas'); canvas.width = maxW; canvas.height = maxH; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, maxW, maxH); const scale = Math.min(maxW / img.width, maxH / img.height); const w = img.width * scale, h = img.height * scale; const x = (maxW - w) / 2, y = (maxH - h) / 2; ctx.drawImage(img, x, y, w, h); canvas.toBlob((blob) => resolve(blob), 'image/png'); }; img.src = URL.createObjectURL(file); }); }
    async function loadLinks() { listStatusEl.textContent = 'Loading...'; const res = await fetch(BASE + '/api/links', { credentials: 'include' }); if (!res.ok) { listStatusEl.textContent = 'Failed'; return; } const links = await res.json(); listStatusEl.textContent = ''; linksBodyEl.innerHTML = links.map(l => { const c = l.short_link_counters?.[0] || {}; return '<tr><td><a href="/' + l.slug + '" target="_blank">' + l.slug + '</a></td><td>' + (c.total_clicks||0) + '</td><td><button onclick="editLink(' + l.id + ')">Edit</button> <button onclick="deleteLink(' + l.id + ')">Del</button></td></tr>'; }).join(''); }
    window.editLink = async (id) => { const res = await fetch(BASE + '/api/links', { credentials: 'include' }); const links = await res.json(); const link = links.find(l => l.id === id); if (!link) return; editIdEl.value = link.id; slugEl.value = link.slug; defaultUrlEl.value = link.default_url; ogTitleEl.value = link.og_title || ''; ogDescEl.value = link.og_description || ''; ogImageUrlEl.value = link.og_image_url || ''; if (link.og_image_url) { ogPreviewEl.src = link.og_image_url; ogPreviewEl.classList.remove('hide'); } else { ogPreviewEl.classList.add('hide'); } formTitleEl.textContent = 'Edit Link'; cancelBtnEl.classList.remove('hide'); };
    window.deleteLink = async (id) => { if (!confirm('Delete?')) return; await fetch(BASE + '/api/links/' + id, { method: 'DELETE', credentials: 'include' }); loadLinks(); };
    cancelBtnEl.onclick = () => { editIdEl.value = ''; slugEl.value = ''; defaultUrlEl.value = ''; ogTitleEl.value = ''; ogDescEl.value = ''; ogImageUrlEl.value = ''; ogPreviewEl.classList.add('hide'); formTitleEl.textContent = 'Create New Link'; cancelBtnEl.classList.add('hide'); };
    saveBtnEl.onclick = async () => { formStatusEl.textContent = 'Saving...'; const payload = { slug: slugEl.value, default_url: defaultUrlEl.value, og_title: ogTitleEl.value || null, og_description: ogDescEl.value || null, og_image_url: ogImageUrlEl.value || null }; const id = editIdEl.value; const method = id ? 'PUT' : 'POST'; const url = id ? BASE + '/api/links/' + id : BASE + '/api/links'; const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) }); const data = await res.json(); if (!res.ok) { formStatusEl.textContent = data.error || 'Error'; return; } formStatusEl.textContent = 'Saved!'; cancelBtnEl.click(); loadLinks(); };
  </script>
</body>
</html>`)
})

app.get('/health', (req, res) => res.json({ ok: true, mode: 'local' }))

app.use('/api/links', linksRouterLocal)
app.use('/api/uploads', uploadsRouterLocal)
app.use('/api/auth', authRouterLocal)
app.use('/', redirectRouterLocal)

const port = Number(process.env.PORT || 8080)
  app.listen(port, () => {
    console.log(`SADDAM Shortlink (LOCAL) listening on http://localhost:${port}`)
    console.log(`Data stored in: ${path.resolve('data')}`)
  })
}

// Start the app with license check
startWithLicenseCheck()
