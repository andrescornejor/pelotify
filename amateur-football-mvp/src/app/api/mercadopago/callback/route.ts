import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const userId = url.searchParams.get('state');

  if (!code || !userId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?error=invalid_callback`);
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/mercadopago/callback`;
  
  // El client_secret es obligatorio para el intercambio de tokens OAuth
  const clientSecret = process.env.MP_CLIENT_SECRET;
  const clientId = process.env.NEXT_PUBLIC_MP_CLIENT_ID;

  if (!clientSecret || !clientId) {
    console.error('Faltan credenciales de MP (MP_CLIENT_SECRET o MP_CLIENT_ID)');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?error=missing_config`);
  }

  try {
    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        client_secret: clientSecret,
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('MP Auth Error:', data);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?error=auth_failed`);
    }

    // Guardar tokens en el perfil del usuario
    await supabaseAdmin
      .from('profiles')
      .update({
        mp_access_token: data.access_token,
        mp_refresh_token: data.refresh_token,
        mp_user_id: data.user_id?.toString(),
        mp_public_key: data.public_key,
      })
      .eq('id', userId);

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?mp=success`);
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?error=exception`);
  }
}
