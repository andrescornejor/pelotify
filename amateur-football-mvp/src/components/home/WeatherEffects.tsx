'use client';

import { motion } from 'framer-motion';
import { useSettings } from '@/contexts/SettingsContext';

export const WeatherEffects = () => {
  const { performanceMode } = useSettings();

  if (performanceMode) return null;

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden hidden md:block">
      {/* Ambient immersive gradients based on "good weather" / "dusk" */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 3 }}
        className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%]"
        style={{ background: 'radial-gradient(circle, #2cfc7d 0%, transparent 70%)' }}
      />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 4, delay: 0.5 }}
        className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%]"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.8) 0%, transparent 70%)' }}
      />

      {/* Floating particles (simulating dust or light fireflies for aesthetics) */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-primary/20"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  );
};
