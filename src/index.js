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
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  return res.status(200).send('OK')
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

app.get('/health', (req, res) => {
  return res.json({ ok: true })
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
