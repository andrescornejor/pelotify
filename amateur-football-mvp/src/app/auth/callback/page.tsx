'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // The Supabase client automatically handles the code exchange
      // when it detects the code in the URL on the client side
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { id, user_metadata, email } = session.user;
        
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', id)
          .single();

        if (!profile) {
          // Create default profile for OAuth users
          await supabase.from('profiles').insert({
            id: id,
            name: user_metadata?.full_name || user_metadata?.name || email?.split('@')[0] || 'Jugador',
            position: 'DC',
            avatar_url: user_metadata?.avatar_url || user_metadata?.picture,
            matches: 0,
            matches_won: 0,
            goals: 0,
            elo: 0,
            mvp_count: 0
          });
        }
      }
      
      // Redirect to home
      router.push('/');
    };

    handleAuthCallback();
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-foreground/60 font-black uppercase tracking-widest text-xs italic">
          Verificando credenciales...
        </p>
      </div>
    </div>
  );
}
