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
    start_time: '18:00', // Default more realistic time
    location: '',
    max_teams: 8,
    entry_fee: 10000,
    prize_percentage: 50,
    prize_description: '',
    banner_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
    host_team_id: '',
    business_id: '',
    field_id: '',
    pitch_price: 0,
  });

  useEffect(() => {
    async function loadInitialData() {
      if (user) {
        // Fetch teams
        const teams = await getUserTeams(user.id);
        const captainTeams = teams.filter((t: any) => t.role === 'captain');
        setUserTeams(captainTeams);
        // Better auto-selection logic
        if (captainTeams.length === 1) {
            setFormData(prev => ({ ...prev, host_team_id: captainTeams[0].id }));
        }

        // Fetch real venues
        const { data: businesses } = await supabase.from('canchas_businesses').select('*').eq('is_active', true);
        if (businesses) setDbVenues(businesses);
        const { data: fields } = await supabase.from('canchas_fields').select('*').eq('is_active', true);
        if (fields) setDbFields(fields);
      }
    }
    loadInitialData();
  }, [user]);

  // Dynamic calculations
  const matchesCount = formData.max_teams - 1;
  const totalIncome = formData.max_teams * formData.entry_fee;
  const totalPitchCosts = matchesCount * formData.pitch_price;
  const netTotal = Math.max(0, totalIncome - totalPitchCosts);
  const calculatedPrize = Math.round((netTotal * formData.prize_percentage) / 100);

  const handleVenueSelect = (address: string, isRealDb = false, businessId?: string) => {
    let newPitchPrice = 0;
    let fieldId = '';
    let type = formData.type;

    if (isRealDb && businessId) {
        let validField = dbFields.find(f => f.business_id === businessId && f.type === formData.type);
        if (!validField) validField = dbFields.find(f => f.business_id === businessId);
        if (validField) {
            newPitchPrice = validField.price_per_match || 0;
            fieldId = validField.id;
            type = validField.type as any;
        }
    } else {
        const venue = findVenueByLocation(address);
        if (venue?.formats) {
            const format = venue.formats.find((f: any) => f.type === type) || venue.formats[0];
            if (format) {
                type = format.type;
                newPitchPrice = format.pricePerPlayer * (type === 'F5' ? 10 : type === 'F7' ? 14 : 22);
            }
        }
    }

    setFormData(prev => ({ 
        ...prev, 
        location: address, 
        business_id: businessId || '', 
        field_id: fieldId,
        pitch_price: newPitchPrice,
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
      
      // Attempt registration with more detailed logging and confirmation
      if (formData.host_team_id) {
          console.log(`Registering host team ${formData.host_team_id} for tournament ${tournament.id}`);
          try {
              await registerTeamForTournament(tournament.id, formData.host_team_id);
              console.log('Host team registered successfully');
          } catch (regErr) {
              console.error('Failed to register host team, but tournament was created:', regErr);
          }
      }

      router.push(`/tournaments/${tournament.id}`);
    } catch (err: any) {
      console.error('Fatal error creating tournament:', err);
      alert(`Error al crear el torneo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Sede', 'Básico', 'Fecha y Hora', 'Premios', 'Anfitrión', 'Review'];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden p-4 lg:p-10 pt-24 pb-32">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(44,252,125,0.2),transparent_70%)]" />
      </div>

      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        <div className="flex flex-col gap-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-all">
            <ArrowLeft className="w-3" /> VOLVER
          </button>
          <div className="space-y-1">
             <h1 className="text-4xl lg:text-7xl font-black italic uppercase text-foreground leading-none tracking-tighter">
                ORGANIZÁ TU <span className="text-primary italic">TORNEO</span>
             </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
           {steps.map((s, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full relative overflow-hidden bg-foreground/5">
                 <motion.div initial={{ width: 0 }} animate={{ width: i <= step ? '100%' : '0%' }} transition={{ duration: 0.5 }} className={cn("absolute inset-0", i < step ? "bg-primary/30 shadow-[0_0_10px_rgba(45,252,125,0.2)]" : "bg-primary")} />
              </div>
           ))}
        </div>

        <div className="glass-premium rounded-[3rem] border border-white/5 p-8 lg:p-12 min-h-[500px] shadow-2xl relative">
           <AnimatePresence mode="wait">
              {/* STEP 0: SEDE */}
              {step === 0 && (
                 <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Seleccioná la Sede Principal</h2>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Elegí donde se jugará la mayoría de los partidos.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dbVenues.map(v => (
                            <button key={v.id} onClick={() => handleVenueSelect(v.address || v.name, true, v.id)} className={cn("p-6 rounded-3xl border text-left flex flex-col gap-4 transition-all group", formData.business_id === v.id ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-white/5 bg-white/[0.02] hover:border-white/10")}>
                                <div className="flex items-start justify-between">
                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all", formData.business_id === v.id ? "bg-primary text-black" : "bg-white/5 text-foreground/20")}>
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-1 rounded-full uppercase italic">Socio Pelotify</span>
                                </div>
                                <div className="space-y-1">
                                    <span className={cn("font-black italic uppercase text-sm block transition-colors", formData.business_id === v.id ? "text-primary" : "text-white")}>{v.name}</span>
                                    <span className="text-[9px] font-bold text-foreground/30 uppercase truncate block">{v.address}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-[#0A0A0A] px-4 text-[9px] font-black uppercase text-foreground/20 tracking-[0.4em] italic">Otras Opiciones</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {ROSARIO_VENUES.slice(0, 4).map(v => (
                            <button key={v.id} onClick={() => handleVenueSelect(v.address)} className={cn("p-4 rounded-2xl border text-left transition-all", formData.location === v.address && !formData.business_id ? "border-primary bg-primary/5" : "border-white/5 bg-white/[0.02]")}>
                                <span className={cn("text-[10px] font-black italic uppercase leading-tight block", formData.location === v.address && !formData.business_id ? "text-primary" : "text-foreground")}>{v.name}</span>
                            </button>
                        ))}
                    </div>

                    <LocationSearch value={formData.location} onChange={handleVenueSelect} placeholder="Buscá otra cancha o dirección específica..." />

                    <button disabled={!formData.location} onClick={() => setStep(1)} className="w-full h-20 bg-foreground text-background rounded-[2rem] font-black text-sm uppercase transition-all disabled:opacity-20 hover:bg-primary hover:text-black shadow-xl">CONTINUAR AL SIGUIENTE PASO</button>
                 </motion.div>
              )}

              {/* STEP 1: BÁSICO */}
              {step === 1 && (
                 <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                    <div className="space-y-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2 flex items-center gap-2 font-mono"><Trophy className="w-3" /> Nombre del Torneo</label>
                          <input type="text" placeholder="Ej: Superliga Pelotify Rosario" className="w-full h-20 bg-white/[0.02] border border-white/5 rounded-[2rem] px-8 text-xl font-black italic tracking-tighter outline-none focus:border-primary/50 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2 font-mono">Formato de Juego</label>
                          <div className="grid grid-cols-3 gap-4">
                             {(['F5', 'F7', 'F11'] as const).map(type => (
                                <button key={type} onClick={() => setFormData({...formData, type})} className={cn("h-24 rounded-[1.5rem] border font-black text-xs uppercase transition-all flex flex-col items-center justify-center gap-2", formData.type === type ? "bg-primary text-black border-primary shadow-lg shadow-primary/20" : "bg-white/[0.02] text-foreground/40 border-white/5 hover:border-white/10")}>
                                   <span className="text-xl italic">⚽</span>
                                   {type === 'F5' ? 'Fútbol 5' : type === 'F7' ? 'Fútbol 7' : 'Fútbol 11'}
                                </button>
                             ))}
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => setStep(0)} className="h-20 px-8 border border-white/10 rounded-[2rem] font-black text-xs text-foreground/40 hover:text-foreground">ATRÁS</button>
                       <button disabled={!formData.name} onClick={() => setStep(2)} className="flex-1 h-20 bg-foreground text-background rounded-[2rem] font-black text-sm uppercase hover:bg-primary hover:text-black">CONTINUAR</button>
                    </div>
                 </motion.div>
              )}

              {/* STEP 2: FECHA Y HORA */}
              {step === 2 && (
                 <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 flex items-center gap-2"><Calendar className="w-3" /> Fecha de Inicio</label>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 font-mono">
                            {Array.from({ length: 14 }).map((_, i) => {
                                const d = new Date(); d.setDate(d.getDate() + i);
                                const dateStr = d.toISOString().split('T')[0];
                                const isSelected = formData.start_date === dateStr;
                                return (
                                    <button key={dateStr} onClick={() => setFormData({ ...formData, start_date: dateStr })} className={cn("flex-shrink-0 w-24 h-28 rounded-2xl border flex flex-col items-center justify-center transition-all", isSelected ? "bg-primary text-black border-primary scale-105 shadow-xl shadow-primary/20" : "bg-white/[0.02] border-white/5 hover:border-white/10")}>
                                        <span className="text-4xl font-black italic tracking-tighter leading-none">{d.getDate()}</span>
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mt-1">{d.toLocaleDateString('es-ES', { month: 'short' })}</span>
                                        <span className={cn("text-[8px] font-bold uppercase mt-2 px-2 py-0.5 rounded-full", isSelected ? "bg-black/10" : "bg-white/5")}>{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 flex items-center gap-2"><Clock className="w-3" /> Todas las horas disponibles</label>
                        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[300px] overflow-y-auto no-scrollbar p-1">
                            {AVAILABLE_TIMES.map(t => (
                                <button key={t} onClick={() => setFormData({...formData, start_time: t})} className={cn("h-12 rounded-xl border text-[10px] font-black transition-all", formData.start_time === t ? "bg-primary border-primary text-black shadow-lg" : "bg-white/[0.02] border-white/5 hover:border-white/20")}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => setStep(1)} className="h-20 px-8 border border-white/10 rounded-[2rem] font-black text-xs text-foreground/40 hover:text-foreground">ATRÁS</button>
                       <button disabled={!formData.start_date} onClick={() => setStep(3)} className="flex-1 h-20 bg-foreground text-background rounded-[2rem] font-black text-sm uppercase hover:bg-primary hover:text-black shadow-xl shadow-primary/10">SIGUIENTE</button>
                    </div>
                 </motion.div>
              )}

              {/* STEP 3: PREMIOS Dinámicos */}
              {step === 3 && (
                 <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="p-8 lg:p-12 rounded-[3rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] scale-150 rotate-12">
                            <Percent className="w-64 h-64" />
                        </div>
                        
                        <div className="flex items-center gap-4 text-primary relative z-10">
                            <Calculator className="w-8 h-8" />
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Bolsa de Premios</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest px-1">Inscripción por Equipo</label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-primary/40 group-focus-within:text-primary transition-colors" />
                                    <input type="number" className="w-full h-24 bg-black/40 border border-primary/10 rounded-[2.5rem] pl-16 pr-8 text-4xl font-black italic outline-none focus:border-primary transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.entry_fee} onChange={e => setFormData({...formData, entry_fee: parseInt(e.target.value) || 0})} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest px-1">Porcentaje para el Premio</label>
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <Percent className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-primary/40 group-focus-within:text-primary transition-colors" />
                                        <input type="number" className="w-full h-24 bg-black/40 border border-primary/10 rounded-[2.5rem] pl-16 pr-8 text-4xl font-black italic outline-none focus:border-primary transition-all max-w-[200px]" value={formData.prize_percentage} onChange={e => setFormData({...formData, prize_percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))})} />
                                    </div>
                                    <div className="flex gap-2">
                                        {[25, 50, 75, 100].map(p => (
                                            <button key={p} onClick={() => setFormData({...formData, prize_percentage: p})} className={cn("flex-1 h-12 rounded-xl border text-[10px] font-black transition-all", formData.prize_percentage === p ? "bg-primary text-black border-primary" : "bg-black/20 border-white/5 hover:border-white/10")}>
                                                {p}%
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-[11px] font-bold uppercase text-foreground/40">
                                <span>Ingreso Total Estimado ({formData.max_teams} equipos)</span>
                                <span className="font-mono text-foreground">${totalIncome.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-bold uppercase text-red-500/60">
                                <span>Costos de Organización (Alquiler Canchas)</span>
                                <span className="font-mono">-${totalPitchCosts.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-end pt-6">
                                <div className="space-y-1">
                                    <span className="text-sm font-black italic uppercase text-foreground">Pozo Neto a Distribuir</span>
                                    <p className="text-[9px] text-foreground/25 uppercase font-bold italic tracking-widest">Calculado descontando el alquiler automático</p>
                                </div>
                                <div className="text-right">
                                    <motion.span key={calculatedPrize} initial={{ scale: 1.1, color: '#FFFFFF' }} animate={{ scale: 1, color: '#2dfc7d' }} className="text-5xl lg:text-7xl font-black italic leading-none tracking-tighter block">${calculatedPrize.toLocaleString()}</motion.span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-foreground/40 px-4 italic">¿Algún premio adicional? (Trofeos, indumentaria, etc)</label>
                        <textarea placeholder="Ej: Trofeo bañando en oro + Juegos de camisetas oficiales..." className="w-full p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] text-base font-bold min-h-[120px] outline-none focus:border-primary/30 transition-all placeholder:opacity-20" value={formData.prize_description} onChange={e => setFormData({...formData, prize_description: e.target.value})} />
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => setStep(2)} className="h-20 px-8 border border-white/10 rounded-[2rem] font-black text-xs text-foreground/40 hover:text-foreground">ATRÁS</button>
                       <button onClick={() => setStep(4)} className="flex-1 h-20 bg-foreground text-background rounded-[2rem] font-black text-sm hover:bg-primary hover:text-black shadow-xl">CONTINUAR</button>
                    </div>
                 </motion.div>
              )}

              {/* STEP 4: EQUIPO ANFITRIÓN */}
              {step === 4 && (
                 <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black italic uppercase text-foreground tracking-tighter">Inscripción Automática</h2>
                        <p className="text-[11px] text-foreground/40 font-bold uppercase italic leading-relaxed max-w-xl">Como organizador, seleccioná cual de tus equipos participará como anfitrión. El equipo quedará aprobado inmediatamente.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {userTeams.length > 0 ? (
                            userTeams.map(t => (
                                <button key={t.id} onClick={() => setFormData({...formData, host_team_id: t.id})} className={cn("w-full p-8 rounded-[2.5rem] border flex items-center justify-between transition-all group", formData.host_team_id === t.id ? "bg-primary border-primary text-black shadow-lg shadow-primary/20" : "bg-white/[0.02] border-white/5 hover:border-white/10")}>
                                    <div className="flex items-center gap-6">
                                        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center overflow-hidden transition-all shadow-inner", formData.host_team_id === t.id ? "bg-black/20" : "bg-white/5")}>
                                            {t.logo_url ? <img src={t.logo_url} className="w-full h-full object-cover" /> : <Shield className="w-8 h-8 opacity-40 ml-1" />}
                                        </div>
                                        <div className="text-left">
                                            <span className="font-black italic uppercase text-xl leading-none block tracking-tighter">{t.name}</span>
                                            <span className="text-[10px] font-black uppercase opacity-40 tracking-widest mt-1 block italic">{t.members_count || 0} Jugadores • {t.elo || 0} ELO</span>
                                        </div>
                                    </div>
                                    {formData.host_team_id === t.id ? <CheckCircle className="w-8 h-8" /> : <Circle className="w-8 h-8 opacity-20 group-hover:opacity-40 transition-opacity" />}
                                </button>
                            ))
                        ) : (
                            <div className="p-16 border-2 border-dashed border-white/5 rounded-[3rem] text-center space-y-6 bg-white/[0.01]">
                                <Trophy className="w-12 h-12 text-white/5 mx-auto" />
                                <div className="space-y-2">
                                    <span className="text-[11px] font-black text-foreground/20 uppercase tracking-[0.5em] block">No eres capitán de ningún equipo</span>
                                    <p className="text-[10px] text-foreground/30 font-bold uppercase italic max-w-xs mx-auto">Debes ser capitán para inscribir un equipo anfitrión automáticamente.</p>
                                </div>
                                <Link href="/teams/create"><button className="h-14 px-10 bg-white/5 hover:bg-white/10 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all">CREAR EQUIPO AHORA</button></Link>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => setStep(3)} className="h-20 px-8 border border-white/10 rounded-[2rem] font-black text-xs text-foreground/40 hover:text-foreground">ATRÁS</button>
                       <button onClick={() => setStep(5)} className="flex-1 h-20 bg-foreground text-background rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-black shadow-xl">IR A LA REVISIÓN</button>
                    </div>
                 </motion.div>
              )}

              {/* STEP 5: REVISIÓN FINAL */}
              {step === 5 && (
                 <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <Target className="w-5 h-5 text-primary" />
                           <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] italic">Resumen del Evento</span>
                        </div>
                        
                        <div className="p-10 lg:p-14 rounded-[4rem] bg-foreground/5 border border-white/5 space-y-10 relative overflow-hidden backdrop-blur-xl">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.04] scale-[2] pointer-events-none">
                                <Zap className="w-64 h-64" />
                            </div>

                            <div className="relative z-10 space-y-2">
                                <h3 className="text-5xl lg:text-7xl font-black italic uppercase text-foreground leading-[0.8] tracking-[0.02em]">{formData.name}</h3>
                                <div className="flex items-center gap-2 mt-4">
                                    <MapPin className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-[11px] font-black text-foreground/40 uppercase tracking-[0.3em] italic">{formData.location}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                                <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-2">
                                    <span className="text-[9px] font-black text-foreground/20 uppercase italic tracking-widest block">Formato</span>
                                    <span className="text-xl font-black italic uppercase text-foreground">Fútbol {formData.type}</span>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-2">
                                    <span className="text-[9px] font-black text-foreground/20 uppercase italic tracking-widest block">Capacidad</span>
                                    <span className="text-xl font-black italic uppercase text-foreground">{formData.max_teams} Equipos</span>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-2 lg:col-span-1 col-span-2">
                                    <span className="text-[9px] font-black text-foreground/20 uppercase italic tracking-widest block">Inicia</span>
                                    <span className="text-xl font-black italic uppercase text-foreground">{formData.start_date.split('-').reverse().join('/')} @ {formData.start_time}</span>
                                </div>
                            </div>

                            <div className="p-8 lg:p-10 rounded-[3rem] bg-primary/10 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 group hover:bg-primary/15 transition-all">
                                <div className="space-y-1 text-center md:text-left">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic block">Premio a Distribuir</span>
                                    <span className="text-5xl lg:text-7xl font-black italic text-primary leading-none">${calculatedPrize.toLocaleString()}</span>
                                </div>
                                <div className="w-h px-8 py-4 rounded-3xl bg-black/40 border border-primary/20 text-center">
                                    <span className="text-[9px] font-black text-primary/60 uppercase block mb-1 italic">Inscripción / Equipo</span>
                                    <span className="text-2xl font-black italic text-white">${formData.entry_fee.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => setStep(4)} className="h-20 px-8 border border-white/10 rounded-[2.5rem] font-black text-xs text-foreground/40 hover:text-foreground uppercase transition-all">ATRÁS</button>
                       <button disabled={loading} onClick={handleCreate} className="flex-1 h-20 bg-primary text-black rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-[0_10px_40px_-10px_rgba(45,252,125,0.4)] flex items-center justify-center gap-4 hover:bg-white hover:shadow-white/20 transition-all active:scale-95">
                          {loading ? (
                              <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                              <>
                                <CheckCircle2 className="w-6 h-6" />
                                CONFIRMAR Y PUBLICAR COPA
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
