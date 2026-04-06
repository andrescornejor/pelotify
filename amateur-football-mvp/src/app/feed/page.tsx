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
    <div className="flex flex-col min-h-screen bg-background">
       <div className="w-full max-w-2xl mx-auto border-x border-foreground/10 min-h-screen flex flex-col relative z-10 bg-background/50 backdrop-blur-sm">
          {/* STICKY HEADER */}
          <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-foreground/10 px-4 py-3 flex items-center justify-between cursor-pointer">
             <h1 className="text-xl font-bold text-foreground">Inicio</h1>
             <Zap className="w-5 h-5 text-blue-500" />
          </div>
       

          {/* CREATE POST BOX */}
          <div className="p-4 border-b border-foreground/10 flex gap-4 hidden sm:flex">
               <div className="w-10 h-10 rounded-full bg-surface-elevated overflow-hidden shrink-0">
                  {user?.avatar_url ? (
                     <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                     <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {user?.user_metadata?.name?.charAt(0) || '?'}
                     </div>
                  )}
               </div>
               <div className="flex-1 flex flex-col">
                 <textarea
                   value={newPostContent}
                   onChange={(e) => setNewPostContent(e.target.value)}
                   placeholder="¡Habla, crack! ¿Qué está pasando?"
                   className="w-full bg-transparent border-none resize-none focus:outline-none text-foreground text-lg placeholder:text-foreground/50 min-h-[50px] font-medium"
                   maxLength={500}
                 />
                 <div className="flex items-center justify-between mt-2 pt-2">
                    <div className="flex items-center gap-1">
                        <button className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors flex items-center justify-center">
                           <ImageIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-foreground/40">{newPostContent.length}/500</span>
                        <button
                          onClick={handlePost}
                          disabled={isPosting || !newPostContent.trim()}
                          className="px-5 py-1.5 rounded-full bg-blue-500 text-white font-bold text-[15px] tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 active:scale-95 transition-all shadow-sm"
                        >
                          {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Postear'}
                        </button>
                    </div>
                 </div>
               </div>
          </div>
          {/* POSTS FEED */}
          <div className="flex flex-col pb-20">
            <AnimatePresence>
               {posts.map((post) => (
                 <motion.div
                   key={post.id}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className={cn("p-4 border-b border-foreground/10 hover:bg-foreground/[0.02] transition-colors relative flex gap-3 cursor-pointer", post.author.is_pro ? "bg-yellow-500/[0.02]" : "")}
                 >
                    {/* LEFTSIDE AVATAR */}
                    <div className="shrink-0 flex flex-col items-center">
                        <Link href={`/profile?id=${post.author.id}`} className={cn("w-10 h-10 rounded-full overflow-hidden shrink-0 border relative hover:opacity-90 transition-opacity", post.author.is_pro ? "border-yellow-500/50" : "border-foreground/10")}>
                             {post.author.avatar_url ? (
                               <img src={post.author.avatar_url} className="w-full h-full object-cover" alt="" />
                             ) : (
                               <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                                  {post.author.name.charAt(0)}
                               </div>
                             )}
                        </Link>
                    </div>

                    {/* RIGHTSIDE CONTENT */}
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-1.5 flex-wrap">
                               <Link href={`/profile?id=${post.author.id}`} className="group flex items-center gap-1.5 min-w-0">
                                   <span className={cn("font-bold text-[15px] truncate group-hover:underline", post.author.is_pro ? "text-yellow-500" : "text-foreground")}>
                                      {post.author.name}
                                   </span>
                                   {post.author.is_pro && (
                                      <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
                                   )}
                                   <span className="text-foreground/50 text-[15px] truncate">
                                      @{post.author.name.toLowerCase().replace(/\s+/g, '')}
                                   </span>
                               </Link>
                               <span className="text-foreground/50 text-[15px]">·</span>
                               <span className="text-foreground/50 text-[15px] hover:underline cursor-pointer">
                                  {timeAgo(post.created_at)}
                               </span>
                           </div>

                           {post.author_id === user?.id && (
                              <div className="relative group/menu shrink-0">
                                 <button className="text-foreground/40 hover:text-blue-500 p-1.5 hover:bg-blue-500/10 rounded-full transition-colors mt-[-4px]">
                                   <MoreHorizontal className="w-4 h-4" />
                                 </button>
                                 <div className="absolute right-0 top-full mt-1 w-32 bg-surface-elevated border border-foreground/10 rounded-xl shadow-xl flex flex-col opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all z-20 overflow-hidden">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                                      className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-white/5 flex items-center gap-2"
                                    >
                                       <Trash2 className="w-4 h-4" /> Eliminar
                                    </button>
                                 </div>
                              </div>
                           )}
                        </div>

                        {/* Content */}
                        <div className="mt-1 mb-3">
                           <p className="text-foreground text-[15px] leading-relaxed whitespace-pre-wrap">
                              {post.content}
                           </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between text-foreground/50 max-w-md pr-4">
                           <button 
                             onClick={(e) => {
                                e.stopPropagation();
                                if (expandedPostId === post.id) {
                                   setExpandedPostId(null);
                                } else {
                                   setExpandedPostId(post.id);
                                   loadComments(post.id);
                                }
                             }}
                             className={cn("flex items-center gap-1.5 text-[13px] group/btn transition-colors", expandedPostId === post.id ? "text-blue-500" : "hover:text-blue-500")}
                           >
                              <div className={cn("p-2 rounded-full transition-colors", expandedPostId === post.id ? "bg-blue-500/10" : "group-hover/btn:bg-blue-500/10")}>
                                 <MessageSquare className="w-4 h-4" />
                              </div>
                              <span>{post.comments_count > 0 ? post.comments_count : ''}</span>
                           </button>

                           <button className="flex items-center gap-1.5 text-[13px] group/btn hover:text-green-500 transition-colors" onClick={(e) => e.stopPropagation()}>
                              <div className="p-2 rounded-full group-hover/btn:bg-green-500/10 transition-colors">
                                 <Zap className="w-4 h-4" />
                              </div>
                           </button>

                           <button 
                             onClick={(e) => { e.stopPropagation(); handleLike(post.id, post.user_has_liked); }}
                             className={cn("flex items-center gap-1.5 text-[13px] group/btn transition-colors", post.user_has_liked ? "text-pink-600" : "hover:text-pink-600")}
                           >
                              <div className={cn("p-2 rounded-full transition-colors", post.user_has_liked ? "bg-pink-600/10" : "group-hover/btn:bg-pink-600/10")}>
                                 <Heart className={cn("w-4 h-4", post.user_has_liked ? "fill-pink-600" : "")} />
                              </div>
                              <span>{post.likes_count > 0 ? post.likes_count : ''}</span>
                           </button>

                           <button className="flex items-center gap-1.5 text-[13px] group/btn hover:text-blue-500 transition-colors" onClick={(e) => e.stopPropagation()}>
                              <div className="p-2 rounded-full group-hover/btn:bg-blue-500/10 transition-colors">
                                 <Share2 className="w-4 h-4" />
                              </div>
                           </button>
                        </div>

                    {/* COMMENTS SECTION */}
                    {expandedPostId === post.id && (
                       <motion.div 
                         initial={{ opacity: 0, height: 0 }}
                         animate={{ opacity: 1, height: 'auto' }}
                         className="mt-2 pt-2 border-t border-foreground/10"
                         onClick={(e) => e.stopPropagation()}
                       >
                          <div className="flex gap-3 mb-4 py-2">
                             <div className="w-8 h-8 rounded-full bg-surface-elevated overflow-hidden shrink-0 border border-foreground/10">
                               {user?.avatar_url ? (
                                  <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                               ) : (
                                  <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                     {user?.user_metadata?.name?.charAt(0) || '?'}
                                  </div>
                               )}
                             </div>
                             <div className="flex-1 flex items-center gap-2 bg-foreground/[0.03] border border-foreground/10 rounded-full pr-1 pl-4 h-10 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                                <input
                                   type="text"
                                   placeholder="Postea tu respuesta..."
                                   value={newCommentContent}
                                   onChange={(e) => setNewCommentContent(e.target.value)}
                                   className="flex-1 bg-transparent text-[15px] focus:outline-none placeholder:text-foreground/50 h-full"
                                />
                                <button
                                   onClick={() => handleComment(post.id)}
                                   disabled={isCommenting === post.id || !newCommentContent.trim()}
                                   className="h-8 px-4 rounded-full bg-blue-500 text-white font-bold text-sm tracking-wide disabled:opacity-50 hover:bg-blue-600 transition-colors flex items-center justify-center"
                                >
                                   {isCommenting === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Responder'}
                                </button>
                             </div>
                          </div>

                          <div className="flex flex-col">
                             {comments[post.id]?.map(comment => (
                                <div key={comment.id} className="flex gap-3 py-3 border-t border-foreground/5 relative">
                                   {/* Connecting line */}
                                   <div className="absolute left-[19px] top-[-20px] bottom-[30px] w-[2px] bg-foreground/10 -z-10" />
                                   
                                   <Link href={`/profile?id=${comment.author.id}`} className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-surface border border-foreground/10 z-10 z-10 mt-0.5 relative hover:opacity-90">
                                      {comment.author.avatar_url ? (
                                         <img src={comment.author.avatar_url} className="w-full h-full object-cover" alt="" />
                                      ) : (
                                         <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                                            {comment.author.name.charAt(0)}
                                         </div>
                                      )}
                                   </Link>
                                   <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                         <Link href={`/profile?id=${comment.author.id}`} className={cn("font-bold text-[15px] hover:underline", comment.author.is_pro ? "text-yellow-500" : "text-foreground")}>
                                            {comment.author.name}
                                         </Link>
                                         <span className="text-foreground/50 text-[15px] truncate max-w-[100px] sm:max-w-none">
                                            @{comment.author.name.toLowerCase().replace(/\s+/g, '')}
                                         </span>
                                         <span className="text-foreground/50 text-[15px]">·</span>
                                         <span className="text-foreground/50 text-[15px] hover:underline cursor-pointer">
                                            {timeAgo(comment.created_at)}
                                         </span>
                                      </div>
                                      <div className="text-foreground/50 text-[15px] mb-1">
                                          En respuesta a <span className="text-blue-500 cursor-pointer hover:underline">@{post.author.name.toLowerCase().replace(/\s+/g, '')}</span>
                                      </div>
                                      <p className="text-[15px] text-foreground leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </motion.div>
                    )}
                  </div>
                </motion.div>
                ))}
                {posts.length === 0 && (
                   <div className="text-center py-20 text-foreground/50 font-medium text-lg border-t border-foreground/10">
                      Aún no hay publicaciones. ¡Sé el primero en twittear!
                   </div>
                )}
             </AnimatePresence>
          </div>
       </div>
    </div>
  );
}
