'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Trophy, 
  UserPlus, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useRecruitmentMatches, useJoinRecruitmentSlot } from '@/hooks/useRecruitmentQueries';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export default function RecruitmentMarketplace() {
  const { user } = useAuth();
  const { data: matches, isLoading } = useRecruitmentMatches();
  const joinSlotMutation = useJoinRecruitmentSlot();
  
  const [filterPos, setFilterPos] = useState<string | null>(null);
  
  const positions = [
    { code: 'GK', label: 'Arqueros', icon: '🧤' },
    { code: 'DEF', label: 'Defensores', icon: '🛡️' },
    { code: 'MID', label: 'Volantes', icon: '🎯' },
    { code: 'FW', label: 'Delanteros', icon: '⚽' },
  ];

  const handleJoinSlot = async (slotId: string) => {
    if (!user) {
      alert('Debes iniciar sesión para postularte.');
      return;
    }
    
    try {
      await joinSlotMutation.mutateAsync({ slotId, userId: user.id });
      // Animación de éxito o toast aquí?
    } catch (err) {
      console.error(err);
      alert('Error al postularse. El cupo podría estar lleno.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050a0a] text-white pb-24">
      {/* Hero Section - Glassmorphism */}
      <div className="relative overflow-hidden pt-20 pb-12 px-4">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#10b98115] to-transparent pointer-events-none" />
        <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-[#10b98120] blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4"
          >
            MERCADO DE <span className="text-[#10b981]">FICHAJES</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg md:text-xl max-w-2xl"
          >
            ¿Te falta uno? ¿Buscás equipo? El Marketplace Pro de Pelotify conecta organizadores con jugadores libres en tiempo real.
          </motion.p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-black/40 border-y border-white/5 py-4 overflow-x-auto no-scrollbar">
        <div className="max-w-5xl mx-auto px-4 flex gap-3">
          <button 
            onClick={() => setFilterPos(null)}
            className={`px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap ${
              !filterPos ? 'bg-[#10b981] text-black scale-105' : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            Todos
          </button>
          {positions.map((pos) => (
            <button
              key={pos.code}
              onClick={() => setFilterPos(pos.code)}
              className={`px-5 py-2 rounded-full font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                filterPos === pos.code ? 'bg-[#10b981] text-black scale-105' : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="text-xl">{pos.icon}</span>
              {pos.label}
            </button>
          ))}
          
          <div className="ml-auto flex items-center">
             <Link href="/recruitment/create">
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 className="bg-white text-black px-6 py-2 rounded-full font-black text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
               >
                 <Plus size={18} />
                 BUSCAR JUGADORES
               </motion.button>
             </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-8">
            <AnimatePresence mode="popLayout">
              {matches?.filter(m => !filterPos || m.slots.some(s => s.position === filterPos)).map((match) => (
                <motion.div
                  key={match.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative bg-[#0a1212] border border-white/10 rounded-[32px] overflow-hidden hover:border-[#10b981/40] transition-all"
                >
                  <div className="absolute top-0 right-0 p-6">
                    <div className="flex flex-col items-end gap-2">
                      <span className="bg-[#10b98130] text-[#10b981] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-[#10b98130]">
                        {match.required_skill_level}
                      </span>
                      {match.venue && (
                         <span className="text-white/40 text-[10px] flex items-center gap-1">
                           <MapPin size={10} /> {match.venue.name}
                         </span>
                      )}
                    </div>
                  </div>

                  <div className="p-8 flex flex-col md:flex-row gap-8">
                    {/* Left Side: Info */}
                    <div className="flex-1 space-y-6">
                      <div>
                        <h3 className="text-2xl font-black italic mb-2 group-hover:text-[#10b981] transition-colors uppercase">
                          Pelotero solicitado
                        </h3>
                        <p className="text-white/50 text-sm line-clamp-2 italic">
                          "{match.description || 'Se busca completar el partido con gente de buena onda y nivel competitivo.'}"
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#10b98120] flex items-center justify-center text-[#10b981]">
                            <Calendar size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-black text-white/30 tracking-widest">Fecha</p>
                            <p className="font-bold text-sm">
                              {format(new Date(match.date), 'EEEE dd/MM', { locale: es })}
                            </p>
                          </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#10b98120] flex items-center justify-center text-[#10b981]">
                            <Clock size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-black text-white/30 tracking-widest">Hora</p>
                            <p className="font-bold text-sm">
                                {match.time || '20:00'} hs
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Slots Grid */}
                    <div className="w-full md:w-[320px] bg-white/5 rounded-3xl p-6 border border-white/5">
                      <h4 className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-4 flex items-center gap-2">
                        <UserPlus size={12} className="text-[#10b981]" />
                        Puestos Vacantes ({match.slots.filter(s => s.status === 'open').length})
                      </h4>

                      <div className="space-y-3">
                        {match.slots.map((slot) => (
                          <div 
                            key={slot.id}
                            className={`relative flex items-center justify-between p-3 rounded-2xl border transition-all ${
                              slot.status === 'open' 
                                ? 'bg-white/5 border-white/10 hover:border-[#10b98140]' 
                                : 'bg-[#10b98110] border-[#10b98120]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black ${
                                slot.status === 'open' ? 'bg-white/10 text-white/40' : 'bg-[#10b981] text-black'
                              }`}>
                                {slot.position}
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-black text-white/30">Posición</p>
                                <p className="text-sm font-bold">
                                  {slot.position === 'GK' ? 'Arquero' : 
                                   slot.position === 'DEF' ? 'Defensor' :
                                   slot.position === 'MID' ? 'Volante' : 
                                   slot.position === 'FW' ? 'Delantero' : 'Cualquiera'}
                                </p>
                              </div>
                            </div>

                            {slot.status === 'open' ? (
                              <button
                                onClick={() => handleJoinSlot(slot.id)}
                                disabled={joinSlotMutation.isPending}
                                className="bg-[#10b981] text-black px-4 py-1.5 rounded-full text-xs font-black hover:scale-105 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                              >
                                {joinSlotMutation.isPending && joinSlotMutation.variables?.slotId === slot.id ? '...' : 'FICHAR'}
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 pr-2">
                                <span className="text-[10px] font-black text-[#10b981] italic">FICHAJE CONFIRMADO</span>
                                <CheckCircle2 size={14} className="text-[#10b981]" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {matches?.length === 0 && (
              <div className="text-center py-24 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                <AlertCircle className="mx-auto mb-4 text-[#10b981]" size={48} />
                <h3 className="text-2xl font-black uppercase mb-2">No hay fichajes activos</h3>
                <p className="text-white/40">Sé el primero en buscar jugadores para tu partido.</p>
                <Link href="/recruitment/create">
                  <button className="mt-6 bg-white text-black px-8 py-3 rounded-full font-black">
                    CREAR BÚSQUEDA
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
