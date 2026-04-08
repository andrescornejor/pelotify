'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import {
  Home,
  Search,
  Users,
  Shield,
  Play,
  TrendingUp,
  ArrowLeft,
  Heart,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  Image as ImageIcon,
  Zap,
  Pencil,
  Loader2,
  AtSign,
  X,
  Check,
  MoreHorizontal,
  Trash2,
  Share2,
  MapPin,
  Calendar,
  Link as LucideLink,
  Link2 as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import MatchPostCard from '@/components/feed/MatchPostCard';
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

interface ProfileData {
  id: string;
  name: string;
  avatar_url: string | null;
  is_pro: boolean;
  position: string;
  handle: string | null;
  bio: string | null;
  elo: number;
  matches: number;
  goals: number;
  instagram: string | null;
  cover_url: string | null;
  created_at: string;
}

type TabType = 'posts' | 'likes' | 'bookmarks' | 'media';

export default function FeedProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const rawId = searchParams.get('id');
  const profileId = (rawId && rawId !== 'undefined' && rawId !== 'null') ? rawId : user?.id;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const initialTab = (searchParams.get('tab') as TabType) || 'posts';
  const [activeTab, setActiveTab] = useState<TabType>(
    ['posts', 'likes', 'bookmarks', 'media'].includes(initialTab) ? initialTab : 'posts'
  );
  
  // Sync tab with URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['posts', 'likes', 'bookmarks', 'media'].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [bookmarkedPostsList, setBookmarkedPostsList] = useState<Post[]>([]);
  const [mediaPosts, setMediaPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  const isMe = profileId === user?.id;

  // Handle editing
  const [showHandleModal, setShowHandleModal] = useState(false);
  const [editingHandle, setEditingHandle] = useState('');
  const [isSavingHandle, setIsSavingHandle] = useState(false);
  const [handleError, setHandleError] = useState('');

  // Share
  const [shareModalPost, setShareModalPost] = useState<Post | null>(null);

  // Bookmarks
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());

  // Sidebar results (copy from FeedClient)
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [currentUserHandle, setCurrentUserHandle] = useState<string | null>(null);

  useEffect(() => {
    if (profileId) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [profileId]);

  useEffect(() => {
    if (user) {
      fetchSidebarData();
      fetchBookmarks();
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

  useEffect(() => {
    if (activeTab === 'likes' && likedPosts.length === 0) {
      fetchLikedPosts();
    } else if (activeTab === 'bookmarks' && bookmarkedPostsList.length === 0 && isMe) {
      fetchBookmarkedPosts();
    } else if (activeTab === 'media' && mediaPosts.length === 0) {
      fetchMediaPosts();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    if (!profileId) {
      if (!authLoading && !searchParams.get('id')) {
        setIsLoadingProfile(false);
      }
      return;
    }

    setIsLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    } finally {
      setIsLoadingProfile(false);
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

  const fetchPostsWithQuery = async (query: any): Promise<Post[]> => {
    const { data, error } = await query;
    if (error) throw error;
    if (!data) return [];

    return data.map((p: any) => ({
      id: p.id,
      content: p.content,
      image_url: p.image_url,
      created_at: p.created_at,
      author_id: p.author_id,
      author: p.author || p.posts?.author || { id: '', name: 'Unknown', avatar_url: null, is_pro: false, position: 'DC', handle: null },
      likes_count: p.post_likes?.length || p.posts?.post_likes?.length || 0,
      comments_count: p.post_comments?.[0]?.count || p.posts?.post_comments?.[0]?.count || 0,
      user_has_liked: p.post_likes?.some((like: any) => like.user_id === user?.id) || false,
    }));
  };

  const fetchUserPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const formattedPosts = await fetchPostsWithQuery(
        supabase
          .from('posts')
          .select(`
            id, content, image_url, created_at, author_id,
            author:profiles(id, name, avatar_url, is_pro, position, handle),
            post_likes(id, user_id),
            post_comments(count)
          `)
          .eq('author_id', profileId!)
          .order('created_at', { ascending: false })
      );
      setPosts(formattedPosts);
    } catch (err) {
      console.error('Error fetching user posts:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const fetchLikedPosts = async () => {
    if (!profileId) return;
    setIsLoadingPosts(true);
    try {
      // Get post IDs the user liked
      const { data: likeData } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });

      if (!likeData || likeData.length === 0) {
        setLikedPosts([]);
        setIsLoadingPosts(false);
        return;
      }

      const postIds = likeData.map(l => l.post_id);
      const formattedPosts = await fetchPostsWithQuery(
        supabase
          .from('posts')
          .select(`
            id, content, image_url, created_at, author_id,
            author:profiles(id, name, avatar_url, is_pro, position, handle),
            post_likes(id, user_id),
            post_comments(count)
          `)
          .in('id', postIds)
          .order('created_at', { ascending: false })
      );
      setLikedPosts(formattedPosts);
    } catch (err) {
      console.error('Error fetching liked posts:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const fetchBookmarkedPosts = async () => {
    if (!user || !isMe) return;
    setIsLoadingPosts(true);
    try {
      const { data: bmData } = await supabase
        .from('post_bookmarks')
        .select('post_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!bmData || bmData.length === 0) {
        setBookmarkedPostsList([]);
        setIsLoadingPosts(false);
        return;
      }

      const postIds = bmData.map(b => b.post_id);
      const formattedPosts = await fetchPostsWithQuery(
        supabase
          .from('posts')
          .select(`
            id, content, image_url, created_at, author_id,
            author:profiles(id, name, avatar_url, is_pro, position, handle),
            post_likes(id, user_id),
            post_comments(count)
          `)
          .in('id', postIds)
          .order('created_at', { ascending: false })
      );
      setBookmarkedPostsList(formattedPosts);
    } catch (err) {
      console.error('Error fetching bookmarked posts:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const fetchMediaPosts = async () => {
    if (!profileId) return;
    setIsLoadingPosts(true);
    try {
      const formattedPosts = await fetchPostsWithQuery(
        supabase
          .from('posts')
          .select(`
            id, content, image_url, created_at, author_id,
            author:profiles(id, name, avatar_url, is_pro, position, handle),
            post_likes(id, user_id),
            post_comments(count)
          `)
          .eq('author_id', profileId)
          .not('image_url', 'is', null)
          .order('created_at', { ascending: false })
      );
      setMediaPosts(formattedPosts);
    } catch (err) {
      console.error('Error fetching media posts:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleLike = async (postId: string, userHasLiked: boolean) => {
    if (!user) { router.push('/login'); return; }

    const updateList = (list: Post[], setter: (p: Post[]) => void) => {
      setter(list.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likes_count: userHasLiked ? p.likes_count - 1 : p.likes_count + 1,
            user_has_liked: !userHasLiked,
          };
        }
        return p;
      }));
    };

    updateList(posts, setPosts);
    updateList(likedPosts, setLikedPosts);
    updateList(bookmarkedPostsList, setBookmarkedPostsList);
    updateList(mediaPosts, setMediaPosts);

    try {
      if (userHasLiked) {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!user) return;
    const isBookmarked = bookmarkedPosts.has(postId);
    setBookmarkedPosts(prev => {
      const next = new Set(prev);
      if (isBookmarked) next.delete(postId); else next.add(postId);
      return next;
    });
    try {
      if (isBookmarked) {
        await supabase.from('post_bookmarks').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('post_bookmarks').insert({ post_id: postId, user_id: user.id });
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('¿Seguro de que querés borrar esta publicación?')) return;
    try {
      await supabase.from('posts').delete().eq('id', postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      setMediaPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
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
      const { error } = await supabase.from('profiles').update({ handle: trimmed }).eq('id', user.id);
      if (error) throw error;
      setProfile(prev => prev ? { ...prev, handle: trimmed } : prev);
      setShowHandleModal(false);
    } catch (err: any) {
      console.error('Error saving handle:', err);
      setHandleError(err.message || 'Error al guardar');
    } finally {
      setIsSavingHandle(false);
    }
  };

  const currentPosts = useMemo(() => {
    switch (activeTab) {
      case 'posts': return posts;
      case 'likes': return likedPosts;
      case 'bookmarks': return bookmarkedPostsList;
      case 'media': return mediaPosts;
      default: return posts;
    }
  }, [activeTab, posts, likedPosts, bookmarkedPostsList, mediaPosts]);

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'posts', label: 'Posts', count: posts.length },
    { id: 'likes', label: 'Me gusta' },
    { id: 'media', label: 'Multimedia' },
    ...(isMe ? [{ id: 'bookmarks' as TabType, label: 'Guardados' }] : []),
  ];

  const displayHandle = profile?.handle || profile?.name?.toLowerCase().replace(/\s+/g, '') || '';

  if (isLoadingProfile || (authLoading && !searchParams.get('id'))) {
    return (
      <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] opacity-[0.03]" style={{ background: 'radial-gradient(circle, #2cfc7d 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-2xl mx-auto w-full">
          {/* Skeleton header */}
          <div className="h-40 bg-foreground/[0.03] animate-pulse" />
          <div className="px-4 pt-14 pb-4 space-y-3">
            <div className="h-6 w-40 bg-foreground/[0.05] rounded animate-pulse" />
            <div className="h-4 w-24 bg-foreground/[0.03] rounded animate-pulse" />
            <div className="h-12 w-full bg-foreground/[0.03] rounded animate-pulse mt-4" />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 border-b border-foreground/[0.06] flex gap-3">
              <div className="w-11 h-11 rounded-full bg-foreground/[0.05] animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-[50%] bg-foreground/[0.05] rounded animate-pulse" />
                <div className="h-16 w-full bg-foreground/[0.03] rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile && !isLoadingProfile && !authLoading) {
    if (isMe) {
      router.replace(`/profile?id=${user?.id}`);
      return null;
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8 text-center">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground mb-2">Perfil no encontrado</h2>
        <p className="text-foreground/40 text-sm mb-6">Este usuario no existe o fue eliminado.</p>
        <button onClick={() => router.push('/feed')} className="px-6 py-3 bg-primary text-background rounded-full font-bold text-sm">
          Volver al 3erTiempo
        </button>
      </div>
    );
  }

  if (!profile) return null;

  const joinDate = new Date(profile.created_at);
  const joinMonth = joinDate.toLocaleString('es', { month: 'long' });
  const joinYear = joinDate.getFullYear();

  const MENU_ITEMS = [
    { href: '/feed', icon: Home, label: 'Muro Social', color: 'text-primary' },
    { href: '/messages', icon: MessageSquare, label: 'Mensajes', color: 'text-blue-500' },
    { href: '/friends', icon: Users, label: 'Mis Amigos', color: 'text-purple-500' },
    { href: '/teams', icon: Shield, label: 'Mis Equipos', color: 'text-green-500' },
    { href: '/highlights', icon: Play, label: 'FutTok', color: 'text-pink-500' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Ambient Backdrop */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #2cfc7d 0%, transparent 70%)' }}
        />
      </div>

      <div className="w-full px-0 sm:px-5 lg:px-10 xl:px-16 pt-0 sm:pt-[25px] lg:pt-[30px]">
        <div className="lg:gap-6 xl:gap-8 flex">
          {/* ── LEFT SIDEBAR ── */}
          <aside className="hidden lg:flex flex-col w-[280px] xl:w-[320px] shrink-0 sticky top-[45px] self-start pb-8 pt-0 xl:pl-4">
            {/* Navigation Menu */}
            <div className="flex flex-col gap-1 pr-4">
              {MENU_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 px-5 py-3.5 rounded-full text-foreground hover:bg-foreground/[0.05] transition-all duration-200 group"
                >
                  <item.icon className={cn("w-6 h-6 xl:w-7 xl:h-7 transition-transform group-hover:scale-110", item.color)} />
                  <span className="text-xl xl:text-2xl font-black italic uppercase font-kanit tracking-tight leading-none pt-1 pr-2">{item.label}</span>
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
            </div>
          </aside>

          {/* ── MIDDLE CONTENT (Profile) ── */}
          <main className="flex-1 min-w-0 max-w-2xl border-x border-foreground/[0.06] bg-background min-h-screen pb-20">
            {/* ── STICKY TOP BAR ── */}
            <div className="sticky top-[84px] sm:top-[85px] lg:top-[30px] z-50 bg-background/85 backdrop-blur-xl border-b border-foreground/[0.08] px-4 py-3 flex items-center gap-4 shadow-sm">
              <button
                onClick={() => router.back()}
                className="w-9 h-9 rounded-full hover:bg-foreground/[0.08] flex items-center justify-center transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-black italic uppercase font-kanit text-foreground tracking-tighter leading-none truncate">
                  {profile.name}
                </h1>
                <p className="text-[11px] text-foreground/40 font-bold">{posts.length} posts</p>
              </div>
            </div>

            {/* ── COVER BANNER ── */}
            <div className="relative w-full h-36 sm:h-48 bg-zinc-900 overflow-hidden">
              <img
                src={profile.cover_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000"}
                alt=""
                className="w-full h-full object-cover brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            {/* ── PROFILE INFO ── */}
            <div className="px-4 sm:px-5 relative">
              <div className="absolute -top-10 left-4">
                <Link
                  href={`/profile?id=${profile.id}`}
                  className={cn(
                    "block w-20 h-20 rounded-full overflow-hidden border-4 border-background shadow-xl hover:opacity-90 transition-opacity",
                    profile.is_pro && "ring-2 ring-yellow-500/60"
                  )}
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-2xl">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                </Link>
              </div>

              <div className="flex justify-end pt-3 pb-2">
                {isMe ? (
                  <Link
                    href={`/profile?id=${user?.id}`}
                    className="px-5 py-2 rounded-full border border-foreground/15 text-[12px] font-black uppercase tracking-wider text-foreground hover:bg-foreground/[0.05] transition-all"
                  >
                    Editar Perfil
                  </Link>
                ) : (
                  <button
                    onClick={() => router.push(`/messages?user=${profile.id}`)}
                    className="px-5 py-2 rounded-full bg-primary text-background text-[12px] font-black uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md"
                  >
                    Mensaje
                  </button>
                )}
              </div>

              <div className="mt-1">
                <div className="flex items-center gap-2">
                  <h2 className={cn("text-xl font-black text-foreground leading-tight", profile.is_pro && "text-yellow-500")}>
                    {profile.name}
                  </h2>
                  {profile.is_pro && <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isMe ? (
                    <button
                      onClick={() => {
                        setEditingHandle(profile.handle || profile.name.toLowerCase().replace(/\s+/g, ''));
                        setHandleError('');
                        setShowHandleModal(true);
                      }}
                      className="flex items-center gap-1 text-[14px] text-foreground/40 hover:text-primary transition-colors group/handle"
                    >
                      <span>@{displayHandle}</span>
                      <Pencil className="w-3 h-3 opacity-0 group-hover/handle:opacity-100 transition-opacity" />
                    </button>
                  ) : (
                    <span className="text-[14px] text-foreground/40">@{displayHandle}</span>
                  )}
                </div>
              </div>

              {profile.bio && <p className="text-[14px] text-foreground/70 mt-3 leading-relaxed">{profile.bio}</p>}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[13px] text-foreground/40">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{profile.position}</span>
                </div>
                {profile.instagram && (
                  <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>@{profile.instagram}</span>
                  </a>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Se unió en {joinMonth} {joinYear}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4 pb-4">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-foreground text-sm">{profile.elo || 0}</span>
                  <span className="text-foreground/40 text-[13px]">ELO</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-foreground text-sm">{profile.matches || 0}</span>
                  <span className="text-foreground/40 text-[13px]">Partidos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-foreground text-sm">{profile.goals || 0}</span>
                  <span className="text-foreground/40 text-[13px]">Goles</span>
                </div>
              </div>
            </div>

            <div className="border-b border-foreground/[0.08] flex">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 py-3.5 text-center text-[14px] font-bold transition-colors relative hover:bg-foreground/[0.04]",
                    activeTab === tab.id ? "text-foreground" : "text-foreground/40"
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="feedProfileTab"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-primary rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex flex-col">
              {isLoadingPosts && currentPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-foreground/20 mb-4" />
                  <p className="text-foreground/30 text-sm">Cargando...</p>
                </div>
              ) : currentPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-foreground/[0.03] border border-foreground/[0.06] flex items-center justify-center mb-4">
                    {activeTab === 'likes' ? <Heart className="w-7 h-7 text-foreground/10" /> :
                      activeTab === 'bookmarks' ? <Bookmark className="w-7 h-7 text-foreground/10" /> :
                        activeTab === 'media' ? <ImageIcon className="w-7 h-7 text-foreground/10" /> :
                          <MessageSquare className="w-7 h-7 text-foreground/10" />
                    }
                  </div>
                  <h3 className="text-lg font-black italic uppercase font-kanit text-foreground tracking-tighter mb-1">
                    {activeTab === 'posts' ? 'Sin posts todavía' : activeTab === 'likes' ? 'Sin me gusta todavía' : activeTab === 'bookmarks' ? 'Nada guardado' : 'Sin multimedia'}
                  </h3>
                  <p className="text-foreground/30 text-sm max-w-xs">
                    {activeTab === 'posts' && isMe ? 'Cuando publiques algo, aparecerá acá.' : activeTab === 'posts' ? 'Este usuario aún no ha publicado nada.' : activeTab === 'likes' ? 'Los posts que le gusten aparecerán acá.' : activeTab === 'bookmarks' ? 'Los posts que guardes aparecerán acá.' : 'Los posts con imágenes aparecerán acá.'}
                  </p>
                </div>
              ) : (
                currentPosts.map((post, index) => (
                  <div
                    key={post.id}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('a, button, input')) return;
                      router.push(`/post/${post.id}`);
                    }}
                    className={cn(
                      "p-4 sm:px-5 sm:py-4 border-b border-foreground/[0.06] transition-colors duration-200 relative flex gap-3 sm:gap-4 group/post hover:bg-foreground/[0.03] cursor-pointer animate-in fade-in slide-in-from-bottom-2",
                      post.author.is_pro ? "bg-gradient-to-r from-yellow-500/[0.03] to-transparent" : ""
                    )}
                    style={{ animationDelay: `${index < 10 ? index * 0.03 : 0}s`, animationFillMode: 'both' }}
                  >
                    <div className="shrink-0">
                      <Link href={`/feed/profile?id=${post.author.id}`} className={cn("block w-11 h-11 rounded-full overflow-hidden hover:opacity-90 transition-opacity", post.author.is_pro && "ring-2 ring-yellow-500/40")}>
                        {post.author.avatar_url ? (
                          <img src={post.author.avatar_url} loading="lazy" className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center font-bold text-primary text-sm">
                            {post.author.name.charAt(0)}
                          </div>
                        )}
                      </Link>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5 flex-wrap leading-tight">
                          <Link href={`/feed/profile?id=${post.author.id}`} className="group flex items-center gap-1 min-w-0">
                            <span className={cn("font-bold text-[15px] truncate group-hover:underline", post.author.is_pro ? "text-yellow-500" : "text-foreground")}>
                              {post.author.name}
                            </span>
                            {post.author.is_pro && <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />}
                            <span className="text-foreground/40 text-[15px] truncate ml-0.5">
                              @{post.author.handle || post.author.name.toLowerCase().replace(/\s+/g, '')}
                            </span>
                          </Link>
                          <span className="text-foreground/40 text-[15px]">·</span>
                          <span className="text-foreground/40 text-[15px]">{timeAgo(post.created_at)}</span>
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

                      <div className="mt-1 mb-2.5">
                        <p className="text-[15px] text-foreground whitespace-pre-wrap leading-snug">
                          {(() => {
                            let content = post.content;
                            const hasMatchCard = content.match(/[?&]id=([0-9a-fA-F-]{36})/);
                            if (hasMatchCard) {
                              content = content.replace(/\n?https?:\/\/[^\s]+match\?id=[0-9a-fA-F-]{36}[^\s]*/g, '');
                            }
                            return content.split(/(#[\w\u00C0-\u024FáéíóúñÁÉÍÓÚÑ]+)/g).map((part, i) => {
                              if (part.startsWith('#')) return <span key={i} className="text-primary hover:underline font-semibold">{part}</span>;
                              return part;
                            });
                          })()}
                        </p>
                        {(() => {
                          const matchIdMatch = post.content.match(/[?&]id=([0-9a-fA-F-]{36})/);
                          if (matchIdMatch) return <MatchPostCard matchId={matchIdMatch[1]} />;
                          return null;
                        })()}
                        {post.image_url && (
                          <div className="mt-3 rounded-2xl overflow-hidden border border-foreground/[0.08] shadow-sm">
                            <img src={post.image_url} alt="" loading="lazy" className="w-full max-h-[500px] object-cover" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-foreground/40 max-w-[400px] -ml-2">
                        <button onClick={(e) => { e.stopPropagation(); router.push(`/post/${post.id}`); }} className="flex items-center gap-1.5 p-2 rounded-full hover:bg-blue-500/10 hover:text-blue-500 transition-colors group/action">
                          <MessageSquare className="w-[18px] h-[18px]" />
                          {post.comments_count > 0 && <span className="text-[13px]">{post.comments_count}</span>}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleLike(post.id, post.user_has_liked); }} className={cn("flex items-center gap-1.5 p-2 rounded-full transition-colors group/action", post.user_has_liked ? "text-pink-500" : "hover:bg-pink-500/10 hover:text-pink-500")}>
                          <Heart className={cn("w-[18px] h-[18px]", post.user_has_liked && "fill-pink-500")} />
                          {post.likes_count > 0 && <span className="text-[13px]">{post.likes_count}</span>}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setShareModalPost(post); }} className="flex items-center gap-1.5 p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                          <Share2 className="w-[18px] h-[18px]" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleBookmark(post.id); }} className={cn("p-2 rounded-full transition-colors", bookmarkedPosts.has(post.id) ? "text-primary" : "hover:bg-primary/10 hover:text-primary")}>
                          {bookmarkedPosts.has(post.id) ? <BookmarkCheck className="w-[18px] h-[18px]" /> : <Bookmark className="w-[18px] h-[18px]" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="hidden xl:flex flex-col w-[320px] shrink-0 sticky top-[45px] self-start gap-5">
            {/* Search */}
            <div className="bg-foreground/[0.03] border border-foreground/10 rounded-2xl h-12 flex items-center px-4 gap-3 focus-within:bg-background focus-within:border-primary/50 transition-all">
              <Search className="w-5 h-5 text-foreground/30" />
              <input
                type="text"
                placeholder="Buscar en el 3erTiempo..."
                className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-foreground/20"
              />
            </div>

            {/* Suggested Users */}
            <div className="bg-foreground/[0.03] border border-foreground/[0.06] rounded-[2rem] overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/[0.06]">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/40 italic">A quién seguir</h3>
              </div>
              <div className="flex flex-col">
                {suggestedUsers.map((su) => (
                  <div key={su.id} className="px-6 py-4 hover:bg-foreground/[0.05] transition-colors flex items-center gap-3">
                    <Link href={`/feed/profile?id=${su.id}`} className={cn("w-10 h-10 rounded-full overflow-hidden shrink-0", su.is_pro && "ring-2 ring-yellow-500/40")}>
                      {su.avatar_url ? <img src={su.avatar_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">{su.name.charAt(0)}</div>}
                    </Link>
                    <Link href={`/feed/profile?id=${su.id}`} className="flex-1 min-w-0">
                      <div className="font-bold text-[14px] truncate leading-tight hover:underline">{su.name}</div>
                      <div className="text-[11px] text-foreground/40 truncate">@{su.handle || su.name.toLowerCase().replace(/\s+/g, '')}</div>
                    </Link>
                    <button className="px-4 py-1.5 rounded-full bg-foreground text-background text-[11px] font-black uppercase hover:bg-foreground/80 transition-all">Seguir</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Players */}
            <div className="bg-foreground/[0.03] border border-foreground/[0.06] rounded-[2rem] overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/[0.06] flex justify-between items-center">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/40 italic">Ranking ELO</h3>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                {topPlayers.map((player) => (
                  <Link key={player.id} href={`/feed/profile?id=${player.id}`} className="px-6 py-3.5 hover:bg-foreground/[0.05] transition-colors flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-primary/5 flex items-center justify-center">
                      {player.avatar_url ? <img src={player.avatar_url} className="w-full h-full object-cover" alt="" /> : <span className="text-primary font-bold text-[10px]">{player.name.charAt(0)}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[13px] truncate leading-none mb-0.5">{player.name}</div>
                      <div className="text-[10px] text-foreground/30 font-bold uppercase">{player.position}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-primary italic leading-none">{player.elo}</div>
                      <div className="text-[8px] font-bold text-foreground/30 uppercase tracking-tighter">ELO</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Share Modal */}
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
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[60px] rounded-full pointer-events-none -z-10" />

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
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveHandle(); }}
                />
              </div>

              {handleError && (
                <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-bold">
                  {handleError}
                </div>
              )}

              <div className="mb-6 px-4 py-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06]">
                <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1.5">Vista previa</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-xs">
                        {profile?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-foreground">{profile?.name}</span>
                    <span className="text-foreground/40 text-sm ml-1.5">
                      @{editingHandle || profile?.name?.toLowerCase().replace(/\s+/g, '')}
                    </span>
                  </div>
                </div>
              </div>

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
