'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRecentChats, subscribeToDirectMessages } from '@/lib/chat';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, X, Minimize2, Maximize2, Send, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import ChatRoom from './ChatRoom';

export function FloatingChat() {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [activeChats, setActiveChats] = useState<any[]>([]); 
  const [isMinimized, setIsMinimized] = useState(false);

  const fetchChats = async () => {
    if (!user) return;
    try {
      const recent = await getRecentChats(user.id);
      setChats(recent.slice(0, 8));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchChats();
    const channel = subscribeToDirectMessages(user.id, () => fetchChats());
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const openChat = (chat: any) => {
    if (!activeChats.find(c => c.userId === chat.userId)) {
      // Limit to 3 open chats for UI sanity
      setActiveChats(prev => [chat, ...prev].slice(0, 3));
    }
    setIsMinimized(false);
  };

  const closeChat = (userId: string) => {
    setActiveChats(prev => prev.filter(c => c.userId !== userId));
  };

  if (!user) return null;

  return (
    <div className="hidden lg:flex fixed bottom-0 right-8 z-[100] items-end gap-4 pointer-events-none">
      {/* --- CHAT WINDOWS --- */}
      <div className="flex items-end gap-4 pointer-events-auto">
        <AnimatePresence>
          {activeChats.map((chat) => (
            <motion.div
              key={chat.userId}
              initial={{ y: 400, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 400, opacity: 0 }}
              className="w-80 bg-surface border border-foreground/10 rounded-t-[2rem] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden"
              style={{ height: '450px' }}
            >
              {/* Header */}
              <div className="p-4 border-b border-foreground/5 flex items-center justify-between bg-primary/10">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl overflow-hidden border border-primary/20">
                      {chat.avatar_url ? (
                        <img src={chat.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-surface-elevated flex items-center justify-center">
                          <User className="w-4 h-4 text-foreground/20" />
                        </div>
                      )}
                   </div>
                   <div className="flex flex-col">
                      <h4 className="text-[11px] font-black uppercase italic tracking-tighter text-foreground leading-none">
                        {chat.name}
                      </h4>
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-0.5">En Línea</span>
                   </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => closeChat(chat.userId)}
                    className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-foreground/40" />
                  </button>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 min-h-0 bg-background/50">
                 <ChatRoom 
                   recipientId={chat.userId} 
                   className="border-none rounded-none bg-transparent"
                 />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- CONTACT RAIL (Right Edge) --- */}
      <div className="flex flex-col gap-3 py-6 pointer-events-auto">
        <div className="flex flex-col items-center gap-4 bg-background/40 backdrop-blur-3xl p-3 rounded-full border border-white/10 shadow-2xl mb-4">
           {chats.map((chat) => (
             <motion.button
               key={chat.userId}
               whileHover={{ scale: 1.1, x: -5 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => openChat(chat)}
               className="relative group"
             >
                <div 
                   className={cn(
                     "w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all duration-300",
                     chat.isUnread ? "border-primary shadow-[0_0_15px_rgba(44,252,125,0.4)] animate-pulse" : "border-white/10 hover:border-primary/50"
                   )}
                >
                  {chat.avatar_url ? (
                    <img src={chat.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-surface-elevated flex items-center justify-center">
                      <User className="w-6 h-6 text-foreground/20" />
                    </div>
                  )}
                </div>

                {/* Status Dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-background shadow-lg" />

                {/* Tooltip on left */}
                <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-95 group-hover:scale-100 whitespace-nowrap shadow-xl">
                    {chat.name}
                    <div className="absolute left-full top-1/2 -translate-y-1/2 w-2 h-2 bg-foreground rotate-45 -ml-1" />
                </div>
             </motion.button>
           ))}

           <div className="w-8 h-[1px] bg-white/10 my-1" />

           <motion.button 
             whileHover={{ scale: 1.1 }}
             className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group"
           >
              <MessageSquare className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
           </motion.button>
        </div>
      </div>
    </div>
  );
}
