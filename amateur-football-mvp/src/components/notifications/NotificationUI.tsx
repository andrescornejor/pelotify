'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ChevronRight, BellOff, BellRing, Sparkles } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Floating notification toast — appears when a foreground message arrives.
 */
export function NotificationToast() {
  const { showInApp, dismissInApp } = useNotifications();
  const router = useRouter();

  return (
    <AnimatePresence>
      {showInApp && (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -60, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-[calc(1rem+env(safe-area-inset-top,0px))] left-4 right-4 z-[9999] max-w-lg mx-auto"
        >
          <button
            onClick={() => {
              dismissInApp();
              if (showInApp.clickAction) {
                router.push(showInApp.clickAction);
              }
            }}
            className="w-full text-left"
          >
            <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-background/95 shadow-[0_20px_60px_rgba(44,252,125,0.12),0_0_0_1px_rgba(44,252,125,0.08)] dark:shadow-[0_20px_60px_rgba(44,252,125,0.2),0_0_0_1px_rgba(44,252,125,0.12)] p-4 backdrop-blur-xl">
              {/* Glow effect */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-start gap-3 relative z-10">
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                  <BellRing className="w-5 h-5 text-primary animate-bounce" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-foreground uppercase tracking-tight line-clamp-1">
                    {showInApp.title}
                  </p>
                  <p className="text-xs text-foreground/60 mt-0.5 line-clamp-2">
                    {showInApp.body}
                  </p>
                </div>

                {/* Close */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissInApp();
                  }}
                  className="w-7 h-7 rounded-lg bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center shrink-0 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-foreground/40" />
                </button>
              </div>

              {/* Progress bar */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 5, ease: 'linear' }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/40 origin-left"
              />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Notification permission prompt banner.
 * Shows when the user hasn't granted notification permission yet.
 */
export function NotificationPromptBanner() {
  const { isSupported, permission, requestPermission } = useNotifications();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Don't show if already granted, not supported, or dismissed
  if (!isSupported || permission === 'granted' || permission === 'denied' || isDismissed) {
    return null;
  }

  const handleEnable = async () => {
    setIsLoading(true);
    await requestPermission();
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/[0.08] p-4 mx-4 mb-4 backdrop-blur-md"
    >
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-foreground uppercase tracking-tight">
            🔔 Activar Notificaciones
          </p>
          <p className="text-[11px] text-foreground/50 mt-0.5">
            Recibí alertas de partidos, invitaciones y mensajes
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setIsDismissed(true)}
            className="text-[10px] font-bold text-foreground/30 hover:text-foreground/50 uppercase tracking-widest px-2 py-1.5 transition-colors"
          >
            No
          </button>
          <button
            onClick={handleEnable}
            disabled={isLoading}
            className="px-4 py-1.5 rounded-xl bg-primary text-background text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {isLoading ? '...' : 'Activar'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Notification bell icon for the navbar/sidebar.
 */
export function NotificationBell({ className }: { className?: string }) {
  const { permission, unreadCount, inAppNotifications, clearAll, requestPermission } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    if (permission !== 'granted') {
      await requestPermission();
      return;
    }
    setShowDropdown((prev) => !prev);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={handleClick}
        className={cn(
          'relative w-10 h-10 rounded-xl flex items-center justify-center transition-all',
          'hover:bg-foreground/5 active:scale-95',
          permission !== 'granted' && 'text-foreground/30'
        )}
        title={permission !== 'granted' ? 'Activar notificaciones' : 'Notificaciones'}
      >
        {permission === 'granted' ? (
          <Bell className="w-5 h-5 text-foreground/60" />
        ) : (
          <BellOff className="w-5 h-5" />
        )}

        {/* Unread badge */}
        {unreadCount > 0 && permission === 'granted' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-background text-[9px] font-black flex items-center justify-center shadow-lg shadow-primary/30"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-auto rounded-2xl border border-foreground/10 bg-background/95 shadow-[0_20px_60px_rgba(15,23,42,0.12)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] z-50 backdrop-blur-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/5">
                <p className="text-xs font-black text-foreground uppercase tracking-widest">
                  Notificaciones
                </p>
                {inAppNotifications.length > 0 && (
                  <button
                    onClick={() => { clearAll(); setShowDropdown(false); }}
                    className="text-[9px] font-bold text-primary uppercase tracking-widest hover:text-primary/70 transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Notifications list */}
              {inAppNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Sparkles className="w-8 h-8 text-foreground/10 mx-auto mb-2" />
                  <p className="text-xs text-foreground/30 font-medium">
                    No hay notificaciones
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-foreground/5">
                  {inAppNotifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => {
                        setShowDropdown(false);
                        if (notif.clickAction) {
                          router.push(notif.clickAction);
                        }
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-foreground/5 transition-colors group flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <BellRing className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground line-clamp-1">
                          {notif.title}
                        </p>
                        <p className="text-[10px] text-foreground/50 line-clamp-1 mt-0.5">
                          {notif.body}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-foreground/20 group-hover:text-foreground/40 shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
