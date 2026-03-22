'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { memo } from 'react';

const STEPS = ['Cancha', 'Cuándo', 'Detalles', 'Confirmar'];

interface StepIndicatorProps {
  current: number;
  total: number;
}

const StepIndicator = ({ current, total }: StepIndicatorProps) => {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <motion.div
              animate={{
                scale: i === current ? 1.1 : 1,
                backgroundColor:
                  i < current
                    ? 'rgb(16 185 129)'
                    : i === current
                      ? 'rgb(16 185 129)'
                      : 'rgba(255,255,255,0.05)',
                borderColor: i <= current ? 'rgb(16 185 129)' : 'rgba(255,255,255,0.1)',
              }}
              transition={{ duration: 0.3 }}
              className="w-8 h-8 rounded-full border flex items-center justify-center"
            >
              {i < current ? (
                <CheckCircle2 className="w-4 h-4 text-black" />
              ) : (
                <span
                  className={`text-[10px] font-black ${i === current ? 'text-black' : 'text-foreground/20'}`}
                >
                  {i + 1}
                </span>
              )}
            </motion.div>
            <span
              className={`text-[8px] font-black uppercase tracking-widest transition-colors ${i === current ? 'text-primary' : i < current ? 'text-primary/60' : 'text-foreground/20'}`}
            >
              {label}
            </span>
          </div>
          {i < total - 1 && (
            <motion.div
              animate={{ opacity: i < current ? 1 : 0.15 }}
              className="w-8 h-0.5 bg-primary mb-5"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default memo(StepIndicator);
