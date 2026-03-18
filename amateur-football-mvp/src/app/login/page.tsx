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
        <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4 lg:p-8 relative overflow-hidden bg-background selection:bg-primary selection:text-background">
            
            {/* ── CINEMATIC BACKGROUND ── */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)] opacity-50" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
                
                {/* Stadium Lights Effect */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-[100%] opacity-30" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[450px] relative z-10"
            >
                {/* Glass Card */}
                <div className="glass-premium rounded-[3rem] p-8 lg:p-12 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden relative group">
                    
                    {/* Decorative Patterns */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex flex-col gap-10 relative z-10">
                        {/* Header */}
                            <div className="flex flex-col items-center gap-4 mb-2">
                                <div className="w-40 h-40 flex items-center justify-center relative group-hover:scale-110 transition-transform duration-700">
                                    <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full opacity-40 shrink-0" />
                                    <img src="/logo_pelotify.png" alt="Logo" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(44,252,125,0.3)]" />
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-black italic text-foreground tracking-tighter uppercase leading-[0.9] text-center font-kanit">
                                    Entrar a la <span className="text-primary">Cancha</span>
                                </h1>
                            </div>

                        {/* Social Login */}
                        <div className="space-y-4">
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isGoogleLoading}
                                className="w-full h-14 bg-white text-zinc-950 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-4 hover:bg-zinc-100 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-[0_10px_20px_rgba(255,255,255,0.1)] group/google"
                            >
                                <img src="https://www.google.com/favicon.ico" className="w-5 h-5 group-hover/google:scale-110 transition-transform" alt="Google" />
                                {isGoogleLoading ? 'Conectando...' : 'Entrar con Google'}
                            </button>
                            
                            <div className="flex items-center gap-4">
                                <div className="h-px flex-1 bg-white/5" />
                                <span className="text-[10px] font-black text-white/45 uppercase tracking-widest">O con tu ficha</span>
                                <div className="h-px flex-1 bg-white/5" />
                            </div>
                        </div>

                        {/* Traditional Form */}
                        <form onSubmit={handleLogin} className="flex flex-col gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-foreground/65 uppercase tracking-widest ml-4">Email de Jugador</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                        <Mail className="w-5 h-5 text-foreground/45 group-focus-within/input:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="messi@ejemplo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white/[0.03] border border-white/5 focus:bg-white/[0.05] focus:border-primary/50 outline-none transition-all text-sm font-bold text-foreground placeholder:text-zinc-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-4 mr-1">
                                    <label className="text-[10px] font-black text-foreground/65 uppercase tracking-widest">Contraseña</label>
                                    <button 
                                        type="button"
                                        onClick={() => setShowForgotModal(true)}
                                        className="text-[9px] font-black text-primary/60 hover:text-primary uppercase tracking-widest transition-colors"
                                    >
                                        ¿La olvidaste?
                                    </button>
                                </div>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-foreground/45 group-focus-within/input:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white/[0.03] border border-white/5 focus:bg-white/[0.05] focus:border-primary/50 outline-none transition-all text-sm font-bold text-foreground placeholder:text-zinc-600"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-16 bg-primary text-zinc-950 font-black text-[12px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 shadow-[0_20px_40px_rgba(16,185,129,0.2)] group/btn relative overflow-hidden mt-2"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                {isLoading ? (
                                    'CALENTANDO...'
                                ) : (
                                    <>
                                        PISAR EL CÉSPED <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="pt-2 text-center">
                            <p className="text-[10px] font-black text-foreground/55 uppercase tracking-[0.2em]">
                                ¿No tenés equipo?{' '}
                                <Link href="/register" className="text-primary hover:text-white transition-colors underline decoration-primary/30 underline-offset-4">
                                    FICHATE ACÁ
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* FORGOT PASSWORD MODAL */}
            <AnimatePresence>
                {showForgotModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md glass-premium rounded-[2.5rem] p-8 lg:p-10 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16 rounded-full" />
                            
                            <form onSubmit={handleForgotSubmit} className="space-y-8 relative z-10">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black italic text-foreground uppercase tracking-tighter">Recuperar <span className="text-primary">Ficha</span></h2>
                                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em] italic">Seguridad de Jugador</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.3em] ml-1">Email de tu cuenta</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                            <Mail className="w-5 h-5 text-foreground/45 group-focus-within/input:text-primary transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            className="w-full h-14 pl-14 pr-6 bg-background/40 border border-foreground/5 rounded-2xl text-foreground text-sm font-black outline-none focus:border-primary/50 transition-all placeholder:foreground/10"
                                            placeholder="messi@ejemplo.com"
                                            value={forgotEmail}
                                            onChange={e => setForgotEmail(e.target.value)}
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
                                        {isSendingReset ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar Link"}
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
