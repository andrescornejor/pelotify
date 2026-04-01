'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChatMessage,
  getMatchMessages,
  getDirectMessages,
  sendMatchMessage,
  sendDirectMessage,
  subscribeToMatchMessages,
  subscribeToDirectMessages,
  markDirectMessagesAsRead,
} from '@/lib/chat';
import { Send, User as UserIcon, Loader2, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatRoomProps {
  matchId?: string;
  recipientId?: string;
  className?: string;
  title?: string;
}

const MessageItem = memo(
  ({
    msg,
    user,
    prevMsg,
    nextMsg,
  }: {
    msg: ChatMessage;
    user: any;
    prevMsg?: ChatMessage;
    nextMsg?: ChatMessage;
  }) => {
    const isMine = msg.sender_id === user.id;
    const sameAuthorAsPrev = prevMsg?.sender_id === msg.sender_id;
    const sameAuthorAsNext = nextMsg?.sender_id === msg.sender_id;

    return (
      <motion.div
        initial={{ opacity: 0, x: isMine ? 20 : -20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        layout
        className={cn(
          'flex gap-3',
          isMine ? 'flex-row-reverse' : 'flex-row',
          sameAuthorAsPrev ? 'mt-1' : 'mt-8'
        )}
      >
        <div className="w-10 shrink-0 flex items-end">
          {!isMine && !sameAuthorAsNext && (
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-10 h-10 rounded-2xl border-2 border-primary/20 bg-surface shadow-2xl overflow-hidden flex items-center justify-center relative group/avatar"
            >
              {msg.profiles?.avatar_url ? (
                <img src={msg.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-5 h-5 text-primary/40" />
              )}
            </motion.div>
          )}
        </div>

        <div
          className={cn(
            'flex flex-col max-w-[85%] sm:max-w-[75%]',
            isMine ? 'items-end' : 'items-start'
          )}
        >
          {!isMine && !sameAuthorAsPrev && (
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2 ml-1 italic drop-shadow-sm">
              {msg.profiles?.name}
            </span>
          )}
          <motion.div
            layout
            className={cn(
              'px-6 py-4 text-[14px] font-bold relative transition-all duration-300 group/bubble',
              isMine
                ? 'bg-gradient-to-br from-primary via-primary to-primary-dark text-black rounded-[2rem] rounded-tr-[0.5rem] shadow-[0_10px_30px_rgba(85,250,134,0.15)] hover:shadow-primary/30'
                : 'bg-white/90 dark:bg-foreground/[0.08] border border-foreground/10 text-foreground rounded-[2rem] rounded-tl-[0.5rem] shadow-sm hover:bg-foreground/[0.1] backdrop-blur-md',
              sameAuthorAsPrev && (isMine ? 'rounded-tr-[2rem]' : 'rounded-tl-[2rem]'),
              sameAuthorAsNext && (isMine ? 'rounded-br-[0.5rem]' : 'rounded-bl-[0.5rem]')
            )}
          >
            <div className="leading-relaxed tracking-tight">{msg.content}</div>
            <div
              className={cn(
                'text-[10px] font-black opacity-40 mt-2 flex items-center gap-1.5 transition-opacity group-hover/bubble:opacity-100',
                isMine ? 'text-black justify-end' : 'text-foreground justify-start'
              )}
            >
              <Clock className="w-2.5 h-2.5" />
              {new Date(msg.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }
);

MessageItem.displayName = 'MessageItem';

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
        setMessages((prev) => [...prev.filter((m) => m.id !== msg.id), msg]);
      });
    } else if (recipientId) {
      subscription = subscribeToDirectMessages(user.id, (msg) => {
        if (msg.sender_id === recipientId || msg.recipient_id === user.id) {
          setMessages((prev) => [...prev.filter((m) => m.id !== msg.id), msg]);
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
        behavior,
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
          profiles: { name: user.name || 'Yo', avatar_url: user.avatar_url },
        };
        setMessages((prev) => [...prev, tempMsg]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  if (!user) return null;

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-surface/20 backdrop-blur-3xl border border-foreground/5 rounded-[2rem] overflow-hidden shadow-2xl relative group',
        className
      )}
    >
      {/* Ambient Background Light - More dynamic */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-0 left-[-20%] w-[60%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none"
      />

      {title && (
        <div className="px-8 py-6 border-b border-foreground/5 bg-foreground/[0.02] backdrop-blur-2xl relative z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(85,250,134,0.6)]" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-foreground/70 italic">
                {title}
              </h3>
            </div>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 sm:px-10 py-10 space-y-10 no-scrollbar relative z-10"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-foreground/20">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.5em] animate-pulse text-primary/60">
              Sincronizando...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-10 opacity-30">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-28 h-28 bg-foreground/[0.03] rounded-[2rem] border border-foreground/5 flex items-center justify-center shadow-inner relative overflow-hidden group/empty"
            >
              <motion.div
                animate={{ rotate: [0, -15, 15, 0], y: [0, -5, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                <Send className="w-12 h-12 -rotate-12 text-primary drop-shadow-[0_0_15px_rgba(85,250,134,0.4)]" />
              </motion.div>
            </motion.div>
            <div className="space-y-4">
              <p className="text-xl font-black uppercase italic tracking-tighter text-foreground">
                Canal Abierto
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-foreground/50 max-w-[260px] leading-relaxed mx-auto">
                Conecta con los demÃ¡s para definir los detalles del partido
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <MessageItem
                  key={msg.id}
                  msg={msg}
                  user={user}
                  prevMsg={messages[i - 1]}
                  nextMsg={messages[i + 1]}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Scroll to Bottom Button - Premium Style */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-36 right-10 w-14 h-14 rounded-2xl bg-primary text-black flex items-center justify-center shadow-[0_0_30px_rgba(85,250,134,0.4)] z-30 transition-all border-4 border-background"
          >
            <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ChevronRight className="w-8 h-8 rotate-90" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="p-8 pt-0 relative z-20">
        <form
          onSubmit={handleSend}
          className="p-1.5 pr-1.5 bg-foreground/[0.04] backdrop-blur-3xl border border-foreground/10 rounded-[2rem] flex gap-3 items-center focus-within:border-primary/40 focus-within:shadow-[0_0_30px_rgba(85,250,134,0.1)] transition-all shadow-inner relative group/form"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={matchId ? 'Escribe al equipo...' : 'Mensaje Privado...'}
            className="flex-1 h-14 sm:h-16 px-8 bg-transparent outline-none text-[15px] font-bold text-foreground placeholder:text-foreground/20 transition-all uppercase tracking-tight"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!newMessage.trim() || isSending}
            className={cn(
              'w-14 h-14 sm:w-16 sm:h-16 rounded-[1.8rem] flex items-center justify-center transition-all shadow-2xl overflow-hidden relative group/send',
              newMessage.trim()
                ? 'bg-primary text-black shadow-primary/30'
                : 'bg-foreground/5 text-foreground/20'
            )}
          >
            {isSending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="relative z-10 flex items-center justify-center">
                <Send
                  className={cn(
                    'w-6 h-6 transition-all duration-500',
                    newMessage.trim() &&
                      'group-hover/send:-rotate-12 group-hover/send:translate-x-1 group-hover/send:-translate-y-1'
                  )}
                />
              </div>
            )}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/send:opacity-100 transition-opacity" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
