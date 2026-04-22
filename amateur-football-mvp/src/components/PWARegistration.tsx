'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share, PlusSquare } from 'lucide-react';

export default function PWARegistration() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    // Check if app is already installed
    const _isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(_isStandalone);

    // Detect iOS
    const _isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(_isIOS);

    // If not standalone, we might want to show the prompt (delayed so it's not instantly annoying)
    const isDismissed = sessionStorage.getItem('pelotify_pwa_prompt_dismissed');
    if (!_isStandalone && !isDismissed) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000); // show after 5 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Handle beforeinstallprompt event for Chromium browsers
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) {
        setShowInstallPrompt(true);
      }
      console.log('App installable: beforeinstallprompt caught');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      window.addEventListener('load', () => {
        // Register main PWA service worker
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('PWA SW registered: ', registration.scope);
          })
          .catch((registrationError) => {
            console.log('PWA SW registration failed: ', registrationError);
          });

        // Register Firebase Cloud Messaging service worker
        navigator.serviceWorker
          .register('/firebase-messaging-sw.js')
          .then((registration) => {
            console.log('FCM SW registered: ', registration.scope);
          })
          .catch((registrationError) => {
            console.log('FCM SW registration failed: ', registrationError);
          });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    console.log('Install button clicked', { hasPrompt: !!deferredPrompt });
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install outcome:', outcome);
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback if prompt is missing but button is shown
      alert('Para instalar: Toca los tres puntos de tu navegador y selecciona "Instalar aplicación" o "Añadir a la pantalla de inicio".');
    }
  };

  // Store userId for widgets
  useEffect(() => {
    // We can't use useAuth directly here to avoid circular dependencies if any,
    // but we can check the window object or just assume it will be called from where user is available
    // Actually, I'll just check for a 'pelotify_userId' cookie or similar if I had one, 
    // but I can pass it from a parent or use a separate hook.
    // For now, let's just make sure we save it to localStorage whenever we have user session.
    const saveUserId = () => {
      try {
        const sessionStr = localStorage.getItem('sb-yidqdqxtzvymmshxwzvv-auth-token'); // Supabase default key pattern
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          const uid = session?.user?.id;
          if (uid) {
            localStorage.setItem('pelotify_widget_userId', uid);
          }
        }
      } catch (e) {
        console.error('Error saving userId for widgets', e);
      }
    };
    
    saveUserId();
    // Also listen for storage events to keep it synced
    window.addEventListener('storage', saveUserId);
    return () => window.removeEventListener('storage', saveUserId);
  }, []);

  const closePrompt = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('Close prompt clicked');
    setShowInstallPrompt(false);
    // Save preference to not show again in this session
    sessionStorage.setItem('pelotify_pwa_prompt_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showInstallPrompt && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-[80px] left-4 right-4 z-[9999] md:bottom-6 md:left-auto md:right-6 md:w-96"
        >
          <div className="bg-background border border-border/50 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden backdrop-blur-xl bg-background/80">
            {/* Background glowing effect */}
            <div className="absolute -top-[50%] -right-[50%] w-[100%] h-[100%] bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
            
            <button 
              onClick={(e) => closePrompt(e)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-all p-2 cursor-pointer z-50 hover:bg-white/10 rounded-full"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 p-[2px] shadow-lg shrink-0">
                <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center overflow-hidden">
                  <img src="/icon-192.png" alt="Pelotify Logo" className="w-10 h-10 object-contain" />
                </div>
              </div>
              <div>
                <h3 className="font-kanit font-bold text-lg leading-tight">Instala Pelotify</h3>
                <p className="text-sm text-muted-foreground leading-snug">
                  Carga más rápido, funciona offline y sin barra de navegador.
                </p>
              </div>
            </div>

            <div className="mt-2 relative z-10 w-full">
              {isIOS && !deferredPrompt ? (
                <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground flex items-center gap-2">
                  <span>1. Toca</span> <Share size={14} className="text-foreground" />
                  <span>2. <strong>Añadir a inicio</strong></span> <PlusSquare size={14} className="text-foreground" />
                </div>
              ) : (
                <button 
                  onClick={() => handleInstallClick()} 
                  className="w-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  <Download className="mr-2 h-4 w-4" /> Instalar App
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
