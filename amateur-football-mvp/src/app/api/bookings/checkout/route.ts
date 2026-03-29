import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const platformClient = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  try {
    const { businessId, fieldId, date, time, userId, totalPrice, downPayment } = await request.json();

    if (!businessId || !fieldId || !date || !time || !userId) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    // 1. Obtener info del negocio y su token de MP
    const { data: business, error: bError } = await supabaseAdmin
      .from('canchas_businesses')
      .select('name, mp_access_token, owner_id')
      .eq('id', businessId)
      .single();

    if (bError || !business) {
      return NextResponse.json({ error: 'Establecimiento no encontrado' }, { status: 404 });
    }

    // 2. Determinar el token a usar (negocio o dueño)
    let finalToken = business.mp_access_token;
    if (!finalToken) {
       const { data: owner } = await supabaseAdmin
         .from('profiles')
         .select('mp_access_token')
         .eq('id', business.owner_id)
         .single();
       finalToken = owner?.mp_access_token;
    }

    // 3. Crear la reserva en estado PENDING
    const { data: booking, error: bkError } = await supabaseAdmin
      .from('canchas_bookings')
      .insert([{
        field_id: fieldId,
        date,
        start_time: time,
        end_time: (parseInt(time.split(':')[0]) + 1) + ":00", // Asumimos 1 hora
        user_id: userId,
        status: 'pending',
        total_price: totalPrice,
        down_payment_paid: 0,
        title: 'Reserva Directa'
      }])
      .select()
      .single();

    if (bkError) throw bkError;

    // 4. Crear Preferencia de Mercado Pago
    let clientToUse = platformClient;
    if (finalToken) {
      clientToUse = new MercadoPagoConfig({ accessToken: finalToken });
    }

    const preference = new Preference(clientToUse);
    const amountToPay = downPayment > 0 ? downPayment : totalPrice;

    const result = await preference.create({
      body: {
        items: [
          {
            id: booking.id,
            title: `Reserva - ${business.name} (${date} ${time})`,
            unit_price: Number(amountToPay),
            quantity: 1,
            currency_id: 'ARS',
          },
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/establecimientos/${businessId}?payment=success&bookingId=${booking.id}`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/establecimientos/${businessId}?payment=failure`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/establecimientos/${businessId}?payment=pending`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago?booking_id=${booking.id}`,
        external_reference: `booking:${booking.id}`,
        metadata: {
          booking_id: booking.id,
          type: 'direct_booking'
        }
      }
    });

    return NextResponse.json({ id: result.id, init_point: result.init_point });
  } catch (error: any) {
    console.error('Booking Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
