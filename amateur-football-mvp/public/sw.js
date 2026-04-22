const CACHE_NAME = 'pelotify-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/logo_pelotify.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
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

// Widget Management
self.addEventListener('widgetclick', (event) => {
  if (event.action === 'open-match' && event.data.matchId) {
    event.waitUntil(clients.openWindow(`/match?id=${event.data.matchId}`));
  } else if (event.action === 'create-match') {
    event.waitUntil(clients.openWindow('/create'));
  } else if (event.action === 'open-profile') {
    event.waitUntil(clients.openWindow('/profile/me'));
  } else if (event.action === 'search-match') {
    event.waitUntil(clients.openWindow('/search'));
  } else if (event.action === 'open-ranks') {
    event.waitUntil(clients.openWindow('/ranks'));
  } else {
    event.waitUntil(clients.openWindow('/'));
  }
});

self.addEventListener('widgetinstall', (event) => {
  console.log('Widget installed:', event.widget.tag);
  event.waitUntil(Promise.resolve());
});

self.addEventListener('widgetuninstall', (event) => {
  console.log('Widget uninstalled:', event.widget.tag);
  event.waitUntil(Promise.resolve());
});

self.addEventListener('widgetresume', (event) => {
  console.log('Widget resumed:', event.widget.tag);
  event.waitUntil(Promise.resolve());
});

self.addEventListener('fetch', (event) => {
  // We can add caching logic here for better offline experience
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

