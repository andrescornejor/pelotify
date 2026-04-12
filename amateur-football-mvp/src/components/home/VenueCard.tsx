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
        whileHover={performanceMode ? {} : { scale: 1.01, y: -4 }}
        className="group relative h-full card-stadium rounded-2xl p-3 transition-all duration-500 flex flex-col"
      >
        {/* Image Container */}
        <div className="relative h-56 sm:h-64 rounded-xl overflow-hidden mb-4 border border-foreground/[0.04]">
          <img 
            src={venue.image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop"} 
            className={cn(
              "w-full h-full object-cover transition-all duration-700",
              !performanceMode && "group-hover:scale-105"
            )} 
            alt={venue.name}
          />
          
          {/* Verified Badge */}
          <div className="absolute top-3 right-3">
            <div className="ticker-badge text-[8px] py-1 bg-primary/15 text-primary border-primary/20">
              <ShieldCheck className="w-3 h-3" />
              VERIFICADO
            </div>
          </div>

          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
          
          {/* Hover CTA */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-5">
            <span className="text-[10px] font-bold uppercase text-white tracking-wider flex items-center gap-1.5">
              Ver sede <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-2 pb-2 space-y-3 flex-1 flex flex-col">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight tracking-tight">
              {venue.name}
            </h3>
            <p className="text-[11px] font-medium text-foreground/35 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-primary/50" />
              {venue.address || "Rosario, Argentina"}
            </p>
          </div>

          <div className="flex-1" />

          {/* Footer */}
          <div className="pt-3 border-t border-foreground/[0.04] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-foreground">Premium</span>
              <span className="text-[8px] font-medium text-foreground/25 uppercase tracking-wider">Césped PRO</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
