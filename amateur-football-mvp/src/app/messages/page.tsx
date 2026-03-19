'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRecentChats } from '@/lib/chat';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search, Loader2, User as UserIcon, Send, Clock, ChevronRight, Shield } from 'lucide-react';
import ChatRoom from '@/components/ChatRoom';
import { cn } from '@/lib/utils';

export default function MessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChat, setSelectedChat] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user) return;
        const loadChats = async () => {
            setIsLoading(true);
            const chats = await getRecentChats(user.id);
            setConversations(chats);
            setIsLoading(false);
        };
        loadChats();
    }, [user]);

    const filteredConversations = conversations.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background pt-24 pb-32 px-4 sm:px-6 lg:px-12 xl:px-24">
            <div className="max-w-7xl mx-auto h-[75vh] grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Conversations List */}
                <div className={cn(
                    "lg:col-span-4 flex flex-col gap-6 transition-all",
                    selectedChat ? "hidden lg:flex" : "flex"
                )}>
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black text-foreground italic uppercase tracking-tighter leading-none">Mensajes</h1>
                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em] mb-4">Central de Comunicaciones</span>
                        
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar Jugador..."
                                className="w-full h-14 pl-14 pr-6 bg-foreground/[0.03] border border-foreground/5 rounded-3xl outline-none text-sm font-bold placeholder:text-foreground/20 focus:border-primary/20 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando...</span>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-20">
                                <MessageSquare className="w-12 h-12" />
                                <p className="text-sm font-black uppercase tracking-widest">No hay chats activos</p>
                            </div>
                        ) : (
                            filteredConversations.map((chat) => (
                                <motion.button
                                    key={chat.userId}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedChat(chat)}
                                    className={cn(
                                        "w-full p-4 rounded-[2rem] border transition-all flex items-center gap-4 group text-left",
                                        selectedChat?.userId === chat.userId
                                            ? "bg-primary text-black border-primary shadow-lg shadow-primary/20"
                                            : "bg-foreground/[0.02] border-foreground/5 hover:border-foreground/10"
                                    )}
                                >
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2",
                                        selectedChat?.userId === chat.userId ? "border-black/20" : "border-foreground/5 ring-4 ring-foreground/[0.02]"
                                    )}>
                                        {chat.avatar_url ? (
                                            <img src={chat.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                                                <UserIcon className="w-6 h-6 opacity-40" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h4 className="font-black text-[13px] uppercase tracking-tighter truncate italic">
                                                {chat.name}
                                            </h4>
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-widest",
                                                selectedChat?.userId === chat.userId ? "text-black/40" : "text-foreground/20"
                                            )}>
                                                {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className={cn(
                                            "text-[11px] font-bold truncate tracking-tight mb-1",
                                            selectedChat?.userId === chat.userId ? "text-black/60" : "text-foreground/45"
                                        )}>
                                            {chat.lastMessage}
                                        </p>
                                    </div>
                                    <ChevronRight className={cn(
                                        "w-4 h-4 transition-transform",
                                        selectedChat?.userId === chat.userId ? "text-black/40" : "text-foreground/10 group-hover:translate-x-1"
                                    )} />
                                </motion.button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={cn(
                    "lg:col-span-8 h-full min-h-0 transition-all",
                    !selectedChat ? "hidden lg:flex items-center justify-center" : "flex flex-col"
                )}>
                    {selectedChat ? (
                        <div className="flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-4 lg:hidden">
                                <button 
                                    onClick={() => setSelectedChat(null)}
                                    className="p-3 bg-foreground/5 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                                >
                                    Volver
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-foreground/10">
                                        {selectedChat.avatar_url ? (
                                            <img src={selectedChat.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-foreground/5 flex items-center justify-center">
                                                <UserIcon className="w-4 h-4 opacity-40" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-black uppercase italic tracking-tighter">{selectedChat.name}</span>
                                </div>
                            </div>
                            <ChatRoom 
                                recipientId={selectedChat.userId} 
                                title={`Chat Privado // ${selectedChat.name}`}
                                className="flex-1"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center space-y-8 opacity-20">
                             <div className="w-32 h-32 rounded-[3.5rem] bg-foreground/[0.02] border border-foreground/5 flex items-center justify-center relative">
                                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                                <MessageSquare className="w-12 h-12 relative z-10" />
                             </div>
                             <div className="space-y-4">
                                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Selecciona un Chat</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">
                                    Conecta con otros jugadores para organizar el próximo partido
                                </p>
                             </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
