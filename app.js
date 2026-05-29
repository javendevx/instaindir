/* ─── Config ─────────────────────────────────────────────────── */
const WORKER_URL = 'https://sparkling-paper-8379.jxveninc.workers.dev'
const COBALT_URL = WORKER_URL
/* ─── State ──────────────────────────────────────────────────── */
const MAX_HISTORY = 30;
let currentPage = 'home';

/* ─── DOM Refs ───────────────────────────────────────────────── */
const splash        = document.getElementById('splash');
const app           = document.getElementById('app');
const configBanner  = document.getElementById('config-banner');
const urlInput      = document.getElementById('url-input');
const pasteBtn      = document.getElementById('paste-btn');
const downloadBtn   = document.getElementById('download-btn');
const btnText       = document.getElementById('btn-text');
const btnSpinner    = document.getElementById('btn-spinner');
const statusMsg     = document.getElementById('status-msg');
const iosTip        = document.getElementById('ios-tip');
const wakeTip       = document.getElementById('wake-tip');
const historyList   = document.getElementById('history-list');
const clearHistBtn  = document.getElementById('clear-history-btn');

/* ─── Init ───────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  // Splash fade after 1.2s
  setTimeout(() => {
    splash.classList.add('fade-out');
    app.classList.remove('hidden');
    setTimeout(() => splash.remove(), 450);
  }, 1200);

  // Config warning
  if (!COBALT_URL || COBALT_URL === 'BURAYA_KOYEB_URL' || COBALT_URL === '') {
    configBanner.classList.remove('hidden');
    app.classList.add('has-banner');
  }

  // iOS detection
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) iosTip.classList.remove('hidden');

  // Show wake-up tip
  wakeTip.classList.remove('hidden');

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  renderHistory();
  setupNavigation();
  setupEvents();
});

/* ─── Navigation ─────────────────────────────────────────────── */
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      navigateTo(page);
    });
  });
}

function navigateTo(page) {
  if (page === currentPage) return;
  currentPage = page;

  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.page === page);
  });
  document.querySelectorAll('.page').forEach(p => {
    p.classList.toggle('active', p.id === `page-${page}`);
  });

  if (page === 'history') renderHistory();
}

/* ─── Events ─────────────────────────────────────────────────── */
function setupEvents() {
  pasteBtn.addEventListener('click', pasteFromClipboard);
  downloadBtn.addEventListener('click', );
  clearHistBtn.addEventListener('click', clearHistory);

  urlInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') ();
  });

  // Auto-paste on focus if clipboard has instagram url
  urlInput.addEventListener('focus', () => {
    if (urlInput.value) return;
    tryAutoFill();
  });
}

async function tryAutoFill() {
  try {
    const text = await navigator.clipboard.readText();
    if (text && isValidInstagramUrl(text)) {
      urlInput.value = text.trim();
    }
  } catch (_) {}
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      urlInput.value = text.trim();
      urlInput.focus();
    }
  } catch (_) {
    // Fallback: focus input so user can paste manually
    urlInput.focus();
    document.execCommand('paste');
  }
}

/* ─── URL Validation ─────────────────────────────────────────── */
function isValidInstagramUrl(url) {
  return /instagram\.com\/(p|reel|reels|tv|stories)\//.test(url);
}

/* ─── Download Handler ───────────────────────────────────────── */
async function handleDownload() {
  const rawUrl = urlInput.value.trim();

  if (!rawUrl) {
    showStatus('Lütfen bir Instagram bağlantısı girin.', 'error');
    return;
  }

  if (!isValidInstagramUrl(rawUrl)) {
    showStatus('Geçersiz Instagram bağlantısı. Desteklenen: /p/, /reel/, /reels/, /tv/, /stories/', 'error');
    return;
  }

  if (!COBALT_URL || COBALT_URL === 'BURAYA_KOYEB_URL') {
    showStatus('Cobalt sunucu URL\'si ayarlanmamış. app.js dosyasında COBALT_URL değerini güncelleyin.', 'error');
    return;
  }

  setLoading(true);
  showStatus('İndirme bağlantısı alınıyor...', 'loading');

  try {
    const response = await fetch(`${WORKER_URL}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        url: rawUrl,
        videoQuality: '720',
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody?.error?.code || `Sunucu hatası: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(data.error?.code || 'Bilinmeyen hata');
    }

    if (data.status === 'tunnel' || data.status === 'redirect') {
      const downloadUrl = data.url;
      saveToHistory(rawUrl, downloadUrl);
      triggerDownload(downloadUrl, rawUrl);
      urlInput.value = '';
    }

  } catch (err) {
    const msg = friendlyError(err.message);
    showStatus(msg, 'error');
  } finally {
    setLoading(false);
  }
}

