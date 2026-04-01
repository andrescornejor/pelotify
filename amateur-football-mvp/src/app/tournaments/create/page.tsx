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
    start_time: '',
    location: '',
    max_teams: 8,
    entry_fee: 5000,
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

  // Calculations for prize money
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
        prize_description: formData.prize_description || `Premio estimado de $${calculatedPrize.toLocaleString()}`,
        business_id: formData.business_id || null,
        field_id: formData.field_id || null
      };

      const tournament = await createTournament(dataToSave);
      
      if (formData.host_team_id) {
          await registerTeamForTournament(tournament.id, formData.host_team_id);
      }

      router.push(`/tournaments/${tournament.id}`);
    } catch (err: any) {
      console.error('Error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Sede', 'Básico', 'Fecha', 'Premios', 'Equipo', 'Review'];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden p-4 lg:p-10 pt-24 pb-32">
      {/* ── AMBIENT DECORATION ── */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(44,252,125,0.2),transparent_70%)]" />
      </div>

      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        {/* ── HEADER ── */}
        <div className="flex flex-col gap-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary">
            <ArrowLeft className="w-3 h-3" /> VOLVER
          </button>
          <div className="space-y-1">
             <h1 className="text-4xl lg:text-7xl font-black italic uppercase text-foreground leading-none tracking-tighter">
                ORGANIZÁ TU <span className="text-primary italic">TORNEO</span>
             </h1>
          </div>
        </div>

        {/* ── PROGRESS ── */}
        <div className="flex items-center gap-3">
           {steps.map((s, i) => (
              <div key={i} className="flex-1 h-1 rounded-full relative overflow-hidden bg-foreground/5">
                 <motion.div initial={{ width: 0 }} animate={{ width: i <= step ? '100%' : '0%' }} className={cn("absolute inset-0", i < step ? "bg-primary/40" : "bg-primary")} />
              </div>
           ))}
        </div>

        <div className="glass-premium rounded-[3rem] border border-foreground/10 p-8 lg:p-12 min-h-[500px]">
           <AnimatePresence mode="wait">
              {/* STEP 0: SEDE */}
              {step === 0 && (
                 <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Seleccioná la Sede</h2>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest leading-relaxed">Mostramos sedes socias de Pelotify con sus precios y formatos reales.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dbVenues.map(v => (
                            <button key={v.id} onClick={() => handleVenueSelect(v.address || v.name, true, v.id)} className={cn("p-6 rounded-3xl border text-left flex flex-col gap-4 transition-all", formData.business_id === v.id ? "border-primary bg-primary/5" : "border-foreground/5 bg-foreground/[0.02] hover:border-foreground/20")}>
                                <div className="flex items-start justify-between">
                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", formData.business_id === v.id ? "bg-primary text-black" : "bg-foreground/5 text-foreground/20")}>
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-1 rounded-full uppercase italic">Socio Pelotify</span>
                                </div>
                                <div>
                                    <span className="font-black italic uppercase text-foreground text-sm block">{v.name}</span>
                                    <span className="text-[9px] font-bold text-foreground/30 uppercase truncate block">{v.address}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] block text-center italic">Otras sedes populares</label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {ROSARIO_VENUES.slice(0, 4).map(v => (
                                <button key={v.id} onClick={() => handleVenueSelect(v.address)} className={cn("p-4 rounded-2xl border text-left transition-all", formData.location === v.address && !formData.business_id ? "border-primary bg-primary/5 shadow-lg" : "border-foreground/5 bg-foreground/[0.02]")}>
                                    <span className="text-[10px] font-black italic uppercase text-foreground leading-tight block">{v.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <LocationSearch value={formData.location} onChange={handleVenueSelect} placeholder="Buscá otra cancha o dirección..." />

                    <button disabled={!formData.location} onClick={() => setStep(1)} className="w-full h-20 bg-foreground text-background rounded-[2rem] font-black text-sm uppercase transition-all disabled:opacity-20 hover:bg-primary hover:text-black">SIGUIENTE</button>
                 </motion.div>
              )}

              {/* STEP 1: BÁSICO */}
              {step === 1 && (
                 <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                    <div className="space-y-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Nombre del Torneo</label>
                          <input type="text" placeholder="Ej: Copa Master Rosario" className="w-full h-20 bg-foreground/[0.03] border border-foreground/10 rounded-[2rem] px-8 text-xl font-black italic" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                       </div>
                       <div className="grid grid-cols-3 gap-4">
                          {(['F5', 'F7', 'F11'] as const).map(type => (
                             <button key={type} onClick={() => setFormData({...formData, type})} className={cn("h-24 rounded-[1.5rem] border font-black text-xs uppercase transition-all", formData.type === type ? "bg-primary text-black border-primary" : "bg-foreground/[0.03] text-foreground/40")}>
                                {type === 'F5' ? 'Fútbol 5' : type === 'F7' ? 'Fútbol 7' : 'Fútbol 11'}
                             </button>
                          ))}
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => setStep(0)} className="h-20 px-8 border border-foreground/10 rounded-[2rem] font-black text-xs">ATRÁS</button>
                       <button disabled={!formData.name} onClick={() => setStep(2)} className="flex-1 h-20 bg-foreground text-background rounded-[2rem] font-black text-sm hover:bg-primary hover:text-black">CONTINUAR</button>
                    </div>
                 </motion.div>
              )}

              {/* STEP 2: FECHA */}
              {step === 2 && (
                 <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {Array.from({ length: 14 }).map((_, i) => {
                            const d = new Date(); d.setDate(d.getDate() + i);
                            const dateStr = d.toISOString().split('T')[0];
                            const isSelected = formData.start_date === dateStr;
                            return (
                                <button key={dateStr} onClick={() => setFormData({ ...formData, start_date: dateStr })} className={cn("flex-shrink-0 w-20 h-24 rounded-2xl border flex flex-col items-center justify-center transition-all", isSelected ? "bg-primary text-black border-primary scale-105" : "bg-foreground/[0.03] border-foreground/5")}>
                                    <span className="text-[10px] font-black italic">{d.getDate()}</span>
                                    <span className="text-[8px] font-black uppercase text-foreground/40">{d.toLocaleDateString('es-ES', { month: 'short' })}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {AVAILABLE_TIMES.slice(16, 40).map(t => (
                            <button key={t} onClick={() => setFormData({...formData, start_time: t})} className={cn("h-10 rounded-lg border text-[9px] font-black transition-all", formData.start_time === t ? "bg-primary border-primary text-black" : "bg-foreground/5")}>{t}</button>
                        ))}
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => setStep(1)} className="h-20 px-8 border border-foreground/10 rounded-[2rem] font-black text-xs">ATRÁS</button>
                       <button disabled={!formData.start_date} onClick={() => setStep(3)} className="flex-1 h-20 bg-foreground text-background rounded-[2rem] font-black text-sm hover:bg-primary hover:text-black">CONTINUAR</button>
                    </div>
                 </motion.div>
              )}

              {/* STEP 3: PREMIOS Y COSTOS */}
              {step === 3 && (
                 <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/20 space-y-6">
                        <div className="flex items-center gap-4 text-primary">
                            <Calculator className="w-6 h-6" />
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Calculador Dinámico</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-primary/60 uppercase">Inscripción / Equipo</label>
                                <div className="flex items-center gap-2 text-2xl font-black italic">$<input type="number" className="bg-transparent border-none outline-none w-full" value={formData.entry_fee} onChange={e => setFormData({...formData, entry_fee: parseInt(e.target.value) || 0})} /></div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-primary/60 uppercase">% para el Premio</label>
                                <div className="flex items-center gap-2 text-2xl font-black italic">%<input type="number" className="bg-transparent border-none outline-none w-full" value={formData.prize_percentage} onChange={e => setFormData({...formData, prize_percentage: parseInt(e.target.value) || 0})} /></div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-primary/10 space-y-3">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-foreground/40">
                                <span>Ingreso Total ({formData.max_teams} eq.)</span>
                                <span>${totalIncome.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase text-red-500/60">
                                <span>Costo de Canchas ({matchesCount} partidos)</span>
                                <span>-${totalPitchCosts.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-end pt-4">
                                <span className="text-sm font-black italic uppercase text-foreground">Gran Premio en Efectivo</span>
                                <span className="text-4xl font-black italic text-primary">${calculatedPrize.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-foreground/40 px-2 italic">Descripción adicional del premio</label>
                        <textarea placeholder="Ej: Trofeo + Medallas + Premio extra..." className="w-full p-6 bg-foreground/[0.03] border border-foreground/10 rounded-[2rem] text-sm font-bold min-h-[100px] outline-none" value={formData.prize_description} onChange={e => setFormData({...formData, prize_description: e.target.value})} />
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => setStep(2)} className="h-20 px-8 border border-foreground/10 rounded-[2rem] font-black text-xs">ATRÁS</button>
                       <button onClick={() => setStep(4)} className="flex-1 h-20 bg-foreground text-background rounded-[2rem] font-black text-sm hover:bg-primary hover:text-black">CONTINUAR</button>
                    </div>
                 </motion.div>
              )}

              {/* STEP 4: EQUIPO */}
              {step === 4 && (
                 <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black italic uppercase text-foreground">Tu Equipo Participa</h2>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase italic">Como organizador, puedes inscribir a tu equipo automáticamente.</p>
                    </div>
                    {userTeams.length > 0 ? (
                        userTeams.map(t => (
                            <button key={t.id} onClick={() => setFormData({...formData, host_team_id: t.id})} className={cn("w-full p-6 rounded-3xl border flex items-center justify-between transition-all", formData.host_team_id === t.id ? "bg-primary border-primary text-black" : "bg-foreground/5")}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center overflow-hidden">{t.logo_url ? <img src={t.logo_url} className="w-full h-full object-cover" /> : <Shield />}</div>
                                    <span className="font-black italic uppercase text-sm">{t.name}</span>
                                </div>
                                {formData.host_team_id === t.id && <CheckCircle className="w-6 h-6" />}
                            </button>
                        ))
                    ) : (
                        <div className="p-10 border border-dashed border-foreground/10 rounded-[2.5rem] text-center">
                            <Link href="/teams/create"><button className="px-8 h-12 bg-primary/20 text-primary rounded-xl font-black text-[10px] uppercase italic">Crear Mi Equipo Primero</button></Link>
                        </div>
                    )}
                    <div className="flex gap-4">
                       <button onClick={() => setStep(3)} className="h-20 px-8 border border-foreground/10 rounded-[2rem] font-black text-xs text-foreground/40">ATRÁS</button>
                       <button onClick={() => setStep(5)} className="flex-1 h-20 bg-foreground text-background rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-black">REVISAR</button>
                    </div>
                 </motion.div>
              )}

              {/* STEP 5: REVIEW */}
              {step === 5 && (
                 <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                    <div className="p-8 rounded-[3rem] bg-foreground/5 border border-foreground/5 space-y-6">
                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <h3 className="text-4xl font-black italic uppercase text-foreground leading-none">{formData.name}</h3>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{formData.location}</span>
                            </div>
                            <span className="text-4xl font-black italic text-primary">${calculatedPrize.toLocaleString()}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl bg-background/50 border border-foreground/5 space-y-1">
                                <span className="text-[8px] font-black text-foreground/20 uppercase italic">Formato</span>
                                <span className="font-black italic uppercase text-foreground">Fútbol {formData.type}</span>
                            </div>
                            <div className="p-5 rounded-2xl bg-background/50 border border-foreground/5 space-y-1">
                                <span className="text-[8px] font-black text-foreground/20 uppercase italic">Cupos</span>
                                <span className="font-black italic uppercase text-foreground">{formData.max_teams} Equipos</span>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                            <span className="text-[10px] font-black text-primary uppercase">Costo Inscripción</span>
                            <span className="text-2xl font-black italic text-foreground">${formData.entry_fee.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => setStep(4)} className="h-20 px-8 border border-foreground/10 rounded-[2rem] font-black text-xs">ATRÁS</button>
                       <button disabled={loading} onClick={handleCreate} className="flex-1 h-20 bg-primary text-black rounded-[2rem] font-black text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> PUBLICAR TORNEO</>}
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
