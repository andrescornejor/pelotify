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
    whileHover={performanceMode ? {} : { y: -4, scale: 1.01 }}
    className={cn(
      'group relative overflow-hidden p-5 rounded-2xl card-stadium transition-all duration-500',
      performanceMode && 'bg-surface shadow-none'
    )}
  >
    {/* Dynamic Background Glow */}
    {!performanceMode && (
      <div
        className="absolute -right-6 -top-6 w-28 h-28 blur-[50px] opacity-0 group-hover:opacity-15 transition-opacity duration-700 rounded-full"
        style={{ backgroundColor: stat.color }}
      />
    )}

    <div className="relative z-10 space-y-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-500"
        style={{ backgroundColor: `${stat.color}12` }}
      >
        <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
      </div>
      <div>
        <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.15em]">
          {stat.label}
        </p>
        <div className="flex items-end gap-1.5 mt-0.5">
          <h3 className="text-2xl font-black tracking-tight text-foreground font-kanit leading-none scoreboard-num">
            {stat.value}
          </h3>
          {!performanceMode && (
            <div className="mb-0.5 flex items-center gap-0.5 text-primary opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-500">
               <TrendingUp className="w-2.5 h-2.5" />
               <span className="text-[7px] font-bold">+4%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);