/* ─── Trigger Download ───────────────────────────────────────── */
async function triggerDownload(url, sourceUrl) {
  const proxyUrl = `${WORKER_URL}/download?url=${encodeURIComponent(url)}`;
  const a = document.createElement('a');
  a.href = proxyUrl;
  a.download = generateFilename(sourceUrl);
  document.body.appendChild(a);
  a.click();
  setTimeout(() => a.remove(), 500);
  showStatus('✅ İndirme başladı! Dosyalar uygulamasını kontrol et.', 'success');
}
function generateFilename(sourceUrl) {
  try {
    const parts = new URL(sourceUrl).pathname.split('/').filter(Boolean);
    const id = parts[parts.length - 1] || 'video';
    return `instagram_${id}.mp4`;
  } catch {
    return 'instagram_video.mp4';
  }
}

/* ─── Error Messages ─────────────────────────────────────────── */
function friendlyError(msg) {
  const lower = (msg || '').toLowerCase();
  if (lower.includes('fetch') || lower.includes('network') || lower.includes('failed')) {
    return 'Sunucuya bağlanılamadı. Sunucunun açık olduğunu kontrol edin (ilk istekte 3-5 sn uyku olabilir), tekrar deneyin.';
  }
  if (lower.includes('private') || lower.includes('content_not_accessible')) {
    return 'Bu içerik gizli hesaba ait. Sadece herkese açık içerikler indirilebilir.';
  }
  if (lower.includes('not_found') || lower.includes('404')) {
    return 'İçerik bulunamadı. Bağlantının doğru olduğunu kontrol edin.';
  }
  if (lower.includes('rate') || lower.includes('limit')) {
    return 'Çok fazla istek gönderildi. Lütfen birkaç saniye bekleyip tekrar deneyin.';
  }
  if (lower.includes('cors')) {
    return 'CORS hatası. Cobalt sunucusunda CORS_WILDCARD=1 ayarlandığından emin olun.';
  }
  return `Hata: ${msg}`;
}

/* ─── UI Helpers ─────────────────────────────────────────────── */
function setLoading(on) {
  downloadBtn.disabled = on;
  btnText.classList.toggle('hidden', on);
  btnSpinner.classList.toggle('hidden', !on);
}

function showStatus(msg, type) {
  statusMsg.textContent = msg;
  statusMsg.className = `status-msg ${type}`;
  statusMsg.classList.remove('hidden');
}

/* ─── History ─────────────────────────────────────────────────── */
function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem('instaindir_history') || '[]');
  } catch {
    return [];
  }
}

function saveToHistory(sourceUrl, downloadUrl) {
  const history = loadHistory();
  history.unshift({
    sourceUrl,
    downloadUrl,
    timestamp: Date.now(),
  });
  if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
  localStorage.setItem('instaindir_history', JSON.stringify(history));
}

function clearHistory() {
  localStorage.removeItem('instaindir_history');
  renderHistory();
}

function renderHistory() {
  const history = loadHistory();

  if (!history.length) {
    historyList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>Henüz indirme geçmişi yok</p>
      </div>`;
    return;
  }

  historyList.innerHTML = history.map((item, i) => `
    <div class="history-item">
      <div class="history-item-icon">▼</div>
      <div class="history-item-body">
        <div class="history-item-url">${escapeHtml(item.sourceUrl)}</div>
        <div class="history-item-time">${formatTime(item.timestamp)}</div>
      </div>
      <button class="history-item-dl" data-index="${i}" title="Tekrar indir">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>
    </div>
  `).join('');

  historyList.querySelectorAll('.history-item-dl').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = loadHistory()[parseInt(btn.dataset.index)];
      if (item) triggerDownload(item.downloadUrl, item.sourceUrl);
    });
  });
}

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Az önce';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} dakika önce`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} saat önce`;
  return d.toLocaleDateString('tr-TR');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showVideoPlayer(url, sourceUrl) {
  statusMsg.innerHTML = `
    <div style="text-align:center">
      <video 
        id="insta-video"
        src="${url}" 
        controls 
        playsinline
        webkit-playsinline
        style="width:100%;border-radius:12px;margin-bottom:12px;max-height:400px"
      ></video>
      <a 
        href="${url}" 
        target="_blank"
        style="display:block;background:linear-gradient(135deg,#f09433,#dc2743,#bc1888);color:white;padding:14px;border-radius:12px;font-weight:700;font-size:16px;text-decoration:none;margin-top:8px;"
      >
        🔗 Videoyu Yeni Sekmede Aç
      </a>
      <p style="font-size:12px;color:#aaa;margin-top:10px;">
        Yeni sekmede açıldıktan sonra:<br/>
        <strong>Paylaş butonu → Dosyayı Kaydet</strong>
      </p>
    </div>
  `;
  statusMsg.className = 'status-msg success';
  statusMsg.classList.remove('hidden');
}
