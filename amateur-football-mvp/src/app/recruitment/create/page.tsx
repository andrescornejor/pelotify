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
  Trash2, 
  Gamepad2,
  Users2,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateRecruitmentMatch } from '@/hooks/useRecruitmentQueries';
import { useAuth } from '@/contexts/AuthContext';
import { AVAILABLE_TIMES } from '@/lib/constants';
import Link from 'next/link';

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

  const [slots, setSlots] = useState<string[]>(['ANY']);

  const addSlot = (pos: string) => {
    if (slots.length >= 12) return;
    setSlots([...slots, pos]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.date || slots.length === 0) {
      alert('Completá la fecha y agregá al menos un cupo.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        p_creator_id: user.id,
        p_venue_id: null,
        p_date: formData.date,
        p_start_time: formData.time,
        p_end_time: '21:00',
        p_description: formData.description,
        p_skill_level: formData.skill_level,
        p_slots: slots
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
            <h1 className="text-4xl font-black italic tracking-tighter uppercase font-kanit">NUEVA <span className="text-primary">BÚSQUEDA</span></h1>
            <p className="text-foreground/30 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Inteligencia de Fichajes v2.0</p>
          </div>
        </div>
        <div className="hidden md:flex gap-4">
           {/* Roster Explanation Hint */}
           <div className="bg-surface-elevated p-3 rounded-2xl border border-white/5 text-[10px] font-bold text-foreground/40 italic max-w-[200px]">
             💡 <span className="text-primary font-black uppercase">¿Roster?</span> Es tu lista de puestos estratégicos para completar el equipo.
           </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Section: Temporal Intel */}
          <div className="glass-premium rounded-[3rem] p-10 border border-white/10 space-y-12">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-6 bg-primary rounded-full shadow-glow-primary" />
              <h3 className="text-xl font-black italic uppercase font-kanit">LOGÍSTICA DEL PARTIDO</h3>
            </div>

            {/* Date Selection - Match Experience */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em]">¿Qué día se juega?</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                   {formData.date}
                </span>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-10 px-10">
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
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setFormData({ ...formData, date: dateStr })}
                      className={cn(
                        "flex-shrink-0 w-20 h-28 rounded-3xl border transition-all flex flex-col items-center justify-center gap-1",
                        isSelected 
                          ? "border-primary bg-primary text-black shadow-glow-primary scale-105" 
                          : "bg-surface-elevated border-white/5 hover:border-white/20 text-foreground/40 hover:text-foreground/70"
                      )}
                    >
                      <span className="text-[9px] font-black tracking-widest">{dayName}</span>
                      <span className="text-3xl font-black italic tracking-tighter leading-none">{dayNumber}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection - Grid Experience */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] px-2 block">HORARIO</span>
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
                        "py-3 rounded-xl border text-[11px] font-black transition-all",
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
               {/* Vibe Selección */}
               <div className="space-y-4 text-center md:text-left">
                  <label className="text-[10px] uppercase font-black text-foreground/30 tracking-[0.25em] ml-2 block italic">STAKE / NIVEL</label>
                  <div className="flex gap-4">
                    {[
                      { id: 'casual', label: 'Casual', icon: '🍻' },
                      { id: 'competitive', label: 'Pro', icon: '⚔️' },
                      { id: 'pro-vibe', label: 'Elite', icon: '💎' },
                    ].map((level) => (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => setFormData({...formData, skill_level: level.id})}
                        className={cn(
                          "flex-1 p-5 rounded-2xl border transition-all text-center flex flex-col items-center gap-1",
                          formData.skill_level === level.id 
                            ? "bg-primary/10 border-primary" 
                            : "bg-surface-elevated border-white/5"
                        )}
                      >
                        <span className="text-2xl">{level.icon}</span>
                        <span className={cn("text-[8px] font-black uppercase", formData.skill_level === level.id ? "text-primary" : "text-foreground/40")}>{level.label}</span>
                      </button>
                    ))}
                  </div>
               </div>

               {/* Mensaje */}
               <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black text-foreground/30 tracking-[0.25em] ml-2 block italic">DETALLES EXTRA</label>
                  <textarea 
                    placeholder="Buscamos arquero... etc."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-surface-elevated border border-white/5 rounded-2xl p-4 min-h-[100px] text-sm outline-none focus:border-primary/50 transition-all resize-none italic font-medium"
                  />
               </div>
            </div>
          </div>

          {/* Section: Tactical Roster (Armado del Roster) */}
          <div className="glass-premium rounded-[3rem] p-10 border border-white/10 space-y-10">
            <div className="flex items-center justify-between">
               <div className="flex flex-col">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-primary rounded-full shadow-glow-primary" />
                    <h3 className="text-xl font-black italic uppercase font-kanit">ARMADO DEL ROSTER</h3>
                  </div>
                  <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em] mt-2 ml-6">Define los puestos libres estratégicamente</p>
               </div>
               <div className="bg-surface-elevated px-4 py-2 rounded-xl border border-white/5 text-[11px] font-black text-primary italic">
                 {slots.length} REFUERZOS
               </div>
            </div>

            {/* Tactical Explanation for Mobile */}
            <div className="md:hidden bg-primary/5 p-4 rounded-2xl border border-primary/10 text-[11px] font-medium leading-relaxed italic text-foreground/60">
              💡 <span className="text-primary font-black uppercase">TIP:</span> El "Roster" es tu plantilla ideal. Añade los puestos que te faltan cubrir hoy.
            </div>

            {/* Tactical Grid Visualization */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              <AnimatePresence>
                {slots.map((pos, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group flex flex-col items-center justify-center bg-surface-elevated border border-white/5 p-6 rounded-3xl relative transition-all hover:border-primary/30"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary text-black font-black flex items-center justify-center text-sm shadow-glow-primary mb-3">
                      {pos}
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => removeSlot(idx)}
                      className="absolute -top-1 -right-1 w-7 h-7 bg-red-400/20 text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-red-500/20"
                    >
                      <Trash2 size={12} className="stroke-[3]" />
                    </button>
                  </motion.div>
                ))}
                
                {slots.length < 12 && (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl py-10 opacity-20">
                    <Zap size={20} className="text-primary" />
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Tactical Selector Bar */}
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-3">
                 {[
                   { code: 'GK', emoji: '🧤' },
                   { code: 'DEF', emoji: '🛡️' },
                   { code: 'MID', emoji: '🎯' },
                   { code: 'FW', emoji: '⚽' },
                   { code: 'ANY', emoji: '🌟' }
                 ].map((btn) => (
                   <button
                     key={btn.code}
                     type="button"
                     onClick={() => addSlot(btn.code)}
                     className="bg-surface-elevated hover:bg-white/[0.03] border border-white/5 hover:border-primary/50 w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90"
                   >
                     <span className="text-xl grayscale group-hover:grayscale-0">{btn.emoji}</span>
                     <span className="text-[9px] font-black text-foreground/40">{btn.code}</span>
                   </button>
                 ))}
              </div>
            </div>
          </div>

          {/* Action Button - Neon High Impact */}
          <div className="pt-8">
            <motion.button
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              disabled={createMutation.isPending}
              className="w-full py-8 rounded-[2rem] bg-primary text-black font-black text-2xl font-kanit italic tracking-tighter uppercase shadow-glow-primary disabled:opacity-50 transition-all flex items-center justify-center gap-4 group"
            >
              {createMutation.isPending ? 'ENVIANDO TÁCTICA...' : 'PUBLICAR FICHAJE'}
              <ChevronRight size={24} className="stroke-[3] group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </div>

        </form>
      </div>
    </div>
  );
}
