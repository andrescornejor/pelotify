import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/instagram/callback`;

  if (!clientId) {
    return NextResponse.json({ error: 'INSTAGRAM_CLIENT_ID no configurado' }, { status: 500 });
  }

  // Se redirige al Authorization Window de Instagram Basic Display API
  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code`;

  return NextResponse.redirect(authUrl);
}
