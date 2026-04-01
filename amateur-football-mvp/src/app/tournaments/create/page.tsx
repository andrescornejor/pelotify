'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Search,
  ChevronRight,
  Target,
  Zap,
  ArrowLeft,
  DollarSign,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createTournament } from '@/lib/tournaments';
import { cn } from '@/lib/utils';
import LocationSearch from '@/components/LocationSearch';

export default function CreateTournamentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'F5' as 'F5' | 'F7' | 'F11',
    start_date: '',
    end_date: '',
    location: '',
    max_teams: 8,
    entry_fee: 0,
    banner_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
  });

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await createTournament({
        ...formData,
        creator_id: user.id,
        is_official: false,
      });
      router.push('/tournaments');
    } catch (err) {
      console.error(err);
      alert('Error al crear el torneo.');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Básico', 'Detalles', 'Review'];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden p-4 lg:p-10 pt-24 pb-32">
      {/* ── AMBIENT DECORATION ── */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(44,252,125,0.2),transparent_70%)]" />
      </div>

      <div className="max-w-3xl mx-auto space-y-12 relative z-10">
        {/* ── HEADER ── */}
        <div className="flex flex-col gap-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> VOLVER
          </button>
          <div className="space-y-2">
             <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Tournament Builder</span>
             </div>
             <h1 className="text-4xl lg:text-7xl font-black italic uppercase text-foreground leading-none tracking-tighter">
                CREÁ TU <span className="text-primary italic">COPA</span>
             </h1>
          </div>
        </div>

        {/* ── STEPS INDICATOR ── */}
        <div className="flex items-center gap-4">
           {steps.map((s, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full relative overflow-hidden bg-foreground/5">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: i <= step ? '100%' : '0%' }}
                    className={cn(
                       "absolute inset-0",
                       i < step ? "bg-primary/40" : "bg-primary"
                    )}
                 />
              </div>
           ))}
        </div>

        <div className="glass-premium rounded-[3rem] border border-foreground/10 p-8 lg:p-12 min-h-[400px]">
           <AnimatePresence mode="wait">
              {step === 0 && (
                 <motion.div 
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                 >
                    <div className="space-y-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Nombre de la Copa</label>
                          <input 
                             type="text"
                             placeholder="Ej: Copa Relámpago Rosario"
                             className="w-full h-20 bg-foreground/[0.03] border border-foreground/10 rounded-[2rem] px-8 text-xl font-black text-foreground italic placeholder:text-foreground/10 focus:border-primary focus:bg-foreground/[0.05] transition-all outline-none"
                             value={formData.name}
                             onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(['F5', 'F7', 'F11'] as const).map(type => (
                             <button
                                key={type}
                                onClick={() => setFormData({...formData, type})}
                                className={cn(
                                   "h-24 rounded-[1.5rem] border font-black text-xs uppercase tracking-widest transition-all",
                                   formData.type === type ? "bg-primary text-black border-primary shadow-lg shadow-primary/20" : "bg-foreground/[0.03] text-foreground/40 border-foreground/10 hover:border-foreground/20"
                                )}
                             >
                                {type === 'F5' ? 'Fútbol 5' : type === 'F7' ? 'Fútbol 7' : 'Fútbol 11'}
                             </button>
                          ))}
                       </div>
                    </div>

                    <button 
                       disabled={!formData.name}
                       onClick={() => setStep(1)}
                       className="w-full h-20 bg-foreground text-background rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-black transition-all disabled:opacity-20"
                    >
                       CONTINUAR
                    </button>
                 </motion.div>
              )}

              {step === 1 && (
                 <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                 >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Fecha Inicio</label>
                          <div className="relative h-16">
                             <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                             <input 
                                type="date"
                                className="w-full h-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-14 font-bold text-foreground text-sm outline-none focus:border-primary"
                                value={formData.start_date}
                                onChange={e => setFormData({...formData, start_date: e.target.value})}
                             />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Cupo de Equipos</label>
                          <div className="relative h-16">
                             <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                             <select 
                                className="w-full h-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-14 font-black text-foreground text-sm outline-none focus:border-primary appearance-none cursor-pointer"
                                value={formData.max_teams}
                                onChange={e => setFormData({...formData, max_teams: parseInt(e.target.value)})}
                             >
                                {[4, 8, 12, 16, 24, 32].map(n => (
                                   <option key={n} value={n}>{n} EQUIPOS</option>
                                ))}
                             </select>
                          </div>
                       </div>
                       <div className="space-y-4 col-span-full">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Sede / Ubicación</label>
                          <LocationSearch 
                             value={formData.location}
                             onChange={(loc) => setFormData({...formData, location: loc})}
                             placeholder="Ubicación o predio..."
                          />
                       </div>
                       <div className="space-y-4 col-span-full">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Costo Inscripción ($)</label>
                          <div className="relative h-16">
                             <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                             <input 
                                type="number"
                                placeholder="Costo por equipo (0 = Gratis)"
                                className="w-full h-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-14 font-black text-foreground text-sm outline-none focus:border-primary"
                                value={formData.entry_fee}
                                onChange={e => setFormData({...formData, entry_fee: parseInt(e.target.value)})}
                             />
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => setStep(0)} className="h-20 px-8 border border-foreground/10 rounded-[2rem] font-black text-xs text-foreground/40 hover:text-foreground">ATRÁS</button>
                       <button 
                          disabled={!formData.start_date || !formData.location}
                          onClick={() => setStep(2)}
                          className="flex-1 h-20 bg-foreground text-background rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-black transition-all disabled:opacity-20"
                       >
                          CONTINUAR
                       </button>
                    </div>
                 </motion.div>
              )}

              {step === 2 && (
                 <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                 >
                    <div className="space-y-6">
                       <h3 className="text-2xl font-black italic text-foreground uppercase tracking-tighter">REPASO FINAL</h3>
                       <div className="p-6 rounded-3xl bg-foreground/5 border border-foreground/5 space-y-4">
                          <div className="flex justify-between items-center text-sm">
                             <span className="text-foreground/40 font-black uppercase tracking-widest text-[9px]">Evento</span>
                             <span className="text-foreground font-black italic uppercase">{formData.name}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                             <span className="text-foreground/40 font-black uppercase tracking-widest text-[9px]">Formato</span>
                             <span className="text-primary font-black uppercase">{formData.type}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                             <span className="text-foreground/40 font-black uppercase tracking-widest text-[9px]">Sede</span>
                             <span className="text-foreground font-bold">{formData.location}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                             <span className="text-foreground/40 font-black uppercase tracking-widest text-[9px]">Inscripción</span>
                             <span className="text-2xl font-black italic text-primary">${formData.entry_fee.toLocaleString()}</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => setStep(1)} className="h-20 px-8 border border-foreground/10 rounded-[2rem] font-black text-xs text-foreground/40 hover:text-foreground">ATRÁS</button>
                       <button 
                          disabled={loading}
                          onClick={handleCreate}
                          className="flex-1 h-20 bg-primary text-black rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                       >
                          {loading ? (
                             <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                             <>
                                <CheckCircle2 className="w-5 h-5" />
                                CONFIRMAR Y CREAR
                             </>
                          )}
                       </button>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
