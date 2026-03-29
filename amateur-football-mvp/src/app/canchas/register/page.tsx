'use client';

import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, MapPin, Building, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function CanchasRegisterPage() {
  const router = useRouter();
  const { login } = useAuth(); // to login implicitly after register
  
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Register User in Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.businessName, // store business name in user metadata temporarily
            role: 'venue_admin'
          }
        }
      });

      if (signUpError) throw signUpError;
      
      if (!signUpData.user) {
        throw new Error('Error al crear el usuario. Intenta nuevamente.');
      }

      // 2. Automatically create the business
      const { error: businessError } = await supabase.from('canchas_businesses').insert([
        {
          owner_id: signUpData.user.id,
          name: formData.businessName,
        }
      ]);

      if (businessError) {
         console.warn("Could not insert business instantly (Make sure you ran the SQL).", businessError);
         // Don't throw, we still successfully created the auth user. 
         // They will see the "Bienvenido, ponte en contacto" screen
      }

      setSuccess(true);
      
      // Auto-login and bypass email confirmation for demo
      await login(formData.email, formData.password);
      router.push('/canchas');

    } catch (err: any) {
      setError(err.message || 'Error al registrar el establecimiento.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] bg-background selection:bg-primary selection:text-background overflow-hidden relative font-outfit">
      {/* ── LEFT PANEL: AUTH FORM ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10 overflow-y-auto pt-24 lg:pt-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[420px]"
        >
          {/* Header */}
          <div className="flex flex-col items-center lg:items-start gap-3 mb-10">
             <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center glow-primary mb-2">
                <MapPin className="w-8 h-8 text-black" />
             </div>
             <h1 className="text-4xl lg:text-5xl font-black italic text-foreground tracking-tighter uppercase leading-[0.9] text-center lg:text-left font-kanit">
               Alta de <br /> <span className="text-primary">Establecimiento</span>
             </h1>
          </div>

          <div className="flex flex-col gap-8">
            {error && (
              <div className="bg-danger/10 text-danger border border-danger/20 p-4 rounded-xl text-sm font-semibold">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-success/10 text-success border border-success/20 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4"/> ¡Cuenta creada! Redirigiendo al panel...
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              <div className="space-y-2">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Building className="w-5 h-5 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Nombre del Complejo (ej. El Óvalo)"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({...prev, businessName: e.target.value}))}
                    className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white/[0.02] border border-white/5 focus:bg-white/[0.04] focus:border-primary/50 outline-none transition-all text-sm font-bold text-foreground placeholder:text-zinc-700 font-kanit"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    placeholder="dueño@complejo.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white/[0.02] border border-white/5 focus:bg-white/[0.04] focus:border-primary/50 outline-none transition-all text-sm font-bold text-foreground placeholder:text-zinc-700 font-kanit"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                    className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white/[0.02] border border-white/5 focus:bg-white/[0.04] focus:border-primary/50 outline-none transition-all text-sm font-bold text-foreground placeholder:text-zinc-700 font-kanit"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="password"
                    placeholder="Confirmar Contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
                    className={cn(
                      "w-full h-16 pl-14 pr-6 rounded-2xl bg-white/[0.02] border outline-none transition-all text-sm font-bold text-foreground placeholder:text-zinc-700 font-kanit",
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-white/5 focus:border-primary/50'
                    )}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full h-16 bg-primary text-zinc-950 font-black text-[12px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-70 shadow-2xl shadow-primary/20 group/btn relative overflow-hidden mt-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CONVERTIRSE EN SOCIO'}
              </button>
            </form>
            
            <div className="text-center">
              <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] font-kanit">
                ¿YA TENÉS CUENTA?{' '}
                <Link href="/canchas/login" className="text-primary hover:text-white transition-colors underline decoration-primary/30 underline-offset-4">
                  INGRESAR ACÁ
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL: CINEMATIC HERO ── */}
      <div className="hidden lg:flex flex-[1.2] relative overflow-hidden bg-zinc-950 border-l border-white/5">
         <motion.div 
           initial={{ scale: 1.1, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1.5 }}
           className="absolute inset-0"
           style={{
             backgroundImage: "url('https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=2670&auto=format&fit=crop')",
             backgroundSize: "cover",
             backgroundPosition: "center"
           }}
         >
           <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
           <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
           <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-transparent to-transparent" />
         </motion.div>

         <div className="relative z-20 flex flex-col justify-end p-20 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
               <div className="flex items-center gap-4">
                 <div className="w-12 h-1 bg-primary rounded-full" />
                 <span className="text-xs font-black uppercase tracking-[0.5em] text-primary italic">Registra tu complejo</span>
               </div>
               <h2 className="text-7xl font-black italic text-white uppercase tracking-tighter leading-[0.8] drop-shadow-2xl font-kanit">
                 LA RED MÁS <br /> GRANDE TE <br /> <span className="text-primary">ESPERA.</span>
               </h2>
               <p className="text-sm text-white/60 font-medium tracking-wide max-w-md leading-relaxed mt-4">
                 Únite a los más de 50 recintos que ya automatizan sus reservas diarias. Conecta tu cuenta y olvídate del papel.
               </p>
            </motion.div>
         </div>
      </div>
    </div>
  );
}
