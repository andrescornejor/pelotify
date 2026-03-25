import { memo } from 'react';
import { motion } from 'framer-motion';
import { Hexagon, Shield, Trophy, Star, Crown, Zap, Flame, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RankName } from '@/lib/ranks';
import { useTheme } from '@/contexts/ThemeContext';

interface RankBadgeProps {
  rankName: RankName;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLabel?: boolean;
}

const RANK_CONFIG: Record<
  RankName,
  {
    icon: any;
    color: string;
    gradient: string;
    glow: string;
    border: string;
    animation?: any;
  }
> = {
  HIERRO: {
    icon: Shield,
    color: '#94a3b8',
    gradient: 'from-slate-400 to-slate-500',
    glow: 'rgba(148, 163, 184, 0.2)',
    border: 'border-slate-400/30',
  },
  BRONCE: {
    icon: Zap,
    color: '#d97706',
    gradient: 'from-amber-600 to-amber-700',
    glow: 'rgba(217, 119, 6, 0.3)',
    border: 'border-amber-600/30',
  },
  PLATA: {
    icon: Award,
    color: '#94a3b8',
    gradient: 'from-slate-300 to-slate-500',
    glow: 'rgba(148, 163, 184, 0.3)',
    border: 'border-slate-300/40',
  },
  ORO: {
    icon: Trophy,
    color: '#fbbf24',
    gradient: 'from-yellow-400 to-yellow-600',
    glow: 'rgba(251, 191, 36, 0.4)',
    border: 'border-yellow-300/50',
  },
  PLATINO: {
    icon: Star,
    color: '#2dd4bf',
    gradient: 'from-emerald-400 to-teal-600',
    glow: 'rgba(45, 212, 191, 0.4)',
    border: 'border-emerald-300/50',
  },
  DIAMANTE: {
    icon: Hexagon,
    color: '#3b82f6',
    gradient: 'from-blue-400 via-blue-500 to-indigo-600',
    glow: 'rgba(59, 130, 246, 0.5)',
    border: 'border-blue-300/60',
  },
  ELITE: {
    icon: Flame,
    color: '#8b5cf6',
    gradient: 'from-violet-400 via-purple-500 to-indigo-600',
    glow: 'rgba(139, 92, 246, 0.6)',
    border: 'border-violet-300/70',
  },
  MAESTRO: {
    icon: Crown,
    color: '#f43f5e',
    gradient: 'from-rose-400 via-pink-500 to-red-600',
    glow: 'rgba(244, 63, 94, 0.7)',
    border: 'border-rose-400/80',
  },
  PELOTIFY: {
    icon: Zap,
    color: '#2cfc7d',
    gradient: 'from-primary-light via-primary to-primary-dark',
    glow: 'rgba(44, 252, 125, 0.8)',
    border: 'border-primary/50',
  },
};

const SIZES = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
  xl: 'w-32 h-32',
};

const ICON_SIZES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
  xl: 'w-16 h-16',
};

export const RankBadge = memo(
  ({ rankName, size = 'md', className, showLabel = false }: RankBadgeProps) => {
    const { theme } = useTheme();
    const config = RANK_CONFIG[rankName];
    if (!config) return null;
    const Icon = config.icon;
    const isLight = theme === 'light';

    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={cn(
            'relative flex items-center justify-center rounded-2xl overflow-hidden transition-all duration-500',
            SIZES[size],
            isLight ? 'bg-white/80 backdrop-blur-md shadow-sm border-zinc-200' : 'glass-premium border',
            !isLight && config.border
          )}
          style={{
            boxShadow: isLight 
              ? `0 4px 12px ${config.glow.replace('0.', '0.1')}` 
              : `0 0 30px ${config.glow}`,
          }}
        >
          {/* Background Gradient */}
          <div className={cn('absolute inset-0 bg-gradient-to-br transition-opacity duration-500', 
            isLight ? 'opacity-10' : 'opacity-20',
            config.gradient
          )} />

          {/* Shimmer Effect for high ranks */}
          {(rankName === 'PELOTIFY' || rankName === 'MAESTRO' || rankName === 'ELITE' || rankName === 'DIAMANTE') && (
            <motion.div
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
              className={cn(
                "absolute inset-0 skew-x-[-20deg] pointer-events-none transition-opacity duration-500",
                isLight ? "bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-40" : "bg-gradient-to-r from-transparent via-white/30 to-transparent"
              )}
            />
          )}

          {/* Icon */}
          <div className="relative z-10">
            <Icon
              className={cn(ICON_SIZES[size])}
              style={{ color: config.color }}
              strokeWidth={2.5}
            />
          </div>

          {/* Rotating outer ring for High Ranks */}
          {(rankName === 'PELOTIFY' || rankName === 'MAESTRO') && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className={cn(
                "absolute inset-0 border-2 border-dashed rounded-full scale-90 transition-all duration-500",
                rankName === 'PELOTIFY' ? "border-primary/40" : "border-rose-500/30"
              )}
            />
          )}
        </motion.div>

        {showLabel && (
          <span
            className={cn(
              'text-[10px] font-black uppercase tracking-[0.2em] italic font-kanit transition-all duration-500',
              'bg-clip-text text-transparent bg-gradient-to-r',
              config.gradient,
              isLight && 'brightness-75 saturate-150'
            )}
          >
            {rankName}
          </span>
        )}
      </div>
    );
  }
);

RankBadge.displayName = 'RankBadge';
