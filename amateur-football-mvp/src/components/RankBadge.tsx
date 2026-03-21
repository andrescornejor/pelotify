'use client';

import { motion } from 'framer-motion';
import { Hexagon, Shield, Trophy, Star, Crown, Zap, Flame, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RankName } from '@/lib/ranks';

interface RankBadgeProps {
  rankName: RankName;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLabel?: boolean;
}

const RANK_CONFIG: Record<RankName, {
  icon: any;
  color: string;
  gradient: string;
  glow: string;
  border: string;
  animation?: any;
}> = {
  HIERRO: {
    icon: Shield,
    color: '#64748b',
    gradient: 'from-slate-500 to-slate-700',
    glow: 'rgba(100, 116, 139, 0.2)',
    border: 'border-slate-400/30'
  },
  BRONCE: {
    icon: zap => <Zap {...zap} />,
    color: '#92400e',
    gradient: 'from-amber-700 to-amber-900',
    glow: 'rgba(146, 64, 14, 0.3)',
    border: 'border-amber-600/30'
  },
  PLATA: {
    icon: Award,
    color: '#94a3b8',
    gradient: 'from-slate-300 to-slate-500',
    glow: 'rgba(148, 163, 184, 0.3)',
    border: 'border-slate-300/40'
  },
  ORO: {
    icon: Trophy,
    color: '#ca8a04',
    gradient: 'from-yellow-400 to-yellow-600',
    glow: 'rgba(202, 138, 4, 0.4)',
    border: 'border-yellow-300/50'
  },
  PLATINO: {
    icon: Star,
    color: '#0ea5e9',
    gradient: 'from-cyan-400 to-blue-600',
    glow: 'rgba(14, 165, 233, 0.4)',
    border: 'border-cyan-300/50'
  },
  DIAMANTE: {
    icon: Hexagon,
    color: '#22d3ee',
    gradient: 'from-sky-300 via-cyan-400 to-indigo-500',
    glow: 'rgba(34, 211, 238, 0.5)',
    border: 'border-sky-200/60'
  },
  ELITE: {
    icon: Flame,
    color: '#10b981',
    gradient: 'from-emerald-400 via-green-500 to-teal-600',
    glow: 'rgba(16, 185, 129, 0.6)',
    border: 'border-emerald-300/70'
  },
  LEYENDA: {
    icon: Crown,
    color: '#f59e0b',
    gradient: 'from-orange-400 via-yellow-500 to-red-600',
    glow: 'rgba(245, 158, 11, 0.7)',
    border: 'border-yellow-200/80'
  }
};

const SIZES = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
  xl: 'w-32 h-32'
};

const ICON_SIZES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
  xl: 'w-16 h-16'
};

export function RankBadge({ rankName, size = 'md', className, showLabel = false }: RankBadgeProps) {
  const config = RANK_CONFIG[rankName];
  const Icon = config.icon;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={cn(
          "relative flex items-center justify-center rounded-2xl overflow-hidden",
          SIZES[size],
          "glass-premium border",
          config.border
        )}
        style={{
          boxShadow: `0 0 30px ${config.glow}`
        }}
      >
        {/* Background Gradient */}
        <div className={cn(
          "absolute inset-0 opacity-20 bg-gradient-to-br",
          config.gradient
        )} />

        {/* Shimmer Effect for high ranks */}
        {(rankName === 'LEYENDA' || rankName === 'ELITE' || rankName === 'DIAMANTE') && (
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] pointer-events-none"
          />
        )}

        {/* Icon */}
        <div className="relative z-10">
          <Icon className={cn(ICON_SIZES[size])} style={{ color: config.color }} strokeWidth={2.5} />
        </div>

        {/* Rotating outer ring for Legends */}
        {rankName === 'LEYENDA' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-dashed border-yellow-500/30 rounded-full scale-90"
          />
        )}
      </motion.div>

      {showLabel && (
        <span className={cn(
          "text-[10px] font-black uppercase tracking-[0.2em] italic font-kanit",
          "bg-clip-text text-transparent bg-gradient-to-r",
          config.gradient
        )}>
          {rankName}
        </span>
      )}
    </div>
  );
}
