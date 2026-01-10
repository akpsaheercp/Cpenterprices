
const CACHE_NAME = 'cpenterprices-cache-v8';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './index.tsx',
  './logo.svg'
];

// Domains that should always bypass cache (APIs, Auth, Firestore)
const IGNORED_DOMAINS = [
  'firestore.googleapis.com',
  'googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com'
];

// External assets we WANT to cache (Fonts, Icons, CDN libs)
const EXTERNAL_CACHE_DOMAINS = [
  'cdn.tailwindcss.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn-icons-png.flaticon.com',
  'aistudiocdn.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Network First for Firebase/API calls (Critical for Realtime Sync)
  if (IGNORED_DOMAINS.some(domain => url.hostname.includes(domain))) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'offline' }), { 
            headers: { 'Content-Type': 'application/json' } 
        });
      })
    );
    return;
  }

  // 2. Stale-While-Revalidate for Static Assets & CDNs
  if (
      STATIC_ASSETS.map(asset => new URL(asset, self.location.href).pathname).includes(url.pathname) || 
      EXTERNAL_CACHE_DOMAINS.some(domain => url.hostname.includes(domain))
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
             // Network failed, rely solely on cache
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Network First for everything else
  event.respondWith(fetch(event.request));
});
