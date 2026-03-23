'use client';

import { useState } from 'react';
import { Share2, Check, Link2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
  variant?: 'icon' | 'full';
}

export function ShareButton({
  title,
  text,
  url,
  className,
  variant = 'icon',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleShare = async () => {
    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch (err) {
        // User cancelled or error — fall through to clipboard
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fallback: copy to clipboard
    try {
      const shareText = `${text}\n${shareUrl}`;
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 2500);
    } catch {
      // Last resort fallback
      const textarea = document.createElement('textarea');
      textarea.value = `${text}\n${shareUrl}`;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 2500);
    }
  };

  if (variant === 'full') {
    return (
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className={cn(
            'flex items-center gap-3 h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all',
            copied
              ? 'bg-primary/20 text-primary border border-primary/20'
              : 'bg-foreground/5 border border-foreground/10 text-foreground/60 hover:text-primary hover:border-primary/20 hover:bg-primary/5',
            className
          )}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>¡Enlace Copiado!</span>
              </motion.div>
            ) : (
              <motion.div
                key="share"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartir</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1, rotate: 8 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleShare}
        className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center border transition-all',
          copied
            ? 'bg-primary/20 border-primary/30 text-primary shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            : 'bg-foreground/5 border-foreground/10 text-foreground/40 hover:text-primary hover:border-primary/20 hover:bg-primary/5',
          className
        )}
        aria-label="Compartir"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
            >
              <Check className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div
              key="share"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Share2 className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Floating toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap z-50"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black text-[9px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 border border-primary/30">
              <Link2 className="w-3 h-3" />
              Enlace copiado
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
