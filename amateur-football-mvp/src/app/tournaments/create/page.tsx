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
  Percent,
  Calculator,
  User,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createTournament, registerTeamForTournament } from '@/lib/tournaments';
import { getUserTeams } from '@/lib/teams';
import { ROSARIO_VENUES, findVenueByLocation } from '@/lib/venues';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import LocationSearch from '@/components/LocationSearch';
import { AVAILABLE_TIMES } from '@/lib/constants';
import Link from 'next/link';

export default function CreateTournamentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  
  const [dbVenues, setDbVenues] = useState<any[]>([]);
  const [dbFields, setDbFields] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'F5' as 'F5' | 'F7' | 'F11',
    start_date: '',
    start_time: '18:00',
    location: '',
    max_teams: 8,
    entry_fee: 10000, // Per team
    match_fee: 6500, // Per player per match
    prize_percentage: 100,
    prize_description: '',
    banner_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
    host_team_id: '',
    business_id: '',
    field_id: '',
  });

  useEffect(() => {
    async function loadInitialData() {
      if (user) {
        const teams = await getUserTeams(user.id);
        const captainTeams = teams.filter((t: any) => t.role === 'captain');
        setUserTeams(captainTeams);
        if (captainTeams.length === 1) {
            setFormData(prev => ({ ...prev, host_team_id: captainTeams[0].id }));
        }

        const { data: businesses } = await supabase.from('canchas_businesses').select('*').eq('is_active', true);
        if (businesses) setDbVenues(businesses);
        const { data: fields } = await supabase.from('canchas_fields').select('*').eq('is_active', true);
        if (fields) setDbFields(fields);
      }
    }
    loadInitialData();
  }, [user]);

  // Calculations for prize money
  // Entry fee pool
  const totalIncome = formData.max_teams * formData.entry_fee;
  const calculatedPrize = Math.round((totalIncome * formData.prize_percentage) / 100);

  const handleVenueSelect = (address: string, isRealDb = false, businessId?: string) => {
    let newMatchFee = formData.match_fee;
    let fieldId = '';
    let type = formData.type;

    if (isRealDb && businessId) {
        let validField = dbFields.find(f => f.business_id === businessId && f.type === formData.type);
        if (!validField) validField = dbFields.find(f => f.business_id === businessId);
        if (validField) {
            const divider = validField.type === 'F5' ? 10 : validField.type === 'F7' ? 14 : 22;
            newMatchFee = Math.round((validField.price_per_match || 0) / divider);
            fieldId = validField.id;
            type = validField.type as any;
        }
    } else {
        const venue = findVenueByLocation(address);
        if (venue?.formats) {
            const format = venue.formats.find((f: any) => f.type === type) || venue.formats[0];
            if (format) {
                type = format.type;
                newMatchFee = format.pricePerPlayer;
            }
        }
    }

    setFormData(prev => ({ 
        ...prev, 
        location: address, 
        business_id: businessId || '', 
        field_id: fieldId,
        match_fee: newMatchFee,
        type: type as any
    }));
  };

  const handleCreate = async () => {
    if (!user) return;
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
        match_fee: formData.match_fee,
        banner_url: formData.banner_url,
        creator_id: user.id,
        is_official: false,
        status: 'upcoming' as const,
        prize_percentage: formData.prize_percentage,
        prize_description: formData.prize_description || `Bolsa de premios estimada: $${calculatedPrize.toLocaleString()}`,
        business_id: formData.business_id || null,
        field_id: formData.field_id || null
      };

      const tournament = await createTournament(dataToSave);
      
      if (formData.host_team_id) {
          try {
              await registerTeamForTournament(tournament.id, formData.host_team_id);
          } catch (regErr) {
              console.error('Failed to register host team:', regErr);
          }
      }

      router.push(`/tournaments/${tournament.id}`);
    } catch (err: any) {
      console.error('Error creating tournament:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Sede', 'Básico', 'Fecha', 'Costos', 'Equipo', 'Review'];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden p-4 lg:p-10 pt-24 pb-32">
      {/* ── BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(44,252,125,0.2),transparent_70%)]" />
      </div>

      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        <div className="flex flex-col gap-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-all">
            <ArrowLeft className="w-4 h-4" /> VOLVER
          </button>
          <h1 className="text-4xl lg:text-7xl font-black italic uppercase text-foreground leading-none tracking-tighter">
             NUEVA <span className="text-primary italic">COPA</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
           {steps.map((s, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full relative overflow-hidden bg-foreground/5">
                 <motion.div initial={{ width: 0 }} animate={{ width: i <= step ? '100%' : '0%' }} className={cn("absolute inset-0 transition-all", i < step ? "bg-primary/30" : "bg-primary shadow-[0_0_15px_rgba(45,252,125,0.3)]")} />
              </div>
           ))}
        </div>

        <div className="glass-premium rounded-[3rem] border border-white/5 p-8 lg:p-14 min-h-[500px] shadow-2xl md:">
           <AnimatePresence mode="wait">
              {step === 0 && (
                 <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">Seleccioná la Sede</h2>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest italic">Los jugadores pagarán el alquiler basándose en esta sede.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dbVenues.map(v => (
                            <button key={v.id} onClick={() => handleVenueSelect(v.address || v.name, true, v.id)} className={cn("p-6 rounded-[2.5rem] border text-left flex flex-col gap-4 transition-all", formData.business_id === v.id ? "border-primary bg-primary/5 shadow-xl shadow-primary/10" : "border-white/5 bg-white/[0.02] hover:border-white/10")}>
                                <div className="flex items-start justify-between">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", formData.business_id === v.id ? "bg-primary text-black" : "bg-white/5 text-foreground/20")}>
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-1 rounded-full uppercase italic">Socio Pelotify</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-black italic uppercase text-foreground leading-none">{v.name}</span>
                                    <span className="text-[9px] font-bold text-foreground/30 uppercase truncate block">{v.address}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <LocationSearch value={formData.location} onChange={handleVenueSelect} placeholder="Buscá otra cancha o dirección..." />

                    <button disabled={!formData.location} onClick={() => setStep(1)} className="w-full h-20 bg-foreground text-background rounded-[2rem] font-black text-sm uppercase transition-all shadow-xl hover:bg-primary hover:text-black">CONTINUAR</button>
                 </motion.div>
              )}

              {step === 1 && (
                 <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                    <div className="space-y-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase text-foreground/40 px-2 flex items-center gap-2"><Trophy className="w-4" /> Nombre del Torneo</label>
                          <input type="text" placeholder="Ej: Super Cup Rosario" className="w-full h-20 bg-white/[0.02] border border-white/5 rounded-[2rem] px-8 text-2xl font-black italic outline-none focus:border-primary/50 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                       </div>
                       <div className="grid grid-cols-3 gap-4">
                          {(['F5', 'F7', 'F11'] as const).map(type => (
                             <button key={type} onClick={() => setFormData({...formData, type})} className={cn("h-28 rounded-3xl border font-black text-xs uppercase flex flex-col items-center justify-center gap-2 transition-all", formData.type === type ? "bg-primary text-black border-primary scale-105 shadow-xl shadow-primary/20" : "bg-white/[0.02] text-foreground/40 hover:border-white/10")}>
                                <span className="text-2xl">⚽</span>
                                {type === 'F5' ? 'Fútbol 5' : type === 'F7' ? 'Fútbol 7' : 'Fútbol 11'}
                             </button>
                          ))}
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => setStep(0)} className="h-20 px-8 border border-white/10 rounded-[2rem] font-black text-xs text-foreground/40">ATRÁS</button>
                       <button disabled={!formData.name} onClick={() => setStep(2)} className="flex-1 h-20 bg-foreground text-background rounded-[2rem] font-black text-sm hover:bg-primary hover:text-black transition-all">SIGUIENTE</button>
                    </div>
                 </motion.div>
              )}

              {step === 2 && (
                 <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 font-mono">
                        {Array.from({ length: 14 }).map((_, i) => {
                            const d = new Date(); d.setDate(d.getDate() + i);
                            const dateStr = d.toISOString().split('T')[0];
                            const isSelected = formData.start_date === dateStr;
                            return (
                                <button key={dateStr} onClick={() => setFormData({ ...formData, start_date: dateStr })} className={cn("flex-shrink-0 w-24 h-28 rounded-3xl border flex flex-col items-center justify-center transition-all", isSelected ? "bg-primary text-black border-primary scale-105 shadow-xl shadow-primary/10" : "bg-white/[0.02] border-white/5")}>
                                    <span className="text-4xl font-black italic tracking-tighter leading-none">{d.getDate()}</span>
                                    <span className="text-[9px] font-black uppercase opacity-60 mt-1">{d.toLocaleDateString('es-ES', { month: 'short' })}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="grid grid-cols-6 lg:grid-cols-8 gap-2 max-h-[300px] overflow-y-auto no-scrollbar p-1">
                        {AVAILABLE_TIMES.map(t => (
                            <button key={t} onClick={() => setFormData({...formData, start_time: t})} className={cn("h-12 rounded-xl border text-[10px] font-black transition-all", formData.start_time === t ? "bg-primary border-primary text-black shadow-lg" : "bg-white/[0.02] border-white/5")}>{t}</button>
                        ))}
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => setStep(1)} className="h-20 px-8 border border-white/10 rounded-[2rem] font-black text-xs text-foreground/40">ATRÁS</button>
                       <button disabled={!formData.start_date} onClick={() => setStep(3)} className="flex-1 h-20 bg-foreground text-background rounded-[2rem] font-black text-sm hover:bg-primary hover:text-black">CONTINUAR</button>
                    </div>
                 </motion.div>
              )}

              {step === 3 && (
                 <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Entry Fee (Per Team, paid once) */}
                        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 space-y-6">
                            <div className="flex items-center gap-3 text-primary">
                                <DollarSign className="w-8 h-8" />
                                <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">Inscripción / Equipo</h3>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-foreground/30 uppercase italic tracking-widest">Cuota fija de ingreso al torneo (para el premio)</p>
                                <input type="number" className="w-full text-5xl font-black italic bg-transparent border-none outline-none text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.entry_fee} onChange={e => setFormData({...formData, entry_fee: parseInt(e.target.value) || 0})} />
                            </div>
                        </div>

                        {/* Match Fee (Per Player per Match) */}
                        <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 space-y-6">
                            <div className="flex items-center gap-3 text-foreground/40">
                                <User className="w-8 h-8" />
                                <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">Cancha / Jugador</h3>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-foreground/30 uppercase italic tracking-widest">Se paga únicamente por partido jugado</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black italic text-foreground/20">$</span>
                                    <input type="number" className="w-full text-5xl font-black italic bg-transparent border-none outline-none text-white" value={formData.match_fee} onChange={e => setFormData({...formData, match_fee: parseInt(e.target.value) || 0})} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-foreground/5 border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-black italic uppercase text-primary">Bolsa de Premios ({formData.prize_percentage}%)</span>
                                <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Proveniente de las inscripciones totales</p>
                            </div>
                            <span className="text-5xl font-black italic text-primary tracking-tighter">${calculatedPrize.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2 pt-4">
                             {[25, 50, 75, 100].map(p => (
                                 <button key={p} onClick={() => setFormData({...formData, prize_percentage: p})} className={cn("flex-1 h-12 rounded-xl border text-[10px] font-black transition-all", formData.prize_percentage === p ? "bg-primary text-black border-primary" : "bg-white/5 border-white/5 hover:border-white/10")}>{p}%</button>
                             ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => setStep(2)} className="h-20 px-8 border border-white/10 rounded-[2rem] font-black text-xs text-foreground/40">ATRÁS</button>
                       <button onClick={() => setStep(4)} className="flex-1 h-20 bg-foreground text-background rounded-[2rem] font-black text-sm hover:bg-primary hover:text-black">CONTINUAR</button>
                    </div>
                 </motion.div>
              )}

              {step === 4 && (
                 <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black italic uppercase text-foreground leading-none tracking-tighter">Inscripción del Anfitrión</h2>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest italic">Tu equipo participará de la llave automáticamente.</p>
                    </div>
                    {userTeams.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {userTeams.map(t => (
                                <button key={t.id} onClick={() => setFormData({...formData, host_team_id: t.id})} className={cn("w-full p-8 rounded-[3rem] border flex items-center justify-between transition-all", formData.host_team_id === t.id ? "bg-primary border-primary text-black" : "bg-white/[0.02] border-white/5")}>
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center overflow-hidden">{t.logo_url ? <img src={t.logo_url} className="w-full h-full object-cover" /> : <Shield className="w-8 h-8 opacity-40 ml-1" />}</div>
                                        <div className="text-left">
                                            <span className="font-black italic uppercase text-2xl leading-none">{t.name}</span>
                                            <span className="text-[10px] font-black uppercase opacity-40 tracking-widest mt-1 block italic">{t.members_count || 0} JUGADORES</span>
                                        </div>
                                    </div>
                                    {formData.host_team_id === t.id && <CheckCircle className="w-8 h-8" />}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-20 border-2 border-dashed border-white/5 rounded-[4rem] text-center bg-white/[0.01]">
                            <Link href="/teams/create"><button className="px-10 h-14 bg-white/5 hover:bg-white/10 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest">CREAR EQUIPO PRIMERO</button></Link>
                        </div>
                    )}
                    <div className="flex gap-4">
                       <button onClick={() => setStep(3)} className="h-20 px-8 border border-white/10 rounded-[2rem] font-black text-xs text-foreground/40">ATRÁS</button>
                       <button onClick={() => setStep(5)} className="flex-1 h-20 bg-foreground text-background rounded-[2rem] font-black text-sm uppercase shadow-xl hover:bg-primary hover:text-black">REVISIÓN FINAL</button>
                    </div>
                 </motion.div>
              )}

              {step === 5 && (
                 <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                    <div className="p-10 rounded-[4rem] bg-foreground/5 border border-white/5 space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.05] scale-[2] rotate-12 pointer-events-none"><Zap className="w-64 h-64" /></div>
                        
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-5xl lg:text-7xl font-black italic uppercase text-foreground leading-[0.8] tracking-tighter">{formData.name}</h3>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span className="text-[11px] font-black text-foreground/40 uppercase tracking-[0.3em] italic">{formData.location}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 relative z-10">
                            <div className="p-6 rounded-[2rem] bg-white/[0.03] space-y-1">
                                <span className="text-[9px] font-black text-foreground/20 uppercase italic block">Inscripción / Equipo</span>
                                <span className="text-2xl font-black italic text-foreground tracking-tighter">${formData.entry_fee.toLocaleString()}</span>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-white/[0.03] space-y-1">
                                <span className="text-[9px] font-black text-foreground/20 uppercase italic block">Cancha / Jugador</span>
                                <span className="text-2xl font-black italic text-foreground tracking-tighter">${formData.match_fee.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="p-10 rounded-[3rem] bg-primary/10 border border-primary/20 flex items-center justify-between relative z-10">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic block">Gran Premio</span>
                                <span className="text-6xl lg:text-8xl font-black italic text-primary leading-none tracking-tighter">${calculatedPrize.toLocaleString()}</span>
                            </div>
                            {formData.host_team_id && <div className="text-right"><span className="text-[9px] font-black text-primary/60 uppercase block italic mb-2">Anfitrión</span><div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center overflow-hidden border border-primary/20"><Shield className="w-8 h-8 opacity-40 ml-1" /></div></div>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => setStep(4)} className="h-20 px-8 border border-white/10 rounded-[2.5rem] font-black text-xs text-foreground/40 uppercase transition-all">ATRÁS</button>
                       <button disabled={loading} onClick={handleCreate} className="flex-1 h-20 bg-primary text-black rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-4 hover:bg-white hover:shadow-white/20 transition-all active:scale-95">
                          {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <><CheckCircle2 className="w-7 h-7" /> PUBLICAR COPA</>}
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
