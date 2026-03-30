'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

export const StatCard = ({ stat, i, fadeUp }: any) => {
  const { performanceMode } = useSettings();

  return (
    <motion.div
      variants={fadeUp}
      custom={i}
      whileHover={performanceMode ? {} : { y: -8, scale: 1.02, rotate: 1 }}
      className={cn(
        'group relative overflow-hidden p-6 rounded-[2.5rem] glass-premium transition-all duration-500 border-white/5 shadow-2xl',
        performanceMode && 'bg-surface shadow-none'
      )}
    >
      {/* Dynamic Background Glow */}
      {!performanceMode && (
        <div
          className="absolute -right-6 -top-6 w-32 h-32 blur-[50px] opacity-0 group-hover:opacity-30 transition-opacity duration-700 rounded-full"
          style={{ backgroundColor: stat.color }}
        />
      )}

      <div className="relative z-10 space-y-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center glass border-white/10 shadow-inner group-hover:rotate-12 transition-transform duration-500"
          style={{ backgroundColor: `${stat.color}15` }}
        >
          <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
        </div>
        <div>
          <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] font-outfit">
            {stat.label}
          </p>
          <div className="flex items-end gap-1.5 mt-1">
            <h3 className="text-3xl font-black italic tracking-tighter text-foreground font-kanit leading-none">
              {stat.value}
            </h3>
            {!performanceMode && (
              <div className="mb-1 flex items-center gap-0.5 text-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                <TrendingUp className="w-3 h-3" />
                <span className="text-[8px] font-black">+4%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};