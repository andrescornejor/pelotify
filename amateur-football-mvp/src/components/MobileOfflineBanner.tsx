'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

/**
 * MobileOfflineBanner shows a subtle indicator when the user loses connectivity.
 */
export function MobileOfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Show "back online" for a few seconds
      setTimeout(() => setWasOffline(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {(isOffline || wasOffline) && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-[max(1rem,env(safe-area-inset-top,0px))] left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-xs"
        >
          <div className={cn(
            "rounded-full px-4 py-2 flex items-center justify-center gap-2 shadow-2xl border backdrop-blur-md",
            isOffline 
              ? "bg-red-500/90 text-white border-red-400/20" 
              : "bg-green-500/90 text-white border-green-400/20"
          )}>
            {isOffline ? (
              <>
                <WifiOff className="w-4 h-4 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">Sin conexión</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Conectado</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Internal helper for cn since this is a new file and I don't want to rely on imports matching perfectly
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
