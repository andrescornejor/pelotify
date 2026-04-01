'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  UserPlus,
  Mail,
  CheckCircle2,
  ArrowRight,
  User,
  Calendar,
  Ruler,
  Award,
  Shield,
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('⚠️ Las contraseñas no coinciden. Revisá la táctica y probá de nuevo.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(formData);
      if (result.needsConfirmation) {
        setRegisteredEmail(formData.email);
        setShowConfirmation(true);
      }
    } catch (error) {
      // Error managed in alert
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      setIsGoogleLoading(false);
    }
  };

  // Removed step functions because it's now a single-step form for auth

  if (showConfirmation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[450px] relative z-10"
        >
          <div className="glass-premium rounded-[3.5rem] p-12 border border-primary/30 text-center space-y-8 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative w-24 h-24 rounded-[2rem] bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-xl">
                <CheckCircle2 className="w-6 h-6 text-black" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">
                ¡Ficha Enviada!
              </h1>
              <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                Te mandamos un link de confirmación a <br />
                <span className="text-primary font-black italic tracking-tight">
                  {registeredEmail}
                </span>
                . <br />
                Confirmá tu ingreso para saltar al campo.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-left">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                💡 El árbitro dice: Si no ves el correo, revisá en la carpeta de{' '}
                <span className="text-foreground">Spam</span> o Correo No Deseado.
              </p>
            </div>

            <Link href="/login" className="block w-full">
              <button className="w-full h-16 bg-white/[0.05] hover:bg-white/[0.1] text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 transition-all border border-white/10 active:scale-95 group">
                VOLVER AL LOGIN{' '}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] bg-background selection:bg-primary selection:text-background overflow-hidden relative">
      {/* ── LEFT PANEL: AUTH FORM ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative z-10 transition-all duration-1000 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[380px] py-2"
        >
          {/* Header */}
          <div className="flex flex-col items-center lg:items-start gap-2 mb-6 mt-2 lg:mt-0">
            <Link href="/" className="w-16 h-16 mb-2 block lg:hidden">
              <img src="/logo_pelotify.png" alt="Logo" className="w-full h-full object-contain" />
            </Link>
            <h1 className="text-3xl lg:text-6xl font-black italic text-foreground tracking-tighter uppercase leading-[0.8] text-center lg:text-left font-kanit">
              Crear tu <br /> <span className="text-primary">Ficha</span>
            </h1>
            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em] italic lg:ml-1 text-center lg:text-left w-full mt-1">
              Agente Libre / Temporada 2026
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Social Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full h-12 bg-white text-zinc-950 font-black text-[12px] uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-100 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-white/5 group/google"
            >
              <img
                src="https://www.google.com/favicon.ico"
                className="w-4 h-4 group-hover/google:scale-110 transition-transform"
                alt="Google"
              />
              {isGoogleLoading ? 'Conectando...' : 'Ficharse con Google'}
            </button>

            <div className="flex items-center gap-4 px-4 font-kanit">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">O</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Traditional Form */}
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              <div className="space-y-2">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    placeholder="jugador@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/[0.02] border border-white/5 focus:bg-white/[0.04] focus:border-primary/50 outline-none transition-all text-sm font-bold text-foreground placeholder:text-zinc-700"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="password"
                    placeholder="Contraseña Maestra"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/[0.02] border border-white/5 focus:bg-white/[0.04] focus:border-primary/50 outline-none transition-all text-sm font-bold text-foreground placeholder:text-zinc-700"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="password"
                    placeholder="Confirmar Táctica"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className={cn(
                      "w-full h-12 pl-12 pr-4 rounded-xl bg-white/[0.02] border outline-none transition-all text-sm font-bold text-foreground placeholder:text-zinc-700",
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-white/5 focus:border-primary/50'
                    )}
                    required
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-4 animate-in fade-in slide-in-from-top-1">
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  isLoading ||
                  !formData.email ||
                  !formData.password ||
                  formData.password !== formData.confirmPassword
                }
                className="w-full h-12 bg-primary text-zinc-950 font-black text-[12px] uppercase tracking-[0.3em] rounded-xl flex items-center justify-center gap-3 hover:bg-white hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-70 shadow-xl shadow-primary/20 group/btn relative overflow-hidden mt-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                {isLoading ? 'FIRMANDO...' : 'UNIRSE AL PLANTEL'}
              </button>
            </form>

            <div className="text-center mt-2 pb-6 lg:pb-0">
              <p className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em]">
                ¿Ya tenés tu ficha?{' '}
                <Link href="/login" className="text-primary hover:text-white transition-colors underline decoration-primary/30 underline-offset-4">
                  INGRESAR ACÁ
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
              <span className="text-xs font-black uppercase tracking-[0.5em] text-primary italic">Registración Única</span>
            </div>
            <h2 className="text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.8] drop-shadow-2xl">
              LA GLORIA <br /> SE ESCRIBE <br /> <span className="text-primary">EN LA CANCHA.</span>
            </h2>
            <p className="text-lg text-white/50 font-bold uppercase tracking-widest max-w-md leading-relaxed">
              Cargá tus estadísticas, subí de ELO y demostrá que sos el mejor en la red de fútbol amateur más competitiva.
            </p>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
