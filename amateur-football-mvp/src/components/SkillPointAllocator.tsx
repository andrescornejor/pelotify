'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Sparkles, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useCallback, useRef, useEffect } from 'react';

interface PlayerStats {
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
}

interface SkillPointAllocatorProps {
  stats: PlayerStats;
  skillPoints: number;
  onStatsChange: (stats: PlayerStats) => void;
  onSkillPointsChange: (points: number) => void;
}

const STAT_CONFIG: Record<keyof PlayerStats, { label: string; fullName: string; icon: string; color: string; glowColor: string }> = {
  pac: { label: 'PAC', fullName: 'Ritmo', icon: '⚡', color: '#3b82f6', glowColor: 'rgba(59,130,246,0.4)' },
  sho: { label: 'SHO', fullName: 'Tiro', icon: '🎯', color: '#ef4444', glowColor: 'rgba(239,68,68,0.4)' },
  pas: { label: 'PAS', fullName: 'Pase', icon: '🔀', color: '#8b5cf6', glowColor: 'rgba(139,92,246,0.4)' },
  dri: { label: 'DRI', fullName: 'Regate', icon: '💫', color: '#f59e0b', glowColor: 'rgba(245,158,11,0.4)' },
  def: { label: 'DEF', fullName: 'Defensa', icon: '🛡️', color: '#10b981', glowColor: 'rgba(16,185,129,0.4)' },
  phy: { label: 'PHY', fullName: 'Físico', icon: '💪', color: '#f97316', glowColor: 'rgba(249,115,22,0.4)' },
};

function getStatTier(value: number): { tier: string; color: string } {
  if (value >= 90) return { tier: 'ELITE', color: '#facc15' };
  if (value >= 80) return { tier: 'TOP', color: '#22c55e' };
  if (value >= 70) return { tier: 'BUENO', color: '#3b82f6' };
  if (value >= 60) return { tier: 'MEDIO', color: '#a855f7' };
  if (value >= 40) return { tier: 'BAJO', color: '#f97316' };
  return { tier: 'NOVATO', color: '#ef4444' };
}

