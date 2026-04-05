'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { LogIn, Mail, Lock, ArrowRight, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const { login, loginWithGoogle, sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      // Error managed in alert inside context
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(forgotEmail);
      setShowForgotModal(false);
      setForgotEmail('');
    } catch (error) {
      // Managed in alert
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] bg-background selection:bg-primary selection:text-background overflow-hidden relative">
      {/* ── LEFT PANEL: AUTH FORM ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[380px] flex flex-col justify-center h-full"
        >
          {/* Header */}
          <div className="flex flex-col items-center lg:items-start gap-2 mb-6">
            <Link href="/" className="w-16 h-16 mb-2 block lg:hidden">
              <img src="/logo_pelotify.png" alt="Logo" className="w-full h-full object-contain" />
            </Link>
            <h1 className="text-3xl lg:text-5xl font-black italic text-foreground tracking-tighter uppercase leading-[0.85] text-center lg:text-left font-kanit">
              Entrar a la <br /> <span className="text-primary">Cancha</span>
            </h1>
            <p className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.3em] italic lg:ml-1 text-center lg:text-left w-full">
              Tu ficha personal de jugador
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Social Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full h-14 bg-white text-zinc-950 font-black text-[11px] uppercase tracking-[0.15em] rounded-2xl flex items-center justify-center gap-4 hover:bg-zinc-100 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-white/5 group/google"
            >
              <img
                src="https://www.google.com/favicon.ico"
                className="w-4 h-4 group-hover/google:scale-110 transition-transform"
                alt="Google"
              />
              {isGoogleLoading ? 'Conectando...' : 'Google'}
            </button>

            <div className="flex items-center gap-4 px-4 font-kanit">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">O</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Traditional Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  placeholder="jugador@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white/[0.02] border border-white/5 focus:bg-white/[0.04] focus:border-primary/50 outline-none transition-all text-sm font-bold text-foreground placeholder:text-zinc-700"
                  required
                />
              </div>

              <div className="relative group/input">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white/[0.02] border border-white/5 focus:bg-white/[0.04] focus:border-primary/50 outline-none transition-all text-sm font-bold text-foreground placeholder:text-zinc-700"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-primary/40 hover:text-primary uppercase tracking-widest transition-colors"
                >
                  ¿Olvido?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-primary text-zinc-950 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-70 shadow-2xl shadow-primary/20 group/btn relative overflow-hidden mt-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                {isLoading ? 'CALENTANDO...' : 'SALTAR A LA CANCHA'}
              </button>
            </form>

            <div className="text-center mt-4 space-y-4">
              <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.15em]">
                ¿No tenés cuenta?{' '}
                <Link href="/register" className="text-primary hover:text-white transition-colors underline decoration-primary/30 underline-offset-4">
                  FICHATE ACÁ
                </Link>
              </p>

              <div className="pt-4 border-t border-white/5 opacity-30 hover:opacity-100 transition-opacity">
                <p className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em]">
                  ¿Tenés un complejo?{' '}
                  <Link href="/canchas/login" className="text-primary hover:text-white transition-colors underline decoration-primary/30 underline-offset-4">
                    ADMINISTRÁ TU SEDE
                  </Link>
                </p>
              </div>
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
        >
          <img
            src="/login_hero.png"
            className="w-full h-full object-cover opacity-60 grayscale-[0.2] hover:grayscale-0 transition-all duration-[3000ms]"
            alt="Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
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
              <span className="text-xs font-black uppercase tracking-[0.5em] text-primary italic">Pelotify Official</span>
            </div>
            <h2 className="text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.8] drop-shadow-2xl">
              LA GLORIA <br /> SE ESCRIBE <br /> <span className="text-primary">EN LA CANCHA.</span>
            </h2>
            <p className="text-lg text-white/50 font-bold uppercase tracking-widest max-w-md leading-relaxed">
              Unite a la red de fútbol amateur más grande del país. Armá tu equipo, desafiá rivales y dominá el ranking.
            </p>
          </motion.div>
        </div>

      </div>

      {/* FORGOT PASSWORD MODAL */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 md:">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md glass-premium rounded-[2.5rem] p-8 lg:p-10 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16 rounded-full" />

              <form onSubmit={handleForgotSubmit} className="space-y-8 relative z-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black italic text-foreground uppercase tracking-tighter">
                    Recuperar <span className="text-primary">Ficha</span>
                  </h2>
                  <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em] italic">
                    Seguridad de Jugador
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.3em] ml-1">
                    Email de tu cuenta
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-foreground/45 group-focus-within/input:text-primary transition-colors" />
                    </div>
                    <input
                      type="email"
                      className="w-full h-14 pl-14 pr-6 bg-background/40 border border-foreground/5 rounded-2xl text-foreground text-sm font-black outline-none focus:border-primary/50 transition-all placeholder:foreground/10"
                      placeholder="messi@ejemplo.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest ml-1 leading-relaxed text-center mt-4">
                    Te mandaremos un link para volver a activar tu ingreso.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 h-14 rounded-2xl bg-foreground/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="flex-[2] h-14 bg-primary text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-primary/20"
                  >
                    {isSendingReset ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Link'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
