'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRecentChats, subscribeToDirectMessages } from '@/lib/chat';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  User, 
  X, 
  Minimize2, 
  Maximize2, 
  Send, 
  Shield,
  ChevronUp,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import ChatRoom from './ChatRoom';

/**
 * REDESIGNED FLOATING CHAT SYSTEM
 * Features: Cinematic rail, glassmorphism windows, and haptic-feel interactions.
 */

export function FloatingChat() {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [activeChats, setActiveChats] = useState<any[]>([]); 
  const [minimizedChats, setMinimizedChats] = useState<string[]>([]);
  const [isRailOpen, setIsRailOpen] = useState(true);

  const fetchChats = async () => {
    if (!user) return;
    try {
      const recent = await getRecentChats(user.id);
      setChats(recent.slice(0, 10));
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

  // Derived processed chats list
  const processedChats = useMemo(() => {
    return chats.map(chat => {
      const isActive = activeChats.some(ac => ac.userId === chat.userId && !minimizedChats.includes(chat.userId));
      return isActive ? { ...chat, isUnread: false } : chat;
    });
  }, [chats, activeChats, minimizedChats]);

  const openChat = (chat: any) => {
    if (!activeChats.find(c => c.userId === chat.userId)) {
      setActiveChats(prev => [chat, ...prev].slice(0, 3));
    }
    // Remove from minimized if present
    setMinimizedChats(prev => prev.filter(id => id !== chat.userId));
    
    // Optimistically mark as read in UI to remove !
    setChats(prev => prev.map(c => c.userId === chat.userId ? { ...c, isUnread: false } : c));
    
    // Actual mark as read is handled in ChatRoom component, 
    // but we can also trigger a fetch shortly after
    setTimeout(fetchChats, 1000);
  };

  const closeChat = (userId: string) => {
    setActiveChats(prev => prev.filter(c => c.userId !== userId));
    setMinimizedChats(prev => prev.filter(id => id !== userId));
  };

  const toggleMinimize = (userId: string) => {
    setMinimizedChats(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  if (!user) return null;

  return (
    <div className="hidden lg:flex fixed bottom-0 right-10 z-[120] items-end gap-5 pointer-events-none pb-8">
      {/* --- CHAT WINDOWS --- */}
      <div className="flex items-end gap-5 pointer-events-auto">
        <AnimatePresence>
          {activeChats.map((chat) => {
            const isMinimized = minimizedChats.includes(chat.userId);
            
            return (
              <motion.div
                key={chat.userId}
                initial={{ y: 500, opacity: 0, scale: 0.9 }}
                animate={{ 
                  y: isMinimized ? 380 : 0, 
                  opacity: 1, 
                  scale: 1,
                  height: isMinimized ? '60px' : '500px'
                }}
                exit={{ y: 500, opacity: 0, scale: 0.9 }}
                className={cn(
                  "w-[340px] bg-background/80 backdrop-blur-[40px] border border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden transition-all duration-500",
                  isMinimized && "hover:translate-y-[-5px] cursor-pointer"
                )}
                onClick={isMinimized ? () => toggleMinimize(chat.userId) : undefined}
              >
                {/* Header */}
                <div 
                  className={cn(
                    "px-6 py-4 flex items-center justify-between relative z-20 group/header",
                    isMinimized ? "bg-primary/5" : "bg-foreground/[0.03] border-b border-foreground/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                       <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg">
                          {chat.avatar_url ? (
                            <img src={chat.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-surface-elevated flex items-center justify-center">
                              <User className="w-5 h-5 text-foreground/20" />
                            </div>
                          )}
                       </div>
                       <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background shadow-lg" />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-[13px] font-black uppercase italic tracking-tighter text-foreground leading-none">
                        {chat.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">En Línea</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleMinimize(chat.userId); }}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors text-foreground/40 hover:text-foreground"
                    >
                      {isMinimized ? <ChevronUp className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); closeChat(chat.userId); }}
                      className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-foreground/40 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Chat Body */}
                <AnimatePresence>
                  {!isMinimized && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 min-h-0 bg-transparent"
                    >
                       <ChatRoom 
                         recipientId={chat.userId} 
                         className="border-none rounded-none !bg-transparent !shadow-none"
                       />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* --- CONTACT RAIL (Right Dock) --- */}
      <div className="flex flex-col gap-4 pointer-events-auto mb-4">
        <motion.div 
          initial={false}
          animate={{ height: isRailOpen ? 'auto' : '64px' }}
          className="flex flex-col items-center gap-4 bg-background/50 backdrop-blur-[50px] p-2.5 rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden"
        >
           {/* Animated Gradient Border */}
           <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />

           <AnimatePresence>
             {isRailOpen && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 20 }}
                 className="flex flex-col gap-3.5 pt-2"
               >
                 {processedChats.map((chat) => (
                   <motion.button
                     key={chat.userId}
                     whileHover={{ scale: 1.15, x: -10 }}
                     whileTap={{ scale: 0.9 }}
                     onClick={() => openChat(chat)}
                     className="relative group transition-all"
                   >
                      <div 
                         className={cn(
                           "w-12 h-12 rounded-[1.25rem] overflow-hidden border-2 transition-all duration-500 relative",
                           chat.isUnread 
                             ? "border-primary shadow-[0_0_20px_rgba(44,252,125,0.6)] " 
                             : "border-white/10 group-hover:border-primary/60 group-hover:shadow-[0_0_15px_rgba(44,252,125,0.2)] bg-surface-elevated/40"
                         )}
                      >
                        {chat.avatar_url ? (
                          <img src={chat.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-foreground/20 group-hover:text-primary/40" />
                          </div>
                        )}
                        
                        {/* Pulse effect for unread messages */}
                        {chat.isUnread && (
                          <motion.div
                            animate={{ opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 bg-primary/20"
                          />
                        )}
                      </div>

                      {/* Presence Dot */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary border-[3px] border-background shadow-lg" />

                      {/* Premium Tooltip */}
                      <div className="absolute right-full mr-6 top-1/2 -translate-y-1/2 px-4 py-2 rounded-[1.25rem] bg-foreground text-background text-[11px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-5 group-hover:translate-x-0 whitespace-nowrap shadow-2xl backdrop-blur-3xl overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-background/5 to-transparent pointer-events-none" />
                          <span className="relative z-10 italic">{chat.name}</span>
                          <div className="absolute left-full top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rotate-45 -ml-1.5" />
                      </div>
                      
                      {/* Unread Message Peek (Compact) */}
                      {chat.isUnread && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black rounded-full text-[9px] font-black flex items-center justify-center border-2 border-background shadow-lg animate-bounce">
                           !
                        </div>
                      )}
                   </motion.button>
                 ))}
               </motion.div>
             )}
           </AnimatePresence>

           <div className="w-10 h-[1px] bg-white/5 my-1" />

           <motion.button 
             onClick={() => setIsRailOpen(!isRailOpen)}
             whileHover={{ scale: 1.1, rotate: isRailOpen ? 0 : 180 }}
             whileTap={{ scale: 0.9 }}
             className={cn(
               "w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all shadow-xl group mb-1",
               isRailOpen 
                 ? "bg-foreground/5 text-foreground/40 hover:bg-foreground/10" 
                 : "bg-primary text-black shadow-primary/30"
             )}
           >
              {isRailOpen ? (
                <ChevronUp className="w-5 h-5 rotate-180" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
           </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

