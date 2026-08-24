// =============================================
// Larvae Survey App – Service Worker
// Enables offline use & PWA install
// =============================================

const CACHE_NAME = 'larva-survey-v12'; // permanent compact verification QR in PDF header

// Resolve every local file against the folder containing this service worker.
// This works at both a root domain and a project URL such as
// https://aamus.github.io/larvae-survey/.
const APP_ROOT = new URL('./', self.location.href);
const appAsset = path => new URL(path, APP_ROOT).href;

// Files to cache for offline use
const ASSETS = [
  '',
  'index.html',
  'style.css',
  'app.js',
  'report.js',
  'bangla-text.js',
  'directory.js',
  'manifest.json',
  'icon-512.jpg',
  'icon-192.png',
  'larva-found.png',
  'larva-not-found.png',
  'qr-code-report.png',                // fixed verification QR artwork
  'fonts/NotoSansBengali-Regular.ttf', // Bangla PDF font
  'libs/jspdf.umd.min.js',             // PDF engine — offline
  'libs/jspdf.plugin.autotable.min.js',// PDF table plugin — offline
].map(appAsset);

// CDN assets to cache when available (Google Fonts for UI text rendering)
const CDN_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap',
];

// ---- Install: cache all core assets ----
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache local assets (required)
      cache.addAll(ASSETS).catch(e => console.warn('Core cache failed:', e));
      // Cache CDN assets (optional, best-effort)
      CDN_ASSETS.forEach(url => {
        fetch(url).then(res => {
          if (res.ok) cache.put(url, res);
        }).catch(() => {});
      });
    })
  );
  self.skipWaiting();
});

// ---- Activate: clean old caches ----
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ---- Fetch: serve from cache, fallback to network ----
self.addEventListener('fetch', event => {
  // Skip non-GET and chrome-extension requests
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      // Not in cache: fetch from network and cache it
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        // Cache the new resource
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      }).catch(() => {
        // Offline fallback: return cached index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match(appAsset('index.html'));
        }
      });
    })
  );
});
