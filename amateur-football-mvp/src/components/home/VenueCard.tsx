'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Star, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VenueCardProps {
  venue: any;
  performanceMode: boolean;
}

export const VenueCard = ({ venue, performanceMode }: VenueCardProps) => {
  return (
    <Link href={`/establecimientos/${venue.id}`} className="block h-full">
      <motion.div
        whileHover={performanceMode ? {} : { scale: 1.02, y: -8 }}
        className="group relative h-full glass-premium rounded-[3rem] p-4 border-foreground/5 hover:border-primary/40 transition-all duration-500 overflow-hidden flex flex-col shadow-xl"
      >
        {/* Background Ambient Glow */}
        {!performanceMode && (
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-colors duration-700" />
        )}

        {/* Image Container */}
        <div className="relative h-64 sm:h-72 rounded-[2.5rem] overflow-hidden mb-6 shadow-inner border border-foreground/5">
          <img 
            src={venue.image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop"} 
            className={cn(
              "w-full h-full object-cover transition-all duration-1000",
              !performanceMode && "grayscale group-hover:grayscale-0 group-hover:scale-110"
            )} 
            alt={venue.name}
          />
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="px-4 py-2 glass rounded-2xl border border-foreground/10 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                <span className="text-[12px] font-black text-white italic">4.9</span>
              </div>
            </div>
          </div>

          <div className="absolute top-4 right-4">
             <div className="px-3 py-1.5 bg-primary text-background rounded-xl font-black text-[9px] uppercase tracking-widest shadow-[0_0_20px_rgba(44,252,125,0.4)]">
                VERIFICADO
             </div>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-8">
             <motion.span 
               initial={{ y: 20, opacity: 0 }}
               whileHover={{ y: 0, opacity: 1 }}
               className="text-[10px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-2 drop-shadow-lg"
             >
               Reservar Ahora <ArrowRight className="w-4 h-4" />
             </motion.span>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-4 space-y-4 flex-1 flex flex-col">
          <div className="space-y-2">
             <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black font-kanit italic uppercase tracking-tighter group-hover:text-primary transition-colors leading-tight">
                  {venue.name}
                </h3>
             </div>
             <p className="text-[11px] font-bold text-foreground/40 uppercase flex items-center gap-2 tracking-wide">
                <MapPin className="w-3.5 h-3.5 text-primary/60" />
                {venue.address || "Rosario, Argentina"}
             </p>
          </div>

          <div className="flex-1" />

          {/* Features / Footer */}
          <div className="pt-6 flex items-center justify-between mt-auto">
             <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                   <Zap className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-widest text-foreground font-kanit italic">Premium</span>
                   <span className="text-[8px] font-bold text-foreground/30 uppercase tracking-[0.1em]">Césped PRO</span>
                </div>
             </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
