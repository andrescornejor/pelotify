'use client';

import { motion } from 'framer-motion';
import { Users, Zap } from 'lucide-react';
import { MatchParticipant } from '@/lib/matches';
import { cn } from '@/lib/utils';

interface PlayerSlotProps {
  participant?: MatchParticipant;
  isSelf?: boolean;
}

export default function PlayerSlot({ participant, isSelf }: PlayerSlotProps) {
  const profile = participant?.profiles as any;
  const name = profile?.name?.split(' ')[0] || 'Jugador';
  const avatar = profile?.avatar_url;
  const seed = participant?.user_id || 'empty';

  if (!participant) {
    return (
      <div className="flex flex-col items-center gap-3 group cursor-not-allowed">
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-[1.8rem] lg:rounded-[2.2rem] border-2 border-dashed border-foreground/5 bg-foreground/[0.01] flex items-center justify-center transition-all group-hover:border-foreground/10 relative overflow-hidden group/empty shadow-inner">
          <Users className="w-6 h-6 lg:w-8 lg:h-8 text-foreground/10 group-hover/empty:scale-110 transition-transform" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-foreground/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
        <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest italic">
          Vacio
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-4 group cursor-pointer relative"
    >
      <div
        className={cn(
          'w-16 h-16 lg:w-20 lg:h-20 rounded-[1.8rem] lg:rounded-[2.2rem] p-1 transition-all duration-500 relative z-10',
          isSelf
            ? 'bg-primary shadow-[0_0_30px_rgba(16,185,129,0.3)]'
            : 'bg-gradient-to-b from-foreground/10 to-transparent shadow-2xl'
        )}
      >
        <div className="w-full h-full rounded-[1.6rem] lg:rounded-[2rem] overflow-hidden bg-surface relative">
          <img
            src={avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        </div>

        {isSelf && (
          <div className="absolute -top-1 -right-1 p-1.5 bg-primary rounded-lg shadow-lg z-20">
            <Zap className="w-3 h-3 text-black fill-black" />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <span
          className={cn(
            'text-[10px] lg:text-xs font-black italic uppercase tracking-tighter transition-colors',
            isSelf ? 'text-primary' : 'text-foreground group-hover:text-primary'
          )}
        >
          {name}
        </span>
        <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest leading-none">
          ELO {profile?.elo || 0}
        </span>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 -z-0 bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}
