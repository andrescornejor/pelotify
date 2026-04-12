'use client';

import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { MapPin, Calendar, Clock, X, Heart, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MatchParticipant } from '@/lib/matches'; // or whatever holds recruitment data

interface ScoutSwipeCardProps {
  cardItem: any; // match/slot details
  onSwipeLeft: (id: string) => void;
  onSwipeRight: (slotId: string, matchId: string, creatorId: string) => void;
  style?: any;
}

export function ScoutSwipeCard({ cardItem, onSwipeLeft, onSwipeRight, style }: ScoutSwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  const crossOpacity = useTransform(x, [-100, 0], [1, 0]);
  const heartOpacity = useTransform(x, [0, 100], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
       // get the first open slot matching the user or ANY, simplified to just the first open
       const openSlot = cardItem.slots?.find((s: any) => s.status === 'open');
       if (openSlot) {
         onSwipeRight(openSlot.id, cardItem.id, cardItem.creator_id);
       } else {
         onSwipeLeft(cardItem.id); // dismiss if no slots
       }
    } else if (info.offset.x < -100) {
       onSwipeLeft(cardItem.id);
    }
  };

  return (
    <motion.div
      style={{ ...style, x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.98 }}
      className="absolute inset-0 rounded-[3rem] overflow-hidden bg-zinc-950 shadow-2xl cursor-grab active:cursor-grabbing will-change-transform border border-white/5"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />
      
      {/* Background visual */}
      {cardItem.venue?.image_url ? (
          <img src={cardItem.venue.image_url} alt="Venue" className="absolute inset-0 w-full h-full object-cover opacity-60" />
      ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 overflow-hidden">
            <div className="w-[150%] h-[150%] bg-gradient-to-br from-primary/20 via-blue-500/10 to-transparent rotate-12 blur-3xl" />
            <Shield className="w-48 h-48 text-white/5 opacity-50" />
          </div>
      )}

      {/* Swipe Indicators */}
      <motion.div style={{ opacity: crossOpacity }} className="absolute top-10 right-10 z-20 w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center pointer-events-none">
        <X className="w-8 h-8 text-red-500" />
      </motion.div>
      <motion.div style={{ opacity: heartOpacity }} className="absolute top-10 left-10 z-20 w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center pointer-events-none shadow-[0_0_50px_rgba(16,185,129,0.5)]">
        <Heart className="w-8 h-8 text-emerald-500 fill-emerald-500" />
      </motion.div>

      <div className="absolute bottom-0 inset-x-0 p-8 z-20 space-y-4 pointer-events-none">
        <div className="flex items-center gap-2">
            <div className="inline-flex px-3 py-1 bg-primary/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase text-primary tracking-widest border border-primary/30 shadow-glow-primary">
            Nivel: {cardItem.required_skill_level?.replace('-', ' ') || 'PRO VIBE'}
            </div>
            <div className="inline-flex px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase text-white tracking-widest border border-white/10">
            Puesto: {cardItem.slots?.find((s: any) => s.status === 'open')?.position || 'ANY'}
            </div>
        </div>

        <h2 className="text-4xl md:text-5xl font-black italic uppercase leading-none text-white tracking-tighter">
          {cardItem.venue?.name || cardItem.location || 'Búsqueda Táctica'}
        </h2>
        <p className="text-white/70 font-medium italic text-base border-l-2 border-primary/50 pl-4 py-1">
          "{cardItem.description}"
        </p>
        
        <div className="flex items-center gap-6 pt-4 border-t border-white/10 mt-4">
          <div className="flex items-center gap-2 text-white/60 text-xs font-black uppercase tracking-widest">
            <Calendar className="w-4 h-4 text-primary" /> {cardItem.date}
          </div>
          <div className="flex items-center gap-2 text-white/60 text-xs font-black uppercase tracking-widest">
            <Clock className="w-4 h-4 text-primary" /> {cardItem.time.slice(0,5)} HS
          </div>
          <div className="flex items-center gap-2 text-white/60 text-xs font-black uppercase tracking-widest">
             <MapPin className="w-4 h-4 text-primary" /> {cardItem.venue?.city || 'Local'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