// Circular progress gauge for each stat
function StatGauge({ value, maxValue = 99, color, size = 72 }: { value: number; maxValue?: number; color: string; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / maxValue, 1);
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="opacity-[0.06]"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 6px ${color}40)`,
          }}
        />
      </svg>
      {/* Center value */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          key={value}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-lg font-black italic tracking-tighter"
          style={{ color }}
        >
          {value}
        </motion.span>
      </div>
    </div>
  );
}

// Individual stat card with controls
function StatCard({
  statKey,
  value,
  skillPoints,
  onIncrement,
  onDecrement,
  isAnimating,
}: {
  statKey: keyof PlayerStats;
  value: number;
  skillPoints: number;
  onIncrement: () => void;
  onDecrement: () => void;
  isAnimating: boolean;
}) {
  const config = STAT_CONFIG[statKey];
  const tier = getStatTier(value);
  const [holdInterval, setHoldInterval] = useState<NodeJS.Timeout | null>(null);
  const canIncrement = skillPoints > 0 && value < 99;
  const canDecrement = value > 0;

  const startHold = useCallback((action: () => void) => {
    action();
    const interval = setInterval(action, 120);
    setHoldInterval(interval);
  }, []);

  const stopHold = useCallback(() => {
    if (holdInterval) {
      clearInterval(holdInterval);
      setHoldInterval(null);
    }
  }, [holdInterval]);

  useEffect(() => {
    return () => {
      if (holdInterval) clearInterval(holdInterval);
    };
  }, [holdInterval]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        "relative rounded-[1.8rem] border overflow-hidden group/stat transition-all duration-500",
        "bg-background/30 dark:bg-white/[0.02]",
        isAnimating
          ? "border-primary/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
          : "border-foreground/[0.06] hover:border-foreground/10"
      )}
    >
      {/* Animated glow on change */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${config.glowColor} 0%, transparent 70%)`,
              opacity: 0.15,
            }}
          />
        )}
      </AnimatePresence>

      <div className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
        {/* Gauge */}
        <div className="relative shrink-0">
          <StatGauge value={value} color={config.color} size={68} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">{config.icon}</span>
            <div className="flex flex-col">
              <span
                className="text-[13px] font-black uppercase tracking-[0.15em] leading-none"
                style={{ color: config.color }}
              >
                {config.label}
              </span>
              <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em] mt-0.5">
                {config.fullName}
              </span>
            </div>
          </div>

          {/* Tier badge */}
          <div className="flex items-center gap-2">
            <span
              className="text-[7px] font-black uppercase tracking-[0.3em] px-2 py-0.5 rounded-full border"
              style={{
                color: tier.color,
                borderColor: `${tier.color}30`,
                background: `${tier.color}10`,
              }}
            >
              {tier.tier}
            </span>
            {/* Progress bar (tiny) */}
            <div className="flex-1 h-[3px] bg-foreground/[0.04] rounded-full overflow-hidden max-w-[80px]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: config.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(value / 99) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onMouseDown={() => startHold(onIncrement)}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={() => startHold(onIncrement)}
            onTouchEnd={stopHold}
            disabled={!canIncrement}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border",
              canIncrement
                ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] active:bg-primary/30 cursor-pointer"
                : "bg-foreground/[0.02] border-foreground/5 text-foreground/15 cursor-not-allowed"
            )}
          >
            <ChevronUp className="w-4 h-4" strokeWidth={3} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onMouseDown={() => startHold(onDecrement)}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={() => startHold(onDecrement)}
            onTouchEnd={stopHold}
            disabled={!canDecrement}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border",
              canDecrement
                ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] active:bg-red-500/30 cursor-pointer"
                : "bg-foreground/[0.02] border-foreground/5 text-foreground/15 cursor-not-allowed"
            )}
          >
            <ChevronDown className="w-4 h-4" strokeWidth={3} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export function SkillPointAllocator({ stats, skillPoints, onStatsChange, onSkillPointsChange }: SkillPointAllocatorProps) {
  const [animatingStat, setAnimatingStat] = useState<keyof PlayerStats | null>(null);
  const [initialStats] = useState<PlayerStats>({ ...stats });
  const animTimeout = useRef<NodeJS.Timeout | null>(null);

  const overall = Math.round(Object.values(stats).reduce((a, b) => a + b, 0) / 6);
  const totalPointsSpent = Object.keys(stats).reduce((acc, key) => {
    const k = key as keyof PlayerStats;
    return acc + Math.max(0, stats[k] - initialStats[k]);
  }, 0);

  const triggerAnimation = (stat: keyof PlayerStats) => {
    setAnimatingStat(stat);
    if (animTimeout.current) clearTimeout(animTimeout.current);
    animTimeout.current = setTimeout(() => setAnimatingStat(null), 600);
  };

  const handleIncrement = (stat: keyof PlayerStats) => {
    if (skillPoints > 0 && stats[stat] < 99) {
      onStatsChange({ ...stats, [stat]: stats[stat] + 1 });
      onSkillPointsChange(skillPoints - 1);
      triggerAnimation(stat);
    }
  };

  const handleDecrement = (stat: keyof PlayerStats) => {
    if (stats[stat] > 0) {
      onStatsChange({ ...stats, [stat]: stats[stat] - 1 });
      onSkillPointsChange(skillPoints + 1);
      triggerAnimation(stat);
    }
  };

  const handleReset = () => {
    const totalReturn = Object.keys(stats).reduce((acc, key) => {
      const k = key as keyof PlayerStats;
      return acc + Math.max(0, stats[k] - initialStats[k]);
    }, 0);
    onStatsChange({ ...initialStats });
    onSkillPointsChange(skillPoints + totalReturn);
  };

  return (
    <div className="space-y-6">
      {/* Header with Skill Points Counter */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{
              boxShadow: skillPoints > 0
                ? ['0 0 20px rgba(16,185,129,0.1)', '0 0 40px rgba(16,185,129,0.25)', '0 0 20px rgba(16,185,129,0.1)']
                : '0 0 0px transparent',
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-[1.2rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 relative overflow-hidden"
          >
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary relative z-10" />
            {skillPoints > 0 && (
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"
              />
            )}
          </motion.div>
          <div className="flex flex-col">
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter text-foreground italic leading-none">
              Atributos
            </h3>
            <span className="text-[9px] sm:text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] mt-1">
              Distribuí tus puntos
            </span>
          </div>
        </div>

        {/* Skill Points Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {totalPointsSpent > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleReset}
              className="w-9 h-9 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/40 hover:text-foreground/70 hover:bg-foreground/10 transition-all"
              title="Resetear cambios"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </motion.button>
          )}

          <motion.div
            layout
            className={cn(
              "relative flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border overflow-hidden transition-all duration-500",
              skillPoints > 0
                ? "bg-primary/10 border-primary/25 shadow-[0_0_25px_rgba(16,185,129,0.1)]"
                : "bg-foreground/[0.03] border-foreground/10"
            )}
          >
            {/* Animated shimmer when points available */}
            {skillPoints > 0 && (
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none"
              />
            )}

            <Sparkles className={cn("w-4 h-4 relative z-10", skillPoints > 0 ? "text-primary" : "text-foreground/30")} />
            <div className="flex flex-col relative z-10">
              <motion.span
                key={skillPoints}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={cn(
                  "text-xl sm:text-2xl font-black italic tracking-tighter leading-none",
                  skillPoints > 0 ? "text-primary" : "text-foreground/30"
                )}
              >
                {skillPoints}
              </motion.span>
              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-foreground/30 leading-none mt-0.5">
                {skillPoints === 1 ? 'Punto' : 'Puntos'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Overall Impact Preview */}
      <motion.div
        layout
        className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 rounded-2xl bg-foreground/[0.02] border border-foreground/[0.05]"
      >
        <TrendingUp className="w-4 h-4 text-foreground/30 shrink-0" />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.15em]">Overall</span>
          <motion.span
            key={overall}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xl font-black italic text-foreground tracking-tighter"
          >
            {overall}
          </motion.span>
        </div>
        {totalPointsSpent > 0 && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1"
          >
            +{totalPointsSpent} asignados
          </motion.span>
        )}
      </motion.div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(Object.keys(stats) as Array<keyof PlayerStats>).map((stat, index) => (
          <motion.div
            key={stat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
          >
            <StatCard
              statKey={stat}
              value={stats[stat]}
              skillPoints={skillPoints}
              onIncrement={() => handleIncrement(stat)}
              onDecrement={() => handleDecrement(stat)}
              isAnimating={animatingStat === stat}
            />
          </motion.div>
        ))}
      </div>

      {/* Help text */}
      {skillPoints > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-[10px] font-bold text-foreground/25 uppercase tracking-[0.2em] pt-2"
        >
          Mantené presionado para ajustar rápidamente
        </motion.p>
      )}
    </div>
  );
}
