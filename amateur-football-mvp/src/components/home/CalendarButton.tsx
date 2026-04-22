'use client';

import { CalendarPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Match } from '@/lib/matches';
import { getFormatMeta, getMatchSport, getSportLabel } from '@/lib/sports';

interface CalendarButtonProps {
  match: Match | any;
  className?: string;
}

export function CalendarButton({ match, className }: CalendarButtonProps) {
  const sport = getMatchSport(match);
  const format = getFormatMeta(match.type, sport);
  const title = encodeURIComponent(`[Pelotify] ${getSportLabel(sport)} ${format.label}`);
  const location = encodeURIComponent(match.location || 'Sede por confirmar');
  const details = encodeURIComponent(
    `${getSportLabel(sport)} organizado por Pelotify.\n\nUbicacion: ${match.location || 'Sede por confirmar'}`
  );

  try {
    const cleanDate = match.date.replace(/-/g, '');
    const timeParts = match.time.split(':');
    const cleanTime = `${timeParts[0].padStart(2, '0')}${timeParts[1].padStart(2, '0')}`;
    const startDate = `${cleanDate}T${cleanTime}00`;
    const endHour = (parseInt(timeParts[0]) + 1).toString().padStart(2, '0');
    const endDate = `${cleanDate}T${endHour}${timeParts[1].padStart(2, '0')}00`;
    const dates = `${startDate}/${endDate}`;
    const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;

    return (
      <motion.a
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-2xl bg-foreground/5 hover:bg-primary/20 hover:text-primary border border-foreground/15 hover:border-primary/40 transition-all text-[9px] font-black uppercase tracking-widest justify-center',
          className
        )}
      >
        <CalendarPlus className="w-4 h-4" />
        <span>Agendar</span>
      </motion.a>
    );
  } catch (e) {
    console.error('Error generating calendar link:', e);
    return null;
  }
}
