'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FifaCard } from '@/components/FifaCard';
import { buildUpdatedPreferences } from '@/lib/personalization';
import confetti from 'canvas-confetti';
import {
  Target,
  Activity,
  Shield,
  Crosshair,
  ArrowRight,
  MapPin,
  Bell,
  Users,
  Dumbbell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPORT_META, type Sport } from '@/lib/sports';

type Position = 'POR' | 'DFC' | 'MC' | 'DC' | '';

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: '',
    height: '',
    foot: 'Derecha',
    position: '' as Position,
    sports: ['football'] as Sport[],
    preferredZone: '',
    goal: 'competitive' as 'competitive' | 'social' | 'fitness' | 'casual',
  });

  // Check if somehow they already onboarded
  useEffect(() => {
    if (user?.user_metadata?.onboarded) {
      router.push('/');
    }
  }, [user, router]);

  const handleNext = () => setStep((s) => s + 1);

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      // 1. Update Profile in DB
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          age: parseInt(formData.age),
          height: parseInt(formData.height),
          preferred_foot: formData.foot,
          position: formData.position,
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // 2. Update Auth Metadata (This will trigger contextual redirect in AuthContext)
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          onboarded: true,
          name: formData.name,
          age: parseInt(formData.age),
          height: parseInt(formData.height),
          position: formData.position,
          preferred_foot: formData.foot,
          preferences: buildUpdatedPreferences(user?.user_metadata, {
            favoriteSports: formData.sports,
            preferredZone: formData.preferredZone,
            goal: formData.goal,
            notifications: {
              sports: formData.sports,
              zone: formData.preferredZone,
              enabled: true,
              nearbyOnly: false,
              community: true,
              reminders: true,
            },
          }),
        },
      });

      if (authError) throw authError;

      // Trigger confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#ffffff'], // Primary green colors
      });

      // The AuthContext effect will eventually route them to '/' automatically upon catching the session update.
      // But we can artificially wait a bit for the animation to play, then force push.
      setTimeout(() => {
        router.push('/');
      }, 2500);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error in onboarding:', error);
      alert(`Error al firmar tu contrato. ${message}`);
      setIsLoading(false);
    }
  };

  const MOCK_STATS = {
    POR: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 },
    DFC: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 },
    MC: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 },
    DC: { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 },
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
      </div>

      <div className="w-full max-w-lg relative z-10 min-h-[500px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* STEP 0: THE IDENTITY (Name, Age, Height, Foot) */}
          {step === 0 && (
            <motion.div
              key="step0"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-10"
            >
              <motion.div variants={itemVariants} className="text-center space-y-4">
                <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">
                  Firma Tu <span className="text-primary">Contrato</span>
                </h1>
                <p className="text-foreground/50 text-sm font-bold tracking-widest uppercase">
                  Establece tu identidad en la liga.
                </p>
              </motion.div>

              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
              >
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-foreground/60 tracking-widest pl-4">
                    El Nombre de la Leyenda
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-16 px-6 rounded-2xl bg-foreground/[0.03] border border-foreground/10 focus:border-primary/50 text-xl font-black outline-none transition-all shadow-inner"
                    placeholder="Tu Apodo/Nombre..."
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-foreground/60 tracking-widest pl-4">
                      Edad (Años)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.age}
                      placeholder="Ej: 25"
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full h-14 px-6 rounded-2xl bg-foreground/[0.03] border border-foreground/10 focus:border-primary/50 text-lg font-black outline-none transition-all text-center placeholder:text-foreground/20 placeholder:font-normal"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-foreground/60 tracking-widest pl-4">
                      Altura (cm)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.height}
                      placeholder="Ej: 175"
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full h-14 px-6 rounded-2xl bg-foreground/[0.03] border border-foreground/10 focus:border-primary/50 text-lg font-black outline-none transition-all text-center placeholder:text-foreground/20 placeholder:font-normal"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-foreground/60 tracking-widest pl-4">
                    Pie Dominante
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Izquierda', 'Derecha', 'Ambos'].map((foot) => (
                      <button
                        key={foot}
                        type="button"
                        onClick={() => setFormData({ ...formData, foot })}
                        className={cn(
                          'h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all',
                          formData.foot === foot
                            ? 'bg-primary text-background shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                            : 'bg-foreground/[0.03] border border-foreground/10 text-foreground/50 hover:text-foreground'
                        )}
                      >
                        {foot}
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={!formData.name || !formData.age || !formData.height}
                  className="w-full h-16 mt-4 bg-foreground text-background font-black text-[12px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  Siguiente Fase <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* STEP 1: POSITION (Playstyle Selection) */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-10"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">
                  Tu <span className="text-primary">Especialidad</span>
                </h1>
                <p className="text-foreground/50 text-sm font-bold tracking-widest uppercase">
                  Selecciona tu estilo de juego natural.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    id: 'POR',
                    title: 'Portero',
                    icon: Shield,
                    color: 'text-blue-400',
                    glow: 'hover:shadow-[0_0_30px_rgba(96,165,250,0.2)] hover:border-blue-400/50 block-glow-blue',
                  },
                  {
                    id: 'DFC',
                    title: 'Defensa',
                    icon: Activity,
                    color: 'text-zinc-400',
                    glow: 'hover:shadow-[0_0_30px_rgba(161,161,170,0.2)] hover:border-zinc-400/50 block-glow-zinc',
                  },
                  {
                    id: 'MC',
                    title: 'Medio',
                    icon: Target,
                    color: 'text-primary',
                    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:border-primary/50 block-glow-emerald',
                  },
                  {
                    id: 'DC',
                    title: 'Delantero',
                    icon: Crosshair,
                    color: 'text-accent',
                    glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:border-accent/50 block-glow-amber',
                  },
                ].map(({ id, title, icon: Icon, color, glow }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setFormData({ ...formData, position: id as Position });
                      // auto-advance after a small delay
                      setTimeout(() => setStep(2), 400);
                    }}
                    className={cn(
                      'flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group',
                      formData.position === id
                        ? `bg-foreground/[0.05] border-foreground/30 scale-95`
                        : `bg-foreground/[0.02] border-foreground/5 ${glow} hover:-translate-y-1`
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Icon
                      className={cn('w-10 h-10 transition-transform group-hover:scale-110', color)}
                    />
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl font-black italic">{id}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                        {title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(0)}
                className="mx-auto w-auto px-6 py-3 rounded-full border border-foreground/10 text-[10px] uppercase font-black tracking-widest text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                Atrás
              </button>
            </motion.div>
          )}

          {/* STEP 2: PERSONALIZATION */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-8"
            >
              <motion.div variants={itemVariants} className="text-center space-y-4">
                <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">
                  Tu <span className="text-primary">Mapa</span> de juego
                </h1>
                <p className="text-foreground/50 text-sm font-bold tracking-widest uppercase">
                  Personalizamos comunidad, radar y notificaciones desde el arranque.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3">
                <label className="text-[10px] font-black uppercase text-foreground/60 tracking-widest pl-4">
                  Deportes que más te interesan
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(SPORT_META) as Sport[]).map((sport) => {
                    const active = formData.sports.includes(sport);
                    return (
                      <button
                        key={sport}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => {
                            const exists = prev.sports.includes(sport);
                            const nextSports = exists
                              ? prev.sports.filter((item) => item !== sport)
                              : [...prev.sports, sport];
                            return {
                              ...prev,
                              sports: nextSports.length > 0 ? nextSports : [sport],
                            };
                          })
                        }
                        className={cn(
                          'min-h-24 rounded-[1.8rem] border p-4 transition-all flex flex-col items-center justify-center gap-2',
                          active
                            ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                            : 'bg-foreground/[0.03] border-foreground/10 text-foreground/60 hover:text-foreground'
                        )}
                      >
                        <span className="text-2xl">{SPORT_META[sport].icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {SPORT_META[sport].shortLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-[10px] font-black uppercase text-foreground/60 tracking-widest pl-4">
                  Tu zona preferida
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-primary absolute left-5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.preferredZone}
                    onChange={(e) => setFormData({ ...formData, preferredZone: e.target.value })}
                    className="w-full h-16 pl-12 pr-6 rounded-2xl bg-foreground/[0.03] border border-foreground/10 focus:border-primary/50 text-base font-bold outline-none transition-all"
                    placeholder="Ej: Rosario Centro, Alberdi, Fisherton"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3">
                <label className="text-[10px] font-black uppercase text-foreground/60 tracking-widest pl-4">
                  Qué buscás en Pelotify
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { id: 'competitive', label: 'Competir', icon: Target },
                    { id: 'social', label: 'Comunidad', icon: Users },
                    { id: 'fitness', label: 'Ritmo', icon: Dumbbell },
                    { id: 'casual', label: 'Sin vueltas', icon: Bell },
                  ] as const).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFormData({ ...formData, goal: id })}
                      className={cn(
                        'min-h-20 rounded-[1.6rem] border p-4 flex items-center gap-3 transition-all text-left',
                        formData.goal === id
                          ? 'bg-white text-black border-white shadow-xl'
                          : 'bg-foreground/[0.03] border-foreground/10 text-foreground/60 hover:text-foreground'
                      )}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 h-14 rounded-2xl border border-foreground/10 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all"
                >
                  Atrás
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 h-14 rounded-2xl bg-foreground text-background font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-black transition-all"
                >
                  Ajustar experiencia
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* STEP 3: FINALE (The FIFA Card Generation) */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center justify-center gap-12"
            >
              <div className="text-center space-y-2">
                <motion.h1
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter"
                >
                  ¡<span className="text-primary">Leyenda</span> Forjada!
                </motion.h1>
              </div>

              <div className="perspective-1000">
                <motion.div
                  initial={{ rotateY: 180, scale: 0.5, opacity: 0 }}
                  animate={{ rotateY: 0, scale: 1.1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 60, damping: 12, delay: 0.5 }}
                  className="relative"
                >
                  {/* Radiant effect behind the card */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, scale: [1, 1.2, 1] }}
                    transition={{ delay: 1, duration: 2, repeat: Infinity }}
                    className="absolute -inset-10 bg-primary/20 blur-[60px] rounded-full pointer-events-none"
                  />

                  <FifaCard
                    player={{
                      name: formData.name,
                      overall: 0,
                      position: formData.position || 'DC',
                      image: user?.avatar_url || undefined,
                      stats:
                        MOCK_STATS[formData.position as keyof typeof MOCK_STATS] ||
                        MOCK_STATS['DC'],
                    }}
                  />
                </motion.div>
              </div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={handleFinish}
                disabled={isLoading}
                className="w-full h-16 bg-primary text-zinc-950 font-black text-[12px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-[0_20px_40px_rgba(16,185,129,0.3)] relative overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                {isLoading ? 'Firmando Papeles...' : 'ACEPTAR Y ENTRAR A LA CANCHA'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
