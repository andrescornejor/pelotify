'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, DollarSign, Globe, Lock } from 'lucide-react';
import { FORMAT_DATA, MatchFormat } from '../constants';
import PitchSVG from './PitchSVG';
import { memo } from 'react';

interface StepDetailsProps {
  type: MatchFormat;
  price: number;
  is_private: boolean;
  onChange: (data: Partial<{ type: MatchFormat; price: number; is_private: boolean }>) => void;
}

const StepDetails = ({ type, price, is_private, onChange }: StepDetailsProps) => {
  return (
    <motion.div
      key="step-2"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
          Detalles del Partido
        </h2>
        <p className="text-[11px] text-foreground/40 font-bold uppercase tracking-widest">
          Formato, cuota y privacidad
        </p>
      </div>

      {/* Format selector */}
      <div className="space-y-4">
        <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] px-1">
          Formato
        </span>
        <div className="grid grid-cols-3 gap-4">
          {(
            Object.entries(FORMAT_DATA) as [MatchFormat, (typeof FORMAT_DATA)[MatchFormat]][]
          ).map(([key, data], i) => {
            const isSelected = type === key;
            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                type="button"
                onClick={() => onChange({ type: key })}
                className={`group relative p-5 rounded-3xl border text-left transition-all duration-400 overflow-hidden flex flex-col gap-3 ${
                  isSelected
                    ? `border-primary bg-primary/[0.08] shadow-2xl ${data.glow}`
                    : 'border-foreground/[0.06] bg-foreground/[0.02] hover:border-foreground/15 hover:bg-foreground/[0.04]'
                }`}
              >
                {isSelected && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${data.color} opacity-5`} />
                )}
                {/* Pitch diagram */}
                <div
                  className={`w-full aspect-video rounded-xl overflow-hidden flex items-center justify-center transition-colors ${
                    isSelected ? 'text-primary' : 'text-foreground/10'
                  }`}
                >
                  <PitchSVG type={key} />
                </div>
                <div className="relative space-y-0.5">
                  <span
                    className={`block text-sm font-black italic uppercase tracking-tight transition-colors ${
                      isSelected ? 'text-foreground' : 'text-foreground/30'
                    }`}
                  >
                    {data.label}
                  </span>
                  <span
                    className={`block text-[9px] font-bold uppercase tracking-widest transition-colors ${
                      isSelected ? 'text-primary' : 'text-foreground/20'
                    }`}
                  >
                    {data.players}
                  </span>
                  <span
                    className={`block text-[9px] tracking-wide transition-colors ${
                      isSelected ? 'text-foreground/50' : 'text-foreground/15'
                    }`}
                  >
                    {data.desc}
                  </span>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-3 h-3 text-black" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Price */}
      <div className="space-y-4">
        <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] px-1">
          Cuota por jugador
        </span>
        <div className="relative group">
          <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
          <input
            type="number"
            min="0"
            placeholder="0 · Partido libre"
            value={price || ''}
            onChange={(e) => onChange({ price: parseInt(e.target.value) || 0 })}
            className="w-full h-16 pl-14 pr-4 rounded-2xl bg-foreground/[0.03] border border-foreground/10 focus:bg-foreground/[0.05] focus:border-primary/40 outline-none text-2xl font-black italic text-foreground tracking-tighter transition-all"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-foreground/20 uppercase tracking-widest">
            ARS
          </span>
        </div>
      </div>

      {/* Privacy */}
      <div className="space-y-4">
        <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] px-1">
          Privacidad
        </span>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              value: false,
              label: 'Público',
              desc: 'Cualquiera puede unirse',
              icon: <Globe className="w-5 h-5" />,
              color: 'primary',
            },
            {
              value: true,
              label: 'Privado',
              desc: 'Solo con invitación',
              icon: <Lock className="w-5 h-5" />,
              color: 'accent',
            },
          ].map(({ value, label, desc, icon, color }) => {
            const isSelected = is_private === value;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onChange({ is_private: value })}
                className={`p-5 rounded-3xl border text-left transition-all duration-300 flex flex-col gap-3 relative overflow-hidden ${
                  isSelected
                    ? color === 'primary'
                      ? 'border-primary bg-primary/[0.08]'
                      : 'border-violet-500 bg-violet-500/[0.08]'
                    : 'border-foreground/[0.06] bg-foreground/[0.02] hover:border-foreground/15'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    isSelected
                      ? color === 'primary'
                        ? 'bg-primary text-black'
                        : 'bg-violet-500 text-white'
                      : 'bg-foreground/[0.04] text-foreground/20'
                  }`}
                >
                  {icon}
                </div>
                <div>
                  <span
                    className={`block text-sm font-black italic uppercase tracking-tight ${isSelected ? 'text-foreground' : 'text-foreground/30'}`}
                  >
                    {label}
                  </span>
                  <span
                    className={`block text-[10px] font-bold tracking-wide mt-0.5 ${isSelected ? 'text-foreground/50' : 'text-foreground/15'}`}
                  >
                    {desc}
                  </span>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${color === 'primary' ? 'bg-primary' : 'bg-violet-500'}`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-black" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default memo(StepDetails);
