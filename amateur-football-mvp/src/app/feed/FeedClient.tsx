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
  };

  const handleComment = async (postId: string) => {
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
      <div className="flex flex-col min-h-screen bg-background pt-0 sm:pt-[25px] lg:pt-[30px] px-0 sm:px-5 lg:px-10 xl:px-16 relative overflow-hidden">
        {/* AMBIENT BACKGROUND */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] opacity-[0.03]" style={{ background: 'radial-gradient(circle, #2cfc7d 0%, transparent 70%)' }} />
        </div>

        <div className="flex gap-0 lg:gap-6 xl:gap-8 grow">
          {/* LEFT SIDEBAR SKELETON */}
          <aside className="hidden lg:flex flex-col w-[280px] xl:w-[320px] shrink-0 gap-4">
            <SkeletonPremium className="h-[300px] w-full rounded-[2rem]" />
          </aside>




          {/* MAIN FEED SKELETON */}
          <div className="w-full lg:flex-1 border-x-0 sm:border-x border-foreground/[0.06] flex flex-col gap-6 px-4 sm:px-5 py-4">
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
    <div className="flex flex-col min-h-screen bg-background pt-0 relative overflow-hidden">
      {/* AMBIENT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] opacity-[0.1]"
          style={{ background: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.15) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, rgba(var(--secondary-rgb), 0.1) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute top-[20%] left-[20%] w-[30%] h-[30%] opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.05) 0%, transparent 70%)' }}
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
      <div className="w-full px-0 sm:px-5 lg:px-10 xl:px-16 pt-0 sm:pt-[25px] lg:pt-[30px]">
        <div className={cn("flex gap-0", standalonePostId ? "justify-center max-w-2xl mx-auto" : "lg:gap-6 xl:gap-8")}>

          {/* ── LEFT SIDEBAR (desktop only) ── */}
          {!standalonePostId && (
            <aside className="hidden lg:flex flex-col w-[280px] xl:w-[320px] shrink-0 sticky top-[40px] lg:top-[45px] xl:top-[45px] self-start pb-8 pt-0 xl:pl-4">

              {/* ── PERFIL CARD ── */}
              {user && (
                <div className="mb-6 premium-card group/pcard border-white/5 overflow-hidden">
                  {/* Cover strip with premium animated gradient */}
                  <div className="h-20 bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <div className="absolute -bottom-6 left-5">
                      <Link href={`/feed/profile?id=${user.id}`} className="block w-14 h-14 rounded-2xl overflow-hidden border-2 border-background shadow-2xl hover:scale-105 transition-transform">
                        {user?.avatar_url ? (
                          <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full bg-surface-elevated flex items-center justify-center font-bold text-primary text-xl">
                            {user?.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </Link>
                    </div>
                  </div>
                  <div className="pt-8 pb-5 px-5">
                    {/* Name */}
                    <Link href={`/feed/profile?id=${user.id}`} className="block">
                      <div className="font-display text-lg text-foreground truncate hover:text-primary transition-colors leading-none">{user.name}</div>
                    </Link>
                    {/* Handle - editable */}
                    <button
                      onClick={() => {
                        setEditingHandle(currentUserHandle || user.name.toLowerCase().replace(/\s+/g, ''));
                        setHandleError('');
                        setShowHandleModal(true);
                      }}
                      className="flex items-center gap-1.5 mt-1.5 text-[12px] font-bold text-foreground/40 hover:text-primary transition-colors group/edit"
                    >
                      <span className="font-outfit italic tracking-wide">@{currentUserHandle || user.name.toLowerCase().replace(/\s+/g, '')}</span>
                      <Pencil className="w-2.5 h-2.5 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                    </button>
                    {/* Quick stats with more breathing room and premium font */}
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                      <Link href={`/feed/profile?id=${user.id}`} className="flex flex-col items-center group/stat">
                        <span className="text-sm font-black text-foreground group-hover/stat:text-primary transition-colors leading-none">{user.user_metadata?.matches || 0}</span>
                        <span className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.2em] mt-1.5">Matches</span>
                      </Link>
                      <Link href={`/feed/profile?id=${user.id}`} className="flex flex-col items-center group/stat">
                        <span className="text-sm font-black text-primary transition-colors leading-none">{user.user_metadata?.elo || 0}</span>
                        <span className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.2em] mt-1.5">ELO</span>
                      </Link>
                      <Link href={`/feed/profile?id=${user.id}`} className="flex flex-col items-center group/stat">
                        <span className="text-sm font-black text-foreground group-hover/stat:text-primary transition-colors leading-none">{user.user_metadata?.goals || 0}</span>
                        <span className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.2em] mt-1.5">Goles</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links - Sports Style */}
              <nav className="flex flex-col gap-1 w-full">
                {[
                  { href: '/feed', icon: Zap, label: '3erTiempo', active: true },
                  { href: '/search', icon: Search, label: 'Descubrir' },
                  { href: '/friends', icon: Users, label: 'Comunidad' },
                  { href: '/teams', icon: Trophy, label: 'Ligas' },
                  { href: '/highlights', icon: Flame, label: 'FutTok' },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-300 group w-full",
                        item.active 
                            ? "bg-primary/5 text-primary border border-primary/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.05)]" 
                            : "text-foreground/40 hover:text-foreground/80 hover:bg-white/[0.03] border border-transparent"
                    )}
                  >
                    <item.icon className={cn("w-6 h-6 transition-transform group-hover:scale-110", item.active ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" : "")} strokeWidth={item.active ? 3 : 2} />
                    <span className="text-xl font-display tracking-tight pt-1">{item.label}</span>
                  </Link>
                ))}

                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => document.querySelector('textarea')?.focus(), 500);
                  }}
                  className="mt-8 w-full py-4.5 rounded-[1.5rem] bg-primary text-black text-xl font-display tracking-wide hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)] transition-all shadow-[0_20px_40px_rgba(var(--primary-rgb),0.2)] flex items-center justify-center press-effect"
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
                      <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-xs">
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
              className="sticky top-[84px] sm:top-[85px] lg:top-[30px] z-50 bg-background/85 backdrop-blur-xl border-b border-foreground/[0.08] px-4 sm:px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                {standalonePostId && <span className="text-foreground/50 mr-1 text-xl leading-none pt-1">←</span>}
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
                {user && (
                  <div className="p-6 border-b border-white/5 flex gap-4 bg-transparent group/create-box">
                    <div className="w-13 h-13 rounded-2xl bg-surface-elevated overflow-hidden shrink-0 border border-white/10 shadow-xl group-hover/create-box:border-primary/30 transition-colors">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-display text-primary text-xl">
                          {user?.user_metadata?.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col relative min-h-[60px]">
                      <div className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words text-lg font-outfit leading-relaxed p-0 border-none select-none text-foreground z-0 overflow-hidden">
                        {newPostContent.split(/(#[\w\u00C0-\u024FáéíóúñÁÉÍÓÚÑ]+)/g).map((part, i) => (
                          part.startsWith('#') ? <span key={i} className="text-primary font-black italic">{part}</span> : part
                        ))}
                        {newPostContent.endsWith('\n') ? '\n' : ''}
                      </div>
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="¿Qué está pasando en la cancha?"
                        className="w-full bg-transparent border-none resize-none focus:outline-none text-transparent text-lg placeholder:text-foreground/20 min-h-[60px] font-outfit font-medium leading-relaxed relative z-10 selection:bg-primary/20 caret-primary p-0 m-0 overflow-hidden"
                        maxLength={500}
                      />

                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative mt-4 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl ring-1 ring-white/5 group/preview">
                          <img src={imagePreview} alt="Preview" className="w-full max-h-[400px] object-cover" />
                          <button
                            onClick={clearImage}
                            className="absolute top-4 right-4 w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-all backdrop-blur-md z-20 group-hover/preview:scale-105"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          {isUploadingImage && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                              <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 text-foreground/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all flex items-center justify-center group"
                            title="Subir imagen"
                          >
                            <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => {
                              setNewPostContent(prev => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' #' : '#'));
                              setTimeout(() => document.querySelector('textarea')?.focus(), 10);
                            }}
                            className="p-2.5 text-foreground/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all flex items-center justify-center group"
                            title="Hashtag"
                          >
                            <Hash className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          {newPostContent.length > 0 && (
                            <div className="flex items-center gap-3">
                              <div className="relative w-6 h-6">
                                <svg className="w-6 h-6 -rotate-90" viewBox="0 0 28 28">
                                  <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" className="text-white/5" strokeWidth="3" />
                                  <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" className={cn(newPostContent.length > 450 ? "text-amber-500" : newPostContent.length > 480 ? "text-red-500" : "text-primary")} strokeWidth="3" strokeDasharray={`${(newPostContent.length / 500) * 69.1} 69.1`} strokeLinecap="round" />
                                </svg>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={handlePost}
                            disabled={isPosting || (!newPostContent.trim() && !selectedImage)}
                            className="px-8 py-2.5 rounded-xl bg-primary text-black font-display text-sm tracking-wide disabled:opacity-30 disabled:grayscale transition-all hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] press-effect"
                          >
                            {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'POSTEAR'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* POSTS FEED */}
            <div className="flex flex-col pb-24">
              {filteredPosts.map((post, index) => (
                <div
                  key={post.id}
                  style={{ animationDelay: `${index < 10 ? index * 0.05 : 0}s`, animationFillMode: 'both' }}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('a, button, input')) return;
                    if (!standalonePostId) {
                      router.push(`/post/${post.id}`);
                    }
                  }}
                  className={cn(
                    "p-5 border-b border-white/5 transition-all duration-300 relative flex gap-4 group/post animate-in fade-in slide-in-from-bottom-3",
                    !standalonePostId && "hover:bg-white/[0.02] cursor-pointer",
                    standalonePostId && "bg-transparent py-10 sm:py-14 border-b-2 border-primary/10",
                    post.author.is_pro ? "bg-gradient-to-r from-primary/[0.02] to-transparent" : ""
                  )}
                >
                  {/* LEFTSIDE AVATAR */}
                  <div className="shrink-0 flex flex-col items-center">
                    <Link href={`/feed/profile?id=${post.author.id}`} className={cn("w-12 h-12 rounded-2xl overflow-hidden shrink-0 relative hover:scale-105 transition-transform duration-300 z-10", post.author.is_pro ? "ring-2 ring-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]" : "ring-1 ring-white/10")}>
                      {post.author.avatar_url ? (
                        <img src={post.author.avatar_url} loading="lazy" className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-surface-elevated flex items-center justify-center font-display text-primary text-lg">
                          {post.author.name.charAt(0)}
                        </div>
                      )}
                    </Link>
                  </div>

                  {/* RIGHTSIDE CONTENT */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 flex-wrap leading-tight">
                        <Link href={`/feed/profile?id=${post.author.id}`} className="group flex items-center gap-1.5 min-w-0">
                          <span className={cn("font-display text-[16px] truncate group-hover:text-primary transition-colors", post.author.is_pro ? "text-primary italic" : "text-foreground")}>
                            {post.author.name}
                          </span>
                          {post.author.is_pro && (
                            <div className="w-3.5 h-3.5 bg-primary rounded-sm flex items-center justify-center">
                              <Zap className="w-2.5 h-2.5 text-black fill-current" />
                            </div>
                          )}
                          <span className="text-foreground/30 text-[14px] font-outfit truncate">
                            @{post.author.handle || post.author.name.toLowerCase().replace(/\s+/g, '')}
                          </span>
                        </Link>
                        <span className="text-foreground/20 text-[14px]">·</span>
                        <span className="text-foreground/30 text-[13px] font-bold uppercase tracking-tight hover:text-foreground/60 transition-colors">
                          {timeAgo(post.created_at)}
                        </span>
                      </div>

                      {post.author_id === user?.id && (
                        <div className="relative group/menu shrink-0">
                          <button className="text-foreground/30 hover:text-primary p-2 hover:bg-primary/10 rounded-xl transition-all">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 top-full mt-2 w-40 glass border-white/10 rounded-2xl shadow-2xl flex flex-col opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all z-20 overflow-hidden">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                              className="w-full text-left px-5 py-3.5 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 flex items-center gap-2.5 italic"
                            >
                              <Trash2 className="w-4 h-4" /> Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={cn("mt-2 mb-3", standalonePostId ? "mt-6 mb-8" : "")}>
                      <div className={cn("text-foreground/90 whitespace-pre-wrap leading-relaxed", standalonePostId ? "text-2xl sm:text-3xl font-display tracking-tight text-white" : "text-[15px] font-medium")}>
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
                                  className="text-primary hover:text-primary-dark font-black italic uppercase tracking-tight transition-colors"
                                >
                                  {part}
                                </button>
                              );
                            }
                            return part;
                          });
                        })()}
                      </div>
                      {/* Detect and render Match Card */}
                      {(() => {
                        const matchIdMatch = post.content.match(/[?&]id=([0-9a-fA-F-]{36})/);
                        if (matchIdMatch) {
                          return <MatchPostCard matchId={matchIdMatch[1]} />;
                        }
                        return null;
                      })()}
                      {/* Post Image */}
                      {post.image_url && (
                        <div
                          className="mt-4 rounded-3xl overflow-hidden border border-white/5 shadow-2xl cursor-pointer ring-1 ring-white/5 transition-transform active:scale-[0.98]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedImage(post.image_url);
                          }}
                        >
                          <img src={post.image_url} alt="" loading="lazy" className="w-full max-h-[600px] object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between text-foreground/30 max-w-sm mt-2">
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
                        className={cn("flex items-center gap-2 group/btn transition-all px-2.5 py-1.5 rounded-xl hover:bg-secondary/10", expandedPostId === post.id ? "text-secondary" : "hover:text-secondary")}
                      >
                        <MessageSquare className={cn("w-4.5 h-4.5 group-hover/btn:scale-110 transition-transform", expandedPostId === post.id && "fill-current")} />
                        <span className="text-[12px] font-black italic">{post.comments_count || ''}</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleBookmark(post.id); }}
                        className={cn("flex items-center gap-2 group/btn transition-all px-2.5 py-1.5 rounded-xl hover:bg-amber-500/10", bookmarkedPosts.has(post.id) ? "text-amber-500" : "hover:text-amber-500")}
                      >
                        {bookmarkedPosts.has(post.id) ? (
                          <BookmarkCheck className="w-4.5 h-4.5 fill-current group-hover/btn:scale-110 transition-transform" />
                        ) : (
                          <Bookmark className="w-4.5 h-4.5 group-hover/btn:scale-110 transition-transform" />
                        )}
                        <span className="text-[12px] font-black italic">{bookmarkedPosts.has(post.id) ? 'Saved' : ''}</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleLike(post.id, post.user_has_liked); }}
                        className={cn("flex items-center gap-2 group/btn transition-all px-2.5 py-1.5 rounded-xl hover:bg-primary/10", post.user_has_liked ? "text-primary" : "hover:text-primary")}
                      >
                        <Heart className={cn("w-4.5 h-4.5 group-hover/btn:scale-110 transition-transform", post.user_has_liked && "fill-current")} />
                        <span className="text-[12px] font-black italic">{post.likes_count || ''}</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleShare(post); }}
                        className="flex items-center gap-2 group/btn transition-all px-2.5 py-1.5 rounded-xl hover:bg-white/10 hover:text-white"
                      >
                        {copiedPostId === post.id ? (
                          <Check className="w-4.5 h-4.5 text-primary animate-in zoom-in" />
                        ) : (
                          <Share2 className="w-4.5 h-4.5 transition-transform group-hover:rotate-12" />
                        )}
                      </button>
                    </div>

                    {/* Expanded Comments */}
                    {expandedPostId === post.id && (
                      <div
                        className="mt-4 border-t border-foreground/[0.04] pt-4 overflow-hidden animate-in fade-in duration-300"
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
                              <Link href={`/feed/profile?id=${comment.author.id}`} className={cn("w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1", comment.author.is_pro ? "ring-yellow-500/20" : "ring-foreground/[0.06]")}>
                                {comment.author.avatar_url ? (
                                  <img src={comment.author.avatar_url} loading="lazy" className="w-full h-full object-cover" alt="" />
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
                      </div>
                    )}
                  </div>
                </div>
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
                className="absolute top-4 right-4 sm:top-8 sm:right-8 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md z-50 border border-white/20"
              >
                <X className="w-6 h-6" />
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
