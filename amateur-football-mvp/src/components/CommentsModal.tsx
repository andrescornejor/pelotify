'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User2, MessageSquare } from 'lucide-react';
import { getComments, addComment, Comment } from '@/lib/highlights';
import { useAuth } from '@/contexts/AuthContext';

interface CommentsModalProps {
  highlightId: string;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export default function CommentsModal({ highlightId, onClose, onCommentAdded }: CommentsModalProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [highlightId]);

  const fetchComments = async () => {
    try {
      const data = await getComments(highlightId);
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const comment = await addComment(highlightId, user.id, newComment.trim());
      setComments([...comments, comment]);
      setNewComment('');
      onCommentAdded?.();
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Error al publicar el comentario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-lg bg-zinc-900/90 border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col h-[70vh] sm:h-[600px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="text-white font-black uppercase tracking-widest text-sm font-outfit">Comentarios</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-black uppercase tracking-tighter">Cargando...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
              <MessageSquare className="w-12 h-12" />
              <p className="text-sm font-medium">Sé el primero en comentar</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden shrink-0 bg-zinc-800 flex items-center justify-center">
                  {comment.profiles?.avatar_url ? (
                    <img src={comment.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User2 className="w-5 h-5 text-white/20" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-sm tracking-tight font-kanit italic">
                      @{comment.profiles?.name || 'crack'}
                    </span>
                    <span className="text-[10px] text-white/40 font-medium">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed font-outfit">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white/5 border-t border-white/5">
          {user ? (
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Añade un comentario..."
                className="flex-1 bg-white/10 border border-white/10 rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors font-outfit"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!newComment.trim() || isSubmitting}
                className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black disabled:opacity-50 disabled:grayscale transition-all shadow-[0_0_20px_rgba(44,252,125,0.3)]"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </form>
          ) : (
            <div className="text-center p-2">
              <p className="text-white/40 text-sm italic">Inicia sesión para comentar</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
