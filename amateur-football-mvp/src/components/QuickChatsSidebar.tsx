'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRecentChats, subscribeToDirectMessages } from '@/lib/chat';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, ChevronRight, X, Clock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChatModal from './ChatModal';

export function QuickChatsSidebar() {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChats = async () => {
    if (!user) return;
    try {
      const recent = await getRecentChats(user.id);
      setChats(recent.slice(0, 6)); // Show top 6
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchChats();

    const sub = subscribeToDirectMessages(user.id, () => {
      fetchChats();
    });

    return () => {
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      }
    };
  }, [user]);

  if (!user) return null;

  return (
    <>
      <div className="hidden xl:block fixed right-6 top-[120px] w-80 h-[calc(100vh-200px)] z-40">
        <div className="h-full flex flex-col">
          <div className="glass-premium p-6 rounded-[2.5rem] border-white/10 shadow-2xl flex flex-col h-full relative overflow-hidden group/sidebar bg-background/40 backdrop-blur-3xl">
            {/* Animated Glow Backdrop */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-1000" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[13px] font-black italic text-foreground uppercase tracking-tighter leading-none">
                    Chats Recientes
                  </h3>
                  <span className="text-[8px] font-black text-foreground/40 uppercase tracking-[0.3em] mt-1">
                    Respuesta Rápida
                  </span>
                </div>
              </div>
              {chats.some(c => c.isUnread) && (
                <div className="px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30">
                  <span className="text-[8px] font-black text-primary animate-pulse">NUEVO</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none relative z-10">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-20 rounded-3xl bg-foreground/[0.03] animate-pulse" />
                ))
              ) : chats.length > 0 ? (
                chats.map((chat) => (
                  <motion.button
                    key={chat.userId}
                    whileHover={{ x: 4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedChat(chat)}
                    className={cn(
                      "w-full p-4 rounded-3xl border transition-all duration-300 flex items-center gap-3 relative overflow-hidden group/chat",
                      chat.isUnread 
                        ? "bg-primary/5 border-primary/20 shadow-[0_10px_30px_rgba(44,252,125,0.05)]" 
                        : "bg-foreground/[0.02] border-white/5 hover:border-primary/20 hover:bg-foreground/[0.04]"
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-2xl overflow-hidden border border-white/10 group-hover/chat:border-primary/50 transition-colors">
                        {chat.avatar_url ? (
                          <img src={chat.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-surface-elevated flex items-center justify-center">
                            <User className="w-5 h-5 text-foreground/20" />
                          </div>
                        )}
                      </div>
                      {chat.isUnread && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border-2 border-background shadow-lg" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[11px] font-black uppercase italic tracking-tighter text-foreground truncate">
                          {chat.name}
                        </p>
                        <span className="text-[7px] font-black text-foreground/20 uppercase">
                          {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-foreground/40 font-medium truncate italic leading-none">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-4 opacity-40">
                  <MessageSquare className="w-10 h-10 text-foreground/10" />
                  <p className="text-[9px] font-black uppercase tracking-widest max-w-[140px]">
                    No hay chats todavía.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-foreground/5 relative z-10">
               <div className="flex items-center gap-2 opacity-30 px-2">
                  <Shield className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-[0.3em]">Ambiente Seguro</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <ChatModal 
        isOpen={!!selectedChat}
        onClose={() => setSelectedChat(null)}
        recipientId={selectedChat?.userId}
        recipientName={selectedChat?.name}
      />
    </>
  );
}
