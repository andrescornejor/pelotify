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
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password?: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
    sendPasswordResetEmail: (email: string) => Promise<void>;
    register: (data: any) => Promise<{ needsConfirmation: boolean }>;
    logout: () => Promise<void>;
    deleteAccount: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check active sessions and sets the user
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    const metadata = session.user.user_metadata || {};
                    setUser({
                        id: session.user.id,
                        email: session.user.email || '',
                        name: metadata.name || metadata.full_name || session.user.email?.split('@')[0] || 'Jugador',
                        avatar_url: metadata.avatar_url,
                        user_metadata: metadata,
                    });
                }
            } catch (error) {
                console.error("Error getting session:", error);
            } finally {
                setIsLoading(false);
            }
        };

        getSession();

        // Listen for changes on auth state (log in, log out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session?.user) {
                    const metadata = session.user.user_metadata || {};
                    const userData = {
                        id: session.user.id,
                        email: session.user.email || '',
                        name: metadata.name || metadata.full_name || session.user.email?.split('@')[0] || 'Jugador',
                        avatar_url: metadata.avatar_url,
                        user_metadata: metadata,
                    };
                    setUser(userData);

                    // Ensure profile exists for any authenticated user
                    // This is critical for features that depend on the 'profiles' table (FKs)
                    const ensureProfile = async () => {
                        try {
                            const { data: profile, error: fetchError } = await supabase
                                .from('profiles')
                                .select('id')
                                .eq('id', session.user.id)
                                .maybeSingle();
                            
                            if (fetchError) {
                                console.error("Error fetching profile in auth change:", fetchError);
                                return;
                            }

                            if (!profile) {
                                console.log("Creating missing profile for user:", session.user.id);
                                const { error: insertError } = await supabase.from('profiles').upsert({
                                    id: session.user.id,
                                    name: userData.name,
                                    avatar_url: userData.avatar_url,
                                    position: metadata.position || 'DC',
                                    age: parseInt(metadata.age) || 23,
                                    height: parseInt(metadata.height) || 175,
                                    preferred_foot: metadata.preferredFoot || metadata.preferred_foot || 'Derecha',
                                    updated_at: new Date().toISOString()
                                });

                                if (insertError) {
                                    console.error("Critical error: Could not create profile for Google user:", insertError);
                                } else {
                                    console.log("Profile auto-created successfully for:", session.user.id);
                                }
                            }
                        } catch (err) {
                            console.error("Unexpected error in ensureProfile:", err);
                        }
                    };

                    if (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION' || _event === 'USER_UPDATED') {
                        ensureProfile();
                    }
                } else {
                    setUser(null);
                }
                setIsLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Protected route logic
    useEffect(() => {
        if (isLoading) return;

        const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/update-password';

        if (!user && !isAuthRoute) {
            router.push('/login');
        } else if (user && isAuthRoute) {
            router.push('/');
        }
    }, [user, isLoading, pathname, router]);

    const checkConfig = () => {
        if (
            !process.env.NEXT_PUBLIC_SUPABASE_URL ||
            process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
        ) {
            alert("⚠️ FALTA CONFIGURAR SUPABASE: Revisa el archivo .env.local y pon tus credenciales reales de Supabase URL y ANON KEY para que esto funcione.");
            return false;
        }
        return true;
    };

    const login = async (email: string, password?: string) => {
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

        router.push('/');
    };

    const loginWithGoogle = async () => {
        if (!checkConfig()) return;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: getURL(),
            }
        });

        if (error) {
            if (error.message.includes("provider is not enabled")) {
                alert("⚠️ GOOGLE NO HABILITADO: Debes entrar al Dashboard de Supabase -> Authentication -> Providers y activar Google con tus credenciales.");
            } else {
                alert(`Error al iniciar sesión con Google: ${error.message}`);
            }
            throw error;
        }
    };

    const updatePassword = async (newPassword: string) => {
        if (!checkConfig()) return;

        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            alert(`Error al actualizar contraseña: ${error.message}`);
            throw error;
        }
        
        alert("✅ Contraseña actualizada con éxito.");
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
        
        alert("✅ Correo de recuperación enviado. Revisa tu bandeja de entrada.");
    };

    const register = async (data: any): Promise<{ needsConfirmation: boolean }> => {
        if (!checkConfig()) return { needsConfirmation: false };

        const { data: signUpData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password || '123456',
            options: {
                data: {
                    name: data.name,
                    age: data.age,
                    height: data.height,
                    position: data.position,
                    preferredFoot: data.preferredFoot,
                }
            }
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
                console.warn("Could not create public profile automatically:", profileError);
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
        router.replace('/login');
    };

    const deleteAccount = async () => {
        try {
            // Call a server-side API route to delete the user
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No hay sesión activa');

            const res = await fetch('/api/delete-account', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al eliminar cuenta');
            }

            await supabase.auth.signOut();
            setUser(null);
            router.replace('/login');
        } catch (error: any) {
            alert(`Error al eliminar cuenta: ${error.message}`);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginWithGoogle, updatePassword, sendPasswordResetEmail, register, logout, deleteAccount, isLoading }}>
            {children}
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
