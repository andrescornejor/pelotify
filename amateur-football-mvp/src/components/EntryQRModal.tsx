'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, UserCheck } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface EntryQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantId: string;
  playerName: string;
  matchTitle: string;
}

export default function EntryQRModal({ 
  isOpen, 
  onClose, 
  participantId, 
  playerName,
  matchTitle 
}: EntryQRModalProps) {
  // Use prefix "checkin-player:" that matches what scan code expects for generic checkins
  const qrValue = `checkin-player:${participantId}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
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
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
                  Pase de Entrada
                </h2>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                   Validar con el encargado
                </p>
              </div>
            </div>

            <div className="p-6 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(255,255,255,0.15)] relative group">
               <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] animate-pulse group-hover:opacity-0 transition-opacity" />
               <QRCodeCanvas 
                 value={qrValue} 
                 size={220} 
                 level="H" 
                 includeMargin={false}
               />
            </div>

            <div className="space-y-6 w-full">
              <div className="space-y-1">
                <p className="text-xs font-black text-white italic uppercase tracking-tight">
                  {playerName}
                </p>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] truncate max-w-[200px] mx-auto">
                  {matchTitle}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-[10px] font-bold text-white/60 leading-tight">
                    Mostrá este QR al llegar a la sede para confirmar tu asistencia al partido.
                  </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
