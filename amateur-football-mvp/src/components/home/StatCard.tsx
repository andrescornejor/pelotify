'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  stat: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
    glow?: string;
    tooltip?: string;
  };
  i: number;
  performanceMode: boolean;
  fadeUp: any;
}

export const StatCard = ({ stat, i, performanceMode, fadeUp }: StatCardProps) => (
  <motion.div
    variants={fadeUp}
    custom={i}
    whileHover={performanceMode ? {} : { y: -8, scale: 1.02, rotate: 1 }}
    className={cn(
      'group relative overflow-hidden p-6 rounded-[2rem] glass border-border shadow-sm transition-all duration-500',
      performanceMode && 'bg-surface shadow-none'
    )}
  >
    {/* Dynamic Background Glow */}
    {!performanceMode && (
      <div
        className="absolute -right-6 -top-6 w-32 h-32 blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-full"
        style={{ backgroundColor: stat.color }}
      />
    )}

    <div className="relative z-10 space-y-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center bg-surface border border-border shadow-inner group-hover:border-primary/30 transition-all duration-500"
      >
        <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.25em] font-space">
          {stat.label}
        </p>
        <div className="flex items-end gap-1.5 mt-0.5">
          <h3 className="text-3xl font-bold tracking-tight text-foreground font-space leading-none">
            {stat.value}
          </h3>
          {!performanceMode && (
            <div className="mb-1 flex items-center gap-0.5 text-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
               <TrendingUp className="w-3 h-3" />
               <span className="text-[8px] font-bold">+4%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);
