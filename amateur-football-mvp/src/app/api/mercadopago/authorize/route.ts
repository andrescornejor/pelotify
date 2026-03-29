import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/mercadopago/callback`;
  const clientId = process.env.NEXT_PUBLIC_MP_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ error: 'MP_CLIENT_ID not set in environment variables' }, { status: 500 });
  }

  // Pass userId in state to recover it in callback
  const authUrl = `https://auth.mercadopago.com/authorization?client_id=${clientId}&response_type=code&platform_id=mp&state=${userId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return NextResponse.redirect(authUrl);
}
