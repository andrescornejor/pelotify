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
import { supabase } from '@/lib/supabase';
import { Send, User as UserIcon, Loader2, ChevronDown, Clock, Image as ImageIcon, X, ImagePlus, Check, CheckCheck } from 'lucide-react';
import { cn, safeFormatTime } from '@/lib/utils';
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
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        layout
        className={cn(
          'flex gap-3 px-4 sm:px-6 w-full',
          isMine ? 'flex-row-reverse' : 'flex-row',
          sameAuthorAsPrev ? 'mt-1' : 'mt-6'
        )}
      >
        <div className="w-8 shrink-0 flex items-end justify-center pb-1">
          {!isMine && !sameAuthorAsNext && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-8 h-8 rounded-full border border-white/10 bg-[#121212] overflow-hidden flex items-center justify-center relative group/avatar shadow-lg z-10"
            >
              {msg.profiles?.avatar_url ? (
                <img src={msg.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-4 h-4 text-white/40" />
              )}
            </motion.div>
          )}
        </div>

        <div
          className={cn(
            'flex flex-col max-w-[80%] sm:max-w-[70%]',
            isMine ? 'items-end' : 'items-start'
          )}
        >
          {!isMine && !sameAuthorAsPrev && (
            <span className="text-[11px] font-semibold tracking-wide text-white/50 mb-1 ml-1 opacity-80">
              {msg.profiles?.name || 'Usuario'}
            </span>
          )}
          <motion.div
            layout
            className={cn(
              'relative transition-all duration-300 group/bubble overflow-hidden flex flex-col',
              isMine
                ? 'glass-premium border-primary/20 text-foreground rounded-[1.3rem] rounded-br-[0.3rem] shadow-[0_5px_20px_rgba(44,252,125,0.15)] bg-gradient-to-br from-primary/20 to-primary/5'
                : 'glass border-white/5 text-white/90 rounded-[1.3rem] rounded-bl-[0.3rem] shadow-md bg-white/5',
              sameAuthorAsPrev && (isMine ? 'rounded-tr-[1.3rem]' : 'rounded-tl-[1.3rem]'),
              sameAuthorAsNext && (isMine ? 'rounded-br-[1.3rem]' : 'rounded-bl-[1.3rem]')
            )}
          >
            {msg.image_url && (
              <div className={cn("overflow-hidden max-w-sm", msg.content ? "p-1 pb-0 rounded-t-[1.3rem]" : "p-1 rounded-[1.3rem]")}>
                <img
                  src={msg.image_url}
                  alt="Attachment"
                  className="w-full max-h-[260px] object-cover rounded-[1.1rem] cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(msg.image_url, '_blank')}
                />
              </div>
            )}
            <div className={cn('px-4 py-2.5 text-[15px] leading-[1.4] whitespace-pre-wrap word-break', !msg.content && 'hidden')}>
              {msg.content}
            </div>
            
            <div
              className={cn(
                'px-4 pb-2 pt-0.5 text-[10px] font-medium flex items-center gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity absolute bottom-0 right-0 left-0 bg-gradient-to-t via-current/10 to-transparent',
                isMine ? 'text-foreground/60 justify-end from-primary/20' : 'text-white/40 justify-start from-white/10'
              )}
            >
              <Clock className="w-3 h-3" />
              {safeFormatTime(msg.created_at)}
              {isMine && (
                <span className={cn('ml-1 transition-colors flex items-center', msg.is_read ? 'text-[#104e28]' : 'opacity-40')}>
                  {msg.is_read ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                </span>
              )}
            </div>
          </motion.div>

          {/* Reacciones Futboleras Exclusivas */}
          <div className={cn(
            "flex items-center gap-1 mt-1 opacity-0 transition-opacity group-hover:opacity-100",
            isMine ? "flex-row-reverse mr-1" : "ml-1"
          )}>
            {['⚽️', '🟥', '🍻', '🔥'].map((emoji) => (
              <button
                key={emoji}
                className="w-6 h-6 rounded-full glass border-white/10 flex items-center justify-center text-xs hover:scale-125 transition-transform bg-white/5 hover:bg-white/20"
                onClick={() => {/* Mock reaction */}}
              >
                {emoji}
              </button>
            ))}
          </div>
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ file: File; preview: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setSelectedImage({ file, preview });
    }
  };

  const uploadImageToChat = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `chat_images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return publicUrl;
  };

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
        setMessages((prev) => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });
    } else if (recipientId) {
      subscription = subscribeToDirectMessages(user.id, (msg) => {
        if (
          (msg.sender_id === recipientId && msg.recipient_id === user.id) ||
          (msg.sender_id === user.id && msg.recipient_id === recipientId)
        ) {
          setMessages((prev) => {
             if (prev.find(m => m.id === msg.id)) return prev;
             return [...prev, msg];
          });
          
          if (msg.sender_id === recipientId) {
            markDirectMessagesAsRead(recipientId, user.id);
          }
        }
      });
    }

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [matchId, recipientId, user?.id]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      const scrollHeight = scrollRef.current.scrollHeight;
      const height = scrollRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      scrollRef.current.scrollTo({
        top: maxScrollTop > 0 ? maxScrollTop : 0,
        behavior,
      });
    }
  };

  useEffect(() => {
    setTimeout(() => scrollToBottom('smooth'), 100);
  }, [messages, selectedImage]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 80;
    setShowScrollBottom(!isAtBottom);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || (!newMessage.trim() && !selectedImage) || isSending) return;

    const content = newMessage.trim();
    setIsSending(true);
    setNewMessage('');

    try {
      let imageUrl;
      if (selectedImage) {
        setUploadingImage(true);
        imageUrl = await uploadImageToChat(selectedImage.file);
        setSelectedImage(null);
      }

      if (matchId) {
        await sendMatchMessage(matchId, user.id, content, imageUrl);
      } else if (recipientId) {
        await sendDirectMessage(user.id, recipientId, content, imageUrl);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setNewMessage(content);
    } finally {
      setIsSending(false);
      setUploadingImage(false);
      setTimeout(() => scrollToBottom('smooth'), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-[#0A0A0A] overflow-hidden relative group font-sans',
        className
      )}
    >
      {/* Premium Gradient Background Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2CFC7D]/5 via-transparent to-transparent pointer-events-none" />

      {title && (
        <div className="px-6 py-4 backdrop-blur-md bg-white/[0.02] border-b border-white/5 relative z-20 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center">
                 <UserIcon className="w-4 h-4 text-white/60" />
             </div>
             <div className="flex flex-col">
                <h3 className="text-[14px] font-semibold text-white/90 leading-tight">
                  {title}
                </h3>
             </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth relative z-10 
                   [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent 
                   [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20
                   pb-6"
      >
        {isLoading ? (
          <div className="flex flex-col gap-6 p-6 opacity-60">
            {[1, 2, 3].map((i) => (
              <div
                key={`msg-skeleton-${i}`}
                className={cn(
                  'flex gap-3 animate-pulse w-full max-w-[80%]',
                  i % 2 === 0 ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
                <div className={cn('h-12 bg-white/5 rounded-[1.2rem]', i % 2 === 0 ? 'w-48' : 'w-64')} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-[#1C1C1E] to-[#121212] rounded-full border border-white/5 flex items-center justify-center shadow-lg mb-6 relative group/empty cursor-default"
            >
              <div className="absolute inset-0 bg-[#2CFC7D]/5 rounded-full opacity-0 group-hover/empty:opacity-100 transition-opacity duration-700" />
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Send className="w-8 h-8 text-white/20 ml-1 mt-1" />
              </motion.div>
            </motion.div>
            <h4 className="text-white/80 font-medium text-[16px] mb-2 font-display">Inicia la conversación</h4>
            <p className="text-[13px] text-white/40 max-w-[240px] leading-relaxed">
              Los mensajes están encriptados y se envían en tiempo real.
            </p>
          </div>
        ) : (
          <div className="flex flex-col py-6">
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

      {/* Scroll Down FAB */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-[90px] right-6 w-9 h-9 rounded-full bg-[#1C1C1E]/90 backdrop-blur-md border border-white/10 text-white flex items-center justify-center shadow-xl z-30 transition-all hover:bg-[#2CFC7D] hover:text-black hover:border-transparent"
          >
             <ChevronDown className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4 pt-2 relative z-20 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent">
        <form
          onSubmit={handleSend}
          className="flex flex-col gap-2 relative bg-[#1C1C1E] border border-white/10 rounded-[1.5rem] p-1.5 shadow-inner transition-all focus-within:border-white/20 focus-within:bg-[#202022]"
        >
          {/* Image Preview */}
          <AnimatePresence>
            {selectedImage && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                className="px-3 pt-3"
              >
                <div className="relative inline-block group/preview">
                  <img
                    src={selectedImage.preview}
                    alt="Preview"
                    className="h-24 w-auto object-cover rounded-xl border border-white/10 shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2 px-2 pb-1 pt-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            
            <button
              type="button"
              disabled={isSending || uploadingImage}
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-colors shrink-0 mb-0.5"
            >
              <ImagePlus className="w-5 h-5" />
            </button>

            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mensaje..."
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
              className="flex-1 bg-transparent outline-none text-[15px] text-white placeholder:text-white/30 resize-none py-2.5 scrollbar-hide"
            />

            <button
              type="submit"
              disabled={(!newMessage.trim() && !selectedImage) || isSending}
              className={cn(
                'p-2.5 rounded-full transition-all shrink-0 mb-0.5 flex items-center justify-center',
                newMessage.trim() || selectedImage
                  ? 'bg-[#2CFC7D] text-black shadow-lg shadow-[#2CFC7D]/20 hover:scale-105 active:scale-95'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              )}
            >
              {isSending || uploadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 ml-0.5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
