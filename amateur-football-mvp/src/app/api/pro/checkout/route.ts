import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
  try {
    const { userId, planType, price } = await request.json();

    if (!userId || !planType || !price) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: `pro_${planType}`,
            title: `Suscripción Pelotify PRO - ${planType.toUpperCase()}`,
            unit_price: Number(price),
            quantity: 1,
            currency_id: 'ARS',
          },
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/api/pro/success?user_id=${userId}&plan=${planType}`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/pro`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pro`,
        },
        auto_return: 'approved',
        external_reference: `pro-${userId}-${planType}`,
        metadata: {
          user_id: userId,
          type: 'pro_subscription'
        }
      }
    });

    return NextResponse.json({ id: result.id, init_point: result.init_point });
  } catch (error: any) {
    console.error('PRO Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
