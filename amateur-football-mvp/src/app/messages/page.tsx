'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRecentChats, markAllDirectMessagesAsRead, subscribeToDirectMessages } from '@/lib/chat';
import { getFriends } from '@/lib/friends';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search, Loader2, User as UserIcon, Send, Clock, ChevronRight, Shield, UserPlus, X, Plus } from 'lucide-react';
import ChatRoom from '@/components/ChatRoom';
import { cn } from '@/lib/utils';

export default function MessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [friends, setFriends] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChat, setSelectedChat] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        if (!user) return;
        
        const markAll = async () => {
            await markAllDirectMessagesAsRead(user.id);
        };
        
        markAll();

        const loadData = async () => {
            setIsLoading(true);
            try {
                const [chats, friendsList] = await Promise.all([
                    getRecentChats(user.id),
                    getFriends(user.id)
                ]);
                setConversations(chats);
                setFriends(friendsList.map(f => ({
                    userId: f.profiles?.id,
                    name: f.profiles?.name,
                    avatar_url: f.profiles?.avatar_url
                })));
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();

        // Subscribe to changes to refresh the list
        const channel = supabase
            .channel('messages-page-refresh')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'direct_messages'
                },
                (payload: any) => {
                    // Refresh if the message involves the user
                    if (payload.new && (payload.new.recipient_id === user.id || payload.new.sender_id === user.id)) {
                        loadData();
                        // If we are on this page, keep it clean
                        markAll();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, user?.id]);

    const filteredConversations = conversations.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const availableFriends = friends.filter(f => 
        !conversations.some(c => c.userId === f.userId) &&
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background pt-32 lg:pt-36 pb-32 px-4 sm:px-6 lg:px-12 xl:px-24">
            <div className="max-w-7xl mx-auto h-[80vh] grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Conversations List */}
                <div className={cn(
                    "lg:col-span-4 flex flex-col gap-6 transition-all h-full overflow-hidden",
                    selectedChat ? "hidden lg:flex" : "flex"
                )}>
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-4xl font-black text-foreground italic uppercase tracking-tighter leading-none">Mensajes</h1>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Central de Comunicaciones</span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsSearchOpen(true)}
                                className="w-12 h-12 rounded-[1.25rem] bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/20"
                            >
                                <Plus className="w-6 h-6" />
                            </motion.button>
                        </div>
                        
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filtrar Mensajes..."
                                className="w-full h-14 pl-14 pr-6 bg-foreground/[0.03] border border-foreground/5 rounded-[1.5rem] outline-none text-sm font-bold placeholder:text-foreground/20 focus:border-primary/20 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 no-scrollbar">
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="w-full h-24 rounded-[1.5rem] bg-foreground/[0.03] border border-foreground/5 animate-pulse" />
                            ))
                        ) : (
                            <>
                                {filteredConversations.length === 0 && availableFriends.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-20">
                                        <MessageSquare className="w-12 h-12" />
                                        <p className="text-sm font-black uppercase tracking-widest leading-relaxed">No hay chats activos<br/>ni amigos encontrados</p>
                                    </div>
                                ) : (
                                    <>
                                        {filteredConversations.map((chat) => (
                                            <motion.button
                                                key={chat.userId}
                                                whileHover={{ x: 4, scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={async () => {
                                                    setSelectedChat(chat);
                                                    setConversations(prev => prev.map(c => 
                                                        c.userId === chat.userId ? { ...c, isUnread: false } : c
                                                    ));
                                                    if (user) await markAllDirectMessagesAsRead(user.id);
                                                }}
                                                className={cn(
                                                    "w-full p-4 rounded-[1.5rem] border transition-all flex items-center gap-4 group text-left",
                                                    selectedChat?.userId === chat.userId
                                                        ? "bg-primary text-black border-primary shadow-xl shadow-primary/10"
                                                        : "bg-surface border-foreground/5 hover:border-foreground/10"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-14 h-14 rounded-[1.1rem] overflow-hidden shrink-0 border-2",
                                                    selectedChat?.userId === chat.userId ? "border-black/20" : "border-foreground/5 ring-4 ring-foreground/[0.02]"
                                                )}>
                                                    {chat.avatar_url ? (
                                                        <img src={chat.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                                                            <UserIcon className="w-6 h-6 opacity-40 text-foreground" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <h4 className="font-black text-[13px] uppercase tracking-tighter truncate italic">
                                                            {chat.name}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            {chat.isUnread && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                                            )}
                                                            <span className={cn(
                                                                "text-[8px] font-black uppercase tracking-widest",
                                                                selectedChat?.userId === chat.userId ? "text-black/40" : "text-foreground/20"
                                                            )}>
                                                                {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className={cn(
                                                        "text-[11px] font-bold truncate tracking-tight mb-1",
                                                        selectedChat?.userId === chat.userId ? "text-black/60" : "text-foreground/45"
                                                    )}>
                                                        {chat.lastMessage}
                                                    </p>
                                                </div>
                                            </motion.button>
                                        ))}
                                        
                                        {/* Show Friends in Search */}
                                        {searchQuery && availableFriends.length > 0 && (
                                            <div className="pt-4 space-y-3">
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 pl-4">Amigos Sugeridos</span>
                                                {availableFriends.map((friend) => (
                                                    <motion.button
                                                        key={friend.userId}
                                                        whileHover={{ x: 4, scale: 1.01 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => {
                                                            setSelectedChat({
                                                                userId: friend.userId,
                                                                name: friend.name,
                                                                avatar_url: friend.avatar_url,
                                                                lastMessage: 'Iniciar conversación...',
                                                                timestamp: new Date().toISOString()
                                                            });
                                                            setSearchQuery('');
                                                        }}
                                                        className="w-full p-4 rounded-[1.5rem] border border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all flex items-center gap-4 group text-left"
                                                    >
                                                        <div className="w-14 h-14 rounded-[1.1rem] overflow-hidden shrink-0 border-2 border-primary/20 relative">
                                                            {friend.avatar_url ? (
                                                                <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                                                    <UserIcon className="w-6 h-6 text-primary" />
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-black text-[13px] uppercase tracking-tighter text-foreground italic">{friend.name}</h4>
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary italic">Enviar primer mensaje</p>
                                                        </div>
                                                        <Plus className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </motion.button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={cn(
                    "lg:col-span-8 h-full flex flex-col min-h-0",
                    !selectedChat ? "hidden lg:flex" : "flex"
                )}>
                    {selectedChat ? (
                        <div className="flex flex-col h-full glass-premium border border-foreground/5 rounded-[2.5rem] overflow-hidden relative">
                            {/* Chat Header */}
                            <div className="px-6 sm:px-10 py-5 bg-foreground/[0.03] backdrop-blur-xl border-b border-foreground/5 flex items-center justify-between relative z-20">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setSelectedChat(null)}
                                        className="lg:hidden p-3 bg-foreground/5 rounded-2xl"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl shadow-primary/5">
                                            {selectedChat.avatar_url ? (
                                                <img src={selectedChat.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary">
                                                    <UserIcon className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-black uppercase italic tracking-tighter text-foreground leading-none">{selectedChat.name}</h3>
                                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary">Conexión Segura</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] hidden sm:block">Activo Ahora</span>
                                </div>
                            </div>

                            <ChatRoom 
                                recipientId={selectedChat.userId} 
                                className="flex-1 !bg-transparent !border-0 !rounded-none !shadow-none"
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 glass-premium border border-foreground/5 rounded-[2.5rem] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-1000"
                                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(44,252,125,0.08) 0%, transparent 70%)' }} />
                            
                             <div className="relative">
                                <motion.div 
                                    animate={{ 
                                        scale: [1, 1.05, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                                    className="w-40 h-40 rounded-[3.5rem] bg-foreground/[0.02] border border-foreground/5 flex items-center justify-center relative shadow-2xl"
                                >
                                    <MessageSquare className="w-16 h-16 text-primary drop-shadow-[0_4px_20px_rgba(44,252,125,0.4)]" />
                                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-primary rounded-2xl border-4 border-background flex items-center justify-center shadow-xl">
                                        <Plus className="w-5 h-5 text-black" />
                                    </div>
                                </motion.div>
                             </div>

                             <div className="space-y-4 relative z-10">
                                <h3 className="text-3xl font-black uppercase tracking-tighter italic text-foreground leading-none">Inicia la <br/> Jugada</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/30 max-w-xs mx-auto leading-relaxed">
                                    Conecta con otros jugadores <br/> para organizar el próximo partido
                                </p>
                             </div>

                             <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsSearchOpen(true)}
                                className="px-8 h-14 bg-foreground text-background font-black italic text-xs uppercase tracking-[0.3em] rounded-2xl relative z-10 shadow-2xl hover:bg-primary hover:text-black transition-all"
                             >
                                NUEVO MENSAJE
                             </motion.button>
                        </div>
                    )}
                </div>

                {/* New Message / Friend Search Modal */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSearchOpen(false)}
                                className="absolute inset-0 bg-background/80 backdrop-blur-2xl"
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                                className="relative w-full max-w-lg bg-surface border border-foreground/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 sm:p-10 shadow-2xl overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <MessageSquare className="w-32 h-32" />
                                </div>

                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="space-y-1">
                                        <h3 className="text-3xl font-black italic text-foreground uppercase tracking-tighter leading-none">Nueva Conversación</h3>
                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Tus Amigos de Pelotify</p>
                                    </div>
                                    <button 
                                        onClick={() => setIsSearchOpen(false)}
                                        className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <div className="relative group">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="BUSCAR EN TUS AMIGOS..."
                                            className="w-full h-16 pl-14 pr-6 bg-foreground/[0.04] border border-foreground/10 rounded-[1.5rem] outline-none text-sm font-black uppercase tracking-wider text-foreground placeholder:text-foreground/20 focus:border-primary/40 transition-all"
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    <div className="max-h-[40vh] overflow-y-auto space-y-3 no-scrollbar pr-2">
                                        {friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                            <div className="text-center py-12 space-y-3 opacity-20">
                                                <UserPlus className="w-10 h-10 mx-auto" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No se encontraron amigos</p>
                                            </div>
                                        ) : (
                                            friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((friend) => (
                                                <motion.button
                                                    key={friend.userId}
                                                    whileHover={{ scale: 1.02, x: 5 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => {
                                                        const existing = conversations.find(c => c.userId === friend.userId);
                                                        setSelectedChat(existing || {
                                                            userId: friend.userId,
                                                            name: friend.name,
                                                            avatar_url: friend.avatar_url,
                                                            lastMessage: 'Iniciar conversación...',
                                                            timestamp: new Date().toISOString()
                                                        });
                                                        setIsSearchOpen(false);
                                                        setSearchQuery('');
                                                    }}
                                                    className="w-full p-4 rounded-[1.5rem] bg-foreground/[0.03] border border-foreground/5 hover:bg-primary hover:border-primary transition-all flex items-center gap-4 group text-left shadow-sm"
                                                >
                                                    <div className="w-12 h-12 rounded-xl border-2 border-foreground/5 group-hover:border-black/20 overflow-hidden shrink-0">
                                                        {friend.avatar_url ? (
                                                            <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                                                                <UserIcon className="w-5 h-5 opacity-40 group-hover:text-black" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-black text-[13px] uppercase tracking-tighter text-foreground group-hover:text-black italic leading-none">{friend.name}</h4>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-foreground/30 group-hover:text-black/50 mt-1">Conectar ahora</p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-black/40" />
                                                </motion.button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
