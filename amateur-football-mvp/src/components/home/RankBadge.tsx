import React from 'react';
import { Shield, Activity, Target, Trophy, Award, Sparkles, Star, Crown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Rank {
  name: string;
  minElo: number;
  color: string;
  icon: any;
}

export const RANKS: Rank[] = [
  { name: 'HIERRO', minElo: 0, color: '#94a3b8', icon: Shield },
  { name: 'BRONCE', minElo: 500, color: '#d97706', icon: Activity },
  { name: 'PLATA', minElo: 1000, color: '#94a3b8', icon: Target },
  { name: 'ORO', minElo: 1500, color: '#fbbf24', icon: Trophy },
  { name: 'PLATINO', minElo: 2000, color: '#2dd4bf', icon: Award },
  { name: 'DIAMANTE', minElo: 2500, color: '#3b82f6', icon: Sparkles },
  { name: 'ELITE', minElo: 3000, color: '#8b5cf6', icon: Star },
  { name: 'MAESTRO', minElo: 3500, color: '#f43f5e', icon: Crown },
  { name: 'PELOTIFY', minElo: 4000, color: '#2cfc7d', icon: Zap },
];

export const getRankByElo = (elo: number) => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (elo >= RANKS[i].minElo) return RANKS[i];
  }
  return RANKS[0];
};

interface RankBadgeProps {
  rankName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RankBadge = ({ rankName, size = 'md', className }: RankBadgeProps) => {
  const rank = RANKS.find(r => r.name === rankName) || RANKS[0];
  const Icon = rank.icon;

  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const iconSizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeMap[size], className)}>
      <div 
        className="absolute inset-0 blur-xl rounded-full opacity-40" 
        style={{ backgroundColor: rank.color }}
      />
      <div className="relative z-10 flex items-center justify-center">
        <Icon 
          className={cn(iconSizeMap[size], "drop-shadow-lg")} 
          style={{ color: rank.color }} 
        />
      </div>
    </div>
  );
};
