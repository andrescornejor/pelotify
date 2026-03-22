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
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4 lg:p-8 relative overflow-hidden bg-background selection:bg-primary selection:text-background">
      {/* ── CINEMATIC BACKGROUND ── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)] opacity-50" />
        <div className="absolute top-0 right-[-10%] w-[60%] h-[100%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[500px] relative z-10"
      >
        {/* Scouting Report Layout */}
        <div className="glass-premium rounded-[3.5rem] p-8 lg:p-12 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary/20" />

          <div className="flex flex-col gap-8 relative z-10">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-28 h-28 flex items-center justify-center relative shrink-0">
                <div className="absolute inset-0 bg-primary/20 blur-[30px] rounded-full opacity-40 shrink-0" />
                <img
                  src="/logo_pelotify.png"
                  alt="Logo"
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(44,252,125,0.3)]"
                />
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-black italic text-foreground tracking-tighter uppercase leading-none font-kanit">
                  Crear <span className="text-primary">Ficha</span>
                </h1>
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em] italic font-kanit">
                  Agente Libre
                </p>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full h-14 bg-white text-zinc-950 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-4 hover:bg-zinc-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                  {isGoogleLoading ? 'Conectando...' : 'Ficharse con Google'}
                </button>

                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                    O Registro Manual
                  </span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">
                  Email Oficial
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    placeholder="jugador@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white/[0.03] border border-white/5 focus:bg-white/[0.05] focus:border-primary/50 outline-none transition-all text-sm font-bold text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">
                  Contraseña Segura
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white/[0.03] border border-white/5 focus:bg-white/[0.05] focus:border-primary/50 outline-none transition-all text-sm font-bold text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">
                  Confirmar Contraseña
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="password"
                    placeholder="Repetir Contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    className={cn(
                      'w-full h-14 pl-14 pr-6 rounded-2xl bg-white/[0.03] border outline-none transition-all text-sm font-bold text-foreground',
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-500/50 focus:bg-white/[0.05] focus:border-red-500'
                        : 'border-white/5 focus:bg-white/[0.05] focus:border-primary/50'
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
                className="w-full h-16 mt-4 bg-primary text-black font-black text-[12px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-95 disabled:opacity-50 shadow-[0_20px_40px_rgba(16,185,129,0.2)] group"
              >
                {isLoading ? (
                  'FIRMANDO PRE-CONTRATO...'
                ) : (
                  <>
                    CREAR CUENTA{' '}
                    <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">
                ¿Ya tenés tu ficha?{' '}
                <Link
                  href="/login"
                  className="text-foreground hover:text-primary transition-colors underline decoration-foreground/20 underline-offset-4"
                >
                  INGRESAR ACÁ
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Bottom */}
        <div className="flex justify-center mt-12 gap-10 opacity-20 group">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">
              RECLUTAMIENTO SEGURO
            </span>
          </div>
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">
              IDENTIDAD VALIDADA
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
