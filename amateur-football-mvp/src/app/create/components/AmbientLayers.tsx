'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';

const AmbientLayers = () => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.04, 0.07, 0.04] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-primary blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-500 blur-[120px]"
      />
      {/* Scanlines */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.01)_2px,rgba(255,255,255,0.01)_4px)]" />
    </div>
  );
};

export default memo(AmbientLayers);
