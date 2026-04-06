import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const paymentId = searchParams.get('payment_id');

  if (!userId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/pro?error=no_user`);
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  try {
    // 1. Update the user profile to PRO
    const { error } = await supabaseAdmin.from('profiles').update({
      is_pro: true,
      pro_since: new Date().toISOString(),
      pro_subscription_id: paymentId,
    }).eq('id', userId);

    if (error) throw error;

    // 2. Redirect to Profile with a success flag
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/profile?id=me&pro_success=true`);
  } catch (error: any) {
    console.error('PRO Success Route Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/pro?error=update_failed`);
  }
}
