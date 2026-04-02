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
    if (slots.length >= 10) return;
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
        p_venue_id: null, // For simplicity now, let's keep it null or add a simple text location later
        p_date: formData.date,
        p_start_time: formData.time,
        p_end_time: '21:00', // Default 1 hour
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
    <div className="min-h-screen bg-[#050a0a] text-white pb-24">
      {/* Header */}
      <div className="pt-12 pb-6 px-4 max-w-2xl mx-auto flex items-center gap-4">
        <Link href="/recruitment">
          <motion.div whileHover={{ x: -2 }} className="p-2 rounded-full bg-white/5 border border-white/10">
            <ChevronLeft size={20} />
          </motion.div>
        </Link>
        <h1 className="text-3xl font-black italic tracking-tighter uppercase">NUEVA BÚSQUEDA</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Main Card */}
          <div className="bg-[#0a1212] border border-white/10 rounded-[32px] p-8 space-y-8">
            
            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] uppercase font-black text-white/40 tracking-[2px] block mb-2">Fecha del Partido</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#10b981]" size={18} />
                    <input 
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 font-bold text-white outline-none focus:border-[#10b981/50] transition-all"
                    />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] uppercase font-black text-white/40 tracking-[2px] block mb-2">Hora</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#10b981]" size={18} />
                    <input 
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 font-bold text-white outline-none focus:border-[#10b981/50] transition-all"
                    />
                  </div>
               </div>
            </div>

            {/* Vibe / Skills Selection */}
            <div>
              <label className="text-[10px] uppercase font-black text-white/40 tracking-[2px] block mb-3">VIBE DEL PARTIDO</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'casual', label: 'Casual', icon: '🍻' },
                  { id: 'competitive', label: 'Competitivo', icon: '⚔️' },
                  { id: 'pro-vibe', label: 'Elite Pro', icon: '💎' },
                ].map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setFormData({...formData, skill_level: level.id})}
                    className={`p-4 rounded-2xl border transition-all text-center ${
                      formData.skill_level === level.id 
                        ? 'bg-[#10b98120] border-[#10b98140] scale-105' 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-1">{level.icon}</div>
                    <div className={`text-[10px] font-black uppercase ${formData.skill_level === level.id ? 'text-[#10b981]' : 'text-white/40'}`}>
                      {level.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] uppercase font-black text-white/40 tracking-[2px] block mb-2">MENSAJE PARA LOS CRACKS</label>
              <textarea 
                placeholder="Ej: Buscamos arquero con manos de hierro y asado post partido. Nivel intermedio arriba."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[120px] text-white outline-none focus:border-[#10b981/50] transition-all resize-none italic"
              />
            </div>
          </div>

          {/* Slots Management Card */}
          <div className="bg-[#0a1212] border border-white/10 rounded-[32px] p-8">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-black italic uppercase">CUPOS A CUBRIR</h3>
               <div className="bg-[#10b98120] px-3 py-1 rounded-full text-[10px] font-black text-[#10b981]">
                 {slots.length} / 10
               </div>
            </div>

            <div className="space-y-3 mb-6">
              <AnimatePresence>
                {slots.map((pos, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-2xl group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#10b981] text-black font-black flex items-center justify-center text-xs">
                        {pos}
                      </div>
                      <span className="font-bold text-sm uppercase">
                        {pos === 'GK' ? 'Arquero' : 
                         pos === 'DEF' ? 'Defensor' :
                         pos === 'MID' ? 'Volante' : 
                         pos === 'FW' ? 'Delantero' : 'Cualquier Posición'}
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeSlot(idx)}
                      className="p-2 opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-5 gap-2">
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
                   className="bg-white/10 hover:bg-white/20 p-4 rounded-xl flex flex-col items-center gap-1 transition-all"
                 >
                   <span className="text-xl">{btn.emoji}</span>
                   <span className="text-[10px] font-black text-white/50">{btn.code}</span>
                 </button>
               ))}
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={createMutation.isPending}
            className="w-full py-5 rounded-3xl bg-[#10b981] text-black font-black text-xl italic shadow-[0_0_40px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            {createMutation.isPending ? 'PUBLICANDO...' : 'PUBLICAR FICHAJE'}
          </motion.button>

        </form>
      </div>
    </div>
  );
}
