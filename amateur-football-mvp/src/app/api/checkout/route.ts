import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Initialize Mercado Pago with the Access Token from .env
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
  try {
    const { matchId, title, price, userId, quantity = 1 } = await request.json();

    if (!matchId || !price || !userId) {
      return NextResponse.json({ error: 'Missing matchId, price or userId' }, { status: 400 });
    }

    const preference = new Preference(client);

    // Using external_reference to store matchId:userId for easy lookup in webhook
    const externalReference = `${matchId}:${userId}`;

    const result = await preference.create({
      body: {
        items: [
          {
            id: matchId,
            title: title || `Reserva de lugar - Pelotify`,
            unit_price: Number(price),
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
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
        external_reference: externalReference,
        metadata: {
          match_id: matchId,
          user_id: userId
        }
      },
    });

    return NextResponse.json({ id: result.id, init_point: result.init_point });
  } catch (error: any) {
    console.error('Mercado Pago Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
