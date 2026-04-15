'use client';

import { Suspense } from 'react';
import { FifaCard } from '@/components/FifaCard';
import {
  Award,
  History,
  Info,
  Edit2,
  Save,
  X,
  Loader2,
  Trophy,
  Zap,
  MapPin,
  Target,
  Calendar,
  Plus,
  ChevronRight,
  Star,
  Shield,
  Users,
  Trash2,
  AlertTriangle,
  Lock,
  Camera,
  ExternalLink,
  MessageSquare,
  Send,
  Trash,
  Flame,
  Play,
  BadgeCheck,
  Wallet,
  Image as ImageIcon,
  Heart,
  Share2,
  MoreHorizontal,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getUserMatches, Match } from '@/lib/matches';
import { findVenueByLocation } from '@/lib/venues';
import { ProfileSkeleton } from '@/components/Skeletons';
import { getDominantColor } from '@/lib/colorUtils';
import { uploadUserAvatar } from '@/lib/storage';
import { compressImage, blobToFile } from '@/lib/imageUtils';
import { RankBadge } from '@/components/RankBadge';
import { getRankByElo } from '@/lib/ranks';
import { ShareStory } from '@/components/ShareStory';
import { getUserHighlights, Highlight } from '@/lib/highlights';
import confetti from 'canvas-confetti';
import { SkillPointAllocator } from '@/components/SkillPointAllocator';
import { RadarChart } from '@/components/RadarChart';
import { detectFace, removeImageBackground } from '@/lib/aiUtils';

interface PlayerStats {
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
}

