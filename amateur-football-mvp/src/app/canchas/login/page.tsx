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
      await login(email, password);
      // Wait for AuthContext routing to take over, but fallback to manually routing
      router.push('/canchas');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] bg-background selection:bg-primary selection:text-background overflow-hidden relative font-outfit">
      {/* ── LEFT PANEL: AUTH FORM ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10">
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
               Dashboard <br /> <span className="text-primary">Canchas</span>
             </h1>
             <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em] italic lg:ml-1 text-center lg:text-left w-full">
               Panel de establecimientos
             </p>
          </div>

          <div className="flex flex-col gap-8">
            {error && (
              <div className="bg-danger/10 text-danger border border-danger/20 p-4 rounded-xl text-sm font-semibold">
                {error}
              </div>
            )}

            {/* Traditional Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="space-y-2">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    placeholder="admin@complejo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white/[0.02] border border-white/5 focus:bg-white/[0.04] focus:border-primary/50 outline-none transition-all text-sm font-bold text-foreground placeholder:text-zinc-700 font-kanit"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 bg-primary text-zinc-950 font-black text-[12px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-70 shadow-2xl shadow-primary/20 group/btn relative overflow-hidden mt-4"
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
      <div className="hidden lg:flex flex-[1.2] relative overflow-hidden bg-zinc-950 border-l border-white/5">
         <motion.div 
           initial={{ scale: 1.1, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1.5 }}
           className="absolute inset-0"
           style={{
             backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbb1b377b5?q=80&w=2675&auto=format&fit=crop')",
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
                 <span className="text-xs font-black uppercase tracking-[0.5em] text-primary italic">Business</span>
               </div>
               <h2 className="text-7xl font-black italic text-white uppercase tracking-tighter leading-[0.8] drop-shadow-2xl font-kanit">
                 GESTIONA TUS <br /> CANCHAS <br /> <span className="text-primary">COMO NUNCA.</span>
               </h2>
               <p className="text-sm text-white/60 font-medium tracking-wide max-w-md leading-relaxed mt-4">
                 Todo en un solo lugar. Reservas, señas, reportes, precios y disponibilidad en tiempo real para todos los jugadores.
               </p>
            </motion.div>
         </div>
      </div>
    </div>
  );
}
