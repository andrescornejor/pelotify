'use client';

import { useEffect, useState } from 'react';

export default function PWARegistration() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Handle beforeinstallprompt event for Chromium browsers
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('App installable: beforeinstallprompt caught');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      window.addEventListener('load', () => {
        // Register main PWA service worker
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('PWA SW registered: ', registration.scope);
          })
          .catch((registrationError) => {
            console.log('PWA SW registration failed: ', registrationError);
          });

        // Register Firebase Cloud Messaging service worker
        navigator.serviceWorker
          .register('/firebase-messaging-sw.js')
          .then((registration) => {
            console.log('FCM SW registered: ', registration.scope);
          })
          .catch((registrationError) => {
            console.log('FCM SW registration failed: ', registrationError);
          });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}
