'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Loader2, Zap } from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';
import { createMatch } from '@/lib/matches';
import { useAuth } from '@/contexts/AuthContext';
import { MatchFormat } from './constants';

// Sub-components
import AmbientLayers from './components/AmbientLayers';
import StepIndicator from './components/StepIndicator';
import StepVenue from './components/StepVenue';
import StepDateTime from './components/StepDateTime';
import StepDetails from './components/StepDetails';
import StepConfirm from './components/StepConfirm';

const STEPS_COUNT = 4;

export default function CreateMatchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    date: '',
    time: '',
    type: 'F5' as MatchFormat,
    price: 0,
    level: 'Amateur',
    is_private: false,
  });

  const handleCreate = async () => {
    if (!user) return;
    setIsCreating(true);
    try {
      const match = await createMatch({
        ...formData,
        missing_players: 0,
        creator_id: user.id,
      });
      router.push(`/match?id=${match.id}`);
    } catch (error: any) {
      console.error('Error creating match:', error);
      alert(`Error al crear el partido: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleLocationChange = useCallback((location: string) => {
    setFormData((prev) => ({ ...prev, location }));
  }, []);

  const handleDateChange = useCallback((date: string) => {
    setFormData((prev) => ({ ...prev, date }));
  }, []);

  const handleTimeChange = useCallback((time: string) => {
    setFormData((prev) => ({ ...prev, time }));
  }, []);

  const handleDetailsChange = useCallback(
    (details: Partial<{ type: MatchFormat; price: number; is_private: boolean }>) => {
      setFormData((prev) => ({ ...prev, ...details }));
    },
    []
  );

  const canProceed = useMemo(() => {
    if (step === 0) return !!formData.location;
    if (step === 1) return !!formData.date && !!formData.time;
    return true;
  }, [step, formData.location, formData.date, formData.time]);

  const getDateLabel = useCallback(() => {
    if (!formData.date) return null;
    const d = new Date(formData.date + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  }, [formData.date]);

  const getTimeLabel = useCallback(() => {
    if (!formData.time) return null;
    const [h, m] = formData.time.split(':');
    const hour = parseInt(h);
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${displayHour}:${m} ${ampm}`;
  }, [formData.time]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AmbientLayers />

      <div className="relative z-10 flex flex-col max-w-4xl mx-auto p-4 pt-6 pb-28 min-h-screen">
        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.6em] text-primary">
                Crear Partido
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-[clamp(2.5rem,8vw,5rem)] font-black italic uppercase leading-none tracking-tighter text-foreground">
              Armá el
            </h1>
            <h1 className="text-[clamp(2.5rem,8vw,5rem)] font-black italic uppercase leading-none tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-teal-300">
                Partido
              </span>
            </h1>
          </div>

          <StepIndicator current={step} total={STEPS_COUNT} />
        </motion.div>

        {/* ── STEP CONTENT ── */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {step === 0 && <StepVenue location={formData.location} onChange={handleLocationChange} />}
            {step === 1 && (
              <StepDateTime
                date={formData.date}
                time={formData.time}
                onDateChange={handleDateChange}
                onTimeChange={handleTimeChange}
              />
            )}
            {step === 2 && (
              <StepDetails
                type={formData.type}
                price={formData.price}
                is_private={formData.is_private}
                onChange={handleDetailsChange}
              />
            )}
            {step === 3 && (
              <StepConfirm
                formData={formData}
                getDateLabel={getDateLabel}
                getTimeLabel={getTimeLabel}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── NAVIGATION ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex gap-3"
        >
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="h-14 px-6 rounded-2xl border border-foreground/10 bg-foreground/[0.03] text-foreground/40 font-black text-xs uppercase tracking-widest hover:border-foreground/20 hover:text-foreground/60 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          )}

          {step < STEPS_COUNT - 1 ? (
            <motion.button
              type="button"
              onClick={() => canProceed && setStep((s) => s + 1)}
              disabled={!canProceed}
              whileHover={canProceed ? { scale: 1.01 } : {}}
              whileTap={canProceed ? { scale: 0.98 } : {}}
              className={`flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all relative overflow-hidden ${
                canProceed
                  ? 'bg-primary text-black shadow-[0_8px_32px_rgba(16,185,129,0.25)]'
                  : 'bg-foreground/[0.04] text-foreground/20 cursor-not-allowed'
              }`}
            >
              {canProceed && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
              )}
              Continuar
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={handleCreate}
              disabled={isCreating}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 h-14 rounded-2xl bg-primary text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(16,185,129,0.3)] disabled:opacity-50 transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando partido...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  ¡Crear Partido!
                </>
              )}
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
