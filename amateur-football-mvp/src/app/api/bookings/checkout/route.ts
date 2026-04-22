import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';
import { addMinutesToTime, getFieldPriceForTime, isSlotAvailable, normalizeTimeHHMM } from '@/lib/canchas';

const platformClient = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  try {
    const {
      businessId,
      fieldId,
      date,
      time,
      userId,
      durationMinutes,
      // Back-compat (client may still send these; we recompute server-side anyway)
      totalPrice: _totalPriceClient,
      downPayment: _downPaymentClient,
      bookingId,
    } = await request.json();

    if (!businessId || !fieldId || !date || !time || !userId) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const duration = Number.isFinite(Number(durationMinutes)) ? Number(durationMinutes) : 60;
    if (duration < 30 || duration > 240) {
      return NextResponse.json({ error: 'Duracion invalida' }, { status: 400 });
    }

    // 0) Fetch field: validate + compute price server-side
    const { data: field, error: fError } = await supabaseAdmin
      .from('canchas_fields')
      .select('id, business_id, is_active, price_per_match, time_pricing, down_payment_percentage')
      .eq('id', fieldId)
      .single();

    if (fError || !field) {
      return NextResponse.json({ error: 'Cancha no encontrada' }, { status: 404 });
    }
    if ((field as any).business_id !== businessId) {
      return NextResponse.json({ error: 'Cancha invalida para el establecimiento' }, { status: 400 });
    }
    if ((field as any).is_active === false) {
      return NextResponse.json({ error: 'Cancha no disponible' }, { status: 409 });
    }

    // 1. Obtener info del negocio y su token de MP
    const { data: business, error: bError } = await supabaseAdmin
      .from('canchas_businesses')
      .select('name, id, mp_access_token, owner_id')
      .eq('id', businessId)
      .single();

    if (bError || !business) {
      return NextResponse.json({ error: 'Establecimiento no encontrado' }, { status: 404 });
    }

    // 1.5) Availability check (server-side)
    const startTime = normalizeTimeHHMM(time);
    const { data: existingBookings, error: existingError } = await supabaseAdmin
      .from('canchas_bookings')
      .select('id, field_id, date, start_time, end_time, status')
      .eq('field_id', fieldId)
      .eq('date', date)
      .neq('status', 'cancelled');

    if (existingError) {
      return NextResponse.json({ error: 'Error validando disponibilidad' }, { status: 500 });
    }

    const isFree = isSlotAvailable({
      bookings: ((existingBookings || []) as any[]).filter((b) => (bookingId ? b.id !== bookingId : true)),
      fieldId,
      date,
      startTime,
      durationMinutes: duration,
    });

    if (!isFree) {
      return NextResponse.json({ error: 'Horario ocupado' }, { status: 409 });
    }

    // 1.6) Compute pricing server-side (avoid tampering)
    const hourlyPrice = getFieldPriceForTime(field as any, startTime);
    const totalPrice = Math.round((hourlyPrice * duration) / 60);
    const downPaymentPct = Math.round(Number((field as any).down_payment_percentage || 0));
    const downPayment = Math.round((totalPrice * downPaymentPct) / 100);

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

    // 3. Obtener o crear la reserva en estado PENDING
    let booking;
    if (bookingId) {
       const { data: existingBooking, error: exError } = await supabaseAdmin
         .from('canchas_bookings')
         .select('*')
         .eq('id', bookingId)
         .single();
       if (exError) throw exError;
       booking = existingBooking;
    } else {
       const { data: newBooking, error: bkError } = await supabaseAdmin
         .from('canchas_bookings')
         .insert([{
           field_id: fieldId,
           date,
           start_time: startTime,
           end_time: addMinutesToTime(startTime, duration),
           booker_id: userId,
           status: 'pending',
           total_price: totalPrice,
           down_payment_paid: 0,
           title: 'Reserva Directa'
         }])
         .select()
         .single();
       if (bkError) throw bkError;
       booking = newBooking;
    }

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
