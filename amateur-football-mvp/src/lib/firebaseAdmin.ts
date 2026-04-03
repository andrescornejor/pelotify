// src/lib/firebaseAdmin.ts — Firebase Admin SDK for sending push notifications (server-side only)
import admin from 'firebase-admin';

function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccount) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY env var is missing');
    throw new Error('Firebase Admin SDK not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY.');
  }

  try {
    const parsed = JSON.parse(serviceAccount);
    return admin.initializeApp({
      credential: admin.credential.cert(parsed),
    });
  } catch (e) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e);
    throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY');
  }
}

export function getAdminMessaging() {
  const app = getFirebaseAdmin();
  return admin.messaging(app);
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  click_action?: string;
  data?: Record<string, string>;
}

/**
 * Send a push notification to a single device token.
 */
export async function sendPushNotification(
  token: string,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    const messaging = getAdminMessaging();

    await messaging.send({
      token,
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.icon,
      },
      webpush: {
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon || '/logo_pelotify.png',
          badge: payload.badge || '/logo_pelotify.png',
          requireInteraction: true,
          actions: [
            { action: 'open', title: 'Ver' },
          ],
        },
        fcmOptions: {
          link: payload.click_action || '/',
        },
      },
      data: payload.data,
    });

    return true;
  } catch (error: any) {
    // Token is invalid/expired — caller should remove it from DB
    if (
      error?.code === 'messaging/registration-token-not-registered' ||
      error?.code === 'messaging/invalid-registration-token'
    ) {
      console.warn('Invalid FCM token, should be removed:', token.slice(0, 20));
      return false;
    }
    console.error('Error sending push notification:', error);
    return false;
  }
}

/**
 * Send a push notification to multiple users by their tokens.
 * Returns the list of failed (invalid) tokens that should be removed from DB.
 */
export async function sendPushToMultiple(
  tokens: string[],
  payload: PushNotificationPayload
): Promise<string[]> {
  if (tokens.length === 0) return [];

  const failedTokens: string[] = [];

  // Send in parallel (Firebase handles rate limiting)
  const results = await Promise.allSettled(
    tokens.map(async (token) => {
      const success = await sendPushNotification(token, payload);
      if (!success) failedTokens.push(token);
    })
  );

  return failedTokens;
}
