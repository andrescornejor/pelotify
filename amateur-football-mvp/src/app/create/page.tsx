'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, DollarSign, Clock, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { createMatch } from '@/lib/matches';
import { useAuth } from '@/contexts/AuthContext';
import { ROSARIO_VENUES } from '@/lib/venues';
import LocationSearch from '@/components/LocationSearch';
import { AVAILABLE_TIMES } from '@/lib/constants';

export default function CreateMatchPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        location: '',
        date: '',
        time: '',
        type: 'F5' as 'F5' | 'F7' | 'F11',
        price: 0,
        level: 'Amateur',
        is_private: false
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsCreating(true);
        try {
            const match = await createMatch({
                ...formData,
                missing_players: 0, // default, though no longer relevant for occupancy
                creator_id: user.id
            });
            router.push(`/match?id=${match.id}`);
        } catch (error: any) {
            console.error('Error creating match:', error);
            alert(`Error al crear el partido: ${error.message}`);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col gap-10 p-4 lg:p-12 lg:pt-20 max-w-5xl mx-auto h-full bg-background relative overflow-hidden min-h-screen">
            
            {/* ── AMBIENT WAR ROOM ── */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-2 text-center lg:text-left">
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">Nuevo Encuentro</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-black italic text-foreground uppercase tracking-tighter leading-none">Armá tu <span className="text-foreground/40">Partido</span></h1>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40 mt-2 max-w-md mx-auto lg:mx-0">Configurá los detalles para que el picadito sea oficial.</p>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-10 relative z-10 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6 relative z-30"
                >
                    <div className="flex items-center gap-4 px-2">
                        <div className="h-0.5 flex-1 bg-foreground/5" />
                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em]">¿Dónde se juega?</span>
                        <div className="h-0.5 flex-1 bg-foreground/5" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {ROSARIO_VENUES.map((venue) => (
                            <button
                                key={venue.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, location: venue.address })}
                                className={`group p-6 rounded-[2rem] border transition-all duration-500 flex flex-col items-start gap-3 relative overflow-hidden ${formData.location === venue.address
                                        ? 'bg-primary/10 border-primary shadow-[0_20px_40px_rgba(16,185,129,0.1)]'
                                        : 'bg-foreground/[0.02] border-foreground/5 text-foreground/40 hover:border-foreground/20 hover:bg-foreground/[0.04]'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                                    formData.location === venue.address ? 'bg-primary text-black border-primary' : 'bg-surface border-foreground/5 text-foreground/20'
                                }`}>
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div className="space-y-1 text-left">
                                    <span className={`text-lg font-black italic uppercase tracking-tighter block transition-colors ${
                                        formData.location === venue.address ? 'text-foreground' : 'text-foreground/30'
                                    }`}>{venue.name}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 block truncate w-full">{venue.address}</span>
                                </div>
                                
                                {formData.location === venue.address && (
                                    <div className="absolute top-4 right-4 animate-pulse">
                                         <div className="w-2 h-2 rounded-full bg-primary" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="max-w-2xl mx-auto lg:mx-0">
                        <LocationSearch 
                            value={formData.location} 
                            onChange={(addr) => setFormData({ ...formData, location: addr })} 
                            placeholder="Buscá otra cancha o dirección..." 
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6 relative z-20"
                >
                    <div className="flex items-center gap-4 px-2">
                        <div className="h-0.5 flex-1 bg-foreground/5" />
                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em]">¿Cuándo se juega?</span>
                        <div className="h-0.5 flex-1 bg-foreground/5" />
                    </div>

                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
                        {Array.from({ length: 14 }).map((_, i) => {
                            const d = new Date();
                            d.setDate(d.getDate() + i);
                            const dateStr = d.toISOString().split('T')[0];
                            const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase();
                            const dayNumber = d.getDate();
                            const monthName = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase();
                            const isSelected = formData.date === dateStr;

                            return (
                                <button
                                    key={dateStr}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, date: dateStr })}
                                    className={`flex-shrink-0 w-20 h-24 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-1 ${isSelected
                                        ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20 scale-105'
                                        : 'bg-foreground/[0.02] border-foreground/5 text-foreground/40 hover:border-foreground/20 hover:bg-foreground/[0.04]'
                                        }`}
                                >
                                    <span className={`text-[8px] font-black tracking-widest ${isSelected ? 'text-black' : 'text-foreground/30'}`}>{monthName}</span>
                                    <span className="text-2xl font-black italic tracking-tighter leading-none">{dayNumber}</span>
                                    <span className={`text-[8px] font-black tracking-widest ${isSelected ? 'text-black' : 'text-foreground/30'}`}>{dayName}</span>
                                </button>
                            );
                        })}
                        <div className="relative flex-shrink-0 group">
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full"
                            />
                            <div className={`w-20 h-24 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-1 ${formData.date && !Array.from({ length: 14 }).some((_, i) => {
                                const d = new Date(); d.setDate(d.getDate() + i); return d.toISOString().split('T')[0] === formData.date;
                            })
                                ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20 scale-105'
                                : 'bg-foreground/[0.02] border-foreground/5 text-foreground/40 hover:border-foreground/20'
                                }`}>
                                <Calendar className="w-6 h-6" />
                                <span className="text-[8px] font-black tracking-widest uppercase">Otro</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-4 px-2">
                            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em]">Horario</span>
                            <div className="h-0.5 flex-1 bg-foreground/5" />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="relative group">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-primary transition-colors z-10" />
                                <select
                                    required
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full h-16 pl-12 pr-10 rounded-2xl bg-foreground/[0.02] border border-foreground/10 focus:bg-foreground/[0.04] focus:border-primary/30 outline-none text-sm font-bold text-foreground italic appearance-none cursor-pointer"
                                >
                                    <option value="" disabled className="bg-background">¿A qué hora?</option>
                                    {AVAILABLE_TIMES.map(t => {
                                        const [h, m] = t.split(':');
                                        const hour = parseInt(h);
                                        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                                        const ampm = hour >= 12 ? 'PM' : 'AM';
                                        return (
                                            <option key={t} value={t} className="bg-background text-foreground">
                                                {displayHour}:{m} {ampm}
                                            </option>
                                        );
                                    })}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/20 group-focus-within:text-primary">
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-4 px-2">
                            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em]">Formación</span>
                            <div className="h-0.5 flex-1 bg-foreground/5" />
                        </div>
                        <div className="flex gap-4">
                            {['F5', 'F7', 'F11'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: t as any })}
                                    className={`flex-1 h-16 rounded-2xl border font-black text-xs tracking-widest transition-all duration-300 italic ${
                                        formData.type === t 
                                        ? 'bg-primary text-black border-primary shadow-[0_10px_20px_rgba(16,185,129,0.2)] scale-105 relative z-10' 
                                        : 'bg-foreground/[0.02] border-foreground/5 text-foreground/20 hover:border-foreground/10'
                                    }`}
                                >
                                    FÚTBOL {t.replace('F', '')}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 px-2">
                            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em]">Logística</span>
                            <div className="h-0.5 flex-1 bg-foreground/5" />
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="relative group">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Cuota por jugador (ARS)"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                    className="w-full h-16 pl-12 pr-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 focus:bg-foreground/[0.04] focus:border-primary/30 outline-none text-lg font-black text-foreground italic tracking-tighter"
                                />
                            </div>
                            
                            <div className="flex gap-2 p-1 rounded-2xl bg-foreground/[0.02] border border-foreground/5">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_private: false })}
                                    className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        !formData.is_private 
                                        ? 'bg-primary text-black' 
                                        : 'text-foreground/20 hover:text-foreground/40'
                                    }`}
                                >
                                    Público
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_private: true })}
                                    className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        formData.is_private 
                                        ? 'bg-accent text-white' 
                                        : 'text-foreground/20 hover:text-foreground/40'
                                    }`}
                                >
                                    Solo Invitados
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="w-full h-20 bg-primary hover:bg-white text-black font-black uppercase text-[11px] tracking-[0.4em] rounded-[2rem] shadow-[0_20px_50px_rgba(16,185,129,0.2)] active:scale-95 transition-all text-lg flex items-center justify-center gap-4 disabled:opacity-50 group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            {isCreating ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    TRANSMITIENDO...
                                </>
                            ) : (
                                <>
                                    INICIAR PARTIDO <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                <div className="mt-10 p-10 rounded-[3rem] bg-foreground/[0.01] border border-foreground/5 flex flex-col md:flex-row items-center gap-10 opacity-40">
                    <div className="w-24 h-24 rounded-full border-4 border-dashed border-foreground/10 flex items-center justify-center animate-spin-slow">
                        <Users className="w-10 h-10 text-foreground/10" />
                    </div>
                    <div className="flex-1 space-y-2 text-center md:text-left">
                        <h5 className="font-black text-foreground italic uppercase tracking-tighter">Protocolo de Organización</h5>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest leading-relaxed">Al armar el partido, el mismo será visible para todos. Como organizador, tendrás autoridad total para aceptar o rechazar jugadores.</p>
                    </div>
                </div>
            </form>
        </div>
    );
}
