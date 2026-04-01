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
        whileHover={performanceMode ? {} : { scale: 1.01, y: -6 }}
        className="group flex flex-col sm:flex-row items-center justify-between gap-6 p-7 rounded-[2rem] glass-premium border-white/5 hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden shadow-2xl"
      >
        {/* Dynamic Ray Background */}
        {!performanceMode && (
          <>
            <div 
              className="absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full opacity-0 group-hover:opacity-[0.07] transition-opacity duration-1000"
              style={{ backgroundColor: teamColor }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </>
        )}
        
        <div className="flex items-center gap-8 relative z-10 w-full sm:w-auto">
          <div className="flex flex-col items-center min-w-[100px]">
            <div className="relative group/avatar">
              {!performanceMode && (
                <div 
                  className="absolute inset-0 blur-3xl rounded-full scale-0 group-hover/avatar:scale-150 transition-transform duration-1000 opacity-0 group-hover/avatar:opacity-30"
                  style={{ backgroundColor: teamColor }}
                />
              )}
              
              <div 
                className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-surface to-background flex items-center justify-center overflow-hidden border-2 border-white/5 group-hover:border-primary/50 transition-all duration-700 shadow-2xl relative z-10 p-1"
              >
                <div className="w-full h-full rounded-[2.8rem] overflow-hidden">
                  {team.logo_url ? (
                    <img 
                    src={team.logo_url} 
                    alt={team.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                  ) : (
                    <div className="p-4 w-full h-full bg-background">
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
              <div className="absolute -bottom-2 right-0 px-2.5 py-1 rounded-lg bg-primary text-background text-[10px] font-black italic shadow-lg z-20 transform group-hover:translate-y--1 transition-transform">
                Lvl {Math.floor((team.elo / 500) + 1)}
              </div>
            </div>
          </div>
 
          <div className="flex-1 space-y-3">
            <h4 className="text-3xl font-black italic uppercase tracking-tighter text-foreground font-kanit leading-none group-hover:text-primary transition-colors duration-300">
              {team.name}
            </h4>
            <div className="flex items-center gap-5">
              <div className="flex -space-x-3.5">
                {[1, 2, 3].map((i) => (
                  <div 
                  key={i} 
                  className="w-9 h-9 rounded-full border-2 border-background bg-surface-elevated overflow-hidden hover:z-20 hover:scale-125 transition-transform flex items-center justify-center shadow-lg"
                  >
                    <User2 className="w-5 h-5 text-foreground/10" />
                  </div>
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-background bg-primary text-[10px] font-black text-background flex items-center justify-center z-10 shadow-lg">
                  +{team.members_count || 0}
                </div>
              </div>
              <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1 rounded-full bg-foreground/[0.03] border border-white/5">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-semibold text-foreground/40 tracking-wide font-outfit">
                  {team.elo > 1000 ? 'Elite Club' : 'Verificado'}
                </span>
              </div>
            </div>
          </div>
        </div>
 
        {/* Action Button */}
        <div className="flex items-center gap-6 relative z-10 w-full sm:w-auto mt-6 sm:mt-0">
          <div className="hidden xl:flex flex-col items-end opacity-0 group-hover:opacity-100 translate-x-8 group-hover:translate-x-0 transition-all duration-700">
            <span className="text-[11px] font-bold text-primary tracking-wide font-outfit">Sede Central</span>
            <span className="text-[10px] font-medium text-foreground/30 mt-1">Entrar al vestuario</span>
          </div>
          <div 
            className="w-16 h-16 rounded-[2rem] bg-foreground/[0.04] border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-all duration-700 shadow-xl group-hover:shadow-[0_15px_30px_rgba(44,252,125,0.2)] group-hover:scale-110"
          >
            <ArrowRight className="w-8 h-8 group-hover:translate-x-1.5 transition-transform duration-500" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
