// src/hooks/useNotifications.ts — React hook for FCM push notifications
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { initializePushNotifications, removeFCMToken } from '@/lib/notifications';
import { onForegroundMessage } from '@/lib/firebase';

interface InAppNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  clickAction?: string;
  timestamp: number;
}

export function useNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [inAppNotifications, setInAppNotifications] = useState<InAppNotification[]>([]);
  const [showInApp, setShowInApp] = useState<InAppNotification | null>(null);
  const initializedRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Check support on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Auto-initialize when user logs in
  useEffect(() => {
    if (!user?.id || !isSupported || initializedRef.current) return;

    // Only auto-initialize if permission was previously granted
    if (Notification.permission === 'granted') {
      initializePushNotifications(user.id).then((token) => {
        if (token) {
          setFcmToken(token);
          setPermission('granted');
          initializedRef.current = true;
        }
      });
    }
  }, [user?.id, isSupported]);

  // Listen for foreground messages
  useEffect(() => {
    if (!fcmToken) return;

    const setupForegroundListener = async () => {
      const unsubscribe = await onForegroundMessage((payload) => {
        const notification: InAppNotification = {
          id: crypto.randomUUID(),
          title: payload.notification?.title || 'Pelotify',
          body: payload.notification?.body || '',
          icon: payload.notification?.icon,
          clickAction: payload.fcmOptions?.link || payload.data?.click_action,
          timestamp: Date.now(),
        };

        setInAppNotifications((prev) => [notification, ...prev].slice(0, 20));
        setShowInApp(notification);

        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowInApp((current) => (current?.id === notification.id ? null : current));
        }, 5000);
      });

      if (unsubscribe) {
        unsubscribeRef.current = unsubscribe;
      }
    };

    setupForegroundListener();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [fcmToken]);

  // Listen for notification click from service worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_CLICK' && event.data?.url) {
        window.location.href = event.data.url;
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  /**
   * Request notification permission and initialize FCM.
   * Call this from a user interaction (button click).
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !isSupported) return false;

    try {
      const token = await initializePushNotifications(user.id);
      if (token) {
        setFcmToken(token);
        setPermission('granted');
        initializedRef.current = true;
        return true;
      }
      setPermission(Notification.permission);
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [user?.id, isSupported]);

  /**
   * Dismiss the in-app notification toast.
   */
  const dismissInApp = useCallback(() => {
    setShowInApp(null);
  }, []);

  /**
   * Clear all in-app notifications.
   */
  const clearAll = useCallback(() => {
    setInAppNotifications([]);
  }, []);

  return {
    isSupported,
    permission,
    fcmToken,
    requestPermission,
    inAppNotifications,
    showInApp,
    dismissInApp,
    clearAll,
    unreadCount: inAppNotifications.length,
  };
}
