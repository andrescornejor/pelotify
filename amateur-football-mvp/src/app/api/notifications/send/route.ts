// src/app/api/notifications/send/route.ts — API route to send push notifications
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPushNotification, sendPushToMultiple, PushNotificationPayload } from '@/lib/firebaseAdmin';

// Use service role for reading tokens (no RLS restrictions)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, matchId, excludeUserId, title, body: messageBody, clickAction, data } = body;

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
  } catch (error: any) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
