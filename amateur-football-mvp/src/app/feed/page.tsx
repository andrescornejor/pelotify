'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  MessageSquare, 
  Heart, 
  Image as ImageIcon,
  MoreHorizontal,
  Send,
  Loader2,
  Trash2,
  Share2,
  Zap
} from 'lucide-react';
import Link from 'next/link';

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} meses`;
  return `hace ${Math.floor(months / 12)} años`;
}

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author_id: string;
  author: {
    id: string;
    name: string;
    avatar_url: string | null;
    is_pro: boolean;
    position: string;
  };
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    avatar_url: string | null;
    is_pro: boolean;
  };
}

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newCommentContent, setNewCommentContent] = useState('');
  const [isCommenting, setIsCommenting] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, content, image_url, created_at, author_id,
          author:profiles(id, name, avatar_url, is_pro, position),
          post_likes(id, user_id),
          post_comments(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPosts: Post[] = data.map((p: any) => ({
          id: p.id,
          content: p.content,
          image_url: p.image_url,
          created_at: p.created_at,
          author_id: p.author_id,
          author: p.author,
          likes_count: p.post_likes.length,
          comments_count: p.post_comments[0].count,
          user_has_liked: p.post_likes.some((like: any) => like.user_id === user?.id)
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id, content, created_at,
          author:profiles(id, name, avatar_url, is_pro)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        setComments(prev => ({ ...prev, [postId]: data as any }));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handlePost = async () => {
    if (!newPostContent.trim() || !user) return;
    
    setIsPosting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: newPostContent.trim()
        });

      if (error) throw error;
      
      setNewPostContent('');
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string, userHasLiked: boolean) => {
    if (!user) return;
    
    try {
      // Optimistic update
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likes_count: userHasLiked ? p.likes_count - 1 : p.likes_count + 1,
            user_has_liked: !userHasLiked
          };
        }
        return p;
      }));

      if (userHasLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimism if failed
      fetchPosts();
    }
  };

  const handleComment = async (postId: string) => {
    if (!newCommentContent.trim() || !user) return;

    setIsCommenting(postId);
    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: newCommentContent.trim()
        });

      if (error) throw error;

      setNewCommentContent('');
      await loadComments(postId);
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsCommenting(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('¿Seguro de que querés borrar esta publicación?')) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-[90vh] bg-background items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[90vh] bg-background pb-32">
       {/* ── AMBIENT GLOWS ── */}
       <div className="fixed top-0 right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
       
       <div className="w-full max-w-2xl mx-auto px-4 mt-6 sm:mt-10 overflow-hidden relative z-10 flex flex-col gap-6">
          <div className="text-center mb-4">
             <h1 className="text-4xl md:text-6xl font-black text-foreground italic uppercase tracking-tighter drop-shadow-2xl flex items-center justify-center gap-3">
               Muro <span className="text-blue-500">Social</span>
             </h1>
             <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40 mt-2">
               Qué está pasando en el potrero
             </p>
          </div>

          {/* CREATE POST BOX */}
          <div className="glass-premium p-4 md:p-6 rounded-[2rem] border border-foreground/5 bg-surface relative overflow-hidden">
             <div className="flex gap-4">
               <div className="w-12 h-12 rounded-full bg-surface-elevated overflow-hidden shrink-0">
                 {user?.avatar_url ? (
                    <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                 ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center font-black text-primary">
                       {user?.user_metadata?.name?.charAt(0) || '?'}
                    </div>
                 )}
               </div>
               <div className="flex-1">
                 <textarea
                   value={newPostContent}
                   onChange={(e) => setNewPostContent(e.target.value)}
                   placeholder="¿Qué tenés en mente, crack?"
                   className="w-full bg-transparent border-none resize-none focus:outline-none text-foreground text-lg md:text-xl placeholder:text-foreground/30 min-h-[80px]"
                   maxLength={500}
                 />
                 <div className="flex items-center justify-between mt-4 pb-2 border-b border-foreground/5 mb-4">
                    <button className="text-foreground/40 hover:text-primary transition-colors flex items-center gap-2">
                       <ImageIcon className="w-5 h-5" />
                       <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">FOTO</span>
                    </button>
                    <div className="text-xs font-bold text-foreground/30 tracking-wider">
                       {newPostContent.length}/500
                    </div>
                 </div>
                 <div className="flex justify-end">
                    <button
                      onClick={handlePost}
                      disabled={isPosting || !newPostContent.trim()}
                      className="h-10 px-6 rounded-xl bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 active:scale-95 transition-all flex items-center gap-2 shadow-[0_5px_20px_rgba(59,130,246,0.3)]"
                    >
                      {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> PUBLICAR</>}
                    </button>
                 </div>
               </div>
             </div>
          </div>

          {/* POSTS FEED */}
          <div className="flex flex-col gap-4">
            <AnimatePresence>
               {posts.map((post) => (
                 <motion.div
                   key={post.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={cn("glass-premium p-4 md:p-6 rounded-[2rem] border transition-all relative", post.author.is_pro ? "border-yellow-500/20 bg-surface group" : "border-foreground/5 bg-surface group")}
                 >
                    {post.author.is_pro && (
                       <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] bg-yellow-500/10 transition-all pointer-events-none" />
                    )}
                    
                    <div className="flex justify-between items-start">
                       <Link href={`/profile?id=${post.author.id}`} className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-full bg-surface-elevated overflow-hidden shrink-0 border relative", post.author.is_pro ? "border-yellow-500/40" : "border-foreground/10")}>
                             {post.author.avatar_url ? (
                               <img src={post.author.avatar_url} className="w-full h-full object-cover" alt="" />
                             ) : (
                               <div className="w-full h-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                                  {post.author.name.charAt(0)}
                               </div>
                             )}
                             {post.author.is_pro && (
                               <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full w-4 h-4 flex items-center justify-center">
                                  <Zap className="w-2.5 h-2.5 text-black" />
                               </div>
                             )}
                          </div>
                          <div>
                             <div className="flex items-center gap-2">
                               <p className={cn("font-black text-sm uppercase italic tracking-tight", post.author.is_pro ? "text-yellow-500" : "text-foreground")}>
                                  {post.author.name}
                               </p>
                               <span className="text-foreground/30 text-[10px] font-bold">·</span>
                               <span className="text-foreground/40 text-[10px] font-bold uppercase tracking-wider">
                                  {timeAgo(post.created_at)}
                               </span>
                             </div>
                             <p className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
                                {post.author.position || 'JUGADOR'}
                             </p>
                          </div>
                       </Link>

                       {post.author_id === user?.id && (
                          <div className="relative group/menu">
                             <button className="text-foreground/40 hover:text-foreground">
                               <MoreHorizontal className="w-5 h-5" />
                             </button>
                             <div className="absolute right-0 top-full mt-1 w-32 bg-surface-elevated border border-foreground/10 rounded-xl shadow-xl opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all z-20">
                                <button 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-white/5 flex items-center gap-2 rounded-xl"
                                >
                                   <Trash2 className="w-3.5 h-3.5" /> BORRAR
                                </button>
                             </div>
                          </div>
                       )}
                    </div>

                    <div className="mt-4 mb-4">
                       <p className="text-foreground text-[15px] leading-relaxed whitespace-pre-wrap">
                          {post.content}
                       </p>
                    </div>

                    <div className="flex items-center gap-6 pt-3 border-t border-foreground/5">
                       <button 
                         onClick={() => handleLike(post.id, post.user_has_liked)}
                         className={cn("flex items-center gap-2 text-xs font-bold transition-all group/btn", post.user_has_liked ? "text-red-500" : "text-foreground/40 hover:text-red-500")}
                       >
                          <div className={cn("p-1.5 rounded-full transition-colors", post.user_has_liked ? "bg-red-500/10" : "group-hover/btn:bg-red-500/10")}>
                             <Heart className={cn("w-4 h-4", post.user_has_liked ? "fill-red-500" : "")} />
                          </div>
                          <span>{post.likes_count}</span>
                       </button>

                       <button 
                         onClick={() => {
                            if (expandedPostId === post.id) {
                               setExpandedPostId(null);
                            } else {
                               setExpandedPostId(post.id);
                               loadComments(post.id);
                            }
                         }}
                         className={cn("flex items-center gap-2 text-xs font-bold transition-all group/btn text-foreground/40 hover:text-blue-500")}
                       >
                          <div className="p-1.5 rounded-full transition-colors group-hover/btn:bg-blue-500/10">
                             <MessageSquare className="w-4 h-4" />
                          </div>
                          <span>{post.comments_count}</span>
                       </button>

                       <button className="flex items-center gap-2 text-xs font-bold transition-all group/btn text-foreground/40 hover:text-primary ml-auto">
                          <div className="p-1.5 rounded-full transition-colors group-hover/btn:bg-primary/10">
                             <Share2 className="w-4 h-4" />
                          </div>
                       </button>
                    </div>

                    {/* COMMENTS SECTION */}
                    {expandedPostId === post.id && (
                       <motion.div 
                         initial={{ opacity: 0, height: 0 }}
                         animate={{ opacity: 1, height: 'auto' }}
                         className="mt-4 pt-4 border-t border-foreground/5"
                       >
                          <div className="flex gap-3 mb-4">
                             <div className="w-8 h-8 rounded-full bg-surface-elevated overflow-hidden shrink-0 border border-foreground/10">
                               {user?.avatar_url ? (
                                  <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                               ) : (
                                  <div className="w-full h-full bg-primary/10 flex items-center justify-center font-black text-primary text-[10px]">
                                     {user?.user_metadata?.name?.charAt(0) || '?'}
                                  </div>
                               )}
                             </div>
                             <div className="flex-1 flex gap-2">
                                <input
                                   type="text"
                                   placeholder="Escribe tu comentario..."
                                   value={newCommentContent}
                                   onChange={(e) => setNewCommentContent(e.target.value)}
                                   className="flex-1 bg-foreground/[0.03] border border-foreground/5 rounded-xl px-4 text-sm focus:outline-none focus:border-blue-500/50"
                                />
                                <button
                                   onClick={() => handleComment(post.id)}
                                   disabled={isCommenting === post.id || !newCommentContent.trim()}
                                   className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 transition-colors"
                                >
                                   {isCommenting === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                             </div>
                          </div>

                          <div className="flex flex-col gap-3">
                             {comments[post.id]?.map(comment => (
                                <div key={comment.id} className="flex gap-3">
                                   <Link href={`/profile?id=${comment.author.id}`} className="w-6 h-6 rounded-full bg-surface-elevated overflow-hidden shrink-0 mt-1">
                                      {comment.author.avatar_url ? (
                                         <img src={comment.author.avatar_url} className="w-full h-full object-cover" alt="" />
                                      ) : (
                                         <div className="w-full h-full bg-primary/10 flex items-center justify-center font-black text-primary text-[8px]">
                                            {comment.author.name.charAt(0)}
                                         </div>
                                      )}
                                   </Link>
                                   <div className="flex-1 bg-foreground/[0.02] p-3 rounded-2xl rounded-tl-none border border-foreground/5">
                                      <div className="flex items-center gap-2 mb-1">
                                         <Link href={`/profile?id=${comment.author.id}`} className={cn("text-xs font-black italic uppercase tracking-tight", comment.author.is_pro ? "text-yellow-500" : "text-foreground")}>
                                            {comment.author.name}
                                         </Link>
                                         <span className="text-[9px] text-foreground/40 font-bold tracking-widest uppercase">
                                            {timeAgo(comment.created_at)}
                                         </span>
                                      </div>
                                      <p className="text-sm text-foreground/80">{comment.content}</p>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </motion.div>
                    )}
                 </motion.div>
               ))}
               {posts.length === 0 && (
                  <div className="text-center py-20 text-foreground/40 italic font-black uppercase tracking-widest text-sm">
                     Aún no hay publicaciones. ¡Sé el primero en romper el hielo!
                  </div>
               )}
            </AnimatePresence>
          </div>
       </div>
    </div>
  );
}
