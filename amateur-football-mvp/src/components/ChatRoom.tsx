'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage, getMatchMessages, getDirectMessages, sendMatchMessage, sendDirectMessage, subscribeToMatchMessages, subscribeToDirectMessages, markDirectMessagesAsRead } from '@/lib/chat';
import { Send, User as UserIcon, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatRoomProps {
    matchId?: string;
    recipientId?: string;
    className?: string;
    title?: string;
}

export default function ChatRoom({ matchId, recipientId, className, title }: ChatRoomProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        const loadMessages = async () => {
            setIsLoading(true);
            try {
                let msgs;
                if (matchId) {
                    msgs = await getMatchMessages(matchId);
                } else if (recipientId) {
                    msgs = await getDirectMessages(user.id, recipientId);
                }
                if (msgs) {
                    setMessages(msgs);
                    if (recipientId) {
                        await markDirectMessagesAsRead(recipientId, user.id);
                    }
                }
            } catch (err) {
                console.error('Error loading messages:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadMessages();

        let subscription: any;
        if (matchId) {
            subscription = subscribeToMatchMessages(matchId, (msg) => {
                setMessages(prev => [...prev.filter(m => m.id !== msg.id), msg]);
            });
        } else if (recipientId) {
            subscription = subscribeToDirectMessages(user.id, (msg) => {
                if (msg.sender_id === recipientId || msg.recipient_id === user.id) {
                    setMessages(prev => [...prev.filter(m => m.id !== msg.id), msg]);
                }
            });
        }

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, [matchId, recipientId, user?.id]);

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior
            });
        }
    };

    useEffect(() => {
        scrollToBottom('smooth');
    }, [messages]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
        setShowScrollBottom(!isAtBottom);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newMessage.trim() || isSending) return;

        const content = newMessage.trim();
        setIsSending(true);
        setNewMessage('');

        try {
            if (matchId) {
                await sendMatchMessage(matchId, user.id, content);
            } else if (recipientId) {
                await sendDirectMessage(user.id, recipientId, content);
                const tempMsg: ChatMessage = {
                    id: Math.random().toString(),
                    sender_id: user.id,
                    recipient_id: recipientId,
                    content,
                    created_at: new Date().toISOString(),
                    profiles: { name: user.name || 'Yo', avatar_url: user.avatar_url }
                };
                setMessages(prev => [...prev, tempMsg]);
            }
        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setIsSending(false);
        }
    };

    if (!user) return null;

    return (
        <div className={cn("flex flex-col h-full bg-surface/40 backdrop-blur-3xl border border-foreground/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative group", className)}>
            {/* Ambient Background Light */}
            <div className="absolute top-0 left-[-20%] w-[60%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50" />
            
            {title && (
                <div className="px-8 py-5 border-b border-foreground/5 bg-foreground/[0.02] backdrop-blur-xl relative z-20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(44,252,125,0.5)]" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/60 italic">{title}</h3>
                        </div>
                        <div className="flex -space-x-2 overflow-hidden">
                             {/* Placeholder for participant avatars if needed */}
                        </div>
                    </div>
                </div>
            )}

            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-6 sm:px-10 py-8 space-y-8 no-scrollbar relative z-10"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-5 text-foreground/20">
                        <div className="relative">
                            <Loader2 className="w-10 h-10 animate-spin" />
                            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Estableciendo Enlace...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 opacity-20">
                        <div className="w-24 h-24 bg-foreground/[0.05] rounded-[2.5rem] border border-foreground/10 flex items-center justify-center shadow-inner relative overflow-hidden group/empty">
                            <motion.div 
                                animate={{ rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity }}
                            >
                                <Send className="w-10 h-10 -rotate-12 transition-transform duration-500 group-hover/empty:scale-110" />
                            </motion.div>
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/empty:opacity-100 transition-opacity" />
                        </div>
                        <div className="space-y-3">
                             <p className="text-lg font-black uppercase italic tracking-tighter text-foreground">Canal Silencioso</p>
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 max-w-[220px]">Rompé el hielo y coordiná el partido con el equipo</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {messages.map((msg, i) => {
                            const isMine = msg.sender_id === user.id;
                            const prevMsg = messages[i - 1];
                            const nextMsg = messages[i + 1];
                            const sameAuthorAsPrev = prevMsg?.sender_id === msg.sender_id;
                            const sameAuthorAsNext = nextMsg?.sender_id === msg.sender_id;
                            
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-4",
                                        isMine ? "flex-row-reverse" : "flex-row",
                                        sameAuthorAsPrev ? "mt-1" : "mt-6"
                                    )}
                                >
                                    <div className="w-10 shrink-0 flex items-end">
                                        {!isMine && !sameAuthorAsNext && (
                                            <div className="w-10 h-10 rounded-2xl border border-foreground/10 bg-surface shadow-lg overflow-hidden flex items-center justify-center relative group/avatar">
                                                {msg.profiles?.avatar_url ? (
                                                    <img src={msg.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon className="w-5 h-5 text-foreground/30" />
                                                )}
                                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                                            </div>
                                        )}
                                    </div>

                                    <div className={cn(
                                        "flex flex-col max-w-[80%] sm:max-w-[70%]",
                                        isMine ? "items-end" : "items-start"
                                    )}>
                                        {!isMine && !sameAuthorAsPrev && (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-2 ml-1 italic">
                                                {msg.profiles?.name}
                                            </span>
                                        )}
                                        <div className={cn(
                                            "px-6 py-4 text-[13px] font-bold relative transition-all duration-300 shadow-sm",
                                            isMine 
                                                ? "bg-gradient-to-br from-primary via-primary to-primary-600 text-black rounded-[1.8rem] rounded-tr-[0.4rem] hover:shadow-primary/20" 
                                                : "bg-foreground/[0.03] border border-foreground/5 text-foreground rounded-[1.8rem] rounded-tl-[0.4rem] hover:bg-foreground/[0.05]",
                                            sameAuthorAsPrev && (isMine ? "rounded-tr-[1.8rem]" : "rounded-tl-[1.8rem]"),
                                            sameAuthorAsNext && (isMine ? "rounded-br-[0.4rem]" : "rounded-bl-[0.4rem]")
                                        )}>
                                            {msg.content}
                                            <div className={cn(
                                                "text-[8px] font-black opacity-30 mt-2 flex items-center gap-1.5",
                                                isMine ? "text-black justify-end" : "text-foreground justify-start"
                                            )}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Scroll to Bottom Button */}
            <AnimatePresence>
                {showScrollBottom && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onClick={() => scrollToBottom()}
                        className="absolute bottom-32 right-10 w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center shadow-2xl z-30 hover:scale-110 active:scale-90 transition-all border-4 border-background"
                    >
                        <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                            <ChevronRight className="w-6 h-6 rotate-90" />
                        </motion.div>
                    </motion.button>
                )}
            </AnimatePresence>

            <div className="p-8 pt-0 relative z-20">
                <form 
                    onSubmit={handleSend} 
                    className="p-1 pr-1 bg-foreground/[0.04] backdrop-blur-3xl border border-foreground/10 rounded-[2.2rem] flex gap-2 items-center focus-within:border-primary/40 focus-within:shadow-[0_0_20px_rgba(44,252,125,0.1)] transition-all shadow-inner relative group/form"
                >
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={matchId ? "Escribí al equipo..." : "Mensaje Privado..."}
                        className="flex-1 h-16 px-8 bg-transparent outline-none text-[14px] font-bold text-foreground placeholder:text-foreground/20 placeholder:italic transition-all uppercase tracking-tight"
                    />
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!newMessage.trim() || isSending}
                        className={cn(
                            "w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all shadow-2xl overflow-hidden relative group/send",
                            newMessage.trim() 
                                ? "bg-primary text-black shadow-primary/30" 
                                : "bg-foreground/5 text-foreground/20"
                        )}
                    >
                        {isSending ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <div className="relative z-10 flex items-center justify-center">
                                <Send className={cn("w-6 h-6 transition-all duration-500", newMessage.trim() && "group-hover/send:-rotate-12 group-hover/send:translate-x-1 group-hover/send:-translate-y-1")} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/send:opacity-100 transition-opacity" />
                    </motion.button>
                </form>
            </div>
        </div>
    );
}
