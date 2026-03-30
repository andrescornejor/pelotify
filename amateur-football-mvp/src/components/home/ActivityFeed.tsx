'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Star, TrendingUp } from 'lucide-react';
import { EmptyState } from './EmptyState';

export const ActivityFeed = ({ activities }: { activities: any[] }) => {
  return (
    <div className="space-y-4">
      {activities.length > 0 ? (
        activities.map((activity, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 rounded-2xl glass-premium border-white/5 flex items-center gap-4 group"
          >
            <div className="w-10 h-10 rounded-full bg-surface border border-white/5 flex items-center justify-center shrink-0">
              {activity.type === 'RANK_UP' ? <TrendingUp className="w-4 h-4 text-primary" /> : <Star className="w-4 h-4 text-accent" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-foreground">
                {activity.user} <span className="text-foreground/40 font-medium tracking-tight"> {activity.detail}</span>
              </p>
              <p className="text-[8px] font-black text-primary/60 uppercase mt-0.5 tracking-tighter">hace {activity.time}</p>
            </div>
          </motion.div>
        ))
      ) : (
        <EmptyState 
          icon={Activity}
          title="Silencio en la Cancha"
          description="No hay actividad reciente en tu zona. ¡Sé el primero en hacer historia hoy!"
        />
      )}
    </div>
  );
};
