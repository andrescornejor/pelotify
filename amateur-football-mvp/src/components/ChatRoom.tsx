'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage, getMatchMessages, getDirectMessages, sendMatchMessage, sendDirectMessage, subscribeToMatchMessages, subscribeToDirectMessages } from '@/lib/chat';
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
                if (msgs) setMessages(msgs);
            } catch (err) {
                console.error('Error loading messages:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadMessages();

        // Subscribe to real-time
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
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
                // For DMs, we manually add the message to the list since we only subscribe to incoming
                const tempMsg: ChatMessage = {
                    id: Math.random().toString(),
                    sender_id: user.id,
                    recipient_id: recipientId,
                    content,
                    created_at: new Date().toISOString(),
                    profiles: { name: user.name || 'Yo' }
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
        <div className={cn("flex flex-col h-full bg-background/50 backdrop-blur-xl border border-foreground/10 rounded-3xl overflow-hidden", className)}>
            {title && (
                <div className="p-4 border-b border-foreground/5 bg-foreground/[0.02]">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">{title}</h3>
                </div>
            )}

            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-5 h-5 animate-spin text-primary/20" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-20">
                        <Send className="w-8 h-8 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Sin mensajes aún</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMine = msg.sender_id === user.id;
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                key={msg.id}
                                className={cn(
                                    "flex flex-col max-w-[80%]",
                                    isMine ? "ml-auto items-end" : "mr-auto items-start"
                                )}
                            >
                                {!isMine && (
                                    <span className="text-[8px] font-black uppercase tracking-widest text-foreground/40 mb-1 ml-1 truncate max-w-[120px]">
                                        {msg.profiles?.name || 'Usuario'}
                                    </span>
                                )}
                                <div className={cn(
                                    "px-4 py-2.5 rounded-2xl text-xs font-bold shadow-sm relative group",
                                    isMine 
                                        ? "bg-primary text-black rounded-tr-none" 
                                        : "bg-foreground/[0.05] text-foreground border border-foreground/5 rounded-tl-none"
                                )}>
                                    {msg.content}
                                    <span className={cn(
                                        "text-[7px] font-black opacity-30 mt-1 block",
                                        isMine ? "text-right" : "text-left"
                                    )}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            <form onSubmit={handleSend} className="p-3 bg-foreground/[0.02] border-t border-foreground/5 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribí un mensaje..."
                    className="flex-1 h-12 px-5 rounded-xl bg-background/50 border border-foreground/10 focus:border-primary/30 outline-none text-xs font-bold transition-all"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="w-12 h-12 bg-primary text-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-primary/20"
                >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
            </form>
        </div>
    );
}
