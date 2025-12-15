import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { linksRouter } from './routes/links.js'
import { uploadsRouter } from './routes/uploads.js'
import { redirectRouter } from './routes/redirect.js'

const app = express()

app.disable('x-powered-by')

app.use(cors())
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
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 24px; }
    .wrap { max-width: 980px; margin: 0 auto; }
    h1 { font-size: 20px; margin: 0 0 16px; }
    .card { border: 1px solid rgba(127,127,127,.25); border-radius: 12px; padding: 16px; margin: 12px 0; }
    label { display: block; font-size: 12px; opacity: .8; margin: 10px 0 6px; }
    input, textarea, select { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(127,127,127,.35); background: transparent; }
    textarea { min-height: 84px; resize: vertical; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    button { padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(127,127,127,.35); background: rgba(127,127,127,.12); cursor: pointer; }
    button.primary { background: #2563eb; border-color: #2563eb; color: white; }
    .actions { display: flex; gap: 10px; align-items: center; margin-top: 12px; flex-wrap: wrap; }
    .muted { opacity: .75; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 10px; border-bottom: 1px solid rgba(127,127,127,.25); font-size: 13px; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .status { white-space: pre-wrap; font-size: 12px; }
    .ogThumb { width: 320px; height: 320px; object-fit: contain; background: white; border: 1px solid rgba(127,127,127,.25); border-radius: 10px; display: block; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>SADDAM Shortlink</h1>

    <div class="card">
      <div class="row">
        <div>
          <label>Admin API Key (stored in this browser)</label>
          <input id="apiKey" type="password" placeholder="Bearer token" />
        </div>
        <div>
          <label>Base URL (readonly)</label>
          <input id="baseUrl" type="text" readonly />
        </div>
      </div>
      <div class="actions">
        <button id="saveKey" class="primary" type="button">Save Key</button>
        <button id="clearKey" type="button">Clear</button>
        <span class="muted">Tip: key is required to create/list links.</span>
      </div>
    </div>

    <div class="card">
      <h2 style="margin:0 0 10px; font-size: 16px;">Create Link</h2>
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
          <label>Slug Length (server env)</label>
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
            <span class="muted">Auto-resize to <code>940×788</code>. Uploads to <code>og-images</code> (or <code>OG_IMAGE_BUCKET</code>).</span>
          </div>
        </div>
      </div>

      <label>OG Description</label>
      <textarea id="ogDescription" placeholder="Shown in preview"></textarea>

      <div class="actions">
        <button id="create" class="primary" type="button">Create</button>
        <button id="refresh" type="button">Refresh List</button>
        <span id="status" class="status"></span>
      </div>
    </div>

    <div class="card">
      <h2 style="margin:0 0 10px; font-size: 16px;">Links</h2>
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
  </div>

  <script>
    const $ = (id) => document.getElementById(id);
    const baseUrl = window.location.origin;
    $('baseUrl').value = baseUrl;

    function trimTrailingSlash(u) {
      return u && u.endsWith('/') ? u.slice(0, -1) : u;
    }

    function getKey() {
      return localStorage.getItem('ADMIN_API_KEY') || '';
    }

    function setKey(v) {
      localStorage.setItem('ADMIN_API_KEY', v);
    }

    function clearKey() {
      localStorage.removeItem('ADMIN_API_KEY');
    }

    function authHeaders() {
      const key = getKey();
      if (!key) return null;
      return { 'Authorization': 'Bearer ' + key };
    }

    function setStatus(msg) {
      $('status').textContent = msg;
    }

    async function api(path, options = {}) {
      const headers = Object.assign({}, options.headers || {});
      const auth = authHeaders();
      if (!auth) throw new Error('Missing Admin API Key');
      Object.assign(headers, auth);
      return fetch(path, Object.assign({}, options, { headers }));
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

    $('apiKey').value = getKey();
    $('saveKey').addEventListener('click', () => {
      const v = $('apiKey').value.trim();
      if (!v) return;
      setKey(v);
      setStatus('Saved key.');
      refreshList();
    });
    $('clearKey').addEventListener('click', () => {
      clearKey();
      $('apiKey').value = '';
      setStatus('Cleared key.');
    });
    $('refresh').addEventListener('click', refreshList);
    $('create').addEventListener('click', createLink);

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

    if (getKey()) {
      refreshList();
    } else {
      setStatus('Enter your Admin API Key to begin.');
    }
  </script>
</body>
</html>`)
})

app.get('/health', (req, res) => {
  return res.json({ ok: true })
})

app.use('/api/links', linksRouter)
app.use('/api/uploads', uploadsRouter)

// redirect router should be last
app.use('/', redirectRouter)

const port = Number(process.env.PORT || 8080)
app.listen(port, () => {
  console.log(`Shortener server listening on :${port}`)
})
