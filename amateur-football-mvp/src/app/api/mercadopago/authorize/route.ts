import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  // Forzamos que la URL sea la de producción aunque estemos en un preview de Vercel
  // Esto evita tener que agregar cientos de URLs de previsualización al Dashboard de MP
  const redirectUri = process.env.NEXT_PUBLIC_MP_REDIRECT_URL || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/mercadopago/callback`;
  const clientId = process.env.NEXT_PUBLIC_MP_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ error: 'MP_CLIENT_ID not set in environment variables' }, { status: 500 });
  }

  // Use Argentina-specific URL to avoid country selection page
  const authUrl = `https://auth.mercadopago.com.ar/authorization?client_id=${clientId}&response_type=code&platform_id=mp&state=${userId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return NextResponse.redirect(authUrl);
}
