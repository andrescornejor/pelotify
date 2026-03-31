const CACHE_NAME = 'pelotify-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/logo_pelotify.png',
  '/icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
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
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // We can add caching logic here for better offline experience
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
