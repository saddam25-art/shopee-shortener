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
      <a href="/masterlinks" class="btn btn-primary">🖼️ Masterlinks</a>
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

app.get(['/link-master', '/masterlinks'], (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Shopee Shortlink Generator</title>
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
    .step-section { margin-bottom: 24px; padding: 20px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; }
    .step-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .step-num { width: 28px; height: 28px; background: #f97316; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 700; }
    .step-title { font-size: 1rem; font-weight: 600; color: #111; }
    label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 8px; }
    input[type="url"], input[type="text"] { width: 100%; padding: 14px 16px; border: 1px solid #d1d5db; border-radius: 12px; font-size: 1rem; margin-bottom: 12px; background: #fff; }
    input:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
    .btn { padding: 12px 20px; border: none; border-radius: 12px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-extract { background: #3b82f6; color: #fff; }
    .btn-extract:hover { background: #2563eb; }
    .btn-extract:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-generate { width: 100%; padding: 14px; background: #f97316; color: #fff; border: none; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-generate:hover { background: #ea580c; }
    .btn-generate:active { transform: scale(0.98); }
    .btn-generate:disabled { opacity: 0.5; cursor: not-allowed; }
    .preview-box { margin-top: 16px; padding: 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; }
    .preview-image { width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin-bottom: 12px; }
    .preview-title { font-size: 1rem; font-weight: 600; color: #111; margin-bottom: 4px; }
    .preview-desc { font-size: 0.875rem; color: #666; }
    .output { margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; }
    .output-row { display: flex; gap: 12px; }
    .output-row input { flex: 1; font-family: ui-monospace, monospace; font-size: 0.875rem; background: #f9fafb; }
    .btn-copy { padding: 14px 24px; background: #e5e7eb; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
    .btn-copy:hover { background: #d1d5db; }
    .btn-copy.copied { background: #dcfce7; color: #166534; }
    .tip { margin-top: 16px; padding: 16px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; }
    .tip p { font-size: 0.875rem; color: #9a3412; }
    .tip strong { color: #c2410c; }
    .error { color: #dc2626; font-size: 0.875rem; padding: 12px; background: #fef2f2; border-radius: 8px; margin-bottom: 12px; }
    .success { color: #166534; font-size: 0.875rem; padding: 12px; background: #dcfce7; border-radius: 8px; margin-bottom: 12px; }
    .loading { display: inline-block; width: 16px; height: 16px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 8px; vertical-align: middle; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .history { background: #fff; border: 1px solid #e5e7eb; border-radius: 20px; padding: 32px; }
    .history-header { display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
    .history h3 { font-size: 1.25rem; font-weight: 700; color: #111; }
    .history-toggle { font-size: 1.25rem; color: #666; transition: transform 0.2s; }
    .history-toggle.open { transform: rotate(180deg); }
    .history-list { margin-top: 20px; }
    .history-item { display: flex; align-items: center; gap: 12px; padding: 16px; background: #f9fafb; border-radius: 12px; margin-bottom: 12px; }
    .history-item-img { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; }
    .history-item-info { flex: 1; }
    .history-item-url { font-family: ui-monospace, monospace; font-size: 0.75rem; color: #374151; word-break: break-all; }
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
    .inst-num { width: 24px; height: 24px; background: #3b82f6; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; flex-shrink: 0; }
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
        <div class="header-title">Shopee Shortlink Generator</div>
        <div class="header-sub">Create shortlinks with image preview for Facebook</div>
      </div>
      <a href="/" class="back-btn">← Back</a>
    </div>
  </header>

  <main>
    <div class="hero">
      <h2>Create Shopee Shortlinks</h2>
      <p>Extract image preview from URL content, create shortlink with Shopee affiliate link. Share on Facebook with beautiful preview!</p>
    </div>

    <div class="features">
      <div class="feature-card">
        <div class="feature-icon">🖼️</div>
        <h3>Image Preview</h3>
        <p>Extract image from any URL</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔗</div>
        <h3>Shortlink</h3>
        <p>Create short URL with preview</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📱</div>
        <h3>Direct to App</h3>
        <p>Opens Shopee app directly</p>
      </div>
    </div>

    <div class="converter">
      <h3>Generate Shortlink</h3>
      
      <div class="step-section">
        <div class="step-header">
          <span class="step-num">1</span>
          <span class="step-title">Extract Image Preview from URL</span>
        </div>
        <label for="content-url">URL Content (untuk ambil image preview)</label>
        <input type="url" id="content-url" placeholder="https://shopee.com.my/product/... atau mana-mana URL" />
        <button class="btn btn-extract" id="btn-extract">Extract Preview</button>
        <div id="extract-error" class="error hide"></div>
        <div id="extract-success" class="success hide"></div>
        <div id="preview-box" class="preview-box hide">
          <img id="preview-image" class="preview-image" src="" alt="Preview" />
          <div id="preview-title" class="preview-title"></div>
          <div id="preview-desc" class="preview-desc"></div>
        </div>
      </div>

      <div class="step-section">
        <div class="step-header">
          <span class="step-num">2</span>
          <span class="step-title">Shopee Affiliate Link (Final Destination)</span>
        </div>
        <label for="affiliate-url">Shopee Affiliate Link</label>
        <input type="url" id="affiliate-url" placeholder="https://s.shopee.com.my/... (affiliate link anda)" />
        <div id="affiliate-error" class="error hide"></div>
      </div>

      <div class="step-section">
        <div class="step-header">
          <span class="step-num">3</span>
          <span class="step-title">Custom Title & Description (Optional)</span>
        </div>
        <label for="custom-title">Title (untuk Facebook preview)</label>
        <input type="text" id="custom-title" placeholder="Contoh: Promosi Hebat! Diskaun 50%" />
        <label for="custom-desc">Description</label>
        <input type="text" id="custom-desc" placeholder="Contoh: Klik untuk beli sekarang!" />
      </div>

      <button class="btn-generate" id="btn-generate">🚀 Generate Shortlink</button>
      <div id="generate-error" class="error hide"></div>
      
      <div id="output" class="output hide">
        <label>Your Shortlink (Share this on Facebook)</label>
        <div class="output-row">
          <input type="text" id="generated-url" readonly />
          <button class="btn-copy" id="btn-copy">Copy</button>
        </div>
        <p style="font-size: 0.75rem; color: #666; margin-top: 8px;">Share link ini di Facebook - image preview akan muncul dan bila klik terus masuk Shopee app!</p>
        <div class="tip">
          <p><strong>💡 Cara ia berfungsi:</strong> Bila share di Facebook, image preview akan muncul. Bila orang klik, mereka akan redirect ke Shopee app (jika installed) atau web Shopee.</p>
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
      <h3>Cara Penggunaan</h3>
      <ol>
        <li><span class="inst-num">1</span><span>Masukkan URL content untuk extract image preview (boleh guna URL produk Shopee atau mana-mana URL)</span></li>
        <li><span class="inst-num">2</span><span>Klik "Extract Preview" untuk ambil image dan metadata</span></li>
        <li><span class="inst-num">3</span><span>Masukkan Shopee affiliate link anda sebagai final destination</span></li>
        <li><span class="inst-num">4</span><span>Klik "Generate Shortlink" untuk create shortlink</span></li>
        <li><span class="inst-num">5</span><span>Copy dan share shortlink di Facebook - image preview akan muncul!</span></li>
      </ol>
    </div>
  </main>

  <footer>
    <p>© 2024 Shopee Shortlink Generator. Untuk affiliate marketing Shopee.</p>
  </footer>

  <script>
    let linkHistory = JSON.parse(localStorage.getItem('shopee_shortlink_history') || '[]');
    let extractedData = null;

    const contentUrlEl = document.getElementById('content-url');
    const affiliateUrlEl = document.getElementById('affiliate-url');
    const customTitleEl = document.getElementById('custom-title');
    const customDescEl = document.getElementById('custom-desc');
    const btnExtract = document.getElementById('btn-extract');
    const btnGenerate = document.getElementById('btn-generate');
    const outputEl = document.getElementById('output');
    const generatedEl = document.getElementById('generated-url');
    const btnCopy = document.getElementById('btn-copy');
    const extractErrorEl = document.getElementById('extract-error');
    const extractSuccessEl = document.getElementById('extract-success');
    const affiliateErrorEl = document.getElementById('affiliate-error');
    const generateErrorEl = document.getElementById('generate-error');
    const previewBoxEl = document.getElementById('preview-box');
    const previewImageEl = document.getElementById('preview-image');
    const previewTitleEl = document.getElementById('preview-title');
    const previewDescEl = document.getElementById('preview-desc');
    const historyToggle = document.getElementById('history-toggle');
    const historyList = document.getElementById('history-list');
    const historyCount = document.getElementById('history-count');
    const historyArrow = document.getElementById('history-arrow');

    function hideAllErrors() {
      extractErrorEl.classList.add('hide');
      extractSuccessEl.classList.add('hide');
      affiliateErrorEl.classList.add('hide');
      generateErrorEl.classList.add('hide');
    }

    function showError(el, msg) {
      el.textContent = msg;
      el.classList.remove('hide');
    }

    function updateHistoryUI() {
      historyCount.textContent = linkHistory.length;
      if (linkHistory.length === 0) {
        document.getElementById('history-section').classList.add('hide');
        return;
      }
      document.getElementById('history-section').classList.remove('hide');
      historyList.innerHTML = linkHistory.map(item => \`
        <div class="history-item" data-id="\${item.id}">
          \${item.imageUrl ? '<img class="history-item-img" src="' + item.imageUrl + '" alt="Preview" />' : ''}
          <div class="history-item-info">
            <div class="history-item-url">\${item.shortUrl}</div>
            <div class="history-item-time">\${new Date(item.createdAt).toLocaleString()}</div>
          </div>
          <button class="history-btn history-btn-copy" onclick="copyHistoryItem('\${item.shortUrl}')">Copy</button>
          <button class="history-btn history-btn-del" onclick="deleteHistoryItem('\${item.id}')">Delete</button>
        </div>
      \`).join('');
    }

    function copyHistoryItem(url) {
      navigator.clipboard.writeText(url);
    }

    function deleteHistoryItem(id) {
      linkHistory = linkHistory.filter(item => item.id !== id);
      localStorage.setItem('shopee_shortlink_history', JSON.stringify(linkHistory));
      updateHistoryUI();
    }

    historyToggle.addEventListener('click', () => {
      historyList.classList.toggle('hide');
      historyArrow.classList.toggle('open');
    });

    btnExtract.addEventListener('click', async () => {
      hideAllErrors();
      previewBoxEl.classList.add('hide');
      extractedData = null;
      
      const url = contentUrlEl.value.trim();
      if (!url) {
        showError(extractErrorEl, 'Sila masukkan URL content');
        return;
      }

      try {
        new URL(url);
      } catch {
        showError(extractErrorEl, 'URL tidak valid');
        return;
      }

      btnExtract.disabled = true;
      btnExtract.innerHTML = '<span class="loading"></span>Extracting...';

      try {
        const res = await fetch('/api/extract-og?url=' + encodeURIComponent(url));
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to extract');
        }

        extractedData = data;
        
        if (data.image) {
          previewImageEl.src = data.image;
          previewImageEl.style.display = 'block';
        } else {
          previewImageEl.style.display = 'none';
        }
        
        previewTitleEl.textContent = data.title || 'No title';
        previewDescEl.textContent = data.description || 'No description';
        previewBoxEl.classList.remove('hide');
        
        if (data.title && !customTitleEl.value) {
          customTitleEl.value = data.title;
        }
        if (data.description && !customDescEl.value) {
          customDescEl.value = data.description;
        }
        
        extractSuccessEl.textContent = 'Preview extracted successfully!';
        extractSuccessEl.classList.remove('hide');
      } catch (e) {
        showError(extractErrorEl, e.message || 'Failed to extract preview');
      } finally {
        btnExtract.disabled = false;
        btnExtract.innerHTML = 'Extract Preview';
      }
    });

    btnGenerate.addEventListener('click', async () => {
      hideAllErrors();
      outputEl.classList.add('hide');
      
      const affiliateUrl = affiliateUrlEl.value.trim();
      if (!affiliateUrl) {
        showError(affiliateErrorEl, 'Sila masukkan Shopee affiliate link');
        return;
      }

      if (!affiliateUrl.includes('shopee.') && !affiliateUrl.includes('shp.ee') && !affiliateUrl.includes('s.shopee')) {
        showError(affiliateErrorEl, 'Sila masukkan link Shopee yang valid');
        return;
      }

      if (!extractedData || !extractedData.image) {
        showError(generateErrorEl, 'Sila extract preview terlebih dahulu (Step 1)');
        return;
      }

      btnGenerate.disabled = true;
      btnGenerate.innerHTML = '<span class="loading"></span>Generating...';

      try {
        const payload = {
          primary_url: affiliateUrl,
          og_title: customTitleEl.value.trim() || extractedData.title || 'Shopee Product',
          og_description: customDescEl.value.trim() || extractedData.description || 'Click to view',
          og_image_url: extractedData.image,
          mode: 'single',
          is_active: true
        };

        const res = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Sila login di Admin Panel terlebih dahulu');
          }
          throw new Error(data.error || 'Failed to create shortlink');
        }

        const slug = data.link.slug;
        const shortUrl = window.location.origin + '/' + slug;
        generatedEl.value = shortUrl;
        outputEl.classList.remove('hide');

        const historyItem = {
          id: Date.now().toString(),
          shortUrl: shortUrl,
          affiliateUrl: affiliateUrl,
          imageUrl: extractedData.image,
          createdAt: new Date().toISOString()
        };
        linkHistory = [historyItem, ...linkHistory.slice(0, 49)];
        localStorage.setItem('shopee_shortlink_history', JSON.stringify(linkHistory));
        updateHistoryUI();

        contentUrlEl.value = '';
        affiliateUrlEl.value = '';
        customTitleEl.value = '';
        customDescEl.value = '';
        extractedData = null;
        previewBoxEl.classList.add('hide');
      } catch (e) {
        showError(generateErrorEl, e.message || 'Failed to generate shortlink');
      } finally {
        btnGenerate.disabled = false;
        btnGenerate.innerHTML = '🚀 Generate Shortlink';
      }
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

// Google OAuth callback handler
app.get('/auth/callback', async (req, res) => {
  const { access_token, refresh_token } = req.query;
  
  if (access_token) {
    // Set cookie and redirect to admin
    res.cookie('sb-access-token', access_token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    if (refresh_token) {
      res.cookie('sb-refresh-token', refresh_token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
    }
    return res.redirect('/admin');
  }
  
  // Handle hash fragment (tokens in URL hash)
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(`<!doctype html>
<html>
<head><title>Authenticating...</title></head>
<body>
<script>
  // Extract tokens from hash fragment
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  
  if (accessToken) {
    // Send tokens to server to set cookies
    fetch('/auth/set-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
      credentials: 'include'
    }).then(() => {
      window.location.href = '/admin';
    }).catch(() => {
      window.location.href = '/admin';
    });
  } else {
    window.location.href = '/admin';
  }
</script>
<p>Authenticating... Please wait.</p>
</body>
</html>`);
});

// Set session from Google OAuth tokens
app.post('/auth/set-session', express.json(), async (req, res) => {
  const { access_token, refresh_token } = req.body;
  
  if (!access_token) {
    return res.status(400).json({ error: 'Missing access_token' });
  }
  
  try {
    // Verify token with Supabase and get user info
    const { supabase } = await import('./supabase.js');
    const { data: { user }, error } = await supabase.auth.getUser(access_token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Create or get user in our database
    const { getUserByEmail, createUser } = await import('./db/users.js');
    let dbUser = await getUserByEmail(user.email);
    
    if (!dbUser) {
      // Create new user from Google account
      const username = user.email.split('@')[0] + '_' + Date.now().toString(36);
      dbUser = await createUser({
        username,
        email: user.email,
        password_hash: 'google_oauth_' + Date.now(), // Placeholder, not used for OAuth
        is_admin: false
      });
    }
    
    // Generate JWT for our app
    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign(
      { userId: dbUser.id, username: dbUser.username },
      process.env.AUTH_JWT_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.cookie('auth_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.json({ success: true, user: { id: dbUser.id, username: dbUser.username } });
  } catch (e) {
    console.error('OAuth session error:', e);
    return res.status(500).json({ error: 'Failed to set session' });
  }
});

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
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,.12);">
              <button id="googleLogin" type="button" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; background: #fff; color: #333; border-radius: 12px; font-weight: 600;">
                <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign in with Google
              </button>
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
    $('googleLogin').addEventListener('click', () => {
      const redirectUrl = encodeURIComponent(window.location.origin + '/auth/callback');
      window.location.href = 'https://glmujwzavinmeanfrlre.supabase.co/auth/v1/authorize?provider=google&redirect_to=' + redirectUrl;
    });
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

app.get('/api/extract-og', async (req, res) => {
  const url = req.query.url
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' })
  }

  try {
    new URL(url)
  } catch {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.5',
      },
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return res.status(400).json({ error: 'Failed to fetch URL: ' + response.status })
    }

    const html = await response.text()

    const getMetaContent = (html, property) => {
      const patterns = [
        new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i'),
        new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, 'i'),
      ]
      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match && match[1]) return match[1]
      }
      return null
    }

    const getTitleTag = (html) => {
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      return match ? match[1].trim() : null
    }

    const getFirstImage = (html) => {
      const match = html.match(/<img[^>]*src=["']([^"']+)["']/i)
      return match ? match[1] : null
    }

    let image = getMetaContent(html, 'og:image') || 
                getMetaContent(html, 'twitter:image') || 
                getMetaContent(html, 'image')
    
    let title = getMetaContent(html, 'og:title') || 
                getMetaContent(html, 'twitter:title') || 
                getTitleTag(html)
    
    let description = getMetaContent(html, 'og:description') || 
                      getMetaContent(html, 'twitter:description') || 
                      getMetaContent(html, 'description')

    if (!image) {
      image = getFirstImage(html)
    }

    if (image && !image.startsWith('http')) {
      try {
        const baseUrl = new URL(url)
        if (image.startsWith('//')) {
          image = baseUrl.protocol + image
        } else if (image.startsWith('/')) {
          image = baseUrl.origin + image
        } else {
          image = new URL(image, url).href
        }
      } catch {
        // keep as is
      }
    }

    return res.json({
      title: title || null,
      description: description || null,
      image: image || null,
      url: url
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return res.status(500).json({ error: 'Failed to extract: ' + message })
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
