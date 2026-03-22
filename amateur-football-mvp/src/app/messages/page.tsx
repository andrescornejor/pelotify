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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 15
            }
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background pt-32 lg:pt-36 pb-32 px-4 sm:px-6 lg:px-12 xl:px-24 relative overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        x: [0, -70, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[20%] -right-[15%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full"
                />
            </div>

            <div className="max-w-7xl mx-auto h-[80vh] grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                
                {/* Conversations List */}
                <div className={cn(
                    "lg:col-span-4 flex flex-col gap-6 transition-all h-full overflow-hidden",
                    selectedChat ? "hidden lg:flex" : "flex"
                )}>
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-4xl font-black text-foreground italic uppercase tracking-tighter leading-none text-gradient">Mensajes</h1>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] drop-shadow-[0_0_8px_rgba(85,250,134,0.3)]">Central de Comunicaciones</span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05, rotate: 90 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsSearchOpen(true)}
                                className="w-12 h-12 rounded-[1.25rem] bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40"
                            >
                                <Plus className="w-6 h-6" />
                            </motion.button>
                        </div>
                        
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-all duration-300" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filtrar Mensajes..."
                                className="w-full h-14 pl-14 pr-6 bg-foreground/[0.03] border border-foreground/5 rounded-[1.5rem] outline-none text-sm font-bold placeholder:text-foreground/20 focus:border-primary/20 focus:bg-foreground/[0.05] transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar pb-6"
                    >
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
                                                variants={itemVariants}
                                                whileHover={{ x: 8, scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={async () => {
                                                    setSelectedChat(chat);
                                                    setConversations(prev => prev.map(c => 
                                                        c.userId === chat.userId ? { ...c, isUnread: false } : c
                                                    ));
                                                    if (user) await markAllDirectMessagesAsRead(user.id);
                                                }}
                                                className={cn(
                                                    "w-full p-4 rounded-[1.8rem] border transition-all duration-300 flex items-center gap-4 group text-left",
                                                    selectedChat?.userId === chat.userId
                                                        ? "bg-primary text-black border-primary shadow-2xl shadow-primary/20"
                                                        : "bg-surface/50 backdrop-blur-sm border-foreground/5 hover:border-primary/30 hover:bg-foreground/[0.04]"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-14 h-14 rounded-[1.2rem] overflow-hidden shrink-0 border-2 transition-transform duration-500 group-hover:scale-110",
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
                                                                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(85,250,134,1)] animate-pulse" />
                                                            )}
                                                            <span className={cn(
                                                                "text-[8px] font-black uppercase tracking-widest opacity-40",
                                                                selectedChat?.userId === chat.userId ? "text-black" : "text-foreground"
                                                            )}>
                                                                {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className={cn(
                                                        "text-[11px] font-bold truncate tracking-tight mb-1 opacity-60",
                                                        selectedChat?.userId === chat.userId ? "text-black" : "text-foreground"
                                                    )}>
                                                        {chat.lastMessage}
                                                    </p>
                                                </div>
                                                <ChevronRight className={cn(
                                                    "w-4 h-4 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1",
                                                    selectedChat?.userId === chat.userId ? "text-black" : "text-primary"
                                                )} />
                                            </motion.button>
                                        ))}
                                        
                                        {/* Show Friends in Search */}
                                        {searchQuery && availableFriends.length > 0 && (
                                            <div className="pt-6 space-y-4">
                                                <div className="flex items-center gap-3 px-4">
                                                    <div className="h-px flex-1 bg-foreground/5" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">Amigos Sugeridos</span>
                                                    <div className="h-px flex-1 bg-foreground/5" />
                                                </div>
                                                {availableFriends.map((friend) => (
                                                    <motion.button
                                                        key={friend.userId}
                                                        variants={itemVariants}
                                                        whileHover={{ x: 8, scale: 1.02 }}
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
                                                        className="w-full p-4 rounded-[1.8rem] border border-dashed border-primary/20 bg-primary/[0.02] hover:bg-primary/[0.05] hover:border-primary/40 transition-all flex items-center gap-4 group text-left"
                                                    >
                                                        <div className="w-14 h-14 rounded-[1.2rem] overflow-hidden shrink-0 border-2 border-primary/20 relative group-hover:scale-110 transition-transform duration-500">
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
                                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                                                            <Plus className="w-5 h-5" />
                                                        </div>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </motion.div>
                </div>

                {/* Chat Area */}
                <div className={cn(
                    "lg:col-span-8 h-full flex flex-col min-h-0",
                    !selectedChat ? "hidden lg:flex" : "flex"
                )}>
                    {selectedChat ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col h-full glass-premium border border-foreground/5 rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-black/20"
                        >
                            {/* Chat Header */}
                            <div className="px-6 sm:px-10 py-6 bg-foreground/[0.03] backdrop-blur-2xl border-b border-foreground/5 flex items-center justify-between relative z-20">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setSelectedChat(null)}
                                        className="lg:hidden p-3 bg-foreground/5 rounded-2xl hover:bg-foreground/10 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-4">
                                        <motion.div 
                                            whileHover={{ scale: 1.05 }}
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl shadow-primary/5"
                                        >
                                            {selectedChat.avatar_url ? (
                                                <img src={selectedChat.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary">
                                                    <UserIcon className="w-5 h-5" />
                                                </div>
                                            )}
                                        </motion.div>
                                        <div>
                                            <h3 className="font-black uppercase italic tracking-tighter text-foreground leading-none text-lg">{selectedChat.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary">Conexión Segura</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <span className="text-[9px] font-black text-foreground uppercase tracking-[0.2em]">Activo Ahora</span>
                                        <span className="text-[7px] font-black text-primary/60 uppercase tracking-[0.1em]">Línea Encriptada</span>
                                    </div>
                                </div>
                            </div>

                            <ChatRoom 
                                recipientId={selectedChat.userId} 
                                className="flex-1 !bg-transparent !border-0 !rounded-none !shadow-none"
                            />
                        </motion.div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 glass-premium border border-foreground/5 rounded-[3rem] relative overflow-hidden group shadow-2xl">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-1000"
                                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(85,250,134,0.1) 0%, transparent 70%)' }} />
                            
                            {/* Decorative background elements */}
                            <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                            <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary/5 blur-3xl rounded-full" />

                             <div className="relative">
                                <motion.div 
                                    animate={{ 
                                        scale: [1, 1.05, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                                    className="w-48 h-48 rounded-[4rem] bg-foreground/[0.02] border border-foreground/5 flex items-center justify-center relative shadow-2xl backdrop-blur-sm"
                                >
                                    <MessageSquare className="w-20 h-20 text-primary drop-shadow-[0_0_20px_rgba(85,250,134,0.4)]" />
                                    <motion.div 
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                        className="absolute -top-4 -right-4 w-14 h-14 bg-primary rounded-3xl border-4 border-background flex items-center justify-center shadow-2xl"
                                    >
                                        <Plus className="w-6 h-6 text-black" />
                                    </motion.div>
                                </motion.div>
                             </div>

                             <div className="space-y-6 relative z-10">
                                <h3 className="text-4xl font-black uppercase tracking-tighter italic text-foreground leading-none text-gradient">Inicia la <br/> Jugada</h3>
                                <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-foreground/40 max-w-sm mx-auto leading-relaxed">
                                    Conecta con otros jugadores de la <br/> comunidad para organizar tu próximo partido
                                </p>
                             </div>

                             <motion.button
                                whileHover={{ scale: 1.05, y: -4, boxShadow: "0 20px 40px rgba(85,250,134,0.2)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsSearchOpen(true)}
                                className="px-10 h-16 bg-primary text-black font-black italic text-sm uppercase tracking-[0.3em] rounded-2xl relative z-10 shadow-2xl transition-all"
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
                                className="absolute inset-0 bg-background/60 backdrop-blur-3xl"
                            />
                            {/* Ambient background glow for modal */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full" />
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                                className="relative w-full max-w-lg bg-surface/40 backdrop-blur-2xl border border-foreground/10 rounded-t-[3rem] sm:rounded-[3rem] p-8 sm:p-12 shadow-[0_32px_64px_rgba(0,0,0,0.4)] overflow-hidden z-10"
                            >
                                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                                    <MessageSquare className="w-48 h-48" />
                                </div>

                                <div className="flex items-center justify-between mb-10 relative z-10">
                                    <div className="space-y-2">
                                        <h3 className="text-4xl font-black italic text-foreground uppercase tracking-tighter leading-none text-gradient">Nuevo Canal</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary drop-shadow-[0_0_8px_rgba(85,250,134,0.3)]">Tus Amigos de Pelotify</p>
                                    </div>
                                    <motion.button 
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setIsSearchOpen(false)}
                                        className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition-colors border border-foreground/5"
                                    >
                                        <X className="w-5 h-5" />
                                    </motion.button>
                                </div>

                                <div className="space-y-8 relative z-10">
                                    <div className="relative group">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-all duration-300" />
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="BUSCAR EN TUS AMIGOS..."
                                            className="w-full h-16 pl-14 pr-6 bg-foreground/[0.04] border border-foreground/10 rounded-[1.8rem] outline-none text-sm font-black uppercase tracking-wider text-foreground placeholder:text-foreground/20 focus:border-primary/40 focus:bg-foreground/[0.06] transition-all shadow-inner"
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    <div className="max-h-[45vh] overflow-y-auto space-y-3 no-scrollbar pr-2 pb-4">
                                        {friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                            <div className="text-center py-20 space-y-4 opacity-20">
                                                <UserPlus className="w-12 h-12 mx-auto" />
                                                <p className="text-[11px] font-black uppercase tracking-[0.4em]">Sin coincidencias</p>
                                            </div>
                                        ) : (
                                            friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((friend) => (
                                                <motion.button
                                                    key={friend.userId}
                                                    whileHover={{ scale: 1.02, x: 6 }}
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
                                                    className="w-full p-4 rounded-[1.8rem] bg-foreground/[0.03] border border-foreground/5 hover:bg-primary hover:border-primary transition-all flex items-center gap-4 group text-left shadow-sm"
                                                >
                                                    <div className="w-14 h-14 rounded-[1.2rem] border-2 border-foreground/5 group-hover:border-black/20 overflow-hidden shrink-0 transition-all duration-500 group-hover:scale-110">
                                                        {friend.avatar_url ? (
                                                            <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                                                                <UserIcon className="w-6 h-6 opacity-40 group-hover:text-black" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-black text-[14px] uppercase tracking-tighter text-foreground group-hover:text-black italic leading-none">{friend.name}</h4>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <div className="w-1 h-1 rounded-full bg-primary group-hover:bg-black opacity-40" />
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-foreground/30 group-hover:text-black/60">Conectar ahora</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-black/10 transition-all">
                                                        <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-black" />
                                                    </div>
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
