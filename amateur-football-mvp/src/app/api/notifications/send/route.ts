// src/app/api/notifications/send/route.ts — API route to send push notifications
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPushToMultiple, PushNotificationPayload } from '@/lib/firebaseAdmin';

// Use service role for reading tokens (no RLS restrictions)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      matchId,
      excludeUserId,
      title,
      body: messageBody,
      clickAction,
      data,
      audience,
      sport,
      zone,
    } = body;

    if (!title || !messageBody) {
      return NextResponse.json({ error: 'title and body are required' }, { status: 400 });
    }

    const payload: PushNotificationPayload = {
      title,
      body: messageBody,
      icon: '/logo_pelotify.png',
      badge: '/logo_pelotify.png',
      click_action: clickAction || '/',
      data: {
        ...(data || {}),
        click_action: clickAction || '/', // Ensure it's in data for the SW fallback
        timestamp: new Date().toISOString(),
      },
    };

    // Mode 1: Send to a specific user
    if (userId) {
      const { data: tokens, error } = await supabaseAdmin
        .from('fcm_tokens')
        .select('token')
        .eq('user_id', userId);

      if (error || !tokens || tokens.length === 0) {
        return NextResponse.json({ sent: 0, message: 'No tokens found for user' });
      }

      const failedTokens = await sendPushToMultiple(
        tokens.map((t) => t.token),
        payload
      );

      // Clean up invalid tokens
      if (failedTokens.length > 0) {
        await supabaseAdmin
          .from('fcm_tokens')
          .delete()
          .in('token', failedTokens);
      }

      return NextResponse.json({
        sent: tokens.length - failedTokens.length,
        failed: failedTokens.length,
      });
    }

    // Mode 1.5: Smart discovery audience by sport / zone
    if (audience === 'discovery') {
      const matchingUserIds = await getDiscoveryAudienceUserIds({ sport, zone });

      if (matchingUserIds.length === 0) {
        return NextResponse.json({ sent: 0, message: 'No users matched discovery preferences' });
      }

      const { data: tokens, error: tokenError } = await supabaseAdmin
        .from('fcm_tokens')
        .select('token')
        .in('user_id', matchingUserIds);

      if (tokenError || !tokens || tokens.length === 0) {
        return NextResponse.json({ sent: 0, message: 'No tokens found for discovery audience' });
      }

      const allTokens = tokens.map((t) => t.token);
      const failedTokens = await sendPushToMultiple(allTokens, payload);

      if (failedTokens.length > 0) {
        await supabaseAdmin.from('fcm_tokens').delete().in('token', failedTokens);
      }

      return NextResponse.json({
        sent: allTokens.length - failedTokens.length,
        failed: failedTokens.length,
        matchedUsers: matchingUserIds.length,
      });
    }

    // Mode 2: Send to all participants of a match
    if (matchId) {
      // Get all participants of the match
      const { data: participants, error: partError } = await supabaseAdmin
        .from('match_participants')
        .select('user_id')
        .eq('match_id', matchId)
        .eq('status', 'confirmed');

      if (partError || !participants || participants.length === 0) {
        return NextResponse.json({ sent: 0, message: 'No participants found' });
      }

      // Get unique user IDs, excluding the sender
      const userIds = [...new Set(participants.map((p) => p.user_id))]
        .filter((id) => id !== excludeUserId);

      if (userIds.length === 0) {
        return NextResponse.json({ sent: 0, message: 'No other participants' });
      }

      // Get all tokens for those users
      const { data: tokens, error: tokenError } = await supabaseAdmin
        .from('fcm_tokens')
        .select('token')
        .in('user_id', userIds);

      if (tokenError || !tokens || tokens.length === 0) {
        return NextResponse.json({ sent: 0, message: 'No tokens found for participants' });
      }

      const allTokens = tokens.map((t) => t.token);
      const failedTokens = await sendPushToMultiple(allTokens, payload);

      // Clean up invalid tokens
      if (failedTokens.length > 0) {
        await supabaseAdmin
          .from('fcm_tokens')
          .delete()
          .in('token', failedTokens);
      }

      return NextResponse.json({
        sent: allTokens.length - failedTokens.length,
        failed: failedTokens.length,
        totalParticipants: userIds.length,
      });
    }

    return NextResponse.json({ error: 'userId or matchId required' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getDiscoveryAudienceUserIds({
  sport,
  zone,
}: {
  sport?: string;
  zone?: string;
}) {
  const userIds = new Set<string>();
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      console.error('Error listing users for discovery audience:', error);
      break;
    }

    const users = data.users || [];
    if (users.length === 0) break;

    users.forEach((user) => {
      const preferences = user.user_metadata?.preferences;
      const notifications = preferences?.notifications;
      if (!notifications?.enabled) return;

      const sports = Array.isArray(notifications.sports) ? notifications.sports : [];
      if (sport && sports.length > 0 && !sports.includes(sport)) return;

      const preferredZone = normalize(zone);
      const savedZone = normalize(notifications.zone || preferences?.preferredZone || '');
      if (preferredZone && savedZone && !savedZone.includes(preferredZone) && !preferredZone.includes(savedZone)) {
        return;
      }

      userIds.add(user.id);
    });

    if (users.length < perPage) break;
    page += 1;
  }

  return Array.from(userIds);
}

function normalize(value?: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
