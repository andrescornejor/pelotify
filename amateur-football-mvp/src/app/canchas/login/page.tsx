'use client';

import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CanchasLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password, '/canchas');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark flex min-h-[100dvh] bg-background selection:bg-primary selection:text-background overflow-hidden relative font-kanit">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-20 bg-zinc-950 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[440px] py-4"
        >
          {/* Header */}
          <div className="flex flex-col items-center lg:items-start gap-10 mb-14">
             <Link href="/" className="group/logo transition-all duration-700 hover:scale-110">
                <div className="relative">
                   <div className="absolute -inset-10 bg-primary/20 blur-[50px] rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                   <img 
                      src="/logo_pelotify.png" 
                      className="w-32 h-32 md:w-36 md:h-36 object-contain relative z-10 drop-shadow-[0_0_25px_rgba(44,252,125,0.5)]" 
                      alt="Pelotify Premium" 
                   />
                </div>
             </Link>
             
             <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-black italic text-white tracking-tighter uppercase leading-[0.8] text-center lg:text-left font-kanit">
                  PANEL <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-white drop-shadow-[0_0_20px_rgba(44,252,125,0.3)] font-kanit">DUEÑOS</span>
                </h1>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                   <div className="h-px w-8 bg-primary/40" />
                   <p className="text-[12px] font-black text-white/40 uppercase tracking-[0.4em] italic">
                     Professional Management
                   </p>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-8">
            {error && (
              <div className="bg-danger/10 text-danger border border-danger/20 p-4 rounded-xl text-sm font-semibold animate-scale-in">
                {error}
              </div>
            )}

            {/* Traditional Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="space-y-1">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    placeholder="admin@complejo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white/[0.03] border border-white/10 focus:bg-white/[0.06] focus:border-primary/50 outline-none transition-all text-sm font-bold text-white placeholder:text-zinc-600 font-kanit"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white/[0.03] border border-white/10 focus:bg-white/[0.06] focus:border-primary/50 outline-none transition-all text-sm font-bold text-white placeholder:text-zinc-600 font-kanit"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 bg-primary text-zinc-950 font-black text-[13px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-70 shadow-2xl shadow-primary/20 group/btn relative overflow-hidden mt-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'INGRESAR AL PANEL'}
              </button>
            </form>

            <div className="text-center mt-2">
              <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] font-kanit">
                ¿AÚN NO ERES SOCIO?{' '}
                <Link href="/canchas/register" className="text-primary hover:text-white transition-colors underline decoration-primary/30 underline-offset-4">
                  REGISTRA TU ESTABLECIMIENTO
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL: CINEMATIC HERO ── */}
      <div className="hidden lg:flex flex-[1.2] relative overflow-hidden bg-zinc-950">
         <motion.div 
           initial={{ scale: 1.1, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1.5 }}
           className="absolute inset-0"
           style={{
             backgroundImage: "url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2670&auto=format&fit=crop')",
             backgroundSize: "cover",
             backgroundPosition: "center"
           }}
         >
           {/* Transición Ultra-Suave (Sin Corte) */}
           <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 via-zinc-950/20 to-transparent z-10 pointer-events-none" />
           <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-0" />
           <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent z-10" />
         </motion.div>

         <div className="relative z-20 flex flex-col justify-end p-20 w-full pb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-8"
            >
               <div className="flex items-center gap-4">
                 <div className="w-16 h-1.5 bg-primary rounded-full shadow-[0_0_20px_rgba(44,252,125,0.6)]" />
                 <span className="text-xs font-black uppercase tracking-[0.5em] text-primary italic">Manager Solutions</span>
               </div>
               
               <div className="space-y-4">
                 <h2 className="text-7xl xl:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.8] drop-shadow-2xl font-kanit">
                   GESTOR <br /> DEFINITIVO <br /> <span className="text-primary italic">EMPEZÁ HOY.</span>
                 </h2>
                 <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] max-w-sm leading-relaxed italic border-l-2 border-white/10 pl-6">
                    Automatiza tus ingresos, controla tus turnos y domina la zona con la herramienta definitiva para dueños de canchas.
                 </p>
               </div>

               <div className="flex gap-10 pt-10 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-2xl font-black italic text-white">100%</p>
                    <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Seguridad</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-black italic text-white">24/7</p>
                    <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Disponibilidad</p>
                  </div>
               </div>
            </motion.div>
         </div>
      </div>
    </div>

  );
}
