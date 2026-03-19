'use client';

import { motion, Variants } from 'framer-motion';
import { Settings, Moon, Sun, Monitor, Bell, Shield, LogOut, ChevronRight, User, Zap, ZapOff, Cpu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import Link from 'next/link';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { performanceMode, setPerformanceMode } = useSettings();

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                type: 'spring', 
                stiffness: 260, 
                damping: 20 
            } 
        }
    };

    return (
        <div className="flex flex-col min-h-screen pb-24 bg-background">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-background p-8 lg:p-12 border-b border-foreground/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col gap-2 max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-foreground/5 rounded-2xl flex items-center justify-center border border-foreground/10 shadow-lg">
                            <Settings className="w-6 h-6 text-foreground/40" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Preferencias</span>
                    </div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-foreground italic uppercase tracking-tighter"
                    >
                        Configuración
                    </motion.h1>
                    <p className="text-foreground/50 font-medium text-sm mt-2 max-w-sm">
                        Ajustá la apariencia, notificaciones y tu cuenta para llevar tu juego al siguiente nivel.
                    </p>
                </div>
            </div>

            {/* Main Settings Content */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl mx-auto w-full px-6 py-8 space-y-10 relative z-10"
            >
                {/* ── APARIENCIA ── */}
                <motion.section variants={itemVariants} className="space-y-4">
                    <div className="flex items-center gap-3 pl-2">
                        <Sun className="w-4 h-4 text-foreground/50" />
                        <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Apariencia</h2>
                    </div>
                    
                    <div className="glass-premium p-2 rounded-[2rem] border border-foreground/5 flex gap-2">
                        <button
                            onClick={() => setTheme('light')}
                            className={`flex-1 flex flex-col items-center gap-2 p-6 rounded-[1.5rem] transition-all duration-300 ${theme === 'light' ? 'bg-primary border-primary shadow-[0_10px_30px_rgba(16,185,129,0.3)] text-black' : 'bg-transparent text-foreground/50 hover:bg-foreground/5 border-transparent'} border`}
                        >
                            <Sun className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Día</span>
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`flex-1 flex flex-col items-center gap-2 p-6 rounded-[1.5rem] transition-all duration-300 ${theme === 'dark' ? 'bg-primary border-primary shadow-[0_10px_30px_rgba(16,185,129,0.3)] text-black' : 'bg-transparent text-foreground/50 hover:bg-foreground/5 border-transparent'} border`}
                        >
                            <Moon className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Noche</span>
                        </button>
                        <button
                            onClick={() => setTheme('system')}
                            className={`flex-1 flex flex-col items-center gap-2 p-6 rounded-[1.5rem] transition-all duration-300 ${theme === 'system' ? 'bg-primary border-primary shadow-[0_10px_30px_rgba(16,185,129,0.3)] text-black' : 'bg-transparent text-foreground/50 hover:bg-foreground/5 border-transparent'} border`}
                        >
                            <Monitor className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sistema</span>
                        </button>
                    </div>
                </motion.section>

                {/* ── RENDIMIENTO ── */}
                <motion.section variants={itemVariants} className="space-y-4">
                    <div className="flex items-center gap-3 pl-2">
                        <Cpu className="w-4 h-4 text-foreground/50" />
                        <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Rendimiento</h2>
                    </div>
                    
                    <div className="glass-premium p-4 rounded-[2rem] border border-foreground/5 space-y-3">
                        <button
                            onClick={() => setPerformanceMode(!performanceMode)}
                            className="w-full flex items-center justify-between p-4 rounded-[1.5rem] bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-colors group cursor-pointer border border-transparent hover:border-foreground/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${performanceMode ? 'bg-primary/20 border-primary/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-foreground/5 border-foreground/10'}`}>
                                    {performanceMode ? <Zap className="w-5 h-5 text-primary" /> : <ZapOff className="w-5 h-5 text-foreground/30" />}
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-sm font-black text-foreground uppercase">Modo Rendimiento</span>
                                    <span className="text-[10px] text-foreground/50 font-black uppercase tracking-widest mt-0.5">
                                        {performanceMode ? 'Activado (Más fluido)' : 'Desactivado (Más efectos)'}
                                    </span>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-all duration-300 border ${performanceMode ? 'bg-primary border-primary' : 'bg-foreground/10 border-foreground/5'}`}>
                                <motion.div 
                                    animate={{ x: performanceMode ? 26 : 2 }}
                                    className="absolute top-1 left-0 w-4 h-4 rounded-full bg-background shadow-sm"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            </div>
                        </button>
                        <p className="px-4 text-[9px] text-foreground/30 font-black uppercase tracking-widest leading-relaxed">
                            Desactiva efectos de desenfoque y animaciones pesadas para celulares de gama baja.
                        </p>
                    </div>
                </motion.section>

                {/* ── CUENTA ── */}
                <motion.section variants={itemVariants} className="space-y-4">
                    <div className="flex items-center gap-3 pl-2">
                        <User className="w-4 h-4 text-foreground/50" />
                        <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Cuenta</h2>
                    </div>
                    
                    <div className="glass-premium p-4 rounded-[2rem] border border-foreground/5 space-y-2">
                        <Link href="/profile/me">
                            <div className="flex items-center justify-between p-4 rounded-[1.5rem] bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-colors group cursor-pointer border border-transparent hover:border-foreground/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-foreground uppercase">Editar Perfil</span>
                                        <span className="text-[10px] text-foreground/50 font-black uppercase tracking-widest mt-0.5">Avatar, Nombre, Posición</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-foreground/30 group-hover:text-primary transition-colors" />
                            </div>
                        </Link>
                        
                        <div className="flex items-center justify-between p-4 rounded-[1.5rem] bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-colors group cursor-pointer border border-transparent hover:border-foreground/5 opacity-50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-foreground/10 rounded-xl flex items-center justify-center border border-foreground/10 text-foreground/50">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-foreground uppercase">Privacidad</span>
                                    <span className="text-[10px] text-foreground/50 font-black uppercase tracking-widest mt-0.5">Próximamente</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* ── PELIGRO ── */}
                <motion.section variants={itemVariants} className="pt-8 border-t border-foreground/5 space-y-4">
                    <div className="flex items-center gap-3 pl-2">
                        <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Zona Restringida</h2>
                    </div>
                    
                    <button 
                        onClick={logout}
                        className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-red-500/[0.02] hover:bg-red-500/10 transition-all border border-red-500/10 hover:border-red-500/30 group active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                <LogOut className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-black text-red-500 uppercase tracking-widest">Cerrar Sesión</span>
                        </div>
                    </button>
                    
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] italic font-kanit">
                        <span className="text-foreground/30">PELOTI</span>
                        <span className="text-primary/40">FY</span>
                        <span className="text-foreground/20 ml-2">v1.0.0</span>
                    </p>
                </motion.section>
            </motion.div>
        </div>
    );
}
