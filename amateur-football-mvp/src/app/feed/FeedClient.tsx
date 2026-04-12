'use client';

import { useState, useEffect, useRef, useMemo, useCallback, Fragment } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Copy,
  Check,
  Globe,
  LinkIcon,
} from 'lucide-react';
import Link from 'next/link';
import MatchPostCard from '@/components/feed/MatchPostCard';
import { uploadPostImage } from '@/lib/storage';
import { compressImage, blobToFile } from '@/lib/imageUtils';
import { sendFriendRequest } from '@/lib/friends';
import ShareModal from '@/components/ShareModal';
import { SkeletonPremium } from '@/components/Skeletons';

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
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(postParam);
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

  // Fullscreen Image state
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Friend request state
  const [pendingFriendRequests, setPendingFriendRequests] = useState<Set<string>>(new Set());
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

  const fetchUserHandle = async () => {
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
  };

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
          if (f.status === 'accepted') friends.add(otherId);
          else if (f.status === 'pending') pending.add(otherId);
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
      console.error('Bookmarks not available:', err);
    }
  };

  const fetchSidebarData = async () => {
    try {
      const { data: players } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, elo, position, is_pro, handle')
        .order('elo', { ascending: false })
        .limit(5);
      if (players) setTopPlayers(players);

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

  const fetchPosts = async () => {
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
  };

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
    if (!user) { router.push('/login'); return; }
    try {
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
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      fetchPosts();
    }
  };

  const handleComment = async (postId: string) => {
    if (!user) { router.push('/login'); return; }
    if (!newCommentContent.trim()) return;
    setIsCommenting(postId);
    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({ post_id: postId, author_id: user.id, content: newCommentContent.trim() });
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
    if (!user) { router.push('/login'); return; }
    const isBookmarked = bookmarkedPosts.has(postId);
    setBookmarkedPosts(prev => {
      const next = new Set(prev);
      if (isBookmarked) next.delete(postId);
      else next.add(postId);
      return next;
    });
    try {
      if (isBookmarked) {
        await supabase.from('post_bookmarks').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('post_bookmarks').insert({ post_id: postId, user_id: user.id });
      }
    } catch (err) {
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
    setSentFriendRequests(prev => new Set(prev).add(targetUserId));
    try {
      await sendFriendRequest(user.id, targetUserId);
    } catch (err) {
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
      <div className="flex flex-col min-h-screen bg-background pt-0 sm:pt-[20px] lg:pt-[24px] px-0 sm:px-4 lg:px-8 xl:px-14 relative overflow-hidden">
        <div className="flex gap-0 lg:gap-5 xl:gap-6 grow">
          <aside className="hidden lg:flex flex-col w-[260px] xl:w-[300px] shrink-0 gap-3">
            <SkeletonPremium className="h-[280px] w-full rounded-2xl" />
          </aside>
          <div className="w-full lg:flex-1 border-x-0 sm:border-x border-foreground/[0.05] flex flex-col gap-5 px-4 sm:px-5 py-4">
            <SkeletonPremium className="h-16 w-full rounded-xl" />
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3">
                <div className="flex gap-3">
                  <SkeletonPremium className="w-10 h-10 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1 pt-1">
                    <SkeletonPremium className="h-3.5 w-[40%] rounded" />
                    <SkeletonPremium className="h-3 w-[20%] rounded" />
                  </div>
                </div>
                <SkeletonPremium className="h-28 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <aside className="hidden lg:flex flex-col w-[260px] xl:w-[320px] shrink-0 gap-3">
            <SkeletonPremium className="h-11 w-full rounded-xl" />
            <SkeletonPremium className="h-[180px] w-full rounded-2xl" />
            <SkeletonPremium className="h-[260px] w-full rounded-2xl" />
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pt-0 relative overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleImageSelect}
      />

      {/* 3-column layout */}
      <div className="w-full px-0 sm:px-4 lg:px-8 xl:px-14 pt-0 sm:pt-[20px] lg:pt-[24px]">
        <div className={cn("flex gap-0", standalonePostId ? "justify-center max-w-2xl mx-auto" : "lg:gap-5 xl:gap-6")}>

          {/* ── LEFT SIDEBAR ── */}
          {!standalonePostId && (
            <aside className="hidden lg:flex flex-col w-[260px] xl:w-[300px] shrink-0 sticky top-[36px] lg:top-[40px] self-start pb-8 pt-0 xl:pl-2">

              {/* Profile Card */}
              {user && (
                <div className="mb-3 card-stadium p-4">
                  {/* Cover strip */}
                  <div className="h-12 -m-4 mb-0 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent relative rounded-t-[1.4rem]">
                    <div className="absolute -bottom-4 left-3">
                      <Link href={`/feed/profile?id=${user.id}`} className="block w-10 h-10 rounded-full overflow-hidden border-2 border-background shadow-md hover:opacity-90 transition-opacity">
                        {user?.avatar_url ? (
                          <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-sm">
                            {user?.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </Link>
                    </div>
                  </div>
                  <div className="pt-6 pb-1 px-0.5">
                    <Link href={`/feed/profile?id=${user.id}`} className="block">
                      <div className="font-bold text-[14px] text-foreground truncate hover:underline leading-tight">{user.name}</div>
                    </Link>
                    <button
                      onClick={() => {
                        setEditingHandle(currentUserHandle || user.name.toLowerCase().replace(/\s+/g, ''));
                        setHandleError('');
                        setShowHandleModal(true);
                      }}
                      className="flex items-center gap-1 mt-0.5 text-[12px] text-foreground/30 hover:text-primary transition-colors group/handle cursor-pointer"
                      title="Editar tu @"
                    >
                      <span>@{currentUserHandle || user.name.toLowerCase().replace(/\s+/g, '')}</span>
                      <Pencil className="w-2.5 h-2.5 opacity-0 group-hover/handle:opacity-100 transition-opacity" />
                    </button>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-foreground/[0.05]">
                      {[
                        { value: user.user_metadata?.matches || 0, label: 'Partidos' },
                        { value: user.user_metadata?.elo || 0, label: 'ELO' },
                        { value: user.user_metadata?.goals || 0, label: 'Goles' },
                      ].map(stat => (
                        <Link key={stat.label} href={`/feed/profile?id=${user.id}`} className="text-center group/stat hover:text-primary transition-colors">
                          <div className="text-sm font-black text-foreground group-hover/stat:text-primary leading-none scoreboard-num">{stat.value}</div>
                          <div className="text-[8px] font-bold text-foreground/25 uppercase tracking-wider mt-0.5">{stat.label}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="flex flex-col gap-0.5 w-full">
                {[
                  { href: '/feed', icon: Zap, label: '3erTiempo', active: true },
                  { href: '/search', icon: Search, label: 'Buscar' },
                  { href: '/friends', icon: Users, label: 'Social' },
                  { href: '/teams', icon: Trophy, label: 'Equipos' },
                  { href: '/highlights', icon: Flame, label: 'FutTok' },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-foreground hover:bg-foreground/[0.04] transition-all duration-200 group w-fit"
                  >
                    <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", item.active ? 'text-primary' : 'text-foreground/40')} />
                    <span className={cn("text-[15px] font-bold tracking-tight leading-none", item.active ? 'text-primary' : 'text-foreground/60')}>{item.label}</span>
                  </Link>
                ))}

                <Link
                  href="/pro"
                  className="mt-1 flex items-center gap-3 px-4 py-2.5 rounded-xl text-foreground hover:bg-yellow-500/[0.06] transition-all duration-200 group w-fit"
                >
                  <div className="relative">
                    <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="text-[15px] font-bold text-yellow-500 tracking-tight leading-none">Pelotify Pro</span>
                </Link>

                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => document.querySelector('textarea')?.focus(), 500);
                  }}
                  className="mt-4 w-[88%] btn-hero py-3 text-[11px]"
                >
                  Postear
                </button>
              </nav>
            </aside>
          )}

          {/* ── MAIN FEED ── */}
          <div className="w-full lg:flex-1 border-x-0 sm:border-x border-foreground/[0.05] min-h-screen flex flex-col relative z-20">
            {/* Mobile Search */}
            {!standalonePostId && (
              <div className="lg:hidden p-3 sm:p-3 border-b border-foreground/[0.05] bg-background">
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/25 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Buscar posts o usuarios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className="input-stadium pl-10 pr-10 h-10 text-[13px]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-md bg-foreground/[0.05] text-foreground/40 hover:bg-primary hover:text-background transition-all active:scale-90"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Profile Bar */}
            {!standalonePostId && user && (
              <div className="lg:hidden border-b border-foreground/[0.04]">
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <Link href={`/feed/profile?id=${user.id}`} className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-foreground/8">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-xs">
                        {user?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[12px] text-foreground truncate leading-tight">{user.name}</div>
                    <button
                      onClick={() => {
                        setEditingHandle(currentUserHandle || user.name.toLowerCase().replace(/\s+/g, ''));
                        setHandleError('');
                        setShowHandleModal(true);
                      }}
                      className="flex items-center gap-1 text-[11px] text-foreground/30 hover:text-primary transition-colors group/mhandle"
                      title="Editar tu @"
                    >
                      <span>@{currentUserHandle || user.name.toLowerCase().replace(/\s+/g, '')}</span>
                      <Pencil className="w-2 h-2 opacity-0 group-hover/mhandle:opacity-100 transition-opacity" />
                    </button>
                  </div>
                  <Link
                    href={`/feed/profile?id=${user.id}`}
                    className="btn-glass text-[10px] px-3 py-1.5"
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
              className="sticky top-[72px] sm:top-[74px] lg:top-[24px] z-50 bg-background/80 backdrop-blur-xl border-b border-foreground/[0.05] px-4 sm:px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2">
                {standalonePostId && <span className="text-foreground/40 mr-1 text-lg leading-none">←</span>}
                <h1 className="text-xl font-black uppercase font-kanit text-foreground tracking-tight leading-none">{standalonePostId ? 'Post' : '3erTiempo'}</h1>
                {!standalonePostId && <div className="w-1.5 h-1.5 rounded-full bg-primary/40 ml-1" />}
              </div>
              <div className="flex items-center gap-2">
                <Link href="/pro" className="group">
                  <Zap className="w-4 h-4 text-foreground/30 group-hover:text-yellow-500 transition-colors" />
                </Link>
              </div>
            </div>

            {!standalonePostId && (
              <>
                {/* CREATE POST BOX */}
                {user && (
                  <div className="p-4 sm:px-5 sm:py-4 border-b border-foreground/[0.04] flex gap-3 bg-background">
                    <div className="w-10 h-10 rounded-full bg-surface-elevated overflow-hidden shrink-0 transition-opacity hover:opacity-90 cursor-pointer">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-[15px]">
                          {user?.user_metadata?.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col relative min-h-[44px]">
                      <div className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words text-[15px] font-medium leading-relaxed p-0 border-none select-none text-foreground z-0 overflow-hidden">
                        {newPostContent.split(/(#[\w\u00C0-\u024FáéíóúñÁÉÍÓÚÑ]+)/g).map((part, i) => (
                          part.startsWith('#') ? <span key={i} className="text-primary font-bold">{part}</span> : part
                        ))}
                        {newPostContent.endsWith('\n') ? '\n' : ''}
                      </div>
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="¡Habla, crack! ¿Qué está pasando?"
                        className="w-full bg-transparent border-none resize-none focus:outline-none text-transparent text-[15px] placeholder:text-foreground/25 min-h-[44px] font-medium leading-relaxed relative z-10 selection:bg-primary/20 caret-foreground p-0 m-0 overflow-hidden"
                        maxLength={500}
                      />

                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative mt-3 rounded-xl overflow-hidden border border-foreground/8 shadow-md">
                          <img src={imagePreview} alt="Preview" className="w-full max-h-[280px] object-cover" />
                          <button
                            onClick={clearImage}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-lg flex items-center justify-center hover:bg-black/80 transition-all backdrop-blur-sm hover:scale-110 active:scale-95 z-20"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          {isUploadingImage && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-10">
                              <Loader2 className="w-7 h-7 animate-spin text-white" />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-foreground/[0.04]">
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="action-btn text-primary"
                            title="Subir imagen"
                          >
                            <ImageIcon className="w-[18px] h-[18px]" />
                          </button>
                          <button
                            onClick={() => {
                              setNewPostContent(prev => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' #' : '#'));
                              setTimeout(() => document.querySelector('textarea')?.focus(), 10);
                            }}
                            className="action-btn text-primary"
                            title="Hashtag"
                          >
                            <Hash className="w-[18px] h-[18px]" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {newPostContent.length > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="relative w-5 h-5">
                                <svg className="w-5 h-5 -rotate-90" viewBox="0 0 28 28">
                                  <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" className="text-foreground/[0.05]" strokeWidth="2" />
                                  <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" className={cn(newPostContent.length > 450 ? "text-amber-500" : newPostContent.length > 480 ? "text-red-500" : "text-primary")} strokeWidth="2" strokeDasharray={`${(newPostContent.length / 500) * 69.1} 69.1`} strokeLinecap="round" />
                                </svg>
                              </div>
                              <div className="h-5 w-px bg-foreground/8" />
                            </div>
                          )}
                          <button
                            onClick={handlePost}
                            disabled={isPosting || (!newPostContent.trim() && !selectedImage)}
                            className="btn-hero px-4 py-1.5 text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={isPosting || (!newPostContent.trim() && !selectedImage) ? { boxShadow: 'none', transform: 'none' } : {}}
                          >
                            {isPosting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Postear'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* POSTS FEED */}
            <div className="flex flex-col pb-20">
              {filteredPosts.map((post, index) => (
                <div
                  key={post.id}
                  style={{ animationDelay: `${index < 10 ? index * 0.03 : 0}s`, animationFillMode: 'both' }}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('a, button, input')) return;
                    if (!standalonePostId) {
                      router.push(`/post/${post.id}`);
                    }
                  }}
                  className={cn(
                    "p-4 sm:px-5 sm:py-4 transition-colors duration-200 relative flex gap-3 group/post animate-in fade-in slide-in-from-bottom-1",
                    !standalonePostId && "hover:bg-foreground/[0.015] cursor-pointer",
                    standalonePostId && "bg-background py-6 sm:py-8",
                    post.author.is_pro ? "bg-gradient-to-r from-yellow-500/[0.02] to-transparent" : ""
                  )}
                >
                  {/* Post separator */}
                  <div className="absolute bottom-0 left-4 right-4 post-separator" />

                  {/* AVATAR */}
                  <div className="shrink-0 flex flex-col items-center">
                    <Link href={`/feed/profile?id=${post.author.id}`} className={cn("w-10 h-10 rounded-full overflow-hidden shrink-0 relative hover:opacity-90 transition-opacity duration-200 z-10", post.author.is_pro ? "ring-[1.5px] ring-yellow-500/30" : "")}>
                      {post.author.avatar_url ? (
                        <img src={post.author.avatar_url} loading="lazy" className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/12 to-primary/4 flex items-center justify-center font-bold text-primary text-[14px]">
                          {post.author.name.charAt(0)}
                        </div>
                      )}
                    </Link>
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1 min-w-0 mt-0">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5 flex-wrap leading-tight">
                        <Link href={`/feed/profile?id=${post.author.id}`} className="group flex items-center gap-1 min-w-0">
                          <span className={cn("font-bold text-[14px] truncate group-hover:underline", post.author.is_pro ? "text-yellow-500" : "text-foreground")}>
                            {post.author.name}
                          </span>
                          {post.author.is_pro && (
                            <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />
                          )}
                          <span className="text-foreground/30 text-[13px] truncate ml-0.5 font-normal">
                            @{post.author.handle || post.author.name.toLowerCase().replace(/\s+/g, '')}
                          </span>
                        </Link>
                        <span className="text-foreground/20 text-[13px]">·</span>
                        <span className="text-foreground/30 text-[13px] hover:underline cursor-pointer font-normal">
                          {timeAgo(post.created_at)}
                        </span>
                      </div>

                      {post.author_id === user?.id && (
                        <div className="relative group/menu shrink-0">
                          <button className="text-foreground/30 hover:text-foreground/50 p-1 hover:bg-foreground/[0.04] rounded-lg transition-colors mt-[-2px]">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-28 card-stadium shadow-xl flex flex-col opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all z-20 overflow-hidden p-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/[0.06] rounded-lg flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={cn("mt-1 mb-2", standalonePostId ? "mt-3 mb-4" : "")}>
                      <p className={cn("text-foreground whitespace-pre-wrap", standalonePostId ? "text-lg sm:text-xl font-medium leading-relaxed" : "text-[14px] leading-[1.45]")}>
                        {(() => {
                          let content = post.content;
                          const hasMatchCard = post.content.match(/[?&]id=([0-9a-fA-F-]{36})/);
                          if (hasMatchCard) {
                            content = content.replace(/\n?https?:\/\/[^\s]+match\?id=[0-9a-fA-F-]{36}[^\s]*/g, '');
                          }
                          return content.split(/(#[\w\u00C0-\u024FáéíóúñÁÉÍÓÚÑ]+)/g).map((part, i) => {
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
                          });
                        })()}
                      </p>
                      {(() => {
                        const matchIdMatch = post.content.match(/[?&]id=([0-9a-fA-F-]{36})/);
                        if (matchIdMatch) {
                          return <MatchPostCard matchId={matchIdMatch[1]} />;
                        }
                        return null;
                      })()}
                      {post.image_url && (
                        <div
                          className="mt-2.5 rounded-xl overflow-hidden border border-foreground/[0.06] cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedImage(post.image_url);
                          }}
                        >
                          <img src={post.image_url} alt="" loading="lazy" className="w-full max-h-[450px] object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between max-w-[400px] -ml-2 pb-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!standalonePostId) {
                            if (expandedPostId === post.id) {
                              setExpandedPostId(null);
                            } else {
                              setExpandedPostId(post.id);
                              loadComments(post.id);
                            }
                          }
                        }}
                        className={cn("action-btn", expandedPostId === post.id ? "text-blue-500" : "hover:text-blue-500")}
                      >
                        <MessageSquare className="w-[17px] h-[17px]" />
                        <span className="text-[12px] font-semibold">{post.comments_count > 0 ? post.comments_count : ''}</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleBookmark(post.id); }}
                        className={cn("action-btn", bookmarkedPosts.has(post.id) ? "text-green-500" : "hover:text-green-500")}
                        title={bookmarkedPosts.has(post.id) ? 'Quitar de guardados' : 'Guardar'}
                      >
                        {bookmarkedPosts.has(post.id) ? (
                          <BookmarkCheck className="w-[17px] h-[17px] fill-green-500" />
                        ) : (
                          <Bookmark className="w-[17px] h-[17px]" />
                        )}
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleLike(post.id, post.user_has_liked); }}
                        className={cn("action-btn", post.user_has_liked ? "text-pink-500" : "hover:text-pink-500")}
                        title="Me gusta"
                      >
                        <Heart className={cn("w-[17px] h-[17px]", post.user_has_liked && "fill-pink-500")} />
                        <span className="text-[12px] font-semibold">{post.likes_count > 0 ? post.likes_count : ''}</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleShare(post); }}
                        className="action-btn hover:text-primary"
                        title="Compartir"
                      >
                        {copiedPostId === post.id ? (
                          <Check className="w-[17px] h-[17px] text-primary" />
                        ) : (
                          <Share2 className="w-[17px] h-[17px]" />
                        )}
                      </button>
                    </div>

                    {/* Expanded Comments */}
                    {expandedPostId === post.id && (
                      <div className="mt-3 border-t border-foreground/[0.04] pt-3 overflow-hidden animate-in fade-in duration-300">
                        <div className="flex gap-2.5 mb-3">
                          <div className="w-7 h-7 rounded-full bg-surface-elevated overflow-hidden shrink-0 mt-0.5">
                            {user?.avatar_url ? (
                              <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px]">
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
                              className="input-stadium pl-3.5 pr-9 py-2 text-[13px] h-auto"
                            />
                            <button
                              onClick={() => handleComment(post.id)}
                              disabled={!newCommentContent.trim() || isCommenting === post.id}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary disabled:opacity-30 p-0.5"
                            >
                              {isCommenting === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3 px-0.5">
                          {comments[post.id]?.map(comment => (
                            <div key={comment.id} className="flex gap-2.5">
                              <Link href={`/feed/profile?id=${comment.author.id}`} className={cn("w-7 h-7 rounded-full overflow-hidden shrink-0", comment.author.is_pro ? "ring-1 ring-yellow-500/20" : "")}>
                                {comment.author.avatar_url ? (
                                  <img src={comment.author.avatar_url} loading="lazy" className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="w-full h-full bg-foreground/[0.03] flex items-center justify-center font-bold text-foreground/30 text-[9px]">
                                    {comment.author.name.charAt(0)}
                                  </div>
                                )}
                              </Link>
                              <div className="flex-1 bg-foreground/[0.02] rounded-xl px-3 py-2">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className={cn("font-bold text-[11px]", comment.author.is_pro ? "text-yellow-600" : "text-foreground")}>{comment.author.name}</span>
                                  <span className="text-[10px] text-foreground/30">{timeAgo(comment.created_at)}</span>
                                </div>
                                <p className="text-[13px] text-foreground/70 leading-relaxed">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                          {comments[post.id]?.length === 0 && (
                            <div className="py-5 text-center text-foreground/25 text-xs">
                              Sé el primero en comentar...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredPosts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                  <div className="w-16 h-16 rounded-2xl card-stadium flex items-center justify-center mb-5">
                    <Search className="w-7 h-7 text-foreground/10" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight mb-1.5">No se encontró nada</h3>
                  <p className="text-foreground/35 text-sm max-w-xs">{searchQuery ? `No hay resultados para "${searchQuery}".` : "El muro está vacío. ¡Sé el primero en postear!"}</p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="btn-glass mt-5"
                    >
                      Ver todo el feed
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          {!standalonePostId && (
            <aside className="hidden lg:flex flex-col w-[260px] xl:w-[320px] shrink-0 sticky top-[44px] self-start gap-3 pb-8">

              {/* Search Bar */}
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar posts o usuarios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="input-stadium pl-10 pr-10 h-10 text-[13px]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-md bg-foreground/[0.05] text-foreground/40 hover:bg-primary hover:text-background transition-all active:scale-90"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              {/* Trending */}
              {trendingTopics.length > 0 && (
                <div className="card-stadium overflow-hidden">
                  <div className="px-4 pt-3.5 pb-1.5 section-header-stadium">
                    <h3 className="text-[15px] font-bold text-foreground">Tendencias</h3>
                  </div>
                  <div className="flex flex-col">
                    {trendingTopics.map((topic, i) => (
                      <button
                        key={topic.tag}
                        onClick={() => handleHashtagClick(topic.tag)}
                        className="px-4 py-2.5 hover:bg-foreground/[0.03] transition-colors cursor-pointer text-left w-full"
                      >
                        <div className="text-[11px] text-foreground/30 font-medium">Tendencia en Pelotify</div>
                        <div className="font-bold text-[14px] text-foreground mt-0.5">
                          #{topic.tag}
                        </div>
                        <div className="text-[11px] text-foreground/30 mt-0.5">{topic.count} {topic.count === 1 ? 'post' : 'posts'}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Who to Follow */}
              <div className="card-stadium overflow-hidden">
                <div className="px-4 pt-3.5 pb-1.5 section-header-stadium">
                  <h3 className="text-[15px] font-bold text-foreground">A quién seguir</h3>
                </div>
                <div className="flex flex-col">
                  {suggestedUsers.map(su => {
                    const isFriend = existingFriends.has(su.id);
                    const isPending = sentFriendRequests.has(su.id);

                    return (
                      <div
                        key={su.id}
                        className="px-4 py-2.5 hover:bg-foreground/[0.03] transition-colors flex items-center gap-2.5"
                      >
                        <Link
                          href={`/feed/profile?id=${su.id}`}
                          className={cn("w-9 h-9 rounded-full overflow-hidden shrink-0 transition-opacity hover:opacity-90", su.is_pro ? "ring-1.5 ring-yellow-500/30" : "")}
                        >
                          {su.avatar_url ? (
                            <img src={su.avatar_url} loading="lazy" className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className={cn("w-full h-full flex items-center justify-center font-bold text-[13px]",
                              su.is_pro ? "bg-gradient-to-br from-yellow-500/15 to-amber-500/8 text-yellow-500" : "bg-gradient-to-br from-primary/12 to-primary/4 text-primary"
                            )}>
                              {su.name?.charAt(0)}
                            </div>
                          )}
                        </Link>
                        <Link href={`/feed/profile?id=${su.id}`} className="flex-1 min-w-0">
                          <div className={cn("font-bold text-[13px] truncate leading-tight hover:underline", su.is_pro ? "text-yellow-500" : "text-foreground")}>
                            {su.name}
                            {su.is_pro && <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500 inline ml-1" />}
                          </div>
                          <div className="text-[12px] text-foreground/30 truncate leading-tight font-normal">
                            @{su.handle || su.name?.toLowerCase().replace(/\s+/g, '')}
                          </div>
                        </Link>
                        <div className="shrink-0">
                          {isFriend ? (
                            <div className="btn-glass text-[10px] px-3 py-1 text-foreground/40">
                              Amigos
                            </div>
                          ) : isPending ? (
                            <div className="btn-glass text-[10px] px-3 py-1 text-foreground/50">
                              Pendiente
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSendFriendRequest(su.id)}
                              className="btn-hero text-[10px] px-3 py-1"
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

              {/* Top ELO Ranking */}
              <div className="card-stadium overflow-hidden">
                <div className="px-4 pt-3.5 pb-1.5 section-header-stadium">
                  <h3 className="text-[15px] font-bold text-foreground">Top ELO</h3>
                </div>
                <div className="flex flex-col">
                  {topPlayers.map((player, i) => (
                    <Link
                      key={player.id}
                      href={`/feed/profile?id=${player.id}`}
                      className="px-4 py-2.5 hover:bg-foreground/[0.03] transition-colors flex items-center gap-2.5"
                    >
                      {/* Medal */}
                      <div className={cn("rank-medal shrink-0",
                        i === 0 ? "rank-medal-gold" :
                        i === 1 ? "rank-medal-silver" :
                        i === 2 ? "rank-medal-bronze" :
                        "bg-foreground/[0.04] text-foreground/40"
                      )}>
                        {i + 1}
                      </div>
                      <div className={cn("w-9 h-9 rounded-full overflow-hidden shrink-0", player.is_pro ? "ring-1.5 ring-yellow-500/30" : "")}>
                        {player.avatar_url ? (
                          <img src={player.avatar_url} loading="lazy" className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className={cn("w-full h-full flex items-center justify-center font-bold text-[13px]",
                            player.is_pro ? "bg-gradient-to-br from-yellow-500/15 to-amber-500/8 text-yellow-500" : "bg-gradient-to-br from-primary/12 to-primary/4 text-primary"
                          )}>
                            {player.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn("font-bold text-[13px] truncate leading-tight hover:underline flex items-center", player.is_pro ? "text-yellow-500" : "text-foreground")}>
                          {player.name}
                          {player.is_pro && <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500 inline ml-1 shrink-0" />}
                        </div>
                        <div className="text-[12px] text-foreground/30 truncate leading-tight font-normal">
                          @{player.handle || player.name?.toLowerCase().replace(/\s+/g, '')}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[14px] font-black text-foreground scoreboard-num leading-none">
                          {player.elo}
                        </div>
                        <div className="text-[9px] font-bold text-foreground/25 uppercase tracking-wider mt-0.5">
                          ELO
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Footer Links */}
              <div className="px-4 py-2 flex flex-wrap gap-x-3 gap-y-1.5">
                {[
                  { label: 'Términos', href: '/terms' },
                  { label: 'Privacidad', href: '/privacy' },
                  { label: 'Ayuda', href: '/help' },
                  { label: 'Pelotify Pro', href: '/pro' },
                ].map(link => (
                  <Link key={link.label} href={link.href} className="text-[10px] font-medium text-foreground/25 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                ))}
                <div className="w-full text-[10px] font-medium text-foreground/15 mt-1.5">
                  © 2026 Pelotify
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

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-[95vw] max-h-[95vh] w-full h-full flex items-center justify-center"
            >
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute top-4 right-4 sm:top-8 sm:right-8 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-all backdrop-blur-md z-50 border border-white/15"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={expandedImage}
                alt="Expanded view"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Handle Edit Modal */}
      <AnimatePresence>
        {showHandleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHandleModal(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm card-stadium p-6 sm:p-7 shadow-2xl relative overflow-hidden noise-texture"
            >
              {/* Ambient glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-primary/8 blur-[50px] rounded-full pointer-events-none -z-10" />

              {/* Header */}
              <div className="flex items-center gap-3 mb-5 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center border border-primary/15">
                  <AtSign className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground leading-none">Editar @</h3>
                  <p className="text-[10px] font-medium text-foreground/35 mt-0.5">Tu nombre de usuario</p>
                </div>
                <button
                  onClick={() => setShowHandleModal(false)}
                  className="ml-auto w-7 h-7 rounded-lg bg-foreground/[0.04] hover:bg-foreground/[0.08] flex items-center justify-center text-foreground/35 hover:text-foreground transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Input */}
              <div className="relative mb-3 z-10">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary font-bold text-lg">@</div>
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
                  className="input-stadium pl-9 pr-4 h-12 text-base font-bold"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveHandle();
                  }}
                />
              </div>

              {/* Error */}
              {handleError && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/8 border border-red-500/15 text-red-400 text-[11px] font-bold relative z-10">
                  {handleError}
                </div>
              )}

              {/* Preview */}
              <div className="mb-5 px-3 py-2.5 rounded-xl bg-foreground/[0.02] border border-foreground/[0.04] relative z-10">
                <div className="text-[9px] font-bold text-foreground/25 uppercase tracking-wider mb-1">Vista previa</div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-xs">
                        {user?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-[13px] text-foreground">{user?.name}</span>
                    <span className="text-foreground/30 text-[13px] ml-1.5 font-normal">
                      @{editingHandle || user?.name?.toLowerCase().replace(/\s+/g, '')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 relative z-10">
                <button
                  onClick={() => setShowHandleModal(false)}
                  className="btn-glass flex-1 h-10"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveHandle}
                  disabled={isSavingHandle || !editingHandle.trim()}
                  className="btn-hero flex-1 h-10 disabled:opacity-50"
                >
                  {isSavingHandle ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Guardar
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-[9px] text-foreground/20 font-medium mt-3 relative z-10">
                Solo letras, números, puntos y guión bajo
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
