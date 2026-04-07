'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  TrendingUp,
  Search,
  X,
  Users,
  Trophy,
  Flame,
  Hash,
  UserPlus,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Globe,
  LinkIcon,
} from 'lucide-react';
import Link from 'next/link';
import { uploadPostImage } from '@/lib/storage';
import { compressImage, blobToFile } from '@/lib/imageUtils';
import { sendFriendRequest } from '@/lib/friends';
import ShareModal from '@/components/ShareModal';

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

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w\u00C0-\u024FáéíóúñÁÉÍÓÚÑ]+/g);
  return matches ? matches.map(t => t.slice(1)) : [];
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

  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Sidebar data
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Bookmark state
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());

  // Share state
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [shareModalPost, setShareModalPost] = useState<Post | null>(null);

  // Friend request state
  const [pendingFriendRequests, setPendingFriendRequests] = useState<Set<string>>(new Set());
  const [sentFriendRequests, setSentFriendRequests] = useState<Set<string>>(new Set());
  const [existingFriends, setExistingFriends] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPosts();
    fetchSidebarData();
    if (user) {
      fetchBookmarks();
      fetchFriendshipStatuses();
    }
  }, [user]);

  const fetchFriendshipStatuses = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('friendships')
        .select('id, user_id, friend_id, status')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (data) {
        const friends = new Set<string>();
        const pending = new Set<string>();
        data.forEach(f => {
          const otherId = f.user_id === user.id ? f.friend_id : f.user_id;
          if (f.status === 'accepted') {
            friends.add(otherId);
          } else if (f.status === 'pending') {
            pending.add(otherId);
          }
        });
        setExistingFriends(friends);
        setSentFriendRequests(pending);
      }
    } catch (err) {
      console.error('Error fetching friendships:', err);
    }
  };

  const fetchBookmarks = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('post_bookmarks')
        .select('post_id')
        .eq('user_id', user.id);
      if (data) {
        setBookmarkedPosts(new Set(data.map(b => b.post_id)));
      }
    } catch (err) {
      // Table might not exist yet, gracefully handle
      console.error('Bookmarks not available:', err);
    }
  };

  const fetchSidebarData = async () => {
    try {
      // Top players by elo
      const { data: players } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, elo, position, is_pro')
        .order('elo', { ascending: false })
        .limit(5);
      if (players) setTopPlayers(players);

      // Suggested users (random recent users, excluding current user)
      const { data: suggested } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, position, is_pro')
        .neq('id', user?.id || '')
        .order('created_at', { ascending: false })
        .limit(4);
      if (suggested) setSuggestedUsers(suggested);
    } catch (err) {
      console.error('Error fetching sidebar:', err);
    }
  };

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

  // Real trending topics: extract hashtags from all posts
  const trendingTopics = useMemo(() => {
    const tagCount: Record<string, number> = {};
    posts.forEach(post => {
      const tags = extractHashtags(post.content);
      tags.forEach(tag => {
        const lower = tag.toLowerCase();
        tagCount[lower] = (tagCount[lower] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  // Filtered posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(post =>
      post.content.toLowerCase().includes(q) ||
      post.author.name.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async () => {
    if ((!newPostContent.trim() && !selectedImage) || !user) return;

    setIsPosting(true);
    try {
      let imageUrl: string | null = null;

      if (selectedImage) {
        setIsUploadingImage(true);
        try {
          const compressed = await compressImage(selectedImage, 1200, 0.8);
          const compressedFile = blobToFile(compressed, selectedImage.name);
          imageUrl = await uploadPostImage(compressedFile, user.id);
        } catch (uploadErr) {
          console.error('Image upload error:', uploadErr);
        }
        setIsUploadingImage(false);
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
      clearImage();
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

  const handleBookmark = async (postId: string) => {
    if (!user) return;
    const isBookmarked = bookmarkedPosts.has(postId);

    // Optimistic update
    setBookmarkedPosts(prev => {
      const next = new Set(prev);
      if (isBookmarked) next.delete(postId);
      else next.add(postId);
      return next;
    });

    try {
      if (isBookmarked) {
        await supabase
          .from('post_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('post_bookmarks')
          .insert({ post_id: postId, user_id: user.id });
      }
    } catch (err) {
      // Revert on error
      setBookmarkedPosts(prev => {
        const next = new Set(prev);
        if (isBookmarked) next.add(postId);
        else next.delete(postId);
        return next;
      });
      console.error('Bookmark error:', err);
    }
  };

  const handleShare = async (post: Post) => {
    setShareModalPost(post);
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    if (!user || sentFriendRequests.has(targetUserId) || existingFriends.has(targetUserId)) return;

    // Optimistic
    setSentFriendRequests(prev => new Set(prev).add(targetUserId));

    try {
      await sendFriendRequest(user.id, targetUserId);
    } catch (err) {
      // Revert
      setSentFriendRequests(prev => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
      console.error('Friend request error:', err);
    }
  };

  const handleHashtagClick = (tag: string) => {
    setSearchQuery(`#${tag}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background pt-[110px] px-3 sm:px-5 lg:px-10 xl:px-16 relative overflow-hidden">
        {/* AMBIENT BACKGROUND */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] opacity-[0.03]" style={{ background: 'radial-gradient(circle, #2cfc7d 0%, transparent 70%)' }} />
        </div>

        <div className="flex gap-0 lg:gap-6 xl:gap-8 grow">
          {/* LEFT SIDEBAR SKELETON */}
          <aside className="hidden lg:flex flex-col w-[280px] xl:w-[320px] shrink-0 gap-4">
            <div className="h-[300px] w-full rounded-[2rem] bg-foreground/[0.03] animate-pulse border border-foreground/[0.06]" />
          </aside>

          {/* MAIN FEED SKELETON */}
          <div className="w-full lg:flex-1 border-x border-foreground/[0.06] flex flex-col gap-6 px-5 py-4">
            <div className="h-20 w-full rounded-2xl bg-foreground/[0.03] animate-pulse" />
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-11 h-11 rounded-full bg-foreground/[0.03] animate-pulse" />
                  <div className="space-y-2 flex-1 pt-1">
                    <div className="h-4 w-[40%] rounded bg-foreground/[0.03] animate-pulse" />
                    <div className="h-3 w-[20%] rounded bg-foreground/[0.03] animate-pulse" />
                  </div>
                </div>
                <div className="h-32 w-full rounded-2xl bg-foreground/[0.03] animate-pulse" />
              </div>
            ))}
          </div>

          {/* RIGHT SIDEBAR SKELETON */}
          <aside className="hidden lg:flex flex-col w-[280px] xl:w-[340px] shrink-0 gap-4">
            <div className="h-12 w-full rounded-2xl bg-foreground/[0.03] animate-pulse" />
            <div className="h-[200px] w-full rounded-[2rem] bg-foreground/[0.03] animate-pulse" />
            <div className="h-[300px] w-full rounded-[2rem] bg-foreground/[0.03] animate-pulse" />
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pt-0 relative overflow-hidden">
      {/* AMBIENT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #2cfc7d 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] opacity-[0.02]"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
        />
      </div>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleImageSelect}
      />

      {/* 3-column layout matching TopHeader padding exactly */}
      <div className="w-full px-3 sm:px-5 lg:px-10 xl:px-16 pt-[80px]">
        <div className="flex gap-0 lg:gap-6 xl:gap-8">

          {/* ── LEFT SIDEBAR (desktop only) ── */}
          <aside className="hidden lg:flex flex-col w-[280px] xl:w-[320px] shrink-0 sticky top-[80px] self-start pb-8 pt-2 xl:pl-4">
            {/* Navigation Links - Twitter Style */}
            <nav className="flex flex-col gap-1 w-full">
              {[
                { href: '/feed', icon: Zap, label: 'Feed', color: 'text-primary' },
                { href: '/search', icon: Search, label: 'Buscar', color: 'text-foreground' },
                { href: '/friends', icon: Users, label: 'Social', color: 'text-foreground' },
                { href: '/teams', icon: Trophy, label: 'Equipos', color: 'text-foreground' },
                { href: '/highlights', icon: Flame, label: 'FutTok', color: 'text-foreground' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 px-5 py-3.5 rounded-full text-foreground hover:bg-foreground/[0.08] transition-all duration-200 group w-fit"
                >
                  <item.icon className={cn("w-6 h-6 xl:w-7 xl:h-7 transition-transform group-hover:scale-110", item.color)} />
                  <span className={cn("text-xl xl:text-2xl font-black italic uppercase font-kanit tracking-tight leading-none pt-1 pr-2", item.color === 'text-primary' ? 'text-primary' : '')}>{item.label}</span>
                </Link>
              ))}

              <Link
                href="/pro"
                className="mt-2 flex items-center gap-4 px-5 py-3.5 rounded-full text-foreground hover:bg-yellow-500/10 transition-all duration-200 group w-fit"
              >
                <div className="relative">
                  <Zap className="w-6 h-6 xl:w-7 xl:h-7 text-yellow-500 fill-yellow-500 transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-yellow-500 blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                </div>
                <span className="text-xl xl:text-2xl font-black italic uppercase font-kanit text-yellow-500 tracking-tight leading-none pt-1 pr-2">Pelotify Pro</span>
              </Link>

              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setTimeout(() => document.querySelector('textarea')?.focus(), 500);
                }}
                className="mt-6 w-[90%] py-4 rounded-full bg-primary text-background text-lg xl:text-xl font-black italic uppercase font-kanit tracking-wide hover:opacity-90 transition-all shadow-[0_0_20px_rgba(44,252,125,0.2)] hover:shadow-[0_0_30px_rgba(44,252,125,0.4)] flex items-center justify-center pt-[18px]"
              >
                Postear
              </button>
            </nav>
          </aside>

          {/* ── MAIN FEED (center column) ── */}
          <div className="w-full lg:flex-1 border-x border-foreground/[0.08] min-h-screen flex flex-col relative z-20">
            {/* STICKY HEADER */}
            <div
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="sticky top-[80px] z-50 bg-background/80 backdrop-blur-md border-b border-foreground/[0.08] px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black italic uppercase font-kanit text-foreground tracking-tighter leading-none">Inicio</h1>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/pro" className="group">
                  <Zap className="w-5 h-5 text-foreground/40 group-hover:text-yellow-500 transition-colors" />
                </Link>
              </div>
            </div>

            {/* MOBILE SEARCH BAR */}
            <div className="lg:hidden p-4 border-b border-foreground/[0.08] bg-background">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar posts o usuarios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="w-full h-11 bg-foreground/[0.03] border border-foreground/[0.06] rounded-2xl pl-11 pr-10 text-[14px] text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-background transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-lg bg-foreground/[0.05] text-foreground/40 hover:bg-primary hover:text-background transition-all active:scale-90"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* CREATE POST BOX */}
            <div className="p-4 sm:px-5 sm:py-5 border-b border-foreground/[0.08] flex gap-3 bg-background">
              <div className="w-12 h-12 rounded-full bg-surface-elevated overflow-hidden shrink-0 transition-opacity hover:opacity-90 cursor-pointer">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-[17px]">
                    {user?.user_metadata?.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col relative min-h-[50px]">
                <div className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words text-lg font-medium leading-relaxed p-0 border-none select-none text-foreground z-0 overflow-hidden">
                  {newPostContent.split(/(#[\w\u00C0-\u024FáéíóúñÁÉÍÓÚÑ]+)/g).map((part, i) => (
                    part.startsWith('#') ? <span key={i} className="text-primary font-bold">{part}</span> : part
                  ))}
                  {newPostContent.endsWith('\n') ? '\n' : ''}
                </div>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="¡Habla, crack! ¿Qué está pasando?"
                  className="w-full bg-transparent border-none resize-none focus:outline-none text-transparent text-lg placeholder:text-foreground/35 min-h-[50px] font-medium leading-relaxed relative z-10 selection:bg-primary/20 caret-foreground p-0 m-0 overflow-hidden"
                  maxLength={500}
                />

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative mt-3 rounded-2xl overflow-hidden border border-foreground/10 shadow-lg">
                    <img src={imagePreview} alt="Preview" className="w-full max-h-[300px] object-cover" />
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/90 transition-all backdrop-blur-sm hover:scale-110 active:scale-95 z-20"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-foreground/[0.04]">
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center group"
                      title="Subir imagen"
                    >
                      <ImageIcon className="w-5 h-5 group-hover:scale-105 transition-transform" />
                    </button>
                    <button
                      onClick={() => {
                        setNewPostContent(prev => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' #' : '#'));
                        setTimeout(() => document.querySelector('textarea')?.focus(), 10);
                      }}
                      className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center group"
                      title="Hashtag"
                    >
                      <Hash className="w-5 h-5 group-hover:scale-105 transition-transform" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    {newPostContent.length > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="relative w-6 h-6">
                          <svg className="w-6 h-6 -rotate-90" viewBox="0 0 28 28">
                            <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" className="text-foreground/[0.06]" strokeWidth="2.5" />
                            <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" className={cn(newPostContent.length > 450 ? "text-amber-500" : newPostContent.length > 480 ? "text-red-500" : "text-primary")} strokeWidth="2.5" strokeDasharray={`${(newPostContent.length / 500) * 69.1} 69.1`} strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className="h-6 w-px bg-foreground/10" />
                      </div>
                    )}
                    <button
                      onClick={handlePost}
                      disabled={isPosting || (!newPostContent.trim() && !selectedImage)}
                      className="px-5 py-1.5 rounded-full bg-primary text-background font-bold text-[15px] tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.96] transition-all duration-200 mt-1"
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
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index < 10 ? index * 0.03 : 0 }}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('a, button, input')) return;
                      if (expandedPostId === post.id) {
                        setExpandedPostId(null);
                      } else {
                        setExpandedPostId(post.id);
                        loadComments(post.id);
                      }
                    }}
                    className={cn("p-4 sm:px-5 sm:py-3.5 border-b border-foreground/[0.08] hover:bg-foreground/[0.03] transition-colors duration-200 relative flex gap-3 cursor-pointer group/post", post.author.is_pro ? "bg-gradient-to-r from-yellow-500/[0.03] to-transparent" : "")}
                  >
                    {/* LEFTSIDE AVATAR */}
                    <div className="shrink-0 flex flex-col items-center">
                      <Link href={`/profile?id=${post.author.id}`} className={cn("w-12 h-12 rounded-full overflow-hidden shrink-0 relative hover:opacity-90 transition-opacity duration-200 z-10", post.author.is_pro ? "ring-2 ring-yellow-500/40" : "")}>
                        {post.author.avatar_url ? (
                          <img src={post.author.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center font-bold text-primary text-[15px]">
                            {post.author.name.charAt(0)}
                          </div>
                        )}
                      </Link>
                    </div>

                    {/* RIGHTSIDE CONTENT */}
                    <div className="flex-1 min-w-0 mt-0.5">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5 flex-wrap leading-tight">
                          <Link href={`/profile?id=${post.author.id}`} className="group flex items-center gap-1 min-w-0">
                            <span className={cn("font-bold text-[15px] truncate group-hover:underline", post.author.is_pro ? "text-yellow-500" : "text-foreground")}>
                              {post.author.name}
                            </span>
                            {post.author.is_pro && (
                              <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
                            )}
                            <span className="text-foreground/40 text-[15px] truncate ml-0.5">
                              @{post.author.name.toLowerCase().replace(/\s+/g, '')}
                            </span>
                          </Link>
                          <span className="text-foreground/40 text-[15px]">·</span>
                          <span className="text-foreground/40 text-[15px] hover:underline cursor-pointer">
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

                      {/* Content with clickable hashtags */}
                      <div className="mt-1 mb-2.5">
                        <p className="text-foreground text-[15px] leading-snug whitespace-pre-wrap">
                          {post.content.split(/(#[\w\u00C0-\u024FáéíóúñÁÉÍÓÚÑ]+)/g).map((part, i) => {
                            if (part.startsWith('#')) {
                              return (
                                <button
                                  key={i}
                                  onClick={(e) => { e.stopPropagation(); handleHashtagClick(part.slice(1)); }}
                                  className="text-primary hover:underline font-semibold"
                                >
                                  {part}
                                </button>
                              );
                            }
                            return part;
                          })}
                        </p>
                        {/* Post Image */}
                        {post.image_url && (
                          <div className="mt-3 rounded-2xl overflow-hidden border border-foreground/[0.08] shadow-sm">
                            <img src={post.image_url} alt="" className="w-full max-h-[500px] object-cover" />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between text-foreground/40 max-w-[425px] pr-2 -ml-2 pb-1">
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
                            <MessageSquare className="w-4.5 h-4.5" />
                          </div>
                          <span className="font-medium -ml-0.5">{post.comments_count > 0 ? post.comments_count : ''}</span>
                        </button>

                        {/* Bookmark */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleBookmark(post.id); }}
                          className={cn("flex items-center gap-1.5 text-[13px] group/btn transition-colors", bookmarkedPosts.has(post.id) ? "text-green-500" : "hover:text-green-500")}
                          title={bookmarkedPosts.has(post.id) ? 'Quitar de guardados' : 'Guardar'}
                        >
                          <div className={cn("p-2 rounded-full transition-colors", bookmarkedPosts.has(post.id) ? "bg-green-500/10" : "group-hover/btn:bg-green-500/10")}>
                            {bookmarkedPosts.has(post.id) ? (
                              <BookmarkCheck className="w-4.5 h-4.5 fill-green-500" />
                            ) : (
                              <Bookmark className="w-4.5 h-4.5" />
                            )}
                          </div>
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleLike(post.id, post.user_has_liked); }}
                          className={cn("flex items-center gap-1.5 text-[13px] group/btn transition-colors", post.user_has_liked ? "text-pink-600" : "hover:text-pink-600")}
                          title="Me gusta"
                        >
                          <div className={cn("p-2 rounded-full transition-colors", post.user_has_liked ? "bg-pink-600/10" : "group-hover/btn:bg-pink-600/10")}>
                            <Heart className={cn("w-4.5 h-4.5", post.user_has_liked && "fill-pink-600")} />
                          </div>
                          <span className="font-medium -ml-0.5">{post.likes_count > 0 ? post.likes_count : ''}</span>
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleShare(post); }}
                          className={cn("flex items-center gap-1.5 text-[13px] group/btn transition-colors hover:text-primary")}
                          title="Compartir"
                        >
                          <div className="p-2 rounded-full group-hover/btn:bg-primary/10 transition-colors relative">
                            {copiedPostId === post.id ? (
                              <Check className="w-4.5 h-4.5 text-primary animate-in zoom-in duration-300" />
                            ) : (
                              <Share2 className="w-4.5 h-4.5" />
                            )}
                          </div>
                        </button>
                      </div>

                      {/* Expanded Comments */}
                      <AnimatePresence>
                        {expandedPostId === post.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 border-t border-foreground/[0.04] pt-4 overflow-hidden"
                          >
                            {/* Comment Input */}
                            <div className="flex gap-3 mb-4">
                              <div className="w-8 h-8 rounded-full bg-surface-elevated overflow-hidden shrink-0 mt-1">
                                {user?.avatar_url ? (
                                  <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                    {user?.user_metadata?.name?.charAt(0) || '?'}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 relative">
                                <input
                                  value={newCommentContent}
                                  onChange={(e) => setNewCommentContent(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                  placeholder="Escribí tu comentario..."
                                  className="w-full bg-foreground/[0.03] border-none rounded-2xl px-4 py-2 text-sm focus:ring-1 focus:ring-primary/30 outline-none pr-10"
                                />
                                <button
                                  onClick={() => handleComment(post.id)}
                                  disabled={!newCommentContent.trim() || isCommenting === post.id}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary disabled:opacity-30 p-1"
                                >
                                  {isCommenting === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            {/* Comment List */}
                            <div className="space-y-4 px-1">
                              {comments[post.id]?.map(comment => (
                                <div key={comment.id} className="flex gap-3">
                                  <Link href={`/profile?id=${comment.author.id}`} className={cn("w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1", comment.author.is_pro ? "ring-yellow-500/20" : "ring-foreground/[0.06]")}>
                                    {comment.author.avatar_url ? (
                                      <img src={comment.author.avatar_url} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                      <div className="w-full h-full bg-foreground/5 flex items-center justify-center font-bold text-foreground/40 text-[10px]">
                                        {comment.author.name.charAt(0)}
                                      </div>
                                    )}
                                  </Link>
                                  <div className="flex-1 bg-foreground/[0.015] rounded-2xl px-4 py-2.5">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className={cn("font-bold text-xs", comment.author.is_pro ? "text-yellow-600" : "text-foreground")}>{comment.author.name}</span>
                                      <span className="text-[10px] text-foreground/40">{timeAgo(comment.created_at)}</span>
                                    </div>
                                    <p className="text-sm text-foreground/80 leading-relaxed">{comment.content}</p>
                                  </div>
                                </div>
                              ))}
                              {comments[post.id]?.length === 0 && (
                                <div className="py-6 text-center text-foreground/30 text-xs italic">
                                  Sé el primero en comentar...
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}

                {filteredPosts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-foreground/[0.02] border border-foreground/[0.06] flex items-center justify-center mb-6 relative group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Search className="w-8 h-8 text-foreground/10 group-hover:text-primary/40 transition-colors duration-500" />
                    </div>
                    <h3 className="text-xl font-black italic uppercase font-kanit text-foreground tracking-tighter mb-2">No se encontró nada</h3>
                    <p className="text-foreground/40 text-sm max-w-xs">{searchQuery ? `No hay resultados para "${searchQuery}". Intentá con otra palabra o hashtag.` : "El muro está vacío. ¡Sé el primero en dominar la cancha con un post!"}</p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-6 px-6 py-2 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/60 text-xs font-bold hover:bg-foreground/10 transition-all"
                      >
                        Ver todo el feed
                      </button>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR (desktop only) ── */}
          <aside className="hidden lg:flex flex-col w-[280px] xl:w-[340px] shrink-0 sticky top-[80px] self-start gap-4 pb-8">

            {/* Search Bar - functional */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Buscar posts o usuarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full h-12 bg-foreground/[0.03] border border-foreground/[0.06] rounded-2xl pl-11 pr-10 text-[14px] text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-background transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-lg bg-foreground/[0.05] text-foreground/40 hover:bg-primary hover:text-background transition-all active:scale-90"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Trending - real hashtags from posts */}
            {trendingTopics.length > 0 && (
              <div className="rounded-2xl bg-foreground/[0.03] overflow-hidden">
                <div className="px-4 pt-4 pb-2">
                  <h3 className="font-black text-foreground text-xl tracking-tight italic font-kanit uppercase">Tendencias</h3>
                </div>
                <div className="flex flex-col">
                  {trendingTopics.map((topic, i) => (
                    <button
                      key={topic.tag}
                      onClick={() => handleHashtagClick(topic.tag)}
                      className="px-4 py-3 hover:bg-foreground/[0.05] transition-colors cursor-pointer text-left w-full"
                    >
                      <div className="text-[13px] text-foreground/40 font-medium">Tendencia en Pelotify</div>
                      <div className="font-bold text-[15px] text-foreground flex items-center gap-1.5 mt-0.5">
                        {topic.tag}
                      </div>
                      <div className="text-[13px] text-foreground/40 mt-0.5">{topic.count} {topic.count === 1 ? 'post' : 'posts'}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Who to Follow - with real friend request */}
            <div className="rounded-2xl bg-foreground/[0.03] overflow-hidden">
              <div className="px-4 pt-4 pb-2">
                <h3 className="font-black text-foreground text-xl tracking-tight italic font-kanit uppercase">A quién seguir</h3>
              </div>
              <div className="flex flex-col">
                {suggestedUsers.map(su => {
                  const isFriend = existingFriends.has(su.id);
                  const isPending = sentFriendRequests.has(su.id);

                  return (
                    <div
                      key={su.id}
                      className="px-4 py-3 hover:bg-foreground/[0.05] transition-colors flex items-center gap-3"
                    >
                      <Link
                        href={`/profile?id=${su.id}`}
                        className={cn("w-10 h-10 rounded-full overflow-hidden shrink-0 transition-opacity hover:opacity-90 duration-200 z-10", su.is_pro ? "ring-2 ring-yellow-500/40" : "")}
                      >
                        {su.avatar_url ? (
                          <img src={su.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className={cn("w-full h-full flex items-center justify-center font-bold text-[15px]",
                            su.is_pro ? "bg-gradient-to-br from-yellow-500/20 to-amber-500/10 text-yellow-500" : "bg-gradient-to-br from-primary/15 to-primary/5 text-primary"
                          )}>
                            {su.name?.charAt(0)}
                          </div>
                        )}
                      </Link>
                      <Link href={`/profile?id=${su.id}`} className="flex-1 min-w-0">
                        <div className={cn("font-bold text-[15px] truncate leading-tight hover:underline", su.is_pro ? "text-yellow-500" : "text-foreground")}>
                          {su.name}
                          {su.is_pro && <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 inline ml-1" />}
                        </div>
                        <div className="text-[14px] text-foreground/40 truncate leading-tight">
                          @{su.name?.toLowerCase().replace(/\s+/g, '')}
                        </div>
                      </Link>
                      <div className="shrink-0">
                        {isFriend ? (
                          <div className="px-4 py-1.5 rounded-full border border-foreground/[0.08] bg-transparent text-foreground/60 text-[14px] font-bold">
                            Amigos
                          </div>
                        ) : isPending ? (
                          <div className="px-4 py-1.5 rounded-full border border-foreground/20 bg-transparent text-foreground text-[14px] font-bold">
                            Pendiente
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSendFriendRequest(su.id)}
                            className="px-4 py-1.5 rounded-full bg-foreground text-background text-[14px] font-bold hover:bg-foreground/80 transition-all active:scale-95 shadow-sm hover:shadow-md"
                          >
                            Seguir
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Ranking */}
            <div className="rounded-2xl bg-foreground/[0.03] overflow-hidden">
              <div className="px-4 pt-4 pb-2">
                <h3 className="font-black text-foreground text-xl tracking-tight italic font-kanit uppercase">Top ELO</h3>
              </div>
              <div className="flex flex-col">
                {topPlayers.map((player, i) => (
                  <Link
                    key={player.id}
                    href={`/profile?id=${player.id}`}
                    className="px-4 py-3 hover:bg-foreground/[0.05] transition-colors flex items-center gap-3"
                  >
                    <div className={cn("w-6 flex justify-center text-[15px] font-bold shrink-0",
                      i === 0 ? "text-yellow-500" :
                        i === 1 ? "text-foreground/60" :
                          i === 2 ? "text-orange-500" :
                            "text-foreground/40"
                    )}>
                      {i + 1}
                    </div>
                    <div className={cn("w-10 h-10 rounded-full overflow-hidden shrink-0 relative transition-opacity hover:opacity-90 z-10", player.is_pro ? "ring-2 ring-yellow-500/40" : "")}>
                      {player.avatar_url ? (
                        <img src={player.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className={cn("w-full h-full flex items-center justify-center font-bold text-[15px]",
                          player.is_pro ? "bg-gradient-to-br from-yellow-500/20 to-amber-500/10 text-yellow-500" : "bg-gradient-to-br from-primary/15 to-primary/5 text-primary"
                        )}>
                          {player.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("font-bold text-[15px] truncate leading-tight hover:underline flex items-center", player.is_pro ? "text-yellow-500" : "text-foreground")}>
                        {player.name}
                        {player.is_pro && <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 inline ml-1 shrink-0" />}
                      </div>
                      <div className="text-[14px] text-foreground/40 truncate leading-tight">
                        @{player.name?.toLowerCase().replace(/\s+/g, '')}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[15px] font-black text-foreground italic font-kanit leading-none">
                        {player.elo}
                      </div>
                      <div className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest mt-0.5">
                        ELO
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            <div className="px-5 py-2 flex flex-wrap gap-x-4 gap-y-2">
              {[
                { label: 'Términos', href: '/terms' },
                { label: 'Privacidad', href: '/privacy' },
                { label: 'Ayuda', href: '/help' },
                { label: 'Pelotify Pro', href: '/pro' },
              ].map(link => (
                <Link key={link.label} href={link.href} className="text-[11px] font-bold text-foreground/30 hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
              <div className="w-full text-[11px] font-bold text-foreground/20 mt-2">
                © 2026 Pelotify. Dominá la cancha.
              </div>
            </div>
          </aside>
        </div>
      </div>

      {shareModalPost && (
        <ShareModal
          isOpen={!!shareModalPost}
          onClose={() => setShareModalPost(null)}
          url={`${typeof window !== 'undefined' ? window.location.origin : ''}/feed?post=${shareModalPost.id}`}
          title={`Post de ${shareModalPost.author.name} en Pelotify`}
          text={shareModalPost.content}
          type="post"
          authorName={shareModalPost.author.name}
          authorAvatar={shareModalPost.author.avatar_url}
          contentPreview={shareModalPost.content}
          imagePreview={shareModalPost.image_url}
        />
      )}
    </div>
  );
}
