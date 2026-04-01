'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Shield } from 'lucide-react';
import ChatRoom from './ChatRoom';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId?: string;
  recipientName?: string;
}

export default function ChatModal({ isOpen, onClose, recipientId, recipientName }: ChatModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl h-[80vh] bg-surface border border-foreground/10 rounded-[2rem] shadow-2xl relative z-10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-foreground/5 flex items-center justify-between bg-foreground/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-black text-foreground italic uppercase tracking-tighter leading-none">
                    Chat con {recipientName || 'Jugador'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest italic tracking-widest">
                      SeÃƒÂ±al Encriptada
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground/40 hover:text-foreground transition-all active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 min-h-0">
              <ChatRoom
                recipientId={recipientId}
                className="border-none rounded-none bg-transparent"
              />
            </div>

            {/* Footer / Tip */}
            <div className="p-4 bg-foreground/[0.01] border-t border-foreground/5 flex items-center justify-center gap-2">
              <Shield className="w-3 h-3 text-foreground/20" />
              <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">
                Ambiente Seguro & Fair Play
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
