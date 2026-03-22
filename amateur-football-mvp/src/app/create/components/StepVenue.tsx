'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { ROSARIO_VENUES } from '@/lib/venues';
import LocationSearch from '@/components/LocationSearch';
import { memo } from 'react';

interface StepVenueProps {
  location: string;
  onChange: (location: string) => void;
}

const StepVenue = ({ location, onChange }: StepVenueProps) => {
  return (
    <motion.div
      key="step-0"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
          ¿Dónde se juega?
        </h2>
        <p className="text-[11px] text-foreground/40 font-bold uppercase tracking-widest">
          Elegí la cancha o escribí una dirección
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ROSARIO_VENUES.map((venue, i) => {
          const isSelected = location === venue.address;
          return (
            <motion.button
              key={venue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              type="button"
              onClick={() => onChange(venue.address)}
              className={`group relative p-5 rounded-3xl border text-left transition-all duration-500 overflow-hidden ${
                isSelected
                  ? 'border-primary bg-primary/[0.08]'
                  : 'border-foreground/[0.06] bg-foreground/[0.02] hover:border-foreground/20 hover:bg-foreground/[0.04]'
              }`}
            >
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              <div className="relative flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      isSelected ? 'bg-primary text-black' : 'bg-foreground/[0.04] text-foreground/20'
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-4 h-4 text-black" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <span
                    className={`text-base font-black italic uppercase tracking-tight block transition-colors ${
                      isSelected ? 'text-foreground' : 'text-foreground/40'
                    }`}
                  >
                    {venue.displayName || venue.name}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/25 block mt-0.5 truncate">
                    {venue.address}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="relative"
      >
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="h-px flex-1 bg-foreground/5" />
          <span className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.5em]">
            O buscá otra
          </span>
          <div className="h-px flex-1 bg-foreground/5" />
        </div>
        <LocationSearch
          value={location}
          onChange={onChange}
          placeholder="Buscá otra cancha o dirección..."
        />
      </motion.div>
    </motion.div>
  );
};

export default memo(StepVenue);
