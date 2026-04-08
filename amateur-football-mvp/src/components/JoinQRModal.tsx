'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Share2, Copy, Check, Zap } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';

interface JoinQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  venueName: string;
}

export default function JoinQRModal({ isOpen, onClose, matchId, venueName }: JoinQRModalProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/match?id=${matchId}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `¡Unite al partido en ${venueName}!`,
          text: `Te invito a jugar en Pelotify. Sumate acá:`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 md:"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm glass-premium rounded-[3rem] border border-white/10 p-10 flex flex-col items-center text-center gap-8 shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/40" />
            </button>

            <div className="space-y-4 pt-4">
              <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
                  Invitar al Match
                </h2>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2">
                  Que nadie se quede afuera
                </p>
              </div>
            </div>

            <div className="p-6 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(255,255,255,0.15)] relative group">
               <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] animate-pulse group-hover:opacity-0 transition-opacity" />
               <QRCodeCanvas 
                 value={shareUrl} 
                 size={220} 
                 level="H" 
                 includeMargin={false}
                 imageSettings={{
                    src: "/icon.png",
                    x: undefined,
                    y: undefined,
                    height: 50,
                    width: 50,
                    excavate: true,
                 }}
               />
            </div>

            <div className="space-y-4 w-full">
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                Mostrá este código para que <br/> tus amigos se unan al instante
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                     const textToShare = `¡Unite al partido en ${venueName}!\n\nTe invito a jugar en Pelotify. Sumate acá:\n\n${shareUrl}`;
                     router.push(`/feed?shareText=${encodeURIComponent(textToShare)}`);
                     onClose();
                  }}
                  className="w-16 shrink-0 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95 overflow-hidden relative group"
                  title="Compartir en Vestuario"
                >
                   <Zap className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={handleCopy}
                  className="flex-1 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95 overflow-hidden relative"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="flex items-center gap-2 text-primary"
                      >
                        <Check className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Copiado</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="flex items-center gap-2 text-white/60"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Link</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                <button
                  onClick={handleShare}
                  className="flex-1 h-16 rounded-2xl bg-primary text-black flex items-center justify-center gap-3 hover:scale-105 transition-all active:scale-95 shadow-xl shadow-primary/20"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Compartir</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
