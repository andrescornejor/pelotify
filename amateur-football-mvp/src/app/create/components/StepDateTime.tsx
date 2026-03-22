'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { AVAILABLE_TIMES } from '@/lib/constants';
import { memo } from 'react';

interface StepDateTimeProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

const StepDateTime = ({ date, time, onDateChange, onTimeChange }: StepDateTimeProps) => {
  return (
    <motion.div
      key="step-1"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
          ¿Cuándo se juega?
        </h2>
        <p className="text-[11px] text-foreground/40 font-bold uppercase tracking-widest">
          Elegí fecha y horario
        </p>
      </div>

      {/* Date picker */}
      <div className="space-y-4">
        <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] px-1">
          Fecha
        </span>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
          {Array.from({ length: 14 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d
              .toLocaleDateString('es-ES', { weekday: 'short' })
              .replace('.', '')
              .toUpperCase();
            const dayNumber = d.getDate();
            const monthName = d
              .toLocaleDateString('es-ES', { month: 'short' })
              .replace('.', '')
              .toUpperCase();
            const isSelected = date === dateStr;
            const isToday = i === 0;

            return (
              <motion.button
                key={dateStr}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                type="button"
                onClick={() => onDateChange(dateStr)}
                className={`flex-shrink-0 w-[72px] h-24 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-0.5 relative overflow-hidden ${
                  isSelected
                    ? 'border-primary bg-primary shadow-lg shadow-primary/20 scale-105'
                    : 'border-foreground/[0.06] bg-foreground/[0.02] hover:border-foreground/20 hover:bg-foreground/[0.04]'
                }`}
              >
                {isToday && !isSelected && (
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary/60" />
                )}
                <span
                  className={`text-[8px] font-black tracking-widest ${isSelected ? 'text-black/70' : 'text-foreground/25'}`}
                >
                  {monthName}
                </span>
                <span
                  className={`text-3xl font-black italic tracking-tighter leading-none ${isSelected ? 'text-black' : 'text-foreground/70'}`}
                >
                  {dayNumber}
                </span>
                <span
                  className={`text-[8px] font-black tracking-widest ${isSelected ? 'text-black/70' : 'text-foreground/25'}`}
                >
                  {dayName}
                </span>
              </motion.button>
            );
          })}
          <div className="relative flex-shrink-0">
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full"
            />
            <div
              className={`w-[72px] h-24 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                date &&
                !Array.from({ length: 14 }).some((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() + i);
                  return d.toISOString().split('T')[0] === date;
                })
                  ? 'border-primary bg-primary text-black scale-105'
                  : 'border-foreground/[0.06] bg-foreground/[0.02] text-foreground/20 hover:border-foreground/20'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[8px] font-black tracking-widest uppercase">Otro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time picker */}
      <div className="space-y-4">
        <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] px-1">
          Horario
        </span>
        <div className="relative group">
          <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
          <select
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-full h-16 pl-14 pr-12 rounded-2xl bg-foreground/[0.03] border border-foreground/10 focus:bg-foreground/[0.05] focus:border-primary/40 outline-none text-lg font-black italic text-foreground appearance-none cursor-pointer transition-all"
          >
            <option value="" disabled className="bg-background">
              ¿A qué hora?
            </option>
            {AVAILABLE_TIMES.map((t) => {
              const [h, m] = t.split(':');
              const hour = parseInt(h);
              const displayHour = hour % 12 === 0 ? 12 : hour % 12;
              const ampm = hour >= 12 ? 'PM' : 'AM';
              return (
                <option key={t} value={t} className="bg-background text-foreground font-bold">
                  {displayHour}:{m} {ampm}
                </option>
              );
            })}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/20">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path
                d="M1 1L6 6L11 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(StepDateTime);
