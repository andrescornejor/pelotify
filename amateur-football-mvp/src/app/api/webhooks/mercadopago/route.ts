import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Admin Supabase client (using service role to bypass RLS for updates)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const paymentId = url.searchParams.get('data.id');
    const receiverId = url.searchParams.get('receiver_id');

    // MP sends notifications for several events. We only care about payments.
    if (type !== 'payment' || !paymentId) {
      return NextResponse.json({ received: true });
    }

    // Por default el token de la plataforma
    let accessTokenToUse = process.env.MP_ACCESS_TOKEN || '';

    // Si recibimos el receiver_id, intentamos usar su token para leer el pago (MP Connect)
    if (receiverId) {
      // Intentamos primero ver si es un token de un establecimiento (Cancha)
      const { data: businessData } = await supabaseAdmin
        .from('canchas_businesses')
        .select('mp_access_token')
        .eq('owner_id', receiverId)
        .single();
        
      if (businessData && businessData.mp_access_token) {
        accessTokenToUse = businessData.mp_access_token;
      } else {
        // Fallback al profile
        const { data: creatorProfile } = await supabaseAdmin
          .from('profiles')
          .select('mp_access_token')
          .eq('id', receiverId)
          .single();
        
        if (creatorProfile && creatorProfile.mp_access_token) {
          accessTokenToUse = creatorProfile.mp_access_token;
        }
      }
    }

    const client = new MercadoPagoConfig({ accessToken: accessTokenToUse });
    const payment = new Payment(client);
    const paymentDetails = await payment.get({ id: paymentId });

    if (paymentDetails.status === 'approved') {
      // Extract our custom identifiers
      const externalReference = paymentDetails.external_reference;
      
      if (!externalReference) {
        console.error('No external_reference found in payment', paymentId);
        return NextResponse.json({ error: 'Missing external_reference' }, { status: 400 });
      }

      const [matchId, userId] = externalReference.split(':');

      if (!matchId || !userId) {
        console.error('Invalid external_reference format', externalReference);
        return NextResponse.json({ error: 'Invalid reference' }, { status: 400 });
      }

      // Check if it's a seña via metadata
      const isSena = paymentDetails.metadata?.is_sena === true;

      if (isSena) {
        // Actualizamos canchas_bookings
        const { error } = await supabaseAdmin
          .from('canchas_bookings')
          .update({ status: 'partial_paid', down_payment_paid: paymentDetails.transaction_amount })
          .eq('match_id', matchId);

        if (error) {
          console.error('Supabase update error (canchas_bookings):', error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
        console.log(`Seña payment confirmed for Match ${matchId}`);
      } else {
        // Update the database (normal match)
        const { error } = await supabaseAdmin
          .from('match_participants')
          .update({ paid: true })
          .eq('match_id', matchId)
          .eq('user_id', userId);

        if (error) {
          console.error('Supabase update error:', error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
        console.log(`Payment confirmed for Match ${matchId}, User ${userId}`);
      }

      console.log(`Payment confirmed for Match ${matchId}, User ${userId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

