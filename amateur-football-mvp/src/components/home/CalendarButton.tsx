'use client';

import { CalendarPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Match } from '@/lib/matches';

interface CalendarButtonProps {
  match: Match | any;
  className?: string;
}

export function CalendarButton({ match, className }: CalendarButtonProps) {
  const addToCalendar = () => {
    // 1. Prepare match data
    const title = encodeURIComponent(`[Pelotify] Partido ${match.type || 'Fútbol'}`);
    const location = encodeURIComponent(match.location || 'Sede por confirmar');
    const details = encodeURIComponent(`Partido organizado por Pelotify. \n\nUbicación: ${match.location || 'Sede por confirmar'}`);

    // 2. Parse Date and Time for Google Format (YYYYMMDDTHHMMSSZ)
    // Note: match.date is "YYYY-MM-DD", match.time is "HH:MM"
    const startDateTime = new Date(`${match.date}T${match.time.split(' ')[0]}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default to 1 hour duration

    const formatDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const dates = `${formatDate(startDateTime)}/${formatDate(endDateTime)}`;

    // 3. Construct URL
    const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;

    // 4. Open in new tab
    window.open(googleUrl, '_blank');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={addToCalendar}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-2xl bg-foreground/5 hover:bg-primary/20 hover:text-primary border border-foreground/15 hover:border-primary/40 transition-all text-[9px] font-black uppercase tracking-widest",
        className
      )}
    >
      <CalendarPlus className="w-4 h-4" />
      <span>Agendar</span>
    </motion.button>
  );
}
