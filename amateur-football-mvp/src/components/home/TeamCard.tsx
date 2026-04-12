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
        whileHover={performanceMode ? {} : { scale: 1.005, y: -3 }}
        className="group flex flex-col sm:flex-row items-center justify-between gap-5 p-5 card-stadium rounded-2xl transition-all cursor-pointer relative overflow-hidden"
      >
        {/* Dynamic Background */}
        {!performanceMode && (
          <div 
            className="absolute top-0 right-0 w-48 h-48 blur-[80px] rounded-full opacity-0 group-hover:opacity-[0.06] transition-opacity duration-700"
            style={{ backgroundColor: teamColor }}
          />
        )}
        
        <div className="flex items-center gap-6 relative z-10 w-full sm:w-auto">
          <div className="flex flex-col items-center min-w-[90px]">
            <div className="relative">
              <div 
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-surface to-background flex items-center justify-center overflow-hidden border border-foreground/[0.06] group-hover:border-primary/20 transition-all duration-500 p-1"
              >
                <div className="w-full h-full rounded-[0.85rem] overflow-hidden">
                  {team.logo_url ? (
                    <img 
                    src={team.logo_url} 
                    alt={team.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

              {/* Level Badge */}
              <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-md bg-primary text-background text-[9px] font-bold shadow-md z-20">
                Lvl {Math.floor((team.elo / 500) + 1)}
              </div>
            </div>
          </div>
 
          <div className="flex-1 space-y-2.5">
            <h4 className="text-2xl font-black tracking-tight text-foreground font-kanit leading-none group-hover:text-primary transition-colors duration-300">
              {team.name}
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {[1, 2, 3].map((i) => (
                  <div 
                  key={i} 
                  className="w-7 h-7 rounded-full border-2 border-background bg-surface-elevated overflow-hidden hover:z-20 hover:scale-110 transition-transform flex items-center justify-center"
                  >
                    <User2 className="w-3.5 h-3.5 text-foreground/10" />
                  </div>
                ))}
                <div className="w-7 h-7 rounded-full border-2 border-background bg-primary text-[9px] font-bold text-background flex items-center justify-center z-10">
                  +{team.members_count || 0}
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-foreground/[0.03] border border-foreground/[0.04]">
                <Shield className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-medium text-foreground/35 tracking-wide">
                  {team.elo > 1000 ? 'Elite Club' : 'Verificado'}
                </span>
              </div>
            </div>
          </div>
        </div>
 
        {/* Action */}
        <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto mt-4 sm:mt-0">
          <div className="hidden xl:flex flex-col items-end opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
            <span className="text-[11px] font-bold text-primary">Sede Central</span>
            <span className="text-[9px] font-medium text-foreground/25 mt-0.5">Ver equipo</span>
          </div>
          <div 
            className="w-12 h-12 rounded-xl bg-foreground/[0.03] border border-foreground/[0.04] flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-all duration-500 group-hover:scale-105"
          >
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
