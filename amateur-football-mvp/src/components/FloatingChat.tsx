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
  Circle,
  MessageCircle
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

  const totalUnread = processedChats.filter(c => c.isUnread).length;

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
    <div className="hidden lg:flex fixed bottom-0 right-10 z-[120] items-end gap-6 pointer-events-none pb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* --- CHAT WINDOWS --- */}
      <div className="flex items-end gap-6 pointer-events-auto">
        <AnimatePresence>
          {activeChats.map((chat) => {
            const isMinimized = minimizedChats.includes(chat.userId);
            
            return (
              <motion.div
                key={chat.userId}
                initial={{ y: 500, opacity: 0, scale: 0.8 }}
                animate={{ 
                  y: isMinimized ? 400 : 0, 
                  opacity: 1, 
                  scale: 1,
                  height: isMinimized ? '72px' : '520px'
                }}
                exit={{ y: 500, opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className={cn(
                  "w-[360px] bg-[#0A0A0A]/90 backdrop-blur-[50px] border border-white/10 rounded-[2rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden transition-all duration-500",
                  isMinimized && "hover:-translate-y-2 cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                )}
                onClick={isMinimized ? () => toggleMinimize(chat.userId) : undefined}
              >
                {/* Header */}
                <div 
                  className={cn(
                    "px-6 py-4 flex items-center justify-between relative z-20 group/header transition-colors",
                    isMinimized ? "bg-white/5" : "bg-white/[0.02] border-b border-white/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                       <div className="w-11 h-11 rounded-[1.25rem] overflow-hidden border border-white/10 shadow-lg bg-surface flex items-center justify-center">
                          {chat.avatar_url ? (
                            <img src={chat.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-white/40" />
                          )}
                       </div>
                       <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#2CFC7D] border-[3px] border-[#0A0A0A] shadow-lg shadow-[#2CFC7D]/20" />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-[14px] font-bold text-white leading-tight">
                        {chat.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2CFC7D] animate-pulse" />
                        <span className="text-[10px] font-semibold text-[#2CFC7D] uppercase tracking-wider">En Línea</span>
                      </div>
                    </div>
                  </div>

                  <div className={cn("flex items-center gap-1.5 transition-opacity", !isMinimized && "opacity-0 group-hover/header:opacity-100")}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleMinimize(chat.userId); }}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                    >
                      {isMinimized ? <ChevronUp className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); closeChat(chat.userId); }}
                      className="p-2 hover:bg-red-500/20 rounded-full transition-colors text-white/50 hover:text-red-400"
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
                      className="flex-1 min-h-0 bg-transparent flex flex-col"
                    >
                       <ChatRoom 
                         recipientId={chat.userId} 
                         className="border-none rounded-none !bg-transparent !shadow-none flex-1"
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
      <div className="flex flex-col gap-4 pointer-events-auto">
        <motion.div 
          initial={false}
          animate={{ height: isRailOpen ? 'auto' : '64px' }}
          className="flex flex-col items-center gap-2 bg-[#121212]/80 backdrop-blur-[40px] p-2 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden relative"
        >
           {/* Edge Lighting Context */}
           <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

           <AnimatePresence>
             {isRailOpen && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 transition={{ duration: 0.2 }}
                 className="flex flex-col gap-3 pt-2 w-full items-center"
               >
                 {processedChats.length === 0 ? (
                    <div className="w-12 h-12 flex items-center justify-center opacity-30">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                 ) : (
                   processedChats.map((chat) => (
                     <motion.button
                       key={chat.userId}
                       whileHover={{ scale: 1.1, x: -4 }}
                       whileTap={{ scale: 0.95 }}
                       onClick={() => openChat(chat)}
                       className="relative group transition-all"
                     >
                        <div 
                           className={cn(
                             "w-12 h-12 rounded-[1.2rem] overflow-hidden border-[1.5px] transition-all duration-300 relative flex items-center justify-center bg-white/5",
                             chat.isUnread 
                               ? "border-[#2CFC7D] shadow-[0_0_20px_rgba(44,252,125,0.4)]" 
                               : "border-white/10 group-hover:border-white/30"
                           )}
                        >
                          {chat.avatar_url ? (
                            <img src={chat.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className={cn("w-5 h-5 transition-colors", chat.isUnread ? "text-[#2CFC7D]" : "text-white/40")} />
                          )}
                          
                          {chat.isUnread && (
                            <div className="absolute inset-0 bg-[#2CFC7D]/10 animate-pulse" />
                          )}
                        </div>

                        {/* Unread Alert Dot/Number */}
                        {chat.isUnread && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#2CFC7D] rounded-full flex items-center justify-center border-2 border-[#121212] shadow-lg animate-pulse" />
                        )}

                        {/* Presence Dot */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#2CFC7D] border-[2.5px] border-[#121212]" />

                        {/* Premium Tooltip */}
                        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2.5 rounded-2xl bg-white text-black font-semibold text-[13px] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-4 group-hover:translate-x-0 whitespace-nowrap shadow-2xl z-50">
                            {chat.name}
                            <div className="absolute left-full top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 -ml-1.5" />
                        </div>
                     </motion.button>
                   ))
                 )}

                 <div className="w-8 h-[1px] bg-white/10 my-2" />
               </motion.div>
             )}
           </AnimatePresence>

           <motion.button 
             onClick={() => setIsRailOpen(!isRailOpen)}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className={cn(
               "w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all duration-300 group relative",
               isRailOpen 
                 ? "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white" 
                 : "bg-[#2CFC7D] text-black shadow-[0_0_30px_rgba(44,252,125,0.3)]"
             )}
           >
              {isRailOpen ? (
                <ChevronUp className="w-5 h-5 transition-transform group-hover:translate-y-1" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
              
              {/* If rail is closed and there are unread messages, show notification dot */}
              {!isRailOpen && totalUnread > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#121212] shadow-lg animate-pulse" />
              )}
           </motion.button>
        </motion.div>
      </div>
    </div>
  );
}


