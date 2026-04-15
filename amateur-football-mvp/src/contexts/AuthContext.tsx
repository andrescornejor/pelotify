'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getURL } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  user_metadata?: any;
  is_business?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string, redirectTo?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  register: (data: any) => Promise<{ needsConfirmation: boolean }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  completeTour: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Shared logic to fetch profile and normalize user state
  const handleUserSession = async (session: any) => {
    if (!session?.user) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const { user: authUser } = session;
    const metadata = authUser.user_metadata || {};

    try {
      // 1. Fetch profile from public schema (source of truth)
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // 1.5. Check if user is a business owner (Venue Admin)
      // We check both the database and the auth metadata for faster/more reliable detection
      const { data: business } = await supabase
        .from('canchas_businesses')
        .select('id')
        .eq('owner_id', authUser.id)
        .maybeSingle();

      const isBusiness = !!business || metadata.role === 'venue_admin';

      // 2. Ensure profile exists (especially for new Google users)
      // Skip for business owners as they don't necessarily need a player profile
      // and we want to avoid creating accidental player records for them
      if (!profile && !isBusiness && metadata.role !== 'venue_admin') {
        console.log('Ensuring profile for user:', authUser.id);
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .upsert({
            id: authUser.id,
            name:
              metadata.name || metadata.full_name || authUser.email?.split('@')[0] || 'Jugador',
            avatar_url: metadata.avatar_url,
            position: metadata.position || 'DC',
            age: parseInt(metadata.age) || 23,
            height: parseInt(metadata.height) || 175,
            preferred_foot: metadata.preferredFoot || metadata.preferred_foot || 'Derecha',
            updated_at: new Date().toISOString(),
          })
          .select()
          .maybeSingle();

        if (!insertError) profile = newProfile;
      }

      // 3. Normalize user state for the app
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: profile?.name || metadata.name || metadata.full_name || 'Jugador',
        avatar_url: profile?.avatar_url || metadata.avatar_url,
        user_metadata: { ...metadata, ...(profile || {}) },
        is_business: isBusiness,
      });
    } catch (err) {
      console.error('Critical error in auth session sync:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth event:', _event);
      handleUserSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Capacitor Deep Link Handling (Google Login return)
  useEffect(() => {
    const isApp = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform();
    if (!isApp) return;

    const handleDeepLink = async () => {
      try {
        // Dynamic import to avoid issues in browser environment
        const { App } = await import('@capacitor/app');

        App.addListener('appUrlOpen', async (data: any) => {
          console.log('Deep link received:', data.url);

          // Supabase sends tokens after the hash (#)
          // Format: com.pelotify.app://#access_token=...&refresh_token=...
          if (data.url && data.url.includes('#')) {
            const hash = data.url.split('#')[1];
            const params = new URLSearchParams(hash);
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');

            if (access_token && refresh_token) {
              const { error } = await supabase.auth.setSession({
                access_token,
                refresh_token,
              });

              if (!error) {
                console.log('Session set successfully from deep link');
                router.replace('/');
              } else {
                console.error('Error setting session:', error.message);
              }
            }
          }
        });
      } catch (err) {
        console.warn('Error setting up Deep Link listener:', err);
      }
    };

    handleDeepLink();
  }, [router]);

  // Protected route logic
  useEffect(() => {
    if (isLoading) return;

    const isAuthRoute =
      pathname === '/login' || pathname === '/register' || pathname === '/update-password' || pathname === '/canchas/login' || pathname === '/canchas/register' || pathname === '/email-confirmed';
    const isOnboardingRoute = pathname === '/onboarding';
    const isCanchasRoute = pathname?.startsWith('/canchas');
    const isPublicRoute = 
      pathname?.startsWith('/post/') || 
      pathname === '/highlights' || 
      (pathname === '/feed' && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('post'));

    if (!user && !isAuthRoute && !isCanchasRoute && pathname !== '/' && !isPublicRoute) {
      router.push('/login');
    } else if (!user && !isAuthRoute && isCanchasRoute && pathname !== '/canchas/login' && pathname !== '/canchas/register') {
      router.push('/canchas/login');
    } else if (user) {
      if (pathname === '/email-confirmed') {
        return; // Let user see the confirmation success screen before proceeding
      }

      // Check if user has finished onboarding (we store this in user_metadata)
      const hasOnboarded = user.user_metadata?.onboarded === true;
      const isBusiness = user.is_business;

      if (isBusiness && !isCanchasRoute && !isOnboardingRoute && pathname === '/') {
        router.push('/canchas');
      } else if (!isBusiness && !hasOnboarded && pathname !== '/onboarding' && !isCanchasRoute) {
        router.push('/onboarding');
      } else if ((hasOnboarded || isBusiness) && (isAuthRoute || pathname === '/onboarding')) {
        if (isCanchasRoute || isBusiness) {
          router.push('/canchas');
        } else {
          router.push('/');
        }
      }
    }
  }, [user, isLoading, pathname, router]);

  const checkConfig = () => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      alert(
        '⚠️ FALTA CONFIGURAR SUPABASE: Revisa el archivo .env.local y pon tus credenciales reales de Supabase URL y ANON KEY para que esto funcione.'
      );
      return false;
    }
    return true;
  };

  const login = async (email: string, password?: string, redirectTo: string = '/') => {
    if (!checkConfig()) return;

    // Si no pasan password, usamos un genérico para la demo si el usuario insiste
    // pero idealmente deberia ser un login real
    const loginPassword = password || '123456';

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: loginPassword,
    });

    if (error) {
      alert(`Error al iniciar sesión: ${error.message}`);
      throw error;
    }

    router.push(redirectTo);
  };

  const loginWithGoogle = async () => {
    if (!checkConfig()) return;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getURL(),
      },
    });

    if (error) {
      if (error.message.includes('provider is not enabled')) {
        alert(
          '⚠️ GOOGLE NO HABILITADO: Debes entrar al Dashboard de Supabase -> Authentication -> Providers y activar Google con tus credenciales.'
        );
      } else {
        alert(`Error al iniciar sesión con Google: ${error.message}`);
      }
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!checkConfig()) return;

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      alert(`Error al actualizar contraseña: ${error.message}`);
      throw error;
    }

    alert('✅ Contraseña actualizada con éxito.');
  };

  const sendPasswordResetEmail = async (email: string) => {
    if (!checkConfig()) return;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getURL()}/update-password`,
    });

    if (error) {
      alert(`Error al enviar correo de recuperación: ${error.message}`);
      throw error;
    }

    alert('✅ Correo de recuperación enviado. Revisa tu bandeja de entrada.');
  };

  const register = async (data: any): Promise<{ needsConfirmation: boolean }> => {
    if (!checkConfig()) return { needsConfirmation: false };

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password || '123456',
      options: {
        emailRedirectTo: `${getURL()}/email-confirmed`,
        data: {
          name: data.name,
          age: data.age,
          height: data.height,
          position: data.position,
          preferredFoot: data.preferredFoot,
        },
      },
    });

    if (error) {
      alert(`Error al registrar usuario: ${error.message}`);
      throw error;
    }

    // Try to create the public profile immediately
    if (signUpData.user) {
      try {
        await supabase.from('profiles').upsert({
          id: signUpData.user.id,
          name: data.name,
          position: data.position,
        });
      } catch (profileError) {
        console.warn('Could not create public profile automatically:', profileError);
      }
    }

    // If Supabase has email confirmation enabled, session will be null
    const needsConfirmation = !signUpData.session;

    if (!needsConfirmation) {
      router.push('/');
    }

    return { needsConfirmation };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.replace('/');
  };

  const deleteAccount = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      // --- MOBILE / CAPACITOR FIX ---
      // Las API routes estáticas (Next.js output: export) de Vercel fallan fuera de node.js
      // en cambio llamamos a un procedimiento interno en la Base de Datos RPC (Postgres)
      const { error: rpcError } = await supabase.rpc('delete_my_account');

      if (rpcError) {
        throw new Error(rpcError.message || 'Error al eliminar cuenta desde la BD');
      }

      await supabase.auth.signOut();
      setUser(null);
      router.replace('/login');
    } catch (error: any) {
      alert(`Error al eliminar cuenta: ${error.message}`);
      throw error;
    }
  };

  const isAuthRoute =
    pathname === '/login' || pathname === '/register' || pathname === '/update-password' || pathname === '/canchas/login' || pathname === '/canchas/register' || pathname === '/email-confirmed';
  const isCanchasRoute = pathname?.startsWith('/canchas');

  const isPublicRoute = 
    pathname?.startsWith('/post/') || 
    pathname === '/highlights' || 
    (pathname === '/feed' && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('post'));

  const showLoader =
    (isLoading && !isAuthRoute && !isPublicRoute) ||
    (!isLoading && !user && !isAuthRoute && !isCanchasRoute && pathname !== '/' && !isPublicRoute) ||
    (!isLoading && !user && isCanchasRoute && pathname !== '/canchas/login' && pathname !== '/canchas/register') ||
    (!isLoading && user && isAuthRoute);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        updatePassword,
        sendPasswordResetEmail,
        register,
        logout,
        deleteAccount,
        completeTour: async () => {
          if (!user) return;
          console.log('Completing tour for user:', user.id);
          const { error } = await supabase.auth.updateUser({
            data: { tour_completed: true }
          });
          if (!error) {
            setUser({
              ...user,
              user_metadata: { ...user.user_metadata, tour_completed: true }
            });
          }
        },
        refreshUser: async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) await handleUserSession(session);
        },
        isLoading,
      }}
    >
      {showLoader ? (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[9999] p-8 text-center animate-in fade-in duration-500">
          <div className="relative mb-10">
            {/* Outer rotating ring */}
            <div className="w-24 h-24 border-4 border-primary/5 border-t-primary rounded-full animate-[spin_1.5s_linear_infinite]" />
            {/* Middle pulse circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full animate-pulse border border-primary/20" />
            </div>
            {/* Inner glowing core */}
            <div className="absolute inset-10 bg-primary/40 rounded-full blur-md animate-pulse" />
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-black italic text-foreground tracking-tighter uppercase font-kanit">
                PELOTI<span className="text-primary">FY</span>
              </h1>
              <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.4em] font-kanit">
                CARGANDO TU ESTADIO...
              </p>
            </div>

            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
            </div>
          </div>

          {/* Background ambiance */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[500px] h-[500px] opacity-10 blur-[100px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #2cfc7d 0%, transparent 70%)' }}
          />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
