'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, MessageCircle, Twitter, Facebook, Link as LinkIcon, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  text: string;
  type: 'post' | 'futtok';
  authorName: string;
  authorAvatar?: string | null;
  contentPreview?: string | null;
  imagePreview?: string | null;
}

export default function ShareModal({
  isOpen,
  onClose,
  url,
  title,
  text,
  type,
  authorName,
  authorAvatar,
  contentPreview,
  imagePreview
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleShareWhatsApp = () => {
    const textToShare = `${title}\n\n${text}\n\nMiralo acá: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(textToShare)}`, '_blank');
  };

  const handleShareTwitter = () => {
    const textToShare = `${title}\n\n${text}\n\n`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(textToShare)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleShareNative = async () => {
    try {
      if (navigator.share && navigator.canShare?.({ url, title, text })) {
        await navigator.share({ url, title, text });
      } else {
        handleCopyLink();
      }
    } catch (err) {
      console.error('Error sharing native', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ y: '100%', opacity: 1, sm: { opacity: 0, scale: 0.95 } }}
              animate={{ y: 0, opacity: 1, sm: { opacity: 1, scale: 1 } }}
              exit={{ y: '100%', opacity: 1, sm: { opacity: 0, scale: 0.95 } }}
              transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
              className="w-full sm:w-full sm:max-w-md bg-background border border-foreground/10 sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-foreground/[0.06] flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <h3 className="text-xl font-black italic uppercase font-kanit tracking-tight text-foreground">
                  Compartir
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-foreground/[0.05] transition-colors active:scale-95"
                >
                  <X className="w-5 h-5 text-foreground/60" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto overflow-x-hidden flex flex-col gap-6">
                {/* Preview Card */}
                <div className="p-4 rounded-3xl bg-foreground/[0.03] border border-foreground/[0.06] flex gap-4 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                    {type === 'futtok' ? <svg className="w-16 h-16 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M21 11.5v-1a1.5 1.5 0 00-1.5-1.5H19v-1a1.5 1.5 0 00-1.5-1.5H16v-1a1.5 1.5 0 00-1.5-1.5h-1a1.5 1.5 0 00-1.5 1.5v1h-1.5A1.5 1.5 0 009 6.5v1H7.5A1.5 1.5 0 006 9v1H4.5A1.5 1.5 0 003 11.5v1A1.5 1.5 0 004.5 14H6v1a1.5 1.5 0 001.5 1.5H9v1a1.5 1.5 0 001.5 1.5h1A1.5 1.5 0 0013 17.5v-1h1.5a1.5 1.5 0 001.5-1.5v-1H19v-1a1.5 1.5 0 001.5-1.5h.5A1.5 1.5 0 0022 9.5v-1a1.5 1.5 0 00-1-1.42z" /></svg> : <Send className="w-16 h-16 text-primary" />}
                  </div>

                  {/* Thumbnail / Image if present */}
                  {imagePreview && (
                    <div className={cn(
                      "shrink-0 bg-foreground/5 overflow-hidden",
                      type === 'futtok' ? "w-20 h-32 rounded-lg" : "w-20 h-20 rounded-xl"
                    )}>
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Preview preview" />
                    </div>
                  )}

                  <div className="flex flex-col min-w-0 flex-1 justify-center z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-foreground/10 shrink-0">
                        {authorAvatar ? (
                          <img src={authorAvatar} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-primary">
                            {authorName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-sm text-foreground truncate">{authorName}</span>
                    </div>
                    {contentPreview && (
                      <p className="text-sm text-foreground/70 line-clamp-2 leading-snug">
                        {contentPreview}
                      </p>
                    )}
                    <span className="text-xs text-primary font-bold mt-2 font-kanit uppercase tracking-wider">
                      {type === 'futtok' ? 'FutTok Destacado' : 'Post Social'}
                    </span>
                  </div>
                </div>

                {/* Share Options Row */}
                <div className="w-full">
                  <p className="font-bold text-sm text-foreground/50 mb-3 ml-2">Compartir en...</p>
                  
                  {/* Share Apps Horizontal Scroll */}
                  <div className="flex overflow-x-auto gap-4 pb-2 px-2 snap-x snap-mandatory no-scrollbar hide-scroll">
                    
                    <button 
                      onClick={handleShareWhatsApp}
                      className="snap-start shrink-0 w-[72px] flex flex-col items-center gap-2 group"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg group-active:scale-90 transition-transform">
                        <MessageCircle className="w-7 h-7 text-white fill-white" />
                      </div>
                      <span className="text-[11px] font-semibold text-foreground/70">WhatsApp</span>
                    </button>

                    <button 
                      onClick={handleShareTwitter}
                      className="snap-start shrink-0 w-[72px] flex flex-col items-center gap-2 group"
                    >
                      <div className="w-14 h-14 rounded-full bg-black border border-white/20 flex items-center justify-center shadow-lg group-active:scale-90 transition-transform">
                        {/* Custom X Logo */}
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-white">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.964H5.078z"></path>
                        </svg>
                      </div>
                      <span className="text-[11px] font-semibold text-foreground/70">Social X</span>
                    </button>

                    <button 
                      onClick={handleShareNative}
                      className="snap-start shrink-0 w-[72px] flex flex-col items-center gap-2 group"
                    >
                      <div className="w-14 h-14 rounded-full bg-foreground/10 border border-foreground/10 flex items-center justify-center shadow-lg group-active:scale-90 transition-transform">
                        <Send className="w-6 h-6 text-foreground" />
                      </div>
                      <span className="text-[11px] font-semibold text-foreground/70">Más...</span>
                    </button>

                  </div>
                </div>

                {/* Copy Link Section */}
                <div className="mt-2">
                   <p className="font-bold text-sm text-foreground/50 mb-3 ml-2">O copiá el enlace</p>
                   <div 
                      onClick={handleCopyLink}
                      className="w-full flex items-center justify-between p-1.5 pl-4 bg-foreground/[0.03] border border-foreground/[0.08] hover:border-primary/50 rounded-2xl cursor-pointer group transition-colors"
                    >
                      <div className="flex-1 truncate text-sm text-foreground/60 mr-4 font-medium select-none">
                        {url}
                      </div>
                      <div className={cn(
                        "p-3 rounded-xl transition-all flex items-center gap-2 font-bold text-sm",
                        copied ? "bg-primary text-background" : "bg-foreground/10 text-foreground group-hover:bg-primary group-hover:text-background"
                      )}>
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copiar</span>
                          </>
                        )}
                      </div>
                   </div>
                </div>
              </div>

              {/* Bottom SafeArea */}
              <div className="h-6 sm:hidden" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
