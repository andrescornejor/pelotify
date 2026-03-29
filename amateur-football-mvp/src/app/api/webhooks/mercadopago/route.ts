import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const paymentId = url.searchParams.get('data.id');
    const creatorId = url.searchParams.get('creator_id');

    // MP sends notifications for several events. We only care about payments.
    if (type !== 'payment' || !paymentId) {
      return NextResponse.json({ received: true });
    }

    // Por default el token de la plataforma
    let accessTokenToUse = process.env.MP_ACCESS_TOKEN || '';

    // Si recibimos el creator_id, intentamos usar su token para leer el pago (MP Connect)
    if (creatorId) {
      const { data: creatorProfile } = await supabaseAdmin
        .from('profiles')
        .select('mp_access_token')
        .eq('id', creatorId)
        .single();
      
      if (creatorProfile && creatorProfile.mp_access_token) {
        accessTokenToUse = creatorProfile.mp_access_token;
      }
    }

    const client = new MercadoPagoConfig({ accessToken: accessTokenToUse });
    const payment = new Payment(client);
    const paymentDetails = await payment.get({ id: paymentId });

    if (paymentDetails.status === 'approved') {
      const externalReference = paymentDetails.external_reference;
      
      if (!externalReference) {
        console.error('No external_reference found in payment', paymentId);
        return NextResponse.json({ error: 'Missing external_reference' }, { status: 400 });
      }

      // 1. Handle Direct Venue Booking Payments
      if (externalReference.startsWith('booking:')) {
        const bookingId = externalReference.split(':')[1];
        
        // Fetch booking to see if it was a down payment or full
        const { data: booking } = await supabaseAdmin
          .from('canchas_bookings')
          .select('total_price, down_payment_paid')
          .eq('id', bookingId)
          .single();
        
        if (booking) {
          const amountPaid = (paymentDetails as any).transaction_details?.total_paid_amount || paymentDetails.transaction_amount;
          const isFullPayment = amountPaid >= booking.total_price;
          
          const { error } = await supabaseAdmin
            .from('canchas_bookings')
            .update({ 
               status: isFullPayment ? 'full_paid' : 'partial_paid',
               down_payment_paid: amountPaid,
               updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);
            
          if (error) throw error;
          console.log(`Booking confirmed: ${bookingId} (${isFullPayment ? 'FULL' : 'PARTIAL'})`);
        }
      } 
      // 2. Handle Individual Player Payments for Matches
      else {
        const [matchId, userId] = externalReference.split(':');

        if (matchId && userId) {
          const { error } = await supabaseAdmin
            .from('match_participants')
            .update({ paid: true })
            .eq('match_id', matchId)
            .eq('user_id', userId);

          if (error) {
            console.error('Supabase update error:', error);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
          }
          console.log(`Match payment confirmed for Match ${matchId}, User ${userId}`);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

