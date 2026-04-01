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
  Clock,
  Shield,
  Circle,
  CheckCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createTournament, registerTeamForTournament } from '@/lib/tournaments';
import { getUserTeams } from '@/lib/teams';
import { cn } from '@/lib/utils';
import LocationSearch from '@/components/LocationSearch';
import { AVAILABLE_TIMES } from '@/lib/constants';

export default function CreateTournamentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [userTeams, setUserTeams] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'F5' as 'F5' | 'F7' | 'F11',
    start_date: '',
    start_time: '',
    location: '',
    max_teams: 8,
    entry_fee: 0,
    banner_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
    host_team_id: '',
  });

  useEffect(() => {
    async function loadTeams() {
      if (user) {
        const teams = await getUserTeams(user.id);
        const captainTeams = teams.filter((t: any) => t.role === 'captain');
        setUserTeams(captainTeams);
        // Auto-select if only one
        if (captainTeams.length === 1) {
            setFormData(prev => ({ ...prev, host_team_id: captainTeams[0].id }));
        }
      }
    }
    loadTeams();
  }, [user]);

  const handleCreate = async () => {
    if (!user) {
        alert('Debes estar logueado para crear un torneo.');
        return;
    }
    setLoading(true);
    try {
      const dataToSave = {
        name: formData.name,
        description: formData.description || null,
        type: formData.type,
        start_date: formData.start_date,
        location: formData.location,
        max_teams: formData.max_teams,
        entry_fee: formData.entry_fee,
        banner_url: formData.banner_url,
        creator_id: user.id,
        is_official: false,
        status: 'upcoming' as const
      };

      const tournament = await createTournament(dataToSave);
      
      // If a host team is selected, register it
      if (formData.host_team_id) {
          try {
              await registerTeamForTournament(tournament.id, formData.host_team_id);
          } catch (regErr) {
              console.error('Tournament created but host team registration failed:', regErr);
          }
      }

      router.push('/tournaments');
    } catch (err: any) {
      console.error('Error creating tournament:', err);
      alert(`Error al crear el torneo: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Básico', 'Cuándo', 'Sede y Costo', 'Equipo', 'Review'];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden p-4 lg:p-10 pt-24 pb-32">
      {/* ── AMBIENT DECORATION ── */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(44,252,125,0.2),transparent_70%)]" />
      </div>

      <div className="max-w-3xl mx-auto space-y-12 relative z-10">
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
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] px-1">
                                Fecha de Inicio
                            </span>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 font-mono">
                                {Array.from({ length: 14 }).map((_, i) => {
                                    const d = new Date();
                                    d.setDate(d.getDate() + i);
                                    const dateStr = d.toISOString().split('T')[0];
                                    const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase();
                                    const dayNumber = d.getDate();
                                    const monthName = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase();
                                    const isSelected = formData.start_date === dateStr;

                                    return (
                                        <motion.button
                                            key={dateStr}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, start_date: dateStr })}
                                            className={`flex-shrink-0 w-[72px] h-24 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-0.5 relative overflow-hidden ${
                                                isSelected ? 'border-primary bg-primary shadow-lg shadow-primary/20 scale-105 text-black' : 'border-foreground/[0.06] bg-foreground/[0.02] hover:border-foreground/20 text-foreground'
                                            }`}
                                        >
                                            <span className={`text-[8px] font-black tracking-widest ${isSelected ? 'opacity-70' : 'opacity-25'}`}>{monthName}</span>
                                            <span className="text-3xl font-black italic tracking-tighter leading-none">{dayNumber}</span>
                                            <span className={`text-[8px] font-black tracking-widest ${isSelected ? 'opacity-70' : 'opacity-25'}`}>{dayName}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] px-1">
                                Horario de Inicio
                            </span>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-h-[300px] overflow-y-auto no-scrollbar p-1">
                                {AVAILABLE_TIMES.map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, start_time: t })}
                                        className={cn(
                                            "h-10 rounded-lg border text-[9px] font-black tracking-tighter transition-all",
                                            formData.start_time === t ? "bg-primary text-black border-primary" : "bg-foreground/[0.02] text-foreground/40 border-foreground/5 hover:border-foreground/20"
                                        )}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => setStep(0)} className="h-20 px-8 border border-foreground/10 rounded-[2rem] font-black text-xs text-foreground/40 hover:text-foreground uppercase tracking-widest">ATRÁS</button>
                       <button 
                          disabled={!formData.start_date}
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
                    <div className="space-y-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2 flex items-center gap-2">
                             <Users className="w-3 h-3" /> CUPO DE EQUIPOS
                          </label>
                          <div className="grid grid-cols-4 gap-3">
                             {[4, 8, 12, 16].map(n => (
                                <button
                                   key={n}
                                   onClick={() => setFormData({...formData, max_teams: n})}
                                   className={cn(
                                      "h-16 rounded-2xl border font-black text-sm transition-all",
                                      formData.max_teams === n ? "bg-primary text-black border-primary" : "bg-foreground/[0.03] text-foreground/40 border-foreground/10"
                                   )}
                                >
                                   {n}
                                </button>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2 flex items-center gap-2">
                             <MapPin className="w-3 h-3" /> UBICACIÓN / SEDE PRINCIPAL
                          </label>
                          <LocationSearch 
                             value={formData.location}
                             onChange={(loc) => setFormData({...formData, location: loc})}
                             placeholder="¿Dónde será la sede principal?"
                          />
                       </div>

                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2 flex items-center gap-2">
                             <DollarSign className="w-3 h-3" /> COSTO INSCRIPCIÓN POR EQUIPO
                          </label>
                          <div className="relative">
                             <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                             <input 
                                type="number"
                                placeholder="Costo total (0 si es gratis)"
                                className="w-full h-20 bg-foreground/[0.03] border border-foreground/10 rounded-[2rem] px-16 text-xl font-black text-foreground outline-none focus:border-primary"
                                value={formData.entry_fee || ''}
                                onChange={e => setFormData({...formData, entry_fee: parseInt(e.target.value) || 0})}
                             />
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => setStep(1)} className="h-20 px-8 border border-foreground/10 rounded-[2rem] font-black text-xs text-foreground/40 hover:text-foreground uppercase tracking-widest">ATRÁS</button>
                       <button 
                          disabled={!formData.location}
                          onClick={() => setStep(3)}
                          className="flex-1 h-20 bg-foreground text-background rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-black transition-all disabled:opacity-20"
                       >
                          CONTINUAR
                       </button>
                    </div>
                 </motion.div>
              )}

              {step === 3 && (
                 <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                 >
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black italic text-foreground uppercase tracking-tighter">¿TU EQUIPO PARTICIPA?</h3>
                            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Como creador y capitán, tu equipo se inscribirá automáticamente.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {userTeams.length > 0 ? (
                                userTeams.map(team => (
                                    <button
                                        key={team.id}
                                        onClick={() => setFormData({...formData, host_team_id: team.id})}
                                        className={cn(
                                            "p-6 rounded-[2rem] border flex items-center justify-between transition-all group",
                                            formData.host_team_id === team.id ? "bg-primary border-primary text-black" : "bg-foreground/[0.03] border-foreground/10 text-foreground/40 hover:border-foreground/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-foreground/10 group-hover:bg-black/10 flex items-center justify-center overflow-hidden">
                                                {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-cover" /> : <Shield className="w-6 h-6" />}
                                            </div>
                                            <span className="font-black italic uppercase tracking-tighter text-sm">{team.name}</span>
                                        </div>
                                        {formData.host_team_id === team.id ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6 opacity-20" />}
                                    </button>
                                ))
                            ) : (
                                <div className="p-10 rounded-[2.5rem] bg-foreground/[0.02] border border-dashed border-foreground/10 text-center space-y-4">
                                    <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest block">No eres capitán de ningún equipo</span>
                                    <p className="text-[9px] text-foreground/40 font-medium uppercase leading-relaxed max-w-xs mx-auto">Tu torneo será neutral. Los equipos deberán inscribirse por su cuenta.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => setStep(2)} className="h-20 px-8 border border-foreground/10 rounded-[2rem] font-black text-xs text-foreground/40 hover:text-foreground">ATRÁS</button>
                       <button 
                          onClick={() => setStep(4)}
                          className="flex-1 h-20 bg-foreground text-background rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                       >
                          REVISAR
                       </button>
                    </div>
                 </motion.div>
              )}

              {step === 4 && (
                 <motion.div 
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                 >
                    <div className="space-y-6">
                       <h3 className="text-2xl font-black italic text-foreground uppercase tracking-tighter">CONFIRMACIÓN DETALLADA</h3>
                       <div className="p-8 rounded-[2.5rem] bg-foreground/5 border border-foreground/5 space-y-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-10">
                             <Trophy className="w-32 h-32" />
                          </div>
                          
                          <div className="relative z-10 space-y-4">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black italic">
                                   {formData.type}
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-3xl font-black italic uppercase text-foreground leading-none">{formData.name}</span>
                                   <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mt-1">{formData.location}</span>
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-background/40">
                                   <span className="text-[8px] font-black text-foreground/20 uppercase block mb-1">INICIA</span>
                                   <span className="text-sm font-black text-foreground">{formData.start_date} {formData.start_time}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-background/40">
                                   <span className="text-[8px] font-black text-foreground/20 uppercase block mb-1">EQUIPO ANFITRIÓN</span>
                                   <span className="text-sm font-black text-foreground">
                                       {formData.host_team_id ? userTeams.find(t => t.id === formData.host_team_id)?.name : 'Ninguno (Neutral)'}
                                   </span>
                                </div>
                             </div>

                             <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                                <span className="text-xs font-black text-primary uppercase">TOTAL INSCRIPCIÓN</span>
                                <span className="text-3xl font-black italic text-primary">${formData.entry_fee.toLocaleString()}</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => setStep(3)} className="h-20 px-8 border border-foreground/10 rounded-[2rem] font-black text-xs text-foreground/40 hover:text-foreground">ATRÁS</button>
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
                                CONFIRMAR Y CREAR TORNEO
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
