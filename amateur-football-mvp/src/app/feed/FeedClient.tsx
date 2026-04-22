'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
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
  AtSign,
  Pencil,
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
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { uploadPostImage } from '@/lib/storage';
import { compressImage, blobToFile } from '@/lib/imageUtils';
import { sendFriendRequest } from '@/lib/friends';
import ShareModal from '@/components/ShareModal';
import { SkeletonPremium } from '@/components/Skeletons';
import CreatePost from '@/components/feed/CreatePost';
import FeedPostItem from '@/components/feed/FeedPostItem';

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
    handle: string | null;
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

export default function FeedClient({ standalonePostId }: { standalonePostId?: string } = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const postParam = standalonePostId || searchParams.get('post');

  // Auto-expand comments when viewing a standalone post
  const [autoExpandedStandalone, setAutoExpandedStandalone] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Sidebar data
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Bookmark state
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());

  // Share state
  const [shareModalPost, setShareModalPost] = useState<Post | null>(null);

  // Fullscreen Image state (now global via context)
  const { setExpandedImageUrl } = useSidebar();

  // Post & Match state
  const [expandedPostId, setExpandedPostId] = useState<string | null>(postParam);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newCommentContent, setNewCommentContent] = useState('');
  const [isCommenting, setIsCommenting] = useState<string | null>(null);

  // Friend request state
  const [sentFriendRequests, setSentFriendRequests] = useState<Set<string>>(new Set());
  const [existingFriends, setExistingFriends] = useState<Set<string>>(new Set());

  // Handle editing state
  const [showHandleModal, setShowHandleModal] = useState(false);
  const [editingHandle, setEditingHandle] = useState('');
  const [currentUserHandle, setCurrentUserHandle] = useState<string | null>(null);
  const [isSavingHandle, setIsSavingHandle] = useState(false);
  const [handleError, setHandleError] = useState('');

  useEffect(() => {
    fetchPosts();
    fetchSidebarData();
    if (user) {
      fetchBookmarks();
      fetchFriendshipStatuses();
      fetchUserHandle();
    }
  }, [user]);

  const fetchUserHandle = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('handle')
        .eq('id', user.id)
        .maybeSingle();
      if (data?.handle) {
        setCurrentUserHandle(data.handle);
      }
    } catch (err) {
      console.error('Error fetching handle:', err);
    }
  }, [user]);

  const handleSaveHandle = async () => {
    if (!user) return;
    const trimmed = editingHandle.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
    if (!trimmed || trimmed.length < 3) {
      setHandleError('Mínimo 3 caracteres (letras, números, . y _)');
      return;
    }
    if (trimmed.length > 30) {
      setHandleError('Máximo 30 caracteres');
      return;
    }
    setIsSavingHandle(true);
    setHandleError('');
    try {
      // Check if handle is already taken
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('handle', trimmed)
        .neq('id', user.id)
        .maybeSingle();
      if (existing) {
        setHandleError('Este @ ya está en uso. Probá con otro.');
        setIsSavingHandle(false);
        return;
      }
      const { error } = await supabase
        .from('profiles')
        .update({ handle: trimmed })
        .eq('id', user.id);
      if (error) throw error;
      setCurrentUserHandle(trimmed);
      setShowHandleModal(false);
      // Refresh posts to show updated handle
      await fetchPosts();
    } catch (err: any) {
      console.error('Error saving handle:', err);
      setHandleError(err.message || 'Error al guardar');
    } finally {
      setIsSavingHandle(false);
    }
  };

  useEffect(() => {
    if (postParam) {
      setExpandedPostId(postParam);
      loadComments(postParam);
    }
  }, [postParam]);

  // Auto-expand comments once posts are loaded for standalone view
  useEffect(() => {
    if (standalonePostId && posts.length > 0 && !autoExpandedStandalone) {
      setExpandedPostId(standalonePostId);
      loadComments(standalonePostId);
      setAutoExpandedStandalone(true);
    }
  }, [standalonePostId, posts, autoExpandedStandalone]);

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
        .select('id, name, avatar_url, elo, position, is_pro, handle')
        .order('elo', { ascending: false })
        .limit(5);
      if (players) setTopPlayers(players);

      // Suggested users (random recent users, excluding current user)
      const { data: suggested } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, position, is_pro, handle')
        .neq('id', user?.id || '')
        .order('created_at', { ascending: false })
        .limit(4);
      if (suggested) setSuggestedUsers(suggested);
    } catch (err) {
      console.error('Error fetching sidebar:', err);
    }
  };

  const fetchPosts = useCallback(async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          id, content, image_url, created_at, author_id,
          author:profiles(id, name, avatar_url, is_pro, position, handle),
          post_likes(id, user_id),
          post_comments(count)
        `)
        .order('created_at', { ascending: false });

      if (standalonePostId) {
        query = query.eq('id', standalonePostId);
      }

      const { data, error } = await query;

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
  }, [user?.id, standalonePostId]);

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

  const loadComments = useCallback(async (postId: string) => {
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
  }, []);

  const handlePost = useCallback(async (content: string, image: File | null) => {
    if (!user) return;

    try {
      let imageUrl: string | null = null;

      if (image) {
        try {
          const compressed = await compressImage(image, 1200, 0.8);
          const compressedFile = blobToFile(compressed, image.name);
          imageUrl = await uploadPostImage(compressedFile, user.id);
        } catch (uploadErr) {
          console.error('Image upload error:', uploadErr);
        }
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: content.trim(),
          image_url: imageUrl
        });

      if (error) throw error;

      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  }, [user, fetchPosts]);

  const handleLike = useCallback(async (postId: string, userHasLiked: boolean) => {
    if (!user) {
      router.push('/login');
      return;
    }

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
  }, [user, fetchPosts, router]);

  const handleComment = useCallback(async (postId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!newCommentContent.trim()) return;

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
  }, [user, newCommentContent, loadComments, router]);

  const handleDeletePost = useCallback(async (postId: string) => {
    if (!confirm('¿Seguro de que querés borrar esta publicación?')) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  }, []);

  const handleBookmark = useCallback(async (postId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
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
  }, [user, bookmarkedPosts, router]);

  const handleShare = useCallback(async (post: Post) => {
    setShareModalPost(post);
  }, []);

  const handleSendFriendRequest = useCallback(async (targetUserId: string) => {
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
  }, [user, sentFriendRequests, existingFriends]);

  const handleHashtagClick = useCallback((tag: string) => {
    setSearchQuery(`#${tag}`);
  }, []);

  const handleExpandPost = useCallback((postId: string) => {
    if (!standalonePostId) {
      if (expandedPostId === postId) {
        setExpandedPostId(null);
      } else {
        setExpandedPostId(postId);
        loadComments(postId);
      }
    }
  }, [expandedPostId, loadComments, standalonePostId]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background pt-0 sm:pt-[25px] lg:pt-[30px] px-0 sm:px-5 lg:px-10 xl:px-16 relative overflow-hidden">
        {/* AMBIENT BACKGROUND */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] opacity-[0.03]" style={{ background: 'radial-gradient(circle, #2cfc7d 0%, transparent 70%)' }} />
        </div>

        <div className="flex gap-0 lg:gap-6 xl:gap-8 grow justify-center">
          {/* LEFT SIDEBAR SKELETON */}
          <aside className="hidden lg:flex flex-col w-[280px] xl:w-[320px] shrink-0 gap-4">
            <SkeletonPremium className="h-[300px] w-full rounded-[2rem]" />
          </aside>




          {/* MAIN FEED SKELETON */}
          <div className="w-full max-w-3xl lg:flex-1 border-x-0 sm:border-x border-foreground/[0.06] flex flex-col gap-6 px-4 sm:px-5 py-4">
            <SkeletonPremium className="h-20 w-full rounded-2xl" />
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-4">
                <div className="flex gap-3">
                  <SkeletonPremium className="w-11 h-11 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1 pt-1">
                    <SkeletonPremium className="h-4 w-[40%] rounded" />
                    <SkeletonPremium className="h-3 w-[20%] rounded" />
                  </div>
                </div>
                <SkeletonPremium className="h-32 w-full rounded-2xl" />
              </div>
            ))}
          </div>

          {/* RIGHT SIDEBAR SKELETON */}
          <aside className="hidden lg:flex flex-col w-[280px] xl:w-[340px] shrink-0 gap-4">
            <SkeletonPremium className="h-12 w-full rounded-2xl" />
            <SkeletonPremium className="h-[200px] w-full rounded-[2rem]" />
            <SkeletonPremium className="h-[300px] w-full rounded-[2rem]" />
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pt-0 relative">
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
      {/* 3-column layout matching TopHeader padding exactly */}

      {/* 3-column layout matching TopHeader padding exactly */}
      <div className="w-full px-0 sm:px-5 lg:px-10 xl:px-16 pt-0 sm:pt-[25px] lg:pt-[30px] flex justify-center">
        <div className={cn(
          "flex gap-0 w-full", 
          standalonePostId ? "max-w-3xl justify-center" : "lg:gap-6 xl:gap-8 max-w-7xl"
        )}>

          {/* ── LEFT SIDEBAR (desktop only) ── */}
          {!standalonePostId && (
            <aside className="hidden lg:flex flex-col w-[280px] xl:w-[320px] shrink-0 sticky top-[40px] lg:top-[45px] xl:top-[45px] self-start pb-8 pt-0 xl:pl-4">

              {/* ── PERFIL CARD ── */}
              {user && (
                <div className="mb-4 rounded-[1.5rem] bg-foreground/[0.03] border border-foreground/[0.06] overflow-hidden">
                  {/* Cover strip */}
                  <div className="h-16 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent relative">
                    <div className="absolute -bottom-5 left-4">
                      <Link href={`/feed/profile?id=${user.id}`} className="block w-12 h-12 rounded-full overflow-hidden border border-foreground/10 shadow-lg hover:opacity-90 transition-opacity">
                        {user?.avatar_url ? (
                          <img src={user.avatar_url} className="w-full h-full object-cover scale-105" alt="" />
                        ) : (
                          <div className="w-full h-full bg-surface-elevated flex items-center justify-center font-bold text-primary text-[15px]">
                            {user?.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </Link>
                    </div>
                  </div>
                  <div className="pt-7 pb-4 px-4">
                    {/* Name */}
                    <Link href={`/feed/profile?id=${user.id}`} className="block">
                      <div className="font-bold text-[15px] text-foreground truncate hover:underline leading-tight">{user.name}</div>
                    </Link>
                    {/* Handle - editable */}
                    <button
                      onClick={() => {
                        setEditingHandle(currentUserHandle || user.name.toLowerCase().replace(/\s+/g, ''));
                        setHandleError('');
                        setShowHandleModal(true);
                      }}
                      className="flex items-center gap-1 mt-0.5 text-[13px] text-foreground/40 hover:text-primary transition-colors group/handle cursor-pointer"
                      title="Editar tu @"
                    >
                      <span>@{currentUserHandle || user.name.toLowerCase().replace(/\s+/g, '')}</span>
                      <Pencil className="w-3 h-3 opacity-0 group-hover/handle:opacity-100 transition-opacity" />
                    </button>
                    {/* Quick stats */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-foreground/[0.06]">
                      <Link href={`/feed/profile?id=${user.id}`} className="text-center group/stat hover:text-primary transition-colors">
                        <div className="text-sm font-black text-foreground group-hover/stat:text-primary leading-none">{user.user_metadata?.matches || 0}</div>
                        <div className="text-[9px] font-bold text-foreground/30 uppercase tracking-wider mt-0.5">Partidos</div>
                      </Link>
                      <Link href={`/feed/profile?id=${user.id}`} className="text-center group/stat hover:text-primary transition-colors">
                        <div className="text-sm font-black text-foreground group-hover/stat:text-primary leading-none">{user.user_metadata?.elo || 0}</div>
                        <div className="text-[9px] font-bold text-foreground/30 uppercase tracking-wider mt-0.5">ELO</div>
                      </Link>
                      <Link href={`/feed/profile?id=${user.id}`} className="text-center group/stat hover:text-primary transition-colors">
                        <div className="text-sm font-black text-foreground group-hover/stat:text-primary leading-none">{user.user_metadata?.goals || 0}</div>
                        <div className="text-[9px] font-bold text-foreground/30 uppercase tracking-wider mt-0.5">Goles</div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links - Twitter Style */}
              <nav className="flex flex-col gap-1 w-full">
                {[
                  { href: '/feed', icon: Zap, label: '3erTiempo', color: 'text-primary' },
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
                  className="mt-6 w-[90%] py-4 rounded-full bg-primary text-background text-lg xl:text-xl font-black italic uppercase font-kanit tracking-wide hover:opacity-90 transition-all shadow-[0_0_20px_rgba(44,252,125,0.2)] hover:shadow-[0_0_30px_rgba(44,252,125,0.4)] flex items-center justify-center pt-[18px] press-effect"
                >
                  Postear
                </button>
              </nav>
            </aside>
          )}

          {/* ── MAIN FEED (center column) ── */}
          <div className="w-full lg:flex-1 border-x-0 sm:border-x border-foreground/[0.08] min-h-screen flex flex-col relative z-20">
            {!standalonePostId && (
              <div className="lg:hidden p-3 sm:p-4 border-b border-foreground/[0.08] bg-background">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-foreground/30 group-focus-within:text-primary transition-colors" />
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
            )}




            {/* MOBILE PROFILE BAR (Perfil section for handle editing) */}
            {!standalonePostId && user && (
              <div className="lg:hidden border-b border-foreground/[0.06] bg-foreground/[0.02]">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Link href={`/feed/profile?id=${user.id}`} className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-foreground/10">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} className="w-full h-full object-cover scale-105" alt="" />
                    ) : (
                      <div className="w-full h-full bg-surface-elevated flex items-center justify-center font-bold text-primary text-xs">
                        {user?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[13px] text-foreground truncate leading-tight">{user.name}</div>
                    <button
                      onClick={() => {
                        setEditingHandle(currentUserHandle || user.name.toLowerCase().replace(/\s+/g, ''));
                        setHandleError('');
                        setShowHandleModal(true);
                      }}
                      className="flex items-center gap-1 text-[12px] text-foreground/40 hover:text-primary transition-colors group/mhandle"
                      title="Editar tu @"
                    >
                      <span>@{currentUserHandle || user.name.toLowerCase().replace(/\s+/g, '')}</span>
                      <Pencil className="w-2.5 h-2.5 opacity-0 group-hover/mhandle:opacity-100 transition-opacity" />
                    </button>
                  </div>
                  <Link
                    href={`/feed/profile?id=${user.id}`}
                    className="px-3 py-1.5 rounded-full border border-foreground/[0.08] text-[11px] font-bold text-foreground/50 hover:text-primary hover:border-primary/30 transition-all"
                  >
                    Ver Perfil
                  </Link>
                </div>
              </div>
            )}

            {/* STICKY HEADER */}
            <div
              onClick={() => {
                if (standalonePostId) router.back();
                else window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={cn(
                "relative lg:sticky z-50 bg-background/85 backdrop-blur-xl border-b border-foreground/[0.08] px-4 sm:px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors shadow-sm",
                standalonePostId 
                  ? "top-0 lg:top-[30px] rounded-b-2xl lg:rounded-2xl lg:mb-4" 
                  : "lg:top-[30px]"
              )}
            >
              <div className="flex items-center gap-2.5">
                {standalonePostId && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); router.back(); }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors mr-1"
                  >
                    <span className="text-foreground/50 text-xl leading-none pt-0.5">←</span>
                  </button>
                )}
                <h1 className="text-2xl font-black italic uppercase font-kanit text-foreground tracking-tighter leading-none">{standalonePostId ? 'Post' : '3erTiempo'}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/pro" className="group">
                  <Zap className="w-5 h-5 text-foreground/40 group-hover:text-yellow-500 transition-colors" />
                </Link>
              </div>
            </div>

            {!standalonePostId && (
              <>
                {/* CREATE POST BOX */}
                {user && <CreatePost user={user} onPost={handlePost} />}
              </>
            )}

            {/* POSTS FEED */}
            <div className="flex flex-col">
              {filteredPosts.map((post) => (
                <FeedPostItem
                  key={post.id}
                  post={post}
                  user={user}
                  bookmarkedPosts={bookmarkedPosts}
                  expandedPostId={expandedPostId}
                  comments={comments}
                  isCommenting={isCommenting}
                  newCommentContent={newCommentContent}
                  standalonePostId={standalonePostId}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                  onComment={handleComment}
                  onDelete={handleDeletePost}
                  onShare={handleShare}
                  onHashtagClick={handleHashtagClick}
                  onExpand={handleExpandPost}
                  onCommentChange={setNewCommentContent}
                  onImageClick={setExpandedImageUrl}
                  timeAgo={timeAgo}
                />
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
            </div>
          </div>

          {/* ── RIGHT SIDEBAR (desktop only) ── */}
          {!standalonePostId && (
            <aside className="hidden lg:flex flex-col w-[280px] xl:w-[340px] shrink-0 sticky top-[52px] self-start gap-4 pb-8">

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
                          href={`/feed/profile?id=${su.id}`}
                          className={cn("w-10 h-10 rounded-full overflow-hidden shrink-0 transition-opacity hover:opacity-90 duration-200 z-10", su.is_pro ? "ring-2 ring-yellow-500/40" : "")}
                        >
                          {su.avatar_url ? (
                            <img src={su.avatar_url} loading="lazy" className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className={cn("w-full h-full flex items-center justify-center font-bold text-[15px]",
                              su.is_pro ? "bg-gradient-to-br from-yellow-500/20 to-amber-500/10 text-yellow-500" : "bg-gradient-to-br from-primary/15 to-primary/5 text-primary"
                            )}>
                              {su.name?.charAt(0)}
                            </div>
                          )}
                        </Link>
                        <Link href={`/feed/profile?id=${su.id}`} className="flex-1 min-w-0">
                          <div className={cn("font-bold text-[15px] truncate leading-tight hover:underline", su.is_pro ? "text-yellow-500" : "text-foreground")}>
                            {su.name}
                            {su.is_pro && <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 inline ml-1" />}
                          </div>
                          <div className="text-[14px] text-foreground/40 truncate leading-tight">
                            @{su.handle || su.name?.toLowerCase().replace(/\s+/g, '')}
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
                      href={`/feed/profile?id=${player.id}`}
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
                          <img src={player.avatar_url} loading="lazy" className="w-full h-full object-cover" alt="" />
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
                          @{player.handle || player.name?.toLowerCase().replace(/\s+/g, '')}
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
          )}
        </div>
      </div>

      {shareModalPost && (
        <ShareModal
          isOpen={!!shareModalPost}
          onClose={() => setShareModalPost(null)}
          url={`${typeof window !== 'undefined' ? window.location.origin : ''}/post/${shareModalPost.id}`}
          title={`Post de ${shareModalPost.author.name} en Pelotify`}
          text={shareModalPost.content}
          type="post"
          authorName={shareModalPost.author.name}
          authorAvatar={shareModalPost.author.avatar_url}
          contentPreview={shareModalPost.content}
          imagePreview={shareModalPost.image_url}
        />
      )}

      {/* Fullscreen Image Modal - Moved to global ClientLayout */}

      {/* Handle Edit Modal */}
      <AnimatePresence>
        {showHandleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHandleModal(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-surface-elevated border border-foreground/10 rounded-[2rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Ambient glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[60px] rounded-full pointer-events-none -z-10" />

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <AtSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-black italic uppercase tracking-tight text-foreground font-kanit leading-none">Editar @</h3>
                  <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-0.5">Tu nombre de usuario</p>
                </div>
                <button
                  onClick={() => setShowHandleModal(false)}
                  className="ml-auto w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground/40 hover:text-foreground transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Input */}
              <div className="relative mb-4">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-lg">@</div>
                <input
                  value={editingHandle}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, '');
                    setEditingHandle(val);
                    setHandleError('');
                  }}
                  placeholder="tu_handle"
                  maxLength={30}
                  autoFocus
                  className="w-full h-14 bg-foreground/[0.04] border border-foreground/10 rounded-2xl pl-10 pr-4 text-lg text-foreground font-bold placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveHandle();
                  }}
                />
              </div>

              {/* Error */}
              {handleError && (
                <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-bold">
                  {handleError}
                </div>
              )}

              {/* Preview */}
              <div className="mb-6 px-4 py-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06]">
                <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1.5">Vista previa</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-xs">
                        {user?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-foreground">{user?.name}</span>
                    <span className="text-foreground/40 text-sm ml-1.5">
                      @{editingHandle || user?.name?.toLowerCase().replace(/\s+/g, '')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowHandleModal(false)}
                  className="flex-1 h-12 rounded-2xl bg-foreground/5 border border-foreground/10 text-sm font-bold text-foreground/60 hover:bg-foreground/10 transition-all active:scale-[0.97]"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveHandle}
                  disabled={isSavingHandle || !editingHandle.trim()}
                  className="flex-1 h-12 rounded-2xl bg-primary text-background text-sm font-black uppercase tracking-wider shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                >
                  {isSavingHandle ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Guardar
                    </>
                  )}
                </button>
              </div>

              {/* Hint */}
              <p className="text-center text-[10px] text-foreground/25 font-bold mt-4">
                Solo letras, números, puntos y guión bajo
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
