const VERSION = 'flipbook-proof-v4';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const PRECACHE = ['/', '/index.html', '/manifest.webmanifest', '/404.html', '/assets/icon.svg', '/assets/icon-192.png', '/assets/icon-512.png', '/assets/icon-512-maskable.png', '/assets/sf-flipbook-proof-apple-touch.png', '/assets/hero-workbench-720.webp', '/assets/hero-workbench-1200.webp', '/privacy/', '/terms/'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await cache.addAll(PRECACHE);
    const html = await (await fetch('/index.html')).text();
    const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
    await cache.addAll([...new Set(builtAssets)]);
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => ![SHELL, RUNTIME].includes(key)).map((key) => caches.delete(key)))),
    self.clients.claim(),
  ]));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith('/api/')) { event.respondWith(networkFirst(event.request)); return; }
  if (event.request.mode === 'navigate') { event.respondWith(networkFirst(event.request, '/index.html')); return; }
  event.respondWith(cacheFirst(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreVary: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(RUNTIME)).put(request, response.clone());
  return response;
}

async function networkFirst(request, fallback) {
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(RUNTIME)).put(request, response.clone());
    return response;
  } catch {
    return (await caches.match(request, { ignoreVary: true })) || (fallback && await caches.match(fallback, { ignoreVary: true })) || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}
