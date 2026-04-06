import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/profile?error=instagram_auth_failed`);
  }

  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/instagram/callback`;

  try {
    // 1. Intercambiar código por token de acceso corto
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error_message || !tokenData.access_token) {
      console.error('Error getting Instagram token:', tokenData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/profile?error=instagram_token_failed`);
    }

    // 2. Obtener información básica del usuario (username) via Instagram Graph API
    const userResponse = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${tokenData.access_token}`);
    const userData = await userResponse.json();

    if (!userData.username) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/profile?error=instagram_user_failed`);
    }

    const instagramUsername = userData.username;

    // 3. Setup Supabase Client
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login`);
    }

    // 4. Actualizar el perfil con el nombre de usuario de Instagram
    await supabase
      .from('profiles')
      .update({ instagram: instagramUsername })
      .eq('id', session.user.id);

    await supabase.auth.updateUser({
      data: { instagram: instagramUsername }
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/profile?success=instagram_linked`);
  } catch (err) {
    console.error('Instagram auth exception:', err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/profile?error=instagram_exception`);
  }
}
