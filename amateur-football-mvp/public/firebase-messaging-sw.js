// Firebase Cloud Messaging Service Worker
// This runs in the background to receive push notifications when the app is closed/minimized

// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// 💡 CLOUD CONFIG (Can be updated via postMessage from client)
let firebaseConfig = {
  apiKey: "AIzaSyCGudm4C7dvjTCT09TcUTGQTBWBuMbPCTQ",
  authDomain: "pelotifyapp.firebaseapp.com",
  projectId: "pelotifyapp",
  storageBucket: "pelotifyapp.firebasestorage.app",
  messagingSenderId: "55967873467",
  appId: "1:55967873467:web:db7a136a0e55aff7c5ac9e"
};

// Initialize Firebase in the service worker context
function initFirebase(config) {
  if (firebase.apps.length > 0) return;
  firebase.initializeApp(config);
}

// Initial init
initFirebase(firebaseConfig);
const messaging = firebase.messaging();

// Handle dynamic config updates from the client
self.addEventListener('message', (event) => {
  if (event.data?.type === 'FIREBASE_CONFIG') {
    initFirebase(event.data.config);
  }
});

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'Pelotify ⚽';
  const notificationOptions = {
    body: payload.notification?.body || '¡Tenés una nueva notificación!',
    icon: '/logo_pelotify.png',
    badge: '/logo_pelotify.png',
    tag: payload.data?.tag || 'pelotify-msg-' + Date.now(),
    requireInteraction: true,
    data: {
      click_action: payload.fcmOptions?.link || payload.data?.click_action || '/',
    },
    vibrate: [200, 100, 200],
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — open the app to the right page
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM SW] Notification clicked');

  event.notification.close();

  const clickAction = event.notification.data?.click_action || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If the app is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            url: clickAction,
          });
          return;
        }
      }
      // Otherwise open a new window
      return clients.openWindow(clickAction);
    })
  );
});

// Activate immediately and claim all clients
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
