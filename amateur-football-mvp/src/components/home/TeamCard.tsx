'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { User2, Shield, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JerseyVisualizer } from '@/components/JerseyVisualizer';

interface TeamCardProps {
  team: any;
  performanceMode: boolean;
}

export const TeamCard = ({ team, performanceMode }: TeamCardProps) => {
  const teamColor = team.primary_color || '#2cfc7d';
  
  return (
    <Link href={`/team?id=${team.id}`} className="block">
      <motion.div
        whileHover={performanceMode ? {} : { y: -4 }}
        className="group flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-[2rem] bg-surface border border-border hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden shadow-sm"
      >
        {/* Dynamic Ray Background */}
        {!performanceMode && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        )}
        
        <div className="flex items-center gap-6 relative z-10 w-full sm:w-auto">
          <div className="flex flex-col items-center min-w-[80px]">
            <div className="relative group/avatar">
              <div 
                className="w-20 h-20 rounded-2xl bg-background flex items-center justify-center overflow-hidden border border-border group-hover:border-primary/50 transition-all duration-700 shadow-lg relative z-10 p-1"
              >
                <div className="w-full h-full rounded-xl overflow-hidden">
                  {team.logo_url ? (
                    <img 
                    src={team.logo_url} 
                    alt={team.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="p-3 w-full h-full bg-background">
                      <JerseyVisualizer 
                        primaryColor={team.primary_color || '#18181b'} 
                        secondaryColor={team.secondary_color || '#10b981'} 
                        pattern={team.jersey_pattern || 'solid'}
                        className="w-full h-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* LVL Floating Badge */}
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded bg-primary text-black text-[9px] font-bold uppercase z-20 shadow-lg font-space">
                LVL {Math.floor((team.elo / 500) + 1)}
              </div>
            </div>
          </div>
 
          <div className="flex-1 space-y-2">
            <h4 className="text-2xl font-bold uppercase tracking-tight text-foreground font-space leading-none group-hover:text-primary transition-colors duration-300">
              {team.name}
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div 
                  key={i} 
                  className="w-7 h-7 rounded-full border border-background bg-surface flex items-center justify-center shadow-sm"
                  >
                    <User2 className="w-4 h-4 text-foreground/20" />
                  </div>
                ))}
                <div className="w-7 h-7 rounded-full border border-background bg-primary text-[9px] font-bold text-black flex items-center justify-center z-10 font-space">
                  +{team.members_count || 0}
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-2 py-0.5 rounded bg-surface border border-border">
                <Shield className="w-3 h-3 text-primary" />
                <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest font-space">
                  {team.elo > 1000 ? 'Elite' : 'Verificado'}
                </span>
              </div>
            </div>
          </div>
        </div>
 
        {/* Action Button */}
        <div className="flex items-center gap-6 relative z-10 w-full sm:w-auto mt-4 sm:mt-0">
          <div className="hidden xl:flex flex-col items-end opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-space">Sede Central</span>
            <span className="text-[8px] font-medium text-foreground/30 uppercase mt-0.5">Entrar</span>
          </div>
          <div 
            className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all duration-500 hover:shadow-lg"
          >
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
