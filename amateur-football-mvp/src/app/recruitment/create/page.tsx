'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  UserPlus,
  Plus,
  Minus,
  Trash2,
  Gamepad2,
  Users2,
  ChevronLeft,
  ChevronRight,
  Zap,
  Target,
  Shield,
  ZapIcon,
  Skull,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateRecruitmentMatch } from '@/hooks/useRecruitmentQueries';
import { useAuth } from '@/contexts/AuthContext';
import { AVAILABLE_TIMES } from '@/lib/constants';
import Link from 'next/link';

const POSITIONS = [
  { code: 'GK', label: 'Arquero', icon: Shield, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { code: 'DEF', label: 'Defensor', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { code: 'MID', label: 'Volante', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { code: 'FW', label: 'Delantero', icon: ZapIcon, color: 'text-red-400', bg: 'bg-red-400/10' },
  { code: 'ANY', label: 'Cualquier Puesto', icon: Star, color: 'text-primary', bg: 'bg-primary/10' },
];

export default function CreateRecruitmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreateRecruitmentMatch();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '20:00',
    description: '',
    skill_level: 'pro-vibe', // casual, competitive, pro-vibe
  });

  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({
    GK: 0,
    DEF: 0,
    MID: 0,
    FW: 0,
    ANY: 1
  });

  const totalSlots = Object.values(slotCounts).reduce((a, b) => a + b, 0);

  const updateCount = (pos: string, delta: number) => {
    if (delta > 0 && totalSlots >= 12) return;
    setSlotCounts(prev => ({
      ...prev,
      [pos]: Math.max(0, prev[pos] + delta)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.date || totalSlots === 0) {
      alert('Completá la fecha y agregá al menos un cupo.');
      return;
    }

    const slotsArray = Object.entries(slotCounts).flatMap(([pos, count]) =>
      Array(count).fill(pos)
    );

    try {
      await createMutation.mutateAsync({
        p_creator_id: user.id,
        p_venue_id: null,
        p_date: formData.date,
        p_start_time: formData.time,
        p_end_time: '21:00',
        p_description: formData.description,
        p_skill_level: formData.skill_level,
        p_slots: slotsArray
      });

      router.push('/recruitment');
    } catch (err) {
      console.error(err);
      alert('Error al crear la búsqueda.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-40 font-outfit">
      {/* Cinematic Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[40%] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-16 pb-12 px-6 max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/recruitment">
            <motion.div
              whileHover={{ scale: 1.1, x: -4 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center border border-white/5 hover:border-primary/40 transition-all cursor-pointer"
            >
              <ChevronLeft size={24} className="text-foreground/40 group-hover:text-primary transition-colors" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase font-kanit">NUEVA <span className="text-primary text-glow-primary">BÚSQUEDA</span></h1>
            <p className="text-foreground/30 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Inteligencia de Fichajes v2.0</p>
          </div>
        </div>
        <div className="hidden md:flex gap-4">
          <div className="bg-surface-elevated p-3 rounded-2xl border border-white/5 text-[10px] font-bold text-foreground/40 italic max-w-[200px]">
            💡 <span className="text-primary font-black uppercase">TACTICA:</span> Definí cuántos jugadores necesitás por puesto para completar tu equipo.
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-12">

          {/* Section: Tactical Roster (Armado del Roster) - NOW FIRST */}
          <div className="glass-premium rounded-[3rem] p-10 border border-white/10 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Users2 size={120} />
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-8">
              <div className="flex flex-col">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-primary rounded-full shadow-glow-primary" />
                  <h3 className="text-2xl font-black italic uppercase font-kanit">EL ROSTER</h3>
                </div>
                <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em] mt-2">¿A quiénes salimos a buscar hoy?</p>
              </div>
              <div className="bg-primary text-black px-6 py-2 rounded-2xl font-black text-sm italic shadow-glow-primary">
                {totalSlots} VACANTES
              </div>
            </div>

            {/* Tactical Grid Visualization - Modern Counter Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {POSITIONS.map((pos) => (
                <div
                  key={pos.code}
                  className={cn(
                    "relative group p-6 rounded-[2.5rem] border transition-all duration-300 flex flex-col gap-6",
                    slotCounts[pos.code] > 0
                      ? "bg-primary/5 border-primary/30 shadow-[0_0_20px_rgba(44,252,125,0.1)]"
                      : "bg-surface-elevated border-white/5 hover:border-white/10"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner", pos.bg)}>
                      <pos.icon className={cn("w-6 h-6", pos.color)} />
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest leading-none mb-1">PUESTO</p>
                      <p className="text-lg font-black italic uppercase font-kanit tracking-tighter">{pos.label}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-black/20 p-2 rounded-3xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => updateCount(pos.code, -1)}
                      className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90 disabled:opacity-20"
                      disabled={slotCounts[pos.code] === 0}
                    >
                      <Minus size={20} className="text-foreground/40" />
                    </button>

                    <span className={cn(
                      "text-3xl font-black font-kanit italic tabular-nums transition-all",
                      slotCounts[pos.code] > 0 ? "text-primary" : "text-foreground/20"
                    )}>
                      {slotCounts[pos.code]}
                    </span>

                    <button
                      type="button"
                      onClick={() => updateCount(pos.code, 1)}
                      className="w-12 h-12 rounded-2xl bg-primary hover:scale-105 flex items-center justify-center transition-all active:scale-95 shadow-glow-primary/30"
                    >
                      <Plus size={20} className="text-black" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-[10px] font-bold text-foreground/20 uppercase tracking-[0.3em] font-kanit">
              Máximo 12 jugadores por búsqueda
            </p>
          </div>

          {/* Section: Temporal Intel */}
          <div className="glass-premium rounded-[3rem] p-10 border border-white/10 space-y-12">
            <div className="flex items-center gap-4 border-b border-white/5 pb-8">
              <div className="w-1.5 h-6 bg-primary rounded-full shadow-glow-primary" />
              <h3 className="text-2xl font-black italic uppercase font-kanit">DATOS DEL ENCUENTRO</h3>
            </div>




            {/* Date Selection - Horizontal Scroll experience */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] italic">FECHA DEL PARTIDO</label>
                <div className="flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                  <Calendar className="text-primary" size={12} />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.1em] italic">
                    {new Date(formData.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>



              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 -mx-10 px-10">
                {Array.from({ length: 14 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() + i);
                  const dateStr = d.toISOString().split('T')[0];
                  const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase();
                  const dayNumber = d.getDate();
                  const isSelected = formData.date === dateStr;

                  return (
                    <motion.button
                      key={dateStr}
                      type="button"
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData({ ...formData, date: dateStr })}
                      className={cn(
                        "flex-shrink-0 w-24 h-32 rounded-[2rem] border transition-all flex flex-col items-center justify-center gap-2",
                        isSelected
                          ? "border-primary bg-primary text-black shadow-glow-primary scale-105 z-10"
                          : "bg-surface-elevated border-white/5 hover:border-white/20 text-foreground/40 hover:text-foreground/70"
                      )}
                    >
                      <span className={cn("text-[10px] font-black tracking-widest", isSelected ? "text-black/60" : "text-foreground/20")}>{dayName}</span>
                      <span className="text-4xl font-black italic tracking-tighter leading-none font-kanit">{dayNumber}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection - Grid experience */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] italic">HORARIO DE INICIO</label>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                  <Clock className="text-foreground/40" size={12} />
                  <span className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.1em] italic">{formData.time} HS</span>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-9 gap-3">
                {AVAILABLE_TIMES.map((t) => {
                  const isSelected = formData.time === t;
                  return (
                    <motion.button
                      key={t}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData({ ...formData, time: t })}
                      className={cn(
                        "py-4 rounded-2xl border text-[13px] font-black italic font-kanit transition-all",
                        isSelected
                          ? "bg-primary text-black border-primary shadow-glow-primary"
                          : "bg-surface-elevated border-white/5 text-foreground/40 hover:border-white/20"
                      )}
                    >
                      {t}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Vibe Selection */}
              <div className="space-y-6">
                <label className="text-[10px] uppercase font-black text-foreground/30 tracking-[0.25em] block italic">NIVEL REQUERIDO</label>
                <div className="flex gap-4">
                  {[
                    { id: 'casual', label: 'Casual', icon: '🍻', color: 'bg-emerald-500/10 text-emerald-400' },
                    { id: 'competitive', label: 'Pro', icon: '⚔️', color: 'bg-blue-500/10 text-blue-400' },
                    { id: 'pro-vibe', label: 'Elite', icon: '💎', color: 'bg-primary/10 text-primary' },
                  ].map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, skill_level: level.id })}
                      className={cn(
                        "flex-1 p-6 rounded-[2rem] border transition-all text-center flex flex-col items-center gap-2 group",
                        formData.skill_level === level.id
                          ? "bg-foreground text-background border-foreground scale-[1.02]"
                          : "bg-surface-elevated border-white/5 hover:border-white/20"
                      )}
                    >
                      <span className="text-3xl filter saturate-50 group-hover:saturate-100">{level.icon}</span>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        formData.skill_level === level.id ? "" : "text-foreground/40"
                      )}>
                        {level.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-6">
                <label className="text-[10px] uppercase font-black text-foreground/30 tracking-[0.25em] block italic">CONSIGNAS EXTRA</label>
                <div className="relative">
                  <textarea
                    placeholder="Ej: Solo gente puntual, traigan pechera si tienen..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-surface-elevated/50 border border-white/5 rounded-[1.5rem] p-6 min-h-[140px] text-base outline-none focus:border-primary/40 transition-all resize-none italic font-medium placeholder:text-foreground/20"
                  />
                  <Gamepad2 className="absolute right-6 bottom-6 text-foreground/10" size={32} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button - Neon High Impact */}
          <div className="pt-8">
            <motion.button
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              disabled={createMutation.isPending}
              className="group relative w-full overflow-hidden rounded-[2.5rem] bg-primary p-8 transition-all hover:shadow-[0_0_80px_rgba(44,252,125,0.4)] disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="relative flex items-center justify-center gap-6">
                <span className="text-3xl font-black italic tracking-tighter uppercase font-kanit text-black">
                  {createMutation.isPending ? 'PUBLICANDO...' : 'PUBLICAR FICHAJE'}
                </span>
                <ChevronRight size={32} className="text-black stroke-[3] group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.button>
            <p className="text-center mt-6 text-[10px] font-black text-foreground/20 uppercase tracking-[0.5em] italic">
              Un paso más cerca de dominar la cancha
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
