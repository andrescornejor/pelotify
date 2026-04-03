// Firebase Cloud Messaging Service Worker
// This runs in the background to receive push notifications when the app is closed/minimized

// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Firebase config will be set via postMessage from the main app
let firebaseConfig = null;
let messagingInitialized = false;

// Listen for config from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    firebaseConfig = event.data.config;
    initializeFirebase();
  }
});

function initializeFirebase() {
  if (messagingInitialized || !firebaseConfig || !firebaseConfig.apiKey) return;

  try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Handle background messages (when the app is NOT in the foreground)
    messaging.onBackgroundMessage((payload) => {
      console.log('[FCM SW] Background message received:', payload);

      const notificationTitle = payload.notification?.title || 'Pelotify';
      const notificationOptions = {
        body: payload.notification?.body || 'Tenés una nueva notificación',
        icon: payload.notification?.icon || '/logo_pelotify.png',
        badge: '/logo_pelotify.png',
        tag: payload.data?.tag || 'pelotify-notification-' + Date.now(),
        requireInteraction: true,
        data: {
          click_action: payload.fcmOptions?.link || payload.data?.click_action || '/',
          ...payload.data,
        },
        vibrate: [200, 100, 200],
        actions: [
          { action: 'open', title: 'Abrir' },
          { action: 'dismiss', title: 'Cerrar' },
        ],
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });

    messagingInitialized = true;
    console.log('[FCM SW] Firebase Messaging initialized successfully');
  } catch (error) {
    console.error('[FCM SW] Error initializing Firebase:', error);
  }
}

// Handle notification click — open the app to the right page
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'dismiss') return;

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
