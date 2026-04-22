'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
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
        isLoading,
      }}
    >
      {showLoader ? (
        <div className="fixed inset-0 bg-[#020203] flex flex-col items-center justify-center z-[9999] overflow-hidden">
          {/* Cinematic Background - Subtle gradient shift */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="relative flex flex-col items-center gap-12">
            {/* Optimized Logo Reveal */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* CSS-only Pulsing Rings - Zero JS overhead */}
              <div className="absolute inset-0 rounded-[2.5rem] border border-primary/20 animate-[ping_3s_linear_infinite] opacity-20" />
              <div className="absolute inset-4 rounded-[2rem] border border-primary/30 animate-[ping_3s_linear_infinite] opacity-30" style={{ animationDelay: '1.5s' }} />
              
              {/* Main Brand Icon */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-24 h-24 bg-foreground/[0.03] backdrop-blur-xl rounded-[2.2rem] border border-primary/30 shadow-[0_0_60px_rgba(var(--primary-rgb),0.15)] flex items-center justify-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-40" />
                
                {/* Floating Logo Symbol */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 flex flex-col items-center"
                >
                  <img 
                    src="/logo_pelotify.png" 
                    alt="Pelotify" 
                    className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]" 
                  />
                </motion.div>

                {/* Scanning Light Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full animate-[shimmer_2s_infinite_linear]" style={{ backgroundSize: '200% 100%' }} />
              </motion.div>

              {/* Orbital Ring - Performance optimized */}
              <div className="absolute inset-[-10px] rounded-[3rem] border border-primary/10 animate-[spin_10s_linear_infinite]" />
            </div>

            {/* Brand & Loading Info */}
            <div className="flex flex-col items-center gap-5">
              <div className="flex flex-col items-center">
                <motion.h1 
                  initial={{ opacity: 0, letterSpacing: "0.5em" }}
                  animate={{ opacity: 1, letterSpacing: "0.25em" }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="text-sm font-black uppercase text-white tracking-[0.25em]"
                >
                  PELOTIFY<span className="text-primary font-black">.</span>APP
                </motion.h1>
                <div className="mt-2 h-[1px] w-12 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              </div>

              {/* Optimized Progress Indicator */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-48 h-1 rounded-full bg-white/[0.03] border border-white/[0.05] overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary/5" />
                  <div 
                    className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-[skeleton-sweep_1.5s_infinite_ease-in-out]"
                    style={{ willChange: 'transform' }}
                  />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-foreground/30 animate-pulse">
                  Verificando credenciales...
                </p>
              </div>
            </div>
          </div>

          {/* Perspective Floor - High Visual / Zero Cost */}
          <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-[radial-gradient(circle_at_50%_100%,rgba(var(--primary-rgb),0.08),transparent_70%)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
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
