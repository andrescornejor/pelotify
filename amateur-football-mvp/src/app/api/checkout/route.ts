import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase admin for secure database querying ignoring RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Fallback configuration para pagos simples
const platformClient = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
  try {
    const { matchId, title, price, userId, quantity = 1 } = await request.json();

    if (!matchId || !price || !userId) {
      return NextResponse.json({ error: 'Missing matchId, price or userId' }, { status: 400 });
    }

    // 1. Obtener la información del partido y su creador
    const { data: match, error: matchError } = await supabaseAdmin
      .from('matches')
      .select('creator_id')
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

    // Determinar si el creador tiene MP Connect activo y establecer el cliente
    let clientToUse = platformClient;
    
    // Cálculo de precios y comisiones (Volviendo al modelo 15% para que el creador gane limpio)
    const basePrice = Number(price);
    const serviceFeePerItem = Math.ceil(basePrice * 0.15); // 15% sobre el precio base
    const finalPricePerItem = basePrice + serviceFeePerItem;
    
    // Nuestra ganancia real como plataforma Pelotify (5%)
    const platformCommissionPerItem = Math.ceil(basePrice * 0.05);

    let marketplaceFee = 0;

    if (creatorProfile && creatorProfile.mp_access_token) {
      // El creador conectó su cuenta: creamos la preferencia en SU nombre
      clientToUse = new MercadoPagoConfig({ accessToken: creatorProfile.mp_access_token });
      
      // Nuestra ganancia real de uso de plataforma
      marketplaceFee = platformCommissionPerItem * Number(quantity); 
    } else {
      console.warn("El creador no vinculó Mercado Pago, el dinero irá a la plataforma");
      // Incluso si va a la plataforma, le cobramos al usuario el cargo de servicio por equidad
    }

    const preference = new Preference(clientToUse);

    // Using external_reference to store matchId:userId for easy lookup in webhook
    // Y también enviar creator_id para gestionar webhooks si es necesario
    const externalReference = `${matchId}:${userId}`;

    const preferenceBody: any = {
      items: [
        {
          id: matchId,
          title: title || `Reserva de lugar - Pelotify`,
          unit_price: finalPricePerItem,
          quantity: Number(quantity),
          currency_id: 'ARS',
        },
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/match?id=${matchId}&payment=success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/match?id=${matchId}&payment=failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/match?id=${matchId}&payment=pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago?creator_id=${match.creator_id}`,
      external_reference: externalReference,
      metadata: {
        match_id: matchId,
        user_id: userId
      }
    };

    // Agregar la comisión (fee) si usamos MP Connect
    if (marketplaceFee > 0) {
      preferenceBody.marketplace_fee = marketplaceFee;
    }

    const result = await preference.create({ body: preferenceBody });

    return NextResponse.json({ id: result.id, init_point: result.init_point });
  } catch (error: any) {
    console.error('Mercado Pago Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

