'use client';

import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Users, DollarSign, Lock, Globe, Zap } from 'lucide-react';
import { FORMAT_DATA, MatchFormat } from '../constants';
import PitchSVG from './PitchSVG';
import { memo } from 'react';

interface StepConfirmProps {
  formData: {
    location: string;
    date: string;
    time: string;
    type: MatchFormat;
    price: number;
    is_private: boolean;
  };
  getDateLabel: () => string | null;
  getTimeLabel: () => string | null;
}

const StepConfirm = ({ formData, getDateLabel, getTimeLabel }: StepConfirmProps) => {
  const summaryItems = [
    {
      icon: <MapPin className="w-4 h-4" />,
      label: 'Cancha',
      value: formData.location || '—',
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: 'Fecha',
      value: getDateLabel() || '—',
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: 'Horario',
      value: getTimeLabel() || '—',
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: 'Formato',
      value: `${FORMAT_DATA[formData.type].players}`,
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: 'Cuota',
      value: formData.price > 0 ? `$${formData.price.toLocaleString('es-AR')} ARS` : 'Libre',
    },
    {
      icon: formData.is_private ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />,
      label: 'Privacidad',
      value: formData.is_private ? 'Solo invitados' : 'Público',
    },
  ];

  return (
    <motion.div
      key="step-3"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
          Resumen del Partido
        </h2>
        <p className="text-[11px] text-foreground/40 font-bold uppercase tracking-widest">
          Revisá los detalles antes de confirmar
        </p>
      </div>

      {/* Big match card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-[2rem] overflow-hidden border border-foreground/10 bg-foreground/[0.02]"
      >
        {/* Pitch hero */}
        <div className="relative h-40 bg-gradient-to-br from-primary/10 via-emerald-900/20 to-teal-900/10 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 text-primary/30">
            <PitchSVG type={formData.type} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
          {/* Format badge */}
          <div className="relative z-10 px-6 py-2 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm">
            <span className="text-primary font-black text-sm uppercase tracking-widest italic">
              {FORMAT_DATA[formData.type].label}
            </span>
          </div>
        </div>

        {/* Details grid */}
        <div className="p-6 grid grid-cols-2 gap-4">
          {summaryItems.map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                {icon}
              </div>
              <div>
                <span className="text-[9px] font-black text-foreground/25 uppercase tracking-widest block">
                  {label}
                </span>
                <span className="text-sm font-black italic text-foreground tracking-tight leading-tight line-clamp-2">
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom decoration */}
        <div className="mx-6 mb-6 p-4 rounded-2xl bg-foreground/[0.03] border border-foreground/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center">
            <Zap className="w-4 h-4 text-foreground/20" />
          </div>
          <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-wider leading-relaxed flex-1">
            Serás el organizador con control total sobre los jugadores
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default memo(StepConfirm);
