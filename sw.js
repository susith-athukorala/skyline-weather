/* Skyline Weather – service worker
 * Bump VERSION whenever you change index.html, icons or this file,
 * so installed copies pick up the update.
 */
const VERSION = 'skyline-v2';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

// Third-party files that rarely change: serve from cache first
const STATIC_HOSTS = /^https:\/\/(cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|openweathermap\.org\/img)/;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // The page itself: try the network so updates show, fall back to the cached copy offline
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, './index.html'));
    return;
  }
  // Own files, Chart.js, fonts and weather icons
  if (url.origin === self.location.origin || STATIC_HOSTS.test(req.url)) {
    event.respondWith(cacheFirst(req));
  }
  // Everything else (the API proxy, the Windy map) goes straight to the network.
  // The page keeps its own copy of the last weather data for offline use.
});

async function cacheFirst(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok || res.type === 'opaque') {
      const c = await caches.open(VERSION);
      c.put(req, res.clone());
    }
    return res;
  } catch (e) {
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

async function networkFirst(req, fallback) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const c = await caches.open(VERSION);
      c.put(fallback, res.clone());
    }
    return res;
  } catch (e) {
    return (await caches.match(fallback)) || new Response('Offline', { status: 503 });
  }
}
