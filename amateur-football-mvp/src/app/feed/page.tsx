'use client';

import { useState, useEffect, useRef } from 'react';
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
  Zap,
  X,
  Trophy,
  Users
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if ((!newPostContent.trim() && !selectedImage) || !user) return;
    
    setIsPosting(true);
    try {
      let imageUrl = null;
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const filePath = `feed/${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('uploads').upload(filePath, selectedImage);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: newPostContent.trim(),
          image_url: imageUrl
        });

      if (error) throw error;
      
      setNewPostContent('');
      setSelectedImage(null);
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
    <div className="flex flex-col min-h-screen bg-background sm:pb-0">
       <div className="w-full max-w-6xl mx-auto flex xl:gap-8">
          {/* LEFT SIDEBAR (EXPLORAR) */}
          <div className="hidden lg:block w-64 shrink-0 px-4 py-6 sticky top-0 h-screen overflow-y-auto">
             <div className="flex flex-col gap-6">
                <Link href="/" className="px-2 mb-2">
                   <h2 className="text-3xl font-black italic tracking-tighter uppercase text-foreground">
                      Pelo<span className="text-primary">tify</span>
                   </h2>
                </Link>
                {/* Links Interesantes */}
                <div className="space-y-3">
                   <Link href="/tournaments" className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-foreground/[0.05] transition-colors group">
                      <Trophy className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                      <span className="text-lg font-black italic uppercase tracking-tighter group-hover:text-primary transition-colors">Torneos</span>
                   </Link>
                   <Link href="/ranks" className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-foreground/[0.05] transition-colors group">
                      <Zap className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                      <span className="text-lg font-black italic uppercase tracking-tighter group-hover:text-primary transition-colors">Ligas</span>
                   </Link>
                   <Link href="/teams" className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-foreground/[0.05] transition-colors group">
                      <Users className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                      <span className="text-lg font-black italic uppercase tracking-tighter group-hover:text-primary transition-colors">Equipos</span>
                   </Link>
                </div>
                {/* CTA Pelotify Pro */}
                <div className="mt-8 p-5 rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-transparent relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/20 blur-3xl rounded-full" />
                   <p className="text-xs text-yellow-500 font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 fill-yellow-500"/> Pro</p>
                   <p className="text-[13px] text-foreground/80 mb-4 font-medium leading-relaxed">Verifica tu cuenta y desbloquea el marco dorado exclusivo para tus posteos.</p>
                   <Link href="/pro"><button className="w-full py-2.5 bg-yellow-500 text-black font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-yellow-400 active:scale-95 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]">Hazte PRO</button></Link>
                </div>
             </div>
          </div>

          {/* MAIN CENTRO FEED */}
          <div className="flex-1 w-full max-w-2xl border-x border-foreground/10 min-h-screen flex flex-col relative z-10 bg-background/50 backdrop-blur-sm">
          {/* STICKY HEADER */}
          <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-foreground/10 px-4 py-3 pb-3 pt-4 flex items-center justify-between cursor-pointer">
             <h1 className="text-xl font-bold text-foreground">Inicio</h1>
             <Zap className="w-5 h-5 text-blue-500 fill-blue-500/20" />
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
               <div className="flex-1 flex flex-col pt-1">
                 <textarea
                   value={newPostContent}
                   onChange={(e) => setNewPostContent(e.target.value)}
                   placeholder="¡Habla, crack! ¿Qué está pasando?"
                   className="w-full bg-transparent border-none resize-none focus:outline-none text-foreground text-lg placeholder:text-foreground/50 min-h-[50px] font-medium"
                   maxLength={500}
                 />

                 <AnimatePresence>
                   {selectedImage && (
                     <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative mt-2 mb-4 w-fit">
                        <img src={URL.createObjectURL(selectedImage)} className="h-48 md:h-64 rounded-2xl object-cover border border-foreground/10" alt="Preview" />
                        <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-background text-foreground backdrop-blur-md rounded-full shadow-lg transition-colors">
                           <X className="w-4 h-4" />
                        </button>
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <div className="flex items-center justify-between mt-2 pt-2 border-t border-foreground/5">
                    <div className="flex items-center gap-1">
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => { if(e.target.files && e.target.files[0]) setSelectedImage(e.target.files[0]) }} />
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors flex items-center justify-center group relative">
                           <ImageIcon className="w-5 h-5" />
                           <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Subir foto</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-foreground/30">{newPostContent.length}/500</span>
                        <button
                          onClick={handlePost}
                          disabled={isPosting || (!newPostContent.trim() && !selectedImage)}
                          className="px-5 py-2 rounded-full bg-blue-500 text-white font-black uppercase tracking-widest text-[11px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 active:scale-95 transition-all shadow-sm flex items-center gap-2"
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
                        <div className="mt-1 mb-3 pr-2">
                           {post.content && (
                             <p className="text-foreground text-[15px] leading-relaxed whitespace-pre-wrap mb-3">
                                {post.content}
                             </p>
                           )}
                           {post.image_url && (
                             <div className="rounded-2xl border border-foreground/10 overflow-hidden mb-2 mt-2">
                               <img src={post.image_url} className="w-full max-h-[500px] object-cover" alt="Post adjunto" />
                             </div>
                           )}
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

          {/* RIGHT SIDEBAR (SUGERENCIAS / TENDENCIAS) */}
          <div className="hidden xl:block w-80 shrink-0 px-6 py-6 sticky top-0 h-screen overflow-y-auto">
             {/* Caja de Búsqueda Falsa o Real */}
             <div className="w-full h-11 rounded-full bg-foreground/[0.03] border border-foreground/10 flex items-center px-4 mb-6 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                <Users className="w-4 h-4 text-foreground/40 mr-3" />
                <input type="text" placeholder="Buscar jugadores..." className="bg-transparent border-none outline-none text-sm w-full font-medium" />
             </div>

             <div className="bg-foreground/[0.02] border border-foreground/10 rounded-2xl p-4 overflow-hidden relative">
                <h3 className="font-black text-lg italic uppercase tracking-tighter mb-4 z-10 relative">Sugerencias <span className="text-primary">PRO</span></h3>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 blur-2xl rounded-full" />
                
                <div className="space-y-5 relative z-10">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-foreground/10 overflow-hidden border border-primary/20"><img src="https://i.pravatar.cc/150?u=4" className="w-full h-full object-cover"/></div>
                         <div className="flex flex-col">
                            <span className="text-sm font-bold flex items-center gap-1">Martín L. <Zap className="w-3 h-3 text-primary fill-primary"/></span>
                            <span className="text-xs text-foreground/50">@martin_gol</span>
                         </div>
                      </div>
                      <button className="px-4 py-1.5 bg-foreground text-background font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-foreground/90 transition-colors">Seguir</button>
                   </div>
                   
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-foreground/10 overflow-hidden border border-foreground/5"><img src="https://i.pravatar.cc/150?u=2" className="w-full h-full object-cover"/></div>
                         <div className="flex flex-col">
                            <span className="text-sm font-bold flex items-center gap-1">Diego R.</span>
                            <span className="text-xs text-foreground/50">@diego_10</span>
                         </div>
                      </div>
                      <button className="px-4 py-1.5 bg-foreground text-background font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-foreground/90 transition-colors">Seguir</button>
                   </div>
                </div>

                <Link href="/search"><button className="mt-5 text-sm text-primary hover:underline font-bold transition-all">Ver más jugadores</button></Link>
             </div>

             <div className="mt-4 text-[11px] text-foreground/40 font-medium px-4 flex flex-wrap gap-x-3 gap-y-1">
                <span className="hover:underline cursor-pointer">Términos</span>
                <span className="hover:underline cursor-pointer">Privacidad</span>
                <span className="hover:underline cursor-pointer">Cookies</span>
                <span className="hover:underline cursor-pointer">Accesibilidad</span>
                <span>© 2026 Pelotify</span>
             </div>
          </div>
       </div>
    </div>
  );
}
