import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Fallback configuration para pagos simples
const platformClient = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
  // Setup Supabase admin for secure database querying ignoring RLS
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  try {
    const { matchId, title, price, userId, quantity = 1 } = await request.json();

    if (!matchId || !price || !userId) {
      return NextResponse.json({ error: 'Missing matchId, price or userId' }, { status: 400 });
    }

    // 1. Obtener la información del partido y su creador
    const { data: match, error: matchError } = await supabaseAdmin
      .from('matches')
      .select('creator_id, business_id')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
    }

    // 2. Obtener la información de MP del creador
    const { data: creatorProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('mp_access_token')
      .eq('id', match.creator_id)
      .single();

    // 2.5 Determinar si el partido pertenece a un establecimiento registrado (Canchas)
    const { data: bookingData } = await supabaseAdmin
      .from('canchas_bookings')
      .select('canchas_fields(canchas_businesses(id, mp_access_token, owner_id))')
      .eq('match_id', matchId)
      .single();

    let businessToken = null;
    let businessOwnerId = null;

    const booking: any = bookingData;
    if (booking?.canchas_fields) {
      const field = Array.isArray(booking.canchas_fields) ? booking.canchas_fields[0] : booking.canchas_fields;
      if (field?.canchas_businesses) {
        const business = Array.isArray(field.canchas_businesses) ? field.canchas_businesses[0] : field.canchas_businesses;
        if (business) {
          businessToken = business.mp_access_token;
          businessOwnerId = business.owner_id;
        }
      }
    }

    // Fallback: Si el establecimiento no tiene token directo, tomamos el del perfil del Dueño del Complejo
    if (!businessToken && businessOwnerId) {
       const { data: ownerProfile } = await supabaseAdmin
         .from('profiles')
         .select('mp_access_token')
         .eq('id', businessOwnerId)
         .single();
       if (ownerProfile?.mp_access_token) {
         businessToken = ownerProfile.mp_access_token;
       }
    }

    // Determinar si el creador o el establecimiento tienen MP Connect activo y establecer el cliente
    let clientToUse = platformClient;
    
    // Cálculo de precios y comisiones (Volviendo al modelo 15% para que reciban limpio)
    const basePrice = Number(price);
    const serviceFeePerItem = Math.ceil(basePrice * 0.15); // 15% sobre el precio base
    const finalPricePerItem = basePrice + serviceFeePerItem;
    
    // Nuestra ganancia real como plataforma Pelotify (5%)
    const platformCommissionPerItem = Math.ceil(basePrice * 0.05);

    let marketplaceFee = 0;

    const isPartner = !!match.business_id;

    if (businessToken) {
      // Prioridad 1: Token específico de la sede socia desde canchas_fields o perfil del dueño
       console.log("Cobro dirigido al token de la sede (Canchas Schema)");
       clientToUse = new MercadoPagoConfig({ accessToken: businessToken });
    } else if (creatorProfile && creatorProfile.mp_access_token && isPartner) {
      // Prioridad 2: Token del creador SOLO si es un partido en sede socia (respaldo)
      console.log("Cobro dirigido al creador como negocio (Partner)");
      clientToUse = new MercadoPagoConfig({ accessToken: creatorProfile.mp_access_token });
      marketplaceFee = platformCommissionPerItem * Number(quantity); 
    } else {
      // Prioridad 3: Sistema Escrow (Independientes)
      // Para partidos particulares o sin sede certificada, el dinero llega a la plataforma
      // centralizada para ser liberado post-partido tras validación.
      console.log("Cobro hacia la plataforma (Escrow Activo)");
      // clientToUse se mantiene con el token de la plataforma definido arriba
    }

    const preference = new Preference(clientToUse);

    // Using external_reference to store matchId:userId for easy lookup in webhook
    // Y también enviar creator_id para gestionar webhooks si es necesario
    const externalReference = `${matchId}:${userId}`;

    // Aseguramos que la URL base tenga protocolo
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    if (baseUrl.includes('vercel.app') && !baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`;
    }

    const preferenceBody: any = {
      items: [
        {
          id: matchId,
          title: title || `Reserva de lugar - Pelotify`,
          unit_price: Math.round(finalPricePerItem), // Aseguramos enteros
          quantity: Number(quantity),
          currency_id: 'ARS',
        },
      ],
      back_urls: {
        success: `${baseUrl}/match?id=${matchId}&payment=success`,
        failure: `${baseUrl}/match?id=${matchId}&payment=failure`,
        pending: `${baseUrl}/match?id=${matchId}&payment=pending`,
      },
      auto_return: 'approved',
      binary_mode: true, // Evita pagos pendientes
      // Simplificamos la URL de notificación para evitar errores de parseo
      notification_url: baseUrl.startsWith('https') 
        ? `${baseUrl}/api/webhooks/mercadopago?cid=${businessOwnerId || match.creator_id}`
        : undefined, 
      external_reference: externalReference,
      metadata: {
        match_id: matchId,
        user_id: userId
      }
    };

    // Agregar la comisión si usamos MP Connect
    if (marketplaceFee > 0) {
      // Mercado Pago requiere que marketplace_fee sea un número limpio
      preferenceBody.marketplace_fee = Math.round(marketplaceFee);
    }

    console.log("Creando preferencia con cuerpo:", JSON.stringify(preferenceBody, null, 2));
    
    const result = await preference.create({ body: preferenceBody });

    return NextResponse.json({ id: result.id, init_point: result.init_point });
  } catch (error: any) {
    console.error('Mercado Pago Error Detail:', error.message, error.stack);
    return NextResponse.json({ 
      error: error.message,
      detail: error.cause 
    }, { status: 500 });
  }
}

