import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Initialize MP
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

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

    // MP sends notifications for several events. We only care about payments.
    if (type !== 'payment' || !paymentId) {
      return NextResponse.json({ received: true });
    }

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

      // Update the database
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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
