const CACHE = 'dreamscape-foundations-v1';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/assets/app-icon.svg', '/assets/cosmos/original.avif', '/assets/reference/illuminated-figure.png', '/sample-corpus.json', '/src/app/app.js', '/src/app/app.css', '/src/app/cosmos.css', '/src/app/cosmos.js', '/src/app/evidence.js', '/src/app/vault.js', '/src/app/rooms.js', '/src/app/planets.js'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('dreamscape-foundations-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Cache only the explicit public shell. Private narratives never enter the HTTP cache.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || (!SHELL.includes(url.pathname) && event.request.mode !== 'navigate')) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok && SHELL.includes(url.pathname)) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))); }
    return response;
  }).catch(() => caches.match(event.request).then(response => response || (event.request.mode === 'navigate' ? caches.match('/index.html') : Response.error()))));
});
