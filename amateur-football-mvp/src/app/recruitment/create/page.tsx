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
  ChevronLeft
} from 'lucide-react';
import { useCreateRecruitmentMatch } from '@/hooks/useRecruitmentQueries';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function CreateRecruitmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreateRecruitmentMatch();
  
  const [formData, setFormData] = useState({
    date: '',
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
      <div className="relative z-10 pt-16 pb-12 px-6 max-w-3xl mx-auto flex items-center justify-between">
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
            <p className="text-foreground/30 text-xs font-black uppercase tracking-[0.3em] mt-1">Player Marketplace v2.0</p>
          </div>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 hidden md:block">
          <span className="text-primary font-black text-xs uppercase tracking-widest italic">Organizador Pro</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Section: Basic Intel */}
          <div className="glass-premium rounded-[3rem] p-10 border border-white/10 space-y-10">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-1.5 h-6 bg-primary rounded-full shadow-glow-primary" />
              <h3 className="text-xl font-black italic uppercase font-kanit">INFORMACIÓN TÁCTICA</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-foreground/30 tracking-[0.25em] ml-2 block">Día del Partido</label>
                  <div className="relative group">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-surface-elevated border border-white/5 rounded-2xl py-5 pl-14 pr-6 font-bold text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                    />
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-foreground/30 tracking-[0.25em] ml-2 block">Hora de Inicio</label>
                  <div className="relative group">
                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full bg-surface-elevated border border-white/5 rounded-2xl py-5 pl-14 pr-6 font-bold text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase font-black text-foreground/30 tracking-[0.25em] ml-2 block">NIVEL REQUERIDO</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'casual', label: 'Casual', icon: '🍻' },
                  { id: 'competitive', label: 'Compete', icon: '⚔️' },
                  { id: 'pro-vibe', label: 'Elite Pro', icon: '💎' },
                ].map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setFormData({...formData, skill_level: level.id})}
                    className={cn(
                      "p-5 rounded-2xl border transition-all text-center flex flex-col items-center gap-2",
                      formData.skill_level === level.id 
                        ? "bg-primary/10 border-primary shadow-[0_0_30px_rgba(44,252,125,0.1)] scale-[1.02]" 
                        : "bg-surface-elevated border-white/5 hover:border-white/20"
                    )}
                  >
                    <span className="text-3xl">{level.icon}</span>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest italic", 
                      formData.skill_level === level.id ? "text-primary" : "text-foreground/40"
                    )}>
                      {level.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-foreground/30 tracking-[0.25em] ml-2 block">MENSAJE PARA LOS POSTULADOS</label>
              <textarea 
                placeholder="Escribe algo que motive a los cracks a unirse... (ej: Nivel alto, tercer tiempo asegurado)"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-surface-elevated border border-white/5 rounded-2xl p-6 min-h-[140px] text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none italic font-medium leading-relaxed"
              />
            </div>
          </div>

          {/* Section: Roster Strategy */}
          <div className="glass-premium rounded-[3rem] p-10 border border-white/10 space-y-10">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-1.5 h-6 bg-primary rounded-full shadow-glow-primary" />
                 <h3 className="text-xl font-black italic uppercase font-kanit">ARMADO DEL ROSTER</h3>
               </div>
               <div className="bg-surface-elevated px-4 py-2 rounded-xl border border-white/5 text-[11px] font-black text-primary italic">
                 {slots.length} / 12 CUPOS
               </div>
            </div>

            {/* Tactical Grid Visualization */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <AnimatePresence>
                {slots.map((pos, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -4 }}
                    className="flex flex-col items-center justify-center bg-surface-elevated border border-white/5 p-6 rounded-3xl relative group transition-all hover:border-primary/20"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary text-black font-black flex items-center justify-center text-sm shadow-glow-primary mb-3">
                      {pos}
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-widest text-foreground/60 italic">
                      {pos === 'GK' ? 'Arquero' : 
                       pos === 'DEF' ? 'Defensa' :
                       pos === 'MID' ? 'Volante' : 
                       pos === 'FW' ? 'Delantero' : 'Libre'}
                    </span>
                    
                    <button 
                      type="button"
                      onClick={() => removeSlot(idx)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-red-500/20 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={14} className="stroke-[3]" />
                    </button>
                  </motion.div>
                ))}
                
                {/* Empty Add State */}
                {slots.length < 12 && (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl py-10 opacity-40">
                    <Plus size={24} className="mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Añadir</span>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Tactical Selector Bar */}
            <div className="space-y-4">
              <p className="text-[10px] uppercase font-black text-foreground/30 tracking-[0.25em] text-center italic">Seleccionar Refuerzo</p>
              <div className="flex flex-wrap justify-center gap-3">
                 {[
                   { code: 'GK', emoji: '🧤', label: 'Arquero' },
                   { code: 'DEF', emoji: '🛡️', label: 'Defensa' },
                   { code: 'MID', emoji: '🎯', label: 'Volante' },
                   { code: 'FW', emoji: '⚽', label: 'Delantero' },
                   { code: 'ANY', emoji: '🌟', label: 'Cualquiera' }
                 ].map((btn) => (
                   <button
                     key={btn.code}
                     type="button"
                     onClick={() => addSlot(btn.code)}
                     className="bg-surface-elevated hover:bg-primary/5 border border-white/5 hover:border-primary/40 px-6 py-4 rounded-2xl flex items-center gap-3 transition-all active:scale-95 group"
                   >
                     <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{btn.emoji}</span>
                     <div className="text-left">
                       <span className="block text-[8px] font-black text-foreground/20 uppercase tracking-widest">{btn.code}</span>
                       <span className="block text-[10px] font-black text-foreground/60 uppercase italic">{btn.label}</span>
                     </div>
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
              {createMutation.isPending ? (
                <>
                  <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>PUBLICANDO TÁCTICA...</span>
                </>
              ) : (
                <>
                  <span>SOLICITAR REFUERZOS</span>
                  <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                    <ChevronRight size={20} className="stroke-[3]" />
                  </div>
                </>
              )}
            </motion.button>
            <p className="text-center text-foreground/20 text-[10px] font-black uppercase tracking-[0.4em] mt-6 italic">
              Al publicar, todos los cracks libres recibirán la notificación
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