const DEFAULT_PLAYER = {
  name: 'Jugador',
  overall: 0,
  position: 'DC',
  stats: {
    pac: 0,
    sho: 0,
    pas: 0,
    dri: 0,
    def: 0,
    phy: 0,
  },
};

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading, deleteAccount, refreshUser } = useAuth();

  // Get ID from query param ?id=...
  const id = searchParams.get('id');
  const isMe = id === 'me' || id === user?.id || (!id && user?.id);

  const initialTab = (searchParams.get('tab') as any) || 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'futtok' | 'wall' | 'wallet'>(
    ['overview', 'history', 'futtok', 'wall', 'wallet'].includes(initialTab) ? initialTab : 'overview'
  );

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    age: '',
    height: '',
    preferredFoot: 'Derecha',
    position: 'DC',
    bio: '',
    cover_url: '',
    instagram: '',
  });
  const [skillPoints, setSkillPoints] = useState(0);
  const [editedStats, setEditedStats] = useState<PlayerStats>(DEFAULT_PLAYER.stats);

  const [isSaving, setIsSaving] = useState(false);
  const [targetProfile, setTargetProfile] = useState<any>(null);
  const [userTeam, setUserTeam] = useState<any>(null);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [mvpCount, setMvpCount] = useState(0);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userMatches, setUserMatches] = useState<Match[]>([]);
  const [ambientColor, setAmbientColor] = useState<string | null>(null);

  // FutTok State
  const [userHighlights, setUserHighlights] = useState<Highlight[]>([]);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(false);

  // Comments State
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const { updatePassword } = useAuth();

  // Avatar Upload State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // AI States
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [aiProgress, setAiProgress] = useState<string | null>(null);
  const [originalFileBeforeAI, setOriginalFileBeforeAI] = useState<File | null>(null);

  // Sync tab with URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'history', 'futtok', 'wall', 'wallet'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isMe && user) {
      const metadata = user.user_metadata || {};
      setEditedData({
        name: user.name || DEFAULT_PLAYER.name,
        age: (metadata.age || '').toString() || '23',
        height: (metadata.height || '').toString() || '175',
        preferredFoot: metadata.preferredFoot || metadata.preferred_foot || 'Derecha',
        position: (metadata.position || user.user_metadata?.position || 'DC').toUpperCase(),
        bio: metadata.bio || '',
        cover_url: metadata.cover_url || '',
        instagram: metadata.instagram || '',
      });
    }
  }, [isMe, user]);

  useEffect(() => {
    if (searchParams.get('pro_success') === 'true') {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FBBF24', '#F59E0B', '#D97706', '#000000', '#ffffff'],
      });
      window.history.replaceState({}, '', '/profile?id=me');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProfileData = async () => {
      const targetId = id === 'me' || !id ? user?.id : id;
      if (!targetId) return;

      setIsLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setTargetProfile(data);
          setSkillPoints(data.skill_points || 0);
          if (data.stats) setEditedStats(data.stats as PlayerStats);
        }
      } catch (err) {
        console.error('Error cargando perfil:', err);
      } finally {
        setIsLoadingProfile(false);
      }

      try {
        const [badgesRes, teamRes] = await Promise.all([
          supabase.from('user_badges').select('*').eq('user_id', targetId),
          supabase
            .from('team_members')
            .select('teams(*)')
            .eq('user_id', targetId)
            .eq('status', 'confirmed')
            .maybeSingle(),
        ]);

        if (badgesRes.data) setUserBadges(badgesRes.data);
        if (teamRes.data?.teams) setUserTeam(teamRes.data.teams);

        // Fetch matches
        const matches = await getUserMatches(targetId);
        setUserMatches(matches);
      } catch (err) {
        console.warn('Error cargando data extra:', err);
      }

      setIsLoadingHighlights(true);
      try {
        const highlights = await getUserHighlights(targetId);
        setUserHighlights(highlights);
      } catch (err) {
         console.warn('Error cargando highlights:', err);
      } finally {
        setIsLoadingHighlights(false);
      }
    };

    if (user || !isMe) {
      fetchProfileData();
    }
  }, [user, id, isMe]);

  useEffect(() => {
    const fetchComments = async () => {
      const targetId = id === 'me' || !id ? user?.id : id;
      if (!targetId || activeTab !== 'wall') return;

      setIsLoadingComments(true);
      try {
        const { data, error } = await supabase
          .from('profile_comments')
          .select('*, author:author_id (name, avatar_url)')
          .eq('profile_id', targetId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setComments(data || []);
      } catch (err) {
        console.error('Error cargando comentarios:', err);
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchComments();
  }, [user, id, activeTab]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = id === 'me' || !id ? user?.id : id;
    if (!user || !targetId || !newComment.trim()) return;

    setIsPostingComment(true);
    try {
      const { data, error } = await supabase
        .from('profile_comments')
        .insert([{ profile_id: targetId, author_id: user.id, content: newComment.trim() }])
        .select('*, author:author_id (name, avatar_url)')
        .single();

      if (error) throw error;
      setComments([data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Error publicando comentario:', err);
      alert('No se pudo publicar el comentario.');
    } finally {
      setIsPostingComment(false);
    }
  };

  const authMetadata = user?.user_metadata || {};
  const dbProfile = targetProfile || {};
  const dbMetadata = dbProfile.user_metadata || {};

  const getField = (field: string, defaultValue: any, snakeCaseField?: string) => {
    if (isMe) {
      return (
        authMetadata[field] ||
        dbProfile[field] ||
        (snakeCaseField ? dbProfile[snakeCaseField] : null) ||
        defaultValue
      );
    }
    return (
      dbProfile[field] ||
      (snakeCaseField ? dbProfile[snakeCaseField] : null) ||
      dbMetadata[field] ||
      defaultValue
    );
  };

  useEffect(() => {
    const currentAvatar = avatarPreview || getField('avatar_url', null);
    if (currentAvatar) {
      getDominantColor(currentAvatar).then((color) => {
        if (color) setAmbientColor(color);
      });
    }
  }, [dbProfile, authMetadata, avatarPreview]);

  const playerStats = useMemo((): PlayerStats => {
    if (isEditing) return editedStats;
    const statsSource = isMe ? authMetadata.stats : dbProfile.stats || dbMetadata.stats;
    if (statsSource && typeof statsSource === 'object') return statsSource as PlayerStats;

    return {
      pac: getField('pac', DEFAULT_PLAYER.stats.pac),
      sho: getField('sho', DEFAULT_PLAYER.stats.sho),
      pas: getField('pas', DEFAULT_PLAYER.stats.pas),
      dri: getField('dri', DEFAULT_PLAYER.stats.dri),
      def: getField('def', DEFAULT_PLAYER.stats.def),
      phy: getField('phy', DEFAULT_PLAYER.stats.phy),
    };
  }, [isMe, authMetadata.stats, dbProfile.stats, dbMetadata.stats, editedStats, isEditing]);
  
  const playerOverall = useMemo(() => {
    return getField(
      'overall',
      Math.round(Object.values(playerStats).reduce((a: number, b: number) => a + b, 0) / 6)
    );
  }, [playerStats, dbProfile, authMetadata]);

  const displayPlayer = useMemo(() => ({
    ...DEFAULT_PLAYER,
    name: (isMe ? user?.name || editedData.name : dbProfile.name) || DEFAULT_PLAYER.name,
    position: getField('position', DEFAULT_PLAYER.position) as string,
    overall: playerOverall as number,
    stats: playerStats,
    bio: getField('bio', '') as string,
  }), [isMe, user?.name, editedData.name, dbProfile.name, playerOverall, playerStats, targetProfile, authMetadata]);

  const displayAge = useMemo(() => getField('age', '18'), [dbProfile, authMetadata]);
  const displayHeight = useMemo(() => getField('height', '170'), [dbProfile, authMetadata]);
  const displayFoot = useMemo(() => getField('preferredFoot', 'Derecha', 'preferred_foot'), [dbProfile, authMetadata]);
  const displayMatches = parseInt(`${getField('matches', 0)}`) || 0;
  const displayElo = parseInt(`${getField('elo', 0)}`) || 0;
  const displayGoals = parseInt(`${getField('goals', 0)}`) || 0;
  const displayMvpCount = dbProfile.mvp_count || 0;
  const teamName = userTeam?.name || 'Sin equipo';

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      let newAvatarUrl = getField('avatar_url', null);
      if (avatarFile) {
        const compressedBlob = await compressImage(avatarFile, 800, 0.8);
        const compressedFile = blobToFile(compressedBlob, avatarFile.name);
        newAvatarUrl = await uploadUserAvatar(compressedFile, user.id);
      }
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        name: editedData.name,
        position: editedData.position,
        preferred_foot: editedData.preferredFoot,
        age: parseInt(editedData.age) || 18,
        height: parseInt(editedData.height) || 170,
        avatar_url: newAvatarUrl,
        cover_url: editedData.cover_url,
        bio: editedData.bio,
        instagram: editedData.instagram,
        stats: editedStats,
        skill_points: skillPoints,
        updated_at: new Date().toISOString(),
      });
      if (profileError) throw profileError;
      
      await supabase.auth.updateUser({
        data: {
          name: editedData.name,
          full_name: editedData.name,
          age: editedData.age,
          height: editedData.height,
          preferredFoot: editedData.preferredFoot,
          position: editedData.position,
          avatar_url: newAvatarUrl,
          cover_url: editedData.cover_url,
          bio: editedData.bio,
          instagram: editedData.instagram,
          stats: editedStats,
          skill_points: skillPoints,
        },
      });
      await refreshUser();
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      router.refresh();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return;
    setIsUpdatingPassword(true);
    try {
      await updatePassword(newPassword);
      setShowPasswordModal(false);
      setNewPassword('');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setOriginalFileBeforeAI(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      const hasFace = await detectFace(file);
      setIsFaceDetected(hasFace);
    }
  };

  const handleRemoveBackground = async () => {
    if (!avatarFile) return;
    setIsRemovingBackground(true);
    setAiProgress('Iniciando...');
    try {
      const resultBlob = await removeImageBackground(avatarFile, (p) => setAiProgress(p));
      const newFile = blobToFile(resultBlob, `nobg-${avatarFile.name}`);
      setAvatarFile(newFile);
      setAvatarPreview(URL.createObjectURL(resultBlob));
      setIsFaceDetected(false);
    } catch (err) {
      alert('No se pudo remover el fondo.');
    } finally {
      setIsRemovingBackground(false);
      setAiProgress(null);
    }
  };

  const handleRestoreOriginal = () => {
    if (originalFileBeforeAI) {
      setAvatarFile(originalFileBeforeAI);
      setAvatarPreview(URL.createObjectURL(originalFileBeforeAI));
      setIsFaceDetected(true);
    }
  };

  if (isLoading || isLoadingProfile) return <ProfileSkeleton />;
  if (isMe && !user && !isLoading) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-x-hidden">
      {/* Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent" />
      </div>

      {/* Hero Banner Section */}
      <div className="relative w-full h-[240px] sm:h-[350px] lg:h-[400px] overflow-hidden bg-foreground/5">
        <img 
          src={getField('cover_url', "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop")} 
          className="w-full h-full object-cover opacity-40"
          alt="Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        {/* Hero Section Face (Avatar Fallback) */}
        {!isEditing && (
           <div className="absolute bottom-10 left-10 lg:left-20 flex items-center gap-6 z-30 lg:hidden">
              <div className="w-20 h-20 rounded-full border-4 border-background overflow-hidden bg-background shadow-2xl">
                 <img src={getField('avatar_url', '')} className="w-full h-full object-cover" alt="" />
              </div>
           </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-32 lg:-mt-40 relative z-20 pb-20">
        {/* Profile Header Block */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 mb-12 relative z-20">
            {/* The FIFA Card (Avatar Replacement) */}
            <div className={cn(
              "relative transition-all duration-700 perspective-1000 group/card shrink-0 mx-auto lg:mx-0",
              isEditing && "z-50 scale-105"
            )}>
               <div className={cn("absolute -inset-10 blur-[80px] rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity", getField('is_pro', false) ? "bg-yellow-500/20" : "bg-primary/20")} />
               <FifaCard
                  player={{
                    ...displayPlayer,
                    name: (isEditing ? editedData.name : displayPlayer.name) as string,
                    position: (isEditing ? editedData.position : displayPlayer.position) as string,
                    image: avatarPreview || (getField('avatar_url', undefined) as string | undefined),
                    mvpTrophies: displayMvpCount,
                    badges: userBadges.map((b) => b.badge_type as string),
                    pendingPoints: skillPoints,
                  }}
                />
                {isEditing && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none">
                    <label className="w-full h-full flex flex-col items-center justify-center bg-black/60 cursor-pointer rounded-[2rem] border-2 border-dashed border-primary/40 m-2 transition-all hover:bg-black/40 pointer-events-auto">
                      <Camera className="w-10 h-10 text-primary mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Cambiar<br/>Foto</span>
                      <input type="file" className="hidden" onChange={handleAvatarChange} />
                    </label>
                    <AnimatePresence>
                      {isFaceDetected && !isRemovingBackground && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                          onClick={(e) => { e.preventDefault(); handleRemoveBackground(); }}
                          className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-black text-[9px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all pointer-events-auto whitespace-nowrap z-50"
                        >
                          <Zap className="w-3 h-3 fill-current" /> Quitar fondo estilo Pro
                        </motion.button>
                      )}
                      {isRemovingBackground && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 rounded-[2rem] backdrop-blur-sm m-2 pointer-events-auto" >
                          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">Procesando IA...</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
            </div>

            {/* Basic Info & Social Stats */}
            <div className="flex-1 w-full space-y-6 lg:pt-8 text-center lg:text-left">
               <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 sm:gap-8 justify-between">
                  <div className="space-y-4">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black italic text-white uppercase tracking-tighter leading-none text-shadow-md">
                        {isEditing ? (editedData.name || 'JUGADOR') : displayPlayer.name}
                      </h1>
                      {!isEditing && getField('is_pro', false) && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center border border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                           <BadgeCheck className="w-5 h-5 text-black" />
                        </div>
                      )}
                    </motion.div>
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                       <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-xs font-black text-primary uppercase tracking-[0.4em] italic leading-none">{displayPlayer.position}</span>
                       <span className="px-3 py-1 rounded-full bg-foreground/10 border border-foreground/20 text-xs font-black text-white/70 uppercase tracking-[0.4em] leading-none">{teamName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 sm:mt-0 shrink-0">
                    {isMe ? (
                       isEditing ? (
                        <div className="flex gap-3">
                           <button onClick={() => setIsEditing(false)} className="h-12 px-6 rounded-[1.25rem] bg-foreground/5 border border-foreground/10 text-[10px] font-black uppercase tracking-widest hover:bg-foreground/10 transition-all">Cancelar</button>
                           <button onClick={handleSaveProfile} disabled={isSaving} className="h-12 px-8 rounded-[1.25rem] bg-primary text-black text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all">
                             {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
                           </button>
                        </div>
                       ) : (
                        <button onClick={() => setIsEditing(true)} className="h-12 px-8 rounded-[1.25rem] bg-foreground/5 border border-foreground/10 text-[10px] font-black uppercase tracking-widest hover:bg-foreground/10 transition-all flex items-center gap-2">
                           <Edit2 className="w-4 h-4" /> Editar
                        </button>
                       )
                    ) : (
                      <button onClick={() => router.push(`/messages?user=${id}`)} className="h-12 px-8 rounded-[1.25rem] bg-primary text-black text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all">
                         <MessageSquare className="w-4 h-4" /> Mensaje
                      </button>
                    )}
                  </div>
               </div>

               <div className="max-w-2xl mx-auto lg:mx-0">
                  {getField('bio', '') && !isEditing && (
                    <p className="text-sm border-l-4 border-primary/40 pl-4 py-1 text-foreground/80 font-medium italic leading-relaxed">
                      "{displayPlayer.bio || getField('bio', '')}"
                    </p>
                  )}
               </div>

               {!isEditing && (
                   <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                      {[
                        { label: 'Partidos', value: displayMatches, color: 'text-foreground' },
                        { label: 'E.L.O.', value: displayElo, color: getField('is_pro', false) ? 'text-yellow-400' : 'text-primary' },
                        { label: 'Goles', value: displayGoals, color: 'text-foreground' },
                        { label: 'M.V.P.', value: displayMvpCount, color: 'text-accent' },
                      ].map((stat, i) => (
                        <div key={i} className="flex-1 min-w-[100px] max-w-[140px] bg-foreground/[0.02] border border-foreground/10 p-4 rounded-[1.5rem] flex flex-col items-center justify-center gap-1 group/stat transition-all text-center">
                           <span className={cn("text-3xl font-black italic tracking-tighter leading-none group-hover/stat:scale-110 transition-transform", stat.color)}>{stat.value}</span>
                           <span className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.3em] truncate w-full">{stat.label}</span>
                        </div>
                      ))}
                   </div>
               )}
            </div>
        </div>

        {!isEditing && (
          <>
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-foreground/5 -mx-4 px-4 py-2 mb-8 overflow-x-auto">
            <div className="flex items-center justify-start sm:justify-center gap-2 min-w-max">
              {[
                { id: 'overview', icon: Award, label: 'Resumen' },
                { id: 'history', icon: History, label: 'Partidos' },
                { id: 'futtok', icon: Play, label: 'Highlights' },
                { id: 'wall', icon: MessageSquare, label: 'Muro Social' },
                ...(isMe ? [{ id: 'wallet', icon: Wallet, label: 'Billetera' }] : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); router.push(`/profile?id=${id || 'me'}&tab=${tab.id}`, { scroll: false }); }}
                  className={cn("flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap", activeTab === tab.id ? "bg-primary text-black shadow-lg" : "text-foreground/40 hover:text-foreground hover:bg-foreground/5")}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-h-[600px]">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-8 rounded-[2rem] bg-foreground/[0.02] border border-foreground/5 space-y-6">
                           <div className="flex items-center gap-2 opacity-30 text-[10px] font-black uppercase tracking-widest"><Shield className="w-4 h-4" /> Habilidades</div>
                           <SkillPointAllocator stats={playerStats} skillPoints={skillPoints} onStatsChange={() => {}} onSkillPointsChange={() => {}} />
                        </div>
                        <div className="p-8 rounded-[2rem] bg-foreground/[0.02] border border-foreground/5 flex items-center justify-center min-h-[300px]">
                           <RadarChart stats={playerStats} />
                        </div>
                     </div>
                     <div className="p-8 rounded-[2rem] bg-foreground/[0.02] border border-foreground/5 space-y-6">
                        <div className="flex items-center gap-2 opacity-30 text-[10px] font-black uppercase tracking-widest"><Info className="w-4 h-4" /> Detalles</div>
                        <div className="space-y-4">
                           {[{ label: 'Edad', value: `${displayAge} Años` }, { label: 'Altura', value: `${displayHeight} cm` }, { label: 'Pie Hábil', value: displayFoot }].map((item, i) => (
                             <div key={i} className="flex justify-between py-3 border-b border-foreground/5">
                                <span className="text-[10px] font-black text-foreground/30 uppercase">{item.label}</span>
                                <span className="text-sm font-black italic text-foreground uppercase">{item.value}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userMatches.length > 0 ? userMatches.map(match => (
                    <Link key={match.id} href={`/matches/${match.id}`}>
                       <div className="p-6 rounded-[2rem] bg-foreground/[0.02] border border-foreground/5 hover:border-primary/30 transition-all">
                          <div className="flex justify-between mb-4">
                             <div className="flex gap-3 items-center">
                                <Calendar className="w-4 h-4 text-foreground/20" />
                                <div className="text-[10px] font-black uppercase text-foreground/40">{new Date(match.date).toLocaleDateString()} • {match.time} HS</div>
                             </div>
                             <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", match.is_completed ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary")}>
                                {match.is_completed ? 'Finalizado' : 'Pendiente'}
                             </span>
                          </div>
                          <div className="flex items-center gap-2 py-3 border-y border-foreground/5 text-center font-black italic uppercase text-sm">
                             <div className="flex-1 truncate">{match.location || 'Cancha'}</div>
                             <div className="px-2 text-[10px] opacity-20">VS</div>
                             <div className="flex-1 truncate">Rival</div>
                          </div>
                       </div>
                    </Link>
                  )) : <div className="col-span-full py-20 text-center opacity-20 font-black uppercase italic">Sin partidos</div>}
                </motion.div>
              )}
              
              {activeTab === 'futtok' && (
                <motion.div key="futtok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                   {userHighlights.map(h => (
                     <Link key={h.id} href={`/futtok?id=${h.id}`}>
                        <div className="aspect-[9/16] rounded-2xl overflow-hidden relative group bg-black">
                           <video src={h.video_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                           <p className="absolute bottom-4 left-4 right-4 text-[10px] font-black uppercase text-white truncate">{h.description || 'Highlight'}</p>
                        </div>
                     </Link>
                   ))}
                </motion.div>
              )}

              {activeTab === 'wall' && (
                <motion.div key="wall" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                   <div className="p-8 rounded-[2rem] bg-foreground/[0.02] border border-foreground/10 flex flex-col items-center gap-4">
                      <MessageSquare className="w-10 h-10 text-foreground/10" />
                      <p className="text-xl font-black italic uppercase text-foreground/20">Muro Social</p>
                      {user && (
                        <form onSubmit={handlePostComment} className="w-full max-w-lg flex flex-col gap-3">
                           <textarea value={newComment} onChange={e => setNewComment(e.target.value)} className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-4 text-xs font-medium outline-none h-24 italic" placeholder="Deja tu firma..." />
                           <button type="submit" className="self-end h-10 px-6 bg-blue-500 text-white font-black text-[10px] uppercase rounded-xl">Firmar</button>
                        </form>
                      )}
                      
                      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                         {comments.map(c => (
                           <div key={c.id} className="p-5 rounded-2xl bg-foreground/5 border border-foreground/5 space-y-3 relative text-left">
                              <div className="flex gap-3 items-center">
                                 <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0"><img src={c.author?.avatar_url || ''} className="w-full h-full object-cover" /></div>
                                 <div className="text-[10px] font-black uppercase italic leading-none">{c.author?.name}</div>
                              </div>
                              <p className="text-xs italic text-foreground/70 leading-relaxed font-medium">"{c.content}"</p>
                           </div>
                         ))}
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </>
        )}

        {isEditing && (
          <div className="mt-8 space-y-8">
             <div className="p-8 rounded-[2.5rem] bg-foreground/[0.02] border border-foreground/10 space-y-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-black italic uppercase text-white">Editar Jugador</h3>
                   <div className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">Puntos Disponibles: {skillPoints}</div>
                </div>
                <SkillPointAllocator stats={editedStats} skillPoints={skillPoints} onStatsChange={setEditedStats} onSkillPointsChange={setSkillPoints} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Nombre</label>
                          <input value={editedData.name} onChange={e => setEditedData({...editedData, name: e.target.value})} className="w-full h-12 bg-foreground/5 rounded-xl border border-foreground/10 px-4 text-sm font-black italic" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Edad</label>
                             <input type="number" value={editedData.age} onChange={e => setEditedData({...editedData, age: e.target.value})} className="w-full h-12 bg-foreground/5 rounded-xl border border-foreground/10 px-4 text-sm font-black italic" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Altura (cm)</label>
                             <input type="number" value={editedData.height} onChange={e => setEditedData({...editedData, height: e.target.value})} className="w-full h-12 bg-foreground/5 rounded-xl border border-foreground/10 px-4 text-sm font-black italic" />
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2 text-left">
                       <label className="text-[9px] font-black uppercase text-foreground/40 ml-1">Biografía</label>
                       <textarea value={editedData.bio} onChange={e => setEditedData({...editedData, bio: e.target.value})} className="w-full h-40 bg-foreground/5 rounded-xl border border-foreground/10 p-4 text-sm font-medium italic outline-none" />
                    </div>
                </div>
             </div>
          </div>
        )}

        <div className="pb-32 lg:pb-12" />

        {isMe && !isEditing && (
          <div className="border-t border-foreground/10 pt-8 pb-8 flex flex-wrap gap-8 items-center text-[11px] font-black uppercase tracking-widest text-foreground/20 italic">
            <button onClick={() => setShowPasswordModal(true)} className="hover:text-primary transition-colors flex items-center gap-2"><Lock className="w-4 h-4" /> Seguridad</button>
            <button onClick={() => setShowDeleteConfirm(true)} className="hover:text-red-500 transition-colors flex items-center gap-2"><Trash2 className="w-4 h-4" /> Eliminar</button>
          </div>
        )}

        <AnimatePresence>
           {showDeleteConfirm && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface p-8 rounded-[3rem] border border-foreground/10 max-w-md w-full text-center space-y-6">
                   <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-500"><AlertTriangle className="w-8 h-8" /></div>
                   <h3 className="text-2xl font-black italic uppercase text-white">¿Borrar todo?</h3>
                   <p className="text-xs text-foreground/40">Esta acción borrará tus datos para siempre.</p>
                   <div className="flex flex-col gap-2">
                      <button onClick={deleteAccount} className="h-12 bg-red-600 text-white font-black text-[10px] uppercase rounded-xl">BORRAR CUENTA</button>
                      <button onClick={() => setShowDeleteConfirm(false)} className="h-12 bg-foreground/5 text-foreground/40 font-black text-[10px] uppercase rounded-xl">CANCELAR</button>
                   </div>
                </motion.div>
             </div>
           )}
           {showPasswordModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm glass-premium rounded-[2.5rem] p-8 lg:p-10 border border-foreground/10 bg-surface">
                <form onSubmit={handleUpdatePassword} className="space-y-8">
                  <div className="space-y-2"><h2 className="text-2xl font-black italic text-foreground uppercase tracking-tighter">Nueva Clave</h2></div>
                  <input type="password" placeholder="Contraseña..." className="w-full h-12 bg-foreground/5 rounded-xl px-4 font-black outline-none border border-foreground/10" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 h-12 rounded-xl bg-foreground/5 text-[10px] font-black uppercase text-foreground/40">CANCELAR</button>
                    <button type="submit" className="flex-1 h-12 bg-primary text-black font-black text-[10px] uppercase rounded-xl">OK</button>
                  </div>
                </form>
              </motion.div>
            </div>
           )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
