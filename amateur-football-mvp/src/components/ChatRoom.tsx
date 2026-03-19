'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage, getMatchMessages, getDirectMessages, sendMatchMessage, sendDirectMessage, subscribeToMatchMessages, subscribeToDirectMessages, markDirectMessagesAsRead } from '@/lib/chat';
import { Send, User as UserIcon, Loader2 } from 'lucide-react';
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
                if (msg.sender_id === recipientId) {
                    setMessages(prev => [...prev.filter(m => m.id !== msg.id), msg]);
                }
            });
        }

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, [matchId, recipientId, user?.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

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
        <div className={cn("flex flex-col h-full bg-background/20 backdrop-blur-3xl border border-foreground/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative", className)}>
            {/* Ambient Background Light */}
            <div className="absolute top-0 left-[-20%] w-[60%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            
            {title && (
                <div className="px-8 py-5 border-b border-foreground/5 bg-foreground/[0.03] backdrop-blur-md relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/60 italic">{title}</h3>
                    </div>
                </div>
            )}

            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 no-scrollbar relative z-10"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-foreground/20">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Encriptando Señal...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-30 group">
                        <div className="w-20 h-20 bg-foreground/[0.03] rounded-[2rem] border border-foreground/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-700">
                            <Send className="w-8 h-8 -rotate-12" />
                        </div>
                        <div className="space-y-2">
                             <p className="text-sm font-black uppercase italic tracking-tighter">Sin Mensajes Detectados</p>
                             <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/60 max-w-[200px]">Inicia la conversación para coordinar el encuentro</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {messages.map((msg, i) => {
                            const isMine = msg.sender_id === user.id;
                            const prevMsg = messages[i - 1];
                            const sameAuthor = prevMsg?.sender_id === msg.sender_id;
                            
                            return (
                                <motion.div
                                    initial={{ opacity: 0, x: isMine ? 20 : -20, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-3",
                                        isMine ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    {!isMine && !sameAuthor ? (
                                        <div className="w-8 h-8 rounded-xl border border-foreground/10 bg-foreground/5 shrink-0 overflow-hidden flex items-center justify-center shadow-sm">
                                            {msg.profiles?.avatar_url ? (
                                                <img src={msg.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-4 h-4 text-foreground/40" />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-8 shrink-0" />
                                    )}

                                    <div className={cn(
                                        "flex flex-col max-w-[75%]",
                                        isMine ? "items-end" : "items-start"
                                    )}>
                                        {!isMine && !sameAuthor && (
                                            <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40 mb-1 ml-1 italic">
                                                {msg.profiles?.name}
                                            </span>
                                        )}
                                        <div className={cn(
                                            "px-5 py-3 rounded-[1.5rem] lg:rounded-[1.25rem] text-xs font-bold relative group transition-all hover:scale-[1.02]",
                                            isMine 
                                                ? "bg-gradient-to-br from-primary via-primary to-primary/90 text-black shadow-lg shadow-primary/10 rounded-tr-none" 
                                                : "bg-surface-elevated text-foreground border border-foreground/5 shadow-sm rounded-tl-none"
                                        )}>
                                            {msg.content}
                                            <div className={cn(
                                                "text-[7px] font-black opacity-40 mt-1.5 flex items-center gap-1",
                                                isMine ? "text-primary-foreground justify-end" : "text-foreground justify-start"
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

            <div className="p-6 pt-0 relative z-10">
                <form 
                    onSubmit={handleSend} 
                    className="p-1 or-2 bg-foreground/[0.04] backdrop-blur-3xl border border-foreground/10 rounded-[1.8rem] flex gap-2 items-center group-focus-within:border-primary/30 transition-all shadow-inner"
                >
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Mensaje Directo..."
                        className="flex-1 h-14 px-7 bg-transparent outline-none text-[13px] font-bold text-foreground placeholder:text-foreground/20 placeholder:italic transition-all"
                    />
                    <motion.button
                        type="submit"
                        whileTap={{ scale: 0.95 }}
                        disabled={!newMessage.trim() || isSending}
                        className={cn(
                            "w-14 h-14 rounded-[1.4rem] flex items-center justify-center transition-all shadow-xl group/btn overflow-hidden relative",
                            newMessage.trim() 
                                ? "bg-primary text-black shadow-primary/20" 
                                : "bg-foreground/5 text-foreground/20"
                        )}
                    >
                        {isSending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <div className="relative z-10 flex items-center justify-center">
                                <Send className={cn("w-5 h-5 transition-transform duration-500", newMessage.trim() && "group-hover/btn:-rotate-12 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1")} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </motion.button>
                </form>
            </div>
        </div>
    );
}
