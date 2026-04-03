// src/lib/notifications.ts — Client-side notification helpers + Supabase token storage
import { supabase } from './supabase';
import { requestFCMToken } from './firebase';

/**
 * Register the FCM service worker with Firebase config injected.
 * Must be called before requesting token.
 */
export async function registerFCMServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

  try {
    // Register the dedicated Firebase messaging SW
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });

    // Inject Firebase config into the service worker via postMessage
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    // Wait for the SW to be ready
    await navigator.serviceWorker.ready;

    // Set config on the SW global scope (for the importScripts init)
    if (registration.active) {
      registration.active.postMessage({
        type: 'FIREBASE_CONFIG',
        config: firebaseConfig,
      });
    }

    console.log('Firebase Messaging SW registered');
    return registration;
  } catch (error) {
    console.error('Failed to register Firebase Messaging SW:', error);
    return null;
  }
}

/**
 * Save the FCM token to Supabase for the given user.
 * Uses upsert to avoid duplicates.
 */
export async function saveFCMToken(userId: string, token: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('fcm_tokens')
      .upsert(
        {
          user_id: userId,
          token,
          device_type: getDeviceType(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'token' }
      );

    if (error) {
      console.error('Error saving FCM token:', error);
    } else {
      console.log('FCM token saved for user:', userId);
    }
  } catch (err) {
    console.error('Failed to save FCM token:', err);
  }
}

/**
 * Remove an FCM token from Supabase (on logout or token refresh).
 */
export async function removeFCMToken(token: string): Promise<void> {
  try {
    await supabase.from('fcm_tokens').delete().eq('token', token);
  } catch (err) {
    console.error('Failed to remove FCM token:', err);
  }
}

/**
 * Get all FCM tokens for a user (used server-side to send notifications).
 */
export async function getUserFCMTokens(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('fcm_tokens')
    .select('token')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching FCM tokens:', error);
    return [];
  }

  return (data || []).map((row) => row.token);
}

/**
 * Get FCM tokens for multiple users.
 */
export async function getMultipleUsersFCMTokens(userIds: string[]): Promise<{ userId: string; token: string }[]> {
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from('fcm_tokens')
    .select('user_id, token')
    .in('user_id', userIds);

  if (error) {
    console.error('Error fetching multiple FCM tokens:', error);
    return [];
  }

  return (data || []).map((row) => ({ userId: row.user_id, token: row.token }));
}

/**
 * Full initialization flow: register SW → request permission → get token → save to DB.
 */
export async function initializePushNotifications(userId: string): Promise<string | null> {
  // 1. Register the FCM service worker
  await registerFCMServiceWorker();

  // 2. Request permission and get token
  const token = await requestFCMToken();
  if (!token) return null;

  // 3. Save token to Supabase
  await saveFCMToken(userId, token);

  return token;
}

/**
 * Send a notification to a specific user via the API route.
 */
export async function sendNotificationToUser(
  targetUserId: string,
  title: string,
  body: string,
  options?: {
    clickAction?: string;
    data?: Record<string, string>;
  }
): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: targetUserId,
        title,
        body,
        clickAction: options?.clickAction,
        data: options?.data,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send notification:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

/**
 * Send notification to all participants of a match.
 */
export async function notifyMatchParticipants(
  matchId: string,
  excludeUserId: string,
  title: string,
  body: string,
  clickAction?: string
): Promise<void> {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId,
        excludeUserId,
        title,
        body,
        clickAction: clickAction || `/match/${matchId}`,
      }),
    });

    if (!response.ok) {
      console.error('Failed to notify match participants');
    }
  } catch (error) {
    console.error('Error notifying match participants:', error);
  }
}

// Helpers

function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown';

  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Macintosh|Mac OS/.test(ua)) return 'macos';
  if (/Windows/.test(ua)) return 'windows';
  return 'web';
}
