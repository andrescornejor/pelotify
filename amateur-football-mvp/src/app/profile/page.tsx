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
    Trash
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getUserMatches, Match } from '@/lib/matches';
import { findVenueByLocation } from '@/lib/venues';
import { ProfileSkeleton } from '@/components/Skeletons';
import { getDominantColor } from '@/lib/colorUtils';
import { uploadUserAvatar } from '@/lib/storage';
import { compressImage, blobToFile } from '@/lib/imageUtils';

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
    }
};

function ProfileContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoading, deleteAccount } = useAuth();

    // Get ID from query param ?id=...
    const id = searchParams.get('id');
    const isMe = id === 'me' || id === user?.id || (!id && user?.id);

    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'wall'>('overview');

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        name: '',
        age: '',
        height: '',
        preferredFoot: 'Derecha',
        position: 'DC'
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

    useEffect(() => {
        if (isMe && user) {
            const metadata = user.user_metadata || {};
            // Ensure we have defaults if Google didn't provide them
            setEditedData({
                name: user.name || DEFAULT_PLAYER.name,
                age: (metadata.age || '').toString() || '23',
                height: (metadata.height || '').toString() || '175',
                preferredFoot: metadata.preferredFoot || metadata.preferred_foot || 'Derecha',
                position: (metadata.position || user.user_metadata?.position || 'DC').toUpperCase()
            });
        }
    }, [isMe, user]);

    useEffect(() => {
        const fetchProfileData = async () => {
            const targetId = (id === 'me' || !id) ? user?.id : id;
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

            // Fetch Gamification Data
            try {
                const [badgesRes, teamRes] = await Promise.all([
                    supabase.from('user_badges').select('*').eq('user_id', targetId),
                    supabase.from('team_members').select('teams(*)').eq('user_id', targetId).eq('status', 'confirmed').maybeSingle()
                ]);

                if (badgesRes.data) setUserBadges(badgesRes.data);
                if (teamRes.data?.teams) setUserTeam(teamRes.data.teams);

                // IMPORTANT: Calculate MVP using the aggregated count from the profile table, not counting individual votes
                // targetProfile is our DB record fetched above
                const actualMvpCount = targetProfile?.mvp_count || 0;
                setMvpCount(actualMvpCount);

                // Fetch real matches
                const matches = await getUserMatches(targetId);
                setUserMatches(matches);
            } catch (err) {
                console.warn('Error cargando data extra:', err);
            }
        };

        if (user || !isMe) {
            fetchProfileData();
        }
    }, [user, id, isMe]);

    // Fetch comments
    useEffect(() => {
        const fetchComments = async () => {
            const targetId = (id === 'me' || !id) ? user?.id : id;
            if (!targetId || activeTab !== 'wall') return;

            setIsLoadingComments(true);
            try {
                const { data, error } = await supabase
                    .from('profile_comments')
                    .select(`
                        *,
                        author:author_id (
                            name,
                            avatar_url
                        )
                    `)
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
        const targetId = (id === 'me' || !id) ? user?.id : id;
        if (!user || !targetId || !newComment.trim()) return;

        setIsPostingComment(true);
        try {
            const { data, error } = await supabase
                .from('profile_comments')
                .insert([
                    {
                        profile_id: targetId,
                        author_id: user.id,
                        content: newComment.trim()
                    }
                ])
                .select(`
                    *,
                    author:author_id (
                        name,
                        avatar_url
                    )
                `)
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

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('¿Seguro que quieres borrar este comentario?')) return;

        try {
            const { error } = await supabase
                .from('profile_comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;
            setComments(comments.filter(c => c.id !== commentId));
        } catch (err) {
            console.error('Error borrando comentario:', err);
            alert('No se pudo borrar el comentario.');
        }
    };

    const authMetadata = user?.user_metadata || {};
    const dbProfile = targetProfile || {};
    const dbMetadata = dbProfile.user_metadata || {};

    const getField = (field: string, defaultValue: any, snakeCaseField?: string) => {
        if (isMe) {
            return authMetadata[field] || dbProfile[field] || (snakeCaseField ? dbProfile[snakeCaseField] : null) || defaultValue;
        }
        return dbProfile[field] || (snakeCaseField ? dbProfile[snakeCaseField] : null) || dbMetadata[field] || defaultValue;
    };

    useEffect(() => {
        const currentAvatar = avatarPreview || getField('avatar_url', null);
        if (currentAvatar) {
            getDominantColor(currentAvatar).then(color => {
                if (color) setAmbientColor(color);
            });
        }
    }, [dbProfile, authMetadata, avatarPreview]);

    const resolveStats = (): PlayerStats => {
        if (isEditing) return editedStats;
        const statsSource = isMe ? authMetadata.stats : (dbProfile.stats || dbMetadata.stats);
        if (statsSource && typeof statsSource === 'object') return statsSource as PlayerStats;

        return {
            pac: getField('pac', DEFAULT_PLAYER.stats.pac),
            sho: getField('sho', DEFAULT_PLAYER.stats.sho),
            pas: getField('pas', DEFAULT_PLAYER.stats.pas),
            dri: getField('dri', DEFAULT_PLAYER.stats.dri),
            def: getField('def', DEFAULT_PLAYER.stats.def),
            phy: getField('phy', DEFAULT_PLAYER.stats.phy),
        };
    };

    const playerStats = resolveStats();
    const playerOverall = getField('overall', Math.round(Object.values(playerStats).reduce((a: number, b: number) => a + b, 0) / 6));

    const displayPlayer = {
        ...DEFAULT_PLAYER,
        name: (isMe ? (user?.name || editedData.name) : dbProfile.name) || DEFAULT_PLAYER.name,
        position: getField('position', DEFAULT_PLAYER.position) as string,
        overall: playerOverall as number,
        stats: playerStats
    };

    const displayAge = getField('age', '18');
    const displayHeight = getField('height', '170');
    const displayFoot = getField('preferredFoot', 'Derecha', 'preferred_foot');

    const displayMatches = parseInt(`${getField('matches', 0)}`) || 0;
    const displayElo = parseInt(`${getField('elo', 0)}`) || 0;
    const displayGoals = parseInt(`${getField('goals', 0)}`) || 0;
    const displayMatchesWon = parseInt(`${getField('matches_won', 0)}`) || 0;
    const displayMvpCount = parseInt(`${getField('mvp_count', 0)}`) || 0;
    const teamName = userTeam?.name || 'Sin equipo';

    const handleSaveProfile = async () => {
        if (!user?.id) {
            alert("Error: No se encontró ID de usuario.");
            return;
        }

        setIsSaving(true);
        try {
            console.log("Iniciando guardado de perfil para:", user.id);

            let newAvatarUrl = getField('avatar_url', null);
            if (avatarFile) {
                console.log("Subiendo nuevo avatar...");

                // Compress the image before uploading
                try {
                    console.log("Comprimiendo imagen...");
                    const compressedBlob = await compressImage(avatarFile, 800, 0.8);
                    const compressedFile = blobToFile(compressedBlob, avatarFile.name);
                    console.log(`Imagen comprimida: de ${Math.round(avatarFile.size / 1024)}KB a ${Math.round(compressedFile.size / 1024)}KB`);
                    newAvatarUrl = await uploadUserAvatar(compressedFile, user.id);
                } catch (compressionError) {
                    console.error("Error comprimiendo imagen, intentando subir original:", compressionError);
                    newAvatarUrl = await uploadUserAvatar(avatarFile, user.id);
                }

                console.log("Avatar subido:", newAvatarUrl);
            }

            // 1. Update Public Profile (Source of Truth) FIRST
            console.log("Actualizando tabla de perfiles...");
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    name: editedData.name,
                    position: editedData.position,
                    preferred_foot: editedData.preferredFoot,
                    age: parseInt(editedData.age) || 18,
                    height: parseInt(editedData.height) || 170,
                    avatar_url: newAvatarUrl,
                    stats: editedStats,
                    skill_points: skillPoints,
                    updated_at: new Date().toISOString()
                });

            if (profileError) {
                console.error("Error en tabla de perfiles:", profileError);
                throw new Error(`Error en el perfil público: ${profileError.message}`);
            }

            // SUCCESS! 
            // We stop the spinner and close the editor immediately after DB success
            setIsSaving(false);
            setIsEditing(false);
            setAvatarFile(null);
            setAvatarPreview(null);
            router.refresh();

            // 2. Update Auth Metadata (for the current session) - Background Fire
            // This triggers onAuthStateChange to refresh headers, but we don't 'await' it
            // to avoid hanging if the Auth server is slow.
            console.log("Actualizando metadata en segundo plano...");
            supabase.auth.updateUser({
                data: {
                    name: editedData.name,
                    full_name: editedData.name,
                    age: editedData.age,
                    height: editedData.height,
                    preferredFoot: editedData.preferredFoot,
                    position: editedData.position,
                    avatar_url: newAvatarUrl,
                    stats: editedStats,
                    skill_points: skillPoints
                }
            }).catch(e => console.warn("Error secundario en metadata de auth:", e));

        } catch (error: any) {
            console.error("Error crítico en handleSaveProfile:", error);
            alert(`Error guardando perfil: ${error.message || 'Error desconocido'}`);
            setIsSaving(false);
        } finally {
            // Safe fallback
            setTimeout(() => setIsSaving(false), 500);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres");
            return;
        }
        setIsUpdatingPassword(true);
        try {
            await updatePassword(newPassword);
            setShowPasswordModal(false);
            setNewPassword('');
        } catch (error) {
            // Error managed in alert
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);

            // Extract color from preview immediately
            getDominantColor(previewUrl).then(color => {
                if (color) setAmbientColor(color);
            });
        }
    };

    if (isLoading || (isLoadingProfile && !isMe)) {
        return <ProfileSkeleton />;
    }

    if (isMe && !user && !isLoading) {
        router.push('/login');
        return null;
    }

    return (
        <div className="flex flex-col gap-8 p-4 sm:p-6 lg:p-10 xl:p-14 2xl:p-16 max-w-full mx-auto min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary">
            {/* Ambient Effects */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div
                    className="absolute top-0 left-0 w-full h-[80dvh] opacity-40 transition-colors duration-1000"
                    style={{ backgroundImage: ambientColor ? `radial-gradient(ellipse at 50% 0%, ${ambientColor}40, transparent 70%)` : 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.15), transparent 70%)' }}
                />
                <div
                    className={cn("absolute top-[-20%] right-[-10%] w-[90%] h-[90%] blur-[160px] rounded-full animate-pulse opacity-50", !ambientColor && "bg-primary/5")}
                    style={{ backgroundColor: ambientColor || undefined, animationDuration: '8s' }}
                />
                <div
                    className={cn("absolute bottom-[-10%] left-[-20%] w-[60%] h-[60%] blur-[120px] rounded-full opacity-30 animate-pulse delay-1000", !ambientColor && "bg-accent/5")}
                    style={{ backgroundColor: ambientColor ? `${ambientColor}80` : undefined, animationDuration: '6s' }}
                />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            {/* Header / Actions */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group/header">
                <div className="space-y-3">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 border border-primary/30">
                            <div className="w-2 h-2 rounded-full bg-primary animate-ping absolute" />
                            <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/40 italic bg-clip-text text-transparent bg-gradient-to-r from-foreground/50 to-foreground/20">Identidad Digital</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black italic text-foreground uppercase tracking-tighter leading-none"
                    >
                        {isMe ? 'Mi ' : ''}
                        <span className="relative inline-block">
                            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/50">Perfil</span>
                            <span className="absolute -bottom-2 -right-8 w-24 h-24 bg-primary/20 blur-[30px] rounded-full group-hover/header:bg-primary/40 transition-colors duration-700" />
                        </span>
                        {!isMe && <span className="text-foreground/20 ml-6 tracking-normal">Público</span>}
                    </motion.h1>
                </div>

                {isMe && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0"
                    >
                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.div
                                    key="editing"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex w-full gap-4"
                                >
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 md:flex-none h-14 px-8 rounded-[1.5rem] bg-foreground/5 border border-foreground/10 text-[11px] font-black uppercase tracking-[0.2em] text-foreground/50 hover:text-foreground hover:bg-foreground/10 hover:border-foreground/20 transition-all disabled:opacity-50 active:scale-95 group/btn"
                                        disabled={isSaving}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <X className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-300" />
                                            <span>Cancelar</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="flex-[2] md:flex-none h-14 px-10 rounded-[1.5rem] bg-gradient-to-r from-primary to-emerald-400 text-black text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all disabled:opacity-50 active:scale-95 relative overflow-hidden group/btn"
                                        disabled={isSaving}
                                    >
                                        <div className="absolute inset-0 flex translate-x-[-100%] group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                                        <div className="flex items-center justify-center gap-3 relative z-10">
                                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            <span className="drop-shadow-md">Guardar Data</span>
                                        </div>
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.button
                                    key="not-editing"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => {
                                        setIsEditing(true);
                                        setActiveTab('overview');
                                    }}
                                    className="w-full md:w-auto h-14 px-10 rounded-[1.5rem] glass-premium bg-foreground/5 border border-foreground/10 text-[11px] font-black uppercase tracking-[0.3em] text-foreground hover:bg-foreground/10 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all flex items-center justify-center gap-3 group active:scale-95 shadow-xl"
                                >
                                    <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                        <Edit2 className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform duration-500" />
                                    </div>
                                    Modificar Specs
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            {/* Profile Hero Section */}
            <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center lg:items-start pt-4">
                {/* Left: FIFA Card */}
                <div className={cn("relative shrink-0 group transition-all duration-1000", isEditing ? "z-50 scale-[1.03]" : "")}>
                    <div
                        className={cn("absolute -inset-20 blur-[120px] rounded-full pointer-events-none transition-all duration-1000",
                            isEditing ? "bg-primary/30 scale-125 animate-pulse" : (ambientColor ? "" : "bg-primary/10 animate-pulse")
                        )}
                        style={{ backgroundColor: !isEditing ? (ambientColor || undefined) : undefined }}
                    />
                    <div className="relative">
                        <FifaCard player={{
                            ...displayPlayer,
                            name: (isEditing ? editedData.name : displayPlayer.name) as string,
                            position: (isEditing ? editedData.position : displayPlayer.position) as string,
                            image: avatarPreview || getField('avatar_url', undefined) as string | undefined,
                            mvpTrophies: displayMvpCount,
                            badges: userBadges.map(b => b.badge_type as string)
                        }} />

                        {isEditing && (
                            <label className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm cursor-pointer opacity-0 group-hover:opacity-100 transition-all text-foreground border-4 border-dashed border-primary/20 rounded-[2rem] m-2">
                                <Camera className="w-8 h-8 mb-2 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Cambiar Foto</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </label>
                        )}
                    </div>

                    {isEditing && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 glass-premium p-6 space-y-6 border border-primary/20 rounded-[2rem] shadow-xl"
                        >
                            {/* Skill Points Display */}
                            <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-primary animate-pulse" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-tight">Puntos de Habilidad</span>
                                        <span className="text-xl font-black text-foreground">{skillPoints}</span>
                                    </div>
                                </div>
                                {skillPoints > 0 && (
                                    <span className="text-[8px] font-black text-primary uppercase animate-bounce">¡Mejora tu carta!</span>
                                )}
                            </div>

                            {/* Stat Editor Controls */}
                            <div className="grid grid-cols-2 gap-4">
                                {(Object.keys(editedStats) as Array<keyof PlayerStats>).map(key => (
                                    <div key={key} className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{key}</span>
                                            <span className="text-xs font-black text-foreground">{editedStats[key]}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => {
                                                    if (editedStats[key] > resolveStats()[key]) {
                                                        setSkillPoints(prev => prev + 1);
                                                        setEditedStats(prev => ({ ...prev, [key]: prev[key] - 1 }));
                                                    }
                                                }}
                                                disabled={editedStats[key] <= (dbProfile.stats?.[key] || 0)}
                                                className="flex-1 h-9 rounded-lg bg-foreground/5 border border-foreground/10 text-xs font-black disabled:opacity-30 flex items-center justify-center hover:bg-foreground/10 transition-all"
                                            >
                                                -
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (skillPoints > 0 && editedStats[key] < 99) {
                                                        setSkillPoints(prev => prev - 1);
                                                        setEditedStats(prev => ({ ...prev, [key]: prev[key] + 1 }));
                                                    }
                                                }}
                                                disabled={skillPoints === 0 || editedStats[key] >= 99}
                                                className="flex-1 h-9 rounded-lg bg-primary/20 border border-primary/20 text-primary text-xs font-black disabled:opacity-30 flex items-center justify-center hover:bg-primary/30 transition-all"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.3em] ml-1">Nombre en Carta</label>
                                    <input
                                        type="text"
                                        className="w-full h-14 bg-background/40 border border-foreground/5 rounded-2xl px-6 text-foreground text-sm font-black outline-none focus:border-primary/50 transition-all uppercase placeholder:foreground/20"
                                        value={editedData.name}
                                        onChange={e => setEditedData({ ...editedData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.3em] ml-1">Posición Principal</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-14 bg-background/40 border border-foreground/5 rounded-2xl px-6 text-foreground text-sm font-black outline-none focus:border-primary/50 appearance-none cursor-pointer uppercase transition-all"
                                            value={editedData.position}
                                            onChange={e => setEditedData({ ...editedData, position: e.target.value })}
                                        >
                                            <option value="POR">PORTERO (POR)</option>
                                            <option value="DFC">DEFENSA (DFC)</option>
                                            <option value="MC">MEDIOCAMPISTA (MC)</option>
                                            <option value="DC">DELANTERO (DC)</option>
                                            <option value="ED">EXTREMO DERECHO (ED)</option>
                                            <option value="EI">EXTREMO IZQUIERDO (EI)</option>
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 rotate-90 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right: Stats & Info */}
                <div className="flex-1 w-full space-y-12">
                    {/* Stats Highlights */}
                    <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-6 transition-all duration-700", isEditing && "opacity-30 blur-sm pointer-events-none grayscale")}>
                        {[
                            { icon: Trophy, label: 'Estatus Card', value: displayElo, color: 'text-primary', glow: 'from-primary/20 via-primary/5 to-transparent', unit: 'ELO' },
                            { icon: History, label: 'Despliegues', value: displayMatches, color: 'text-blue-500', glow: 'from-blue-500/20 via-blue-500/5 to-transparent', unit: 'EXP' },
                            { icon: Target, label: 'Objetivos', value: displayGoals, color: 'text-accent', glow: 'from-accent/20 via-accent/5 to-transparent', unit: 'GOL' }
                        ].map((node, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                key={i}
                                className="glass-premium p-8 lg:p-10 rounded-[2.5rem] border border-foreground/10 relative overflow-hidden group hover:border-foreground/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                            >
                                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", node.glow)} />
                                <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r hidden sm:block opacity-50",
                                    i === 0 ? "from-primary to-transparent" : i === 1 ? "from-blue-500 to-transparent" : "from-accent to-transparent"
                                )} />
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className={cn("p-4 rounded-2xl bg-background/50 border border-foreground/5 backdrop-blur-xl group-hover:scale-110 transition-transform duration-500 shadow-xl",
                                        i === 0 ? "shadow-primary/10" : i === 1 ? "shadow-blue-500/10" : "shadow-accent/10"
                                    )}>
                                        <node.icon className={cn("w-6 h-6", node.color)} />
                                    </div>
                                    <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest italic group-hover:text-foreground/40 transition-colors"></span>
                                </div>
                                <div className="flex items-baseline gap-2 relative z-10">
                                    <span className="text-6xl font-black text-foreground italic tracking-tighter leading-none group-hover:scale-105 transition-transform origin-left">{node.value}</span>
                                    <span className={cn("text-[11px] font-black uppercase tracking-[0.2em] -mt-2", node.color)}>{node.unit}</span>
                                </div>
                                <p className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.4em] mt-4 ml-1 relative z-10">{node.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Navigation Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className={cn("sticky top-0 z-30 py-6 bg-background/80 backdrop-blur-2xl -mx-4 px-4 lg:-mx-0 lg:px-0 border-b border-foreground/5 transition-all duration-700", isEditing && "opacity-30 blur-sm pointer-events-none grayscale")}
                    >
                        <div className="flex p-1.5 bg-foreground/[0.03] rounded-[2rem] border border-foreground/10 relative shadow-2xl backdrop-blur-3xl w-full">
                            {[
                                { id: 'overview', label: 'Biometría' },
                                { id: 'history', label: 'Despliegues' },
                                { id: 'wall', label: 'Muro Social' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "flex-1 py-4 px-2 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] rounded-[1.5rem] transition-all relative z-10 italic group outline-none",
                                        activeTab === tab.id ? 'text-black' : 'text-foreground/40 hover:text-foreground'
                                    )}
                                >
                                    <span className="relative z-20 flex items-center justify-center gap-2">
                                        {activeTab === tab.id && <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />}
                                        {tab.label}
                                    </span>
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="profile-tab-indicator"
                                            className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-400 rounded-[1.5rem] shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                                            initial={false}
                                            transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Tab Content */}
                    <div className="min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-10"
                                >
                                    {/* Personal Data Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className={cn("glass-premium p-10 lg:p-12 rounded-[3.5rem] border border-foreground/10 space-y-10 relative overflow-hidden group transition-all duration-700", isEditing ? "z-50 ring-4 ring-primary/30 shadow-[0_0_100px_rgba(16,185,129,0.2)] bg-background/80 scale-[1.02]" : "")}>
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                            <div className="flex items-center justify-between relative z-10 border-b border-foreground/5 pb-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-[1.5rem] bg-background/50 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover:scale-110 transition-transform">
                                                        <Info className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground italic leading-none">Biometría</h3>
                                                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] mt-1">Identidad Core</span>
                                                    </div>
                                                </div>
                                                <div className="hidden sm:flex px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">VERIFICADO</span>
                                                </div>
                                            </div>

                                            <div className="space-y-6 relative z-10">
                                                {isEditing ? (
                                                    <div className="grid grid-cols-2 gap-6 bg-background/40 p-6 rounded-[2rem] border border-foreground/5 backdrop-blur-md">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2 ml-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                                <label className="text-[10px] font-black uppercase text-foreground/70 tracking-[0.2em] leading-none">Edad (Años)</label>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                className="w-full h-14 bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-5 text-foreground text-lg font-black outline-none focus:border-primary focus:bg-primary/5 transition-all shadow-inner"
                                                                value={editedData.age}
                                                                onChange={e => setEditedData({ ...editedData, age: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2 ml-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                                <label className="text-[10px] font-black uppercase text-foreground/70 tracking-[0.2em] leading-none">Altura (cm)</label>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                className="w-full h-14 bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-5 text-foreground text-lg font-black outline-none focus:border-primary focus:bg-primary/5 transition-all shadow-inner"
                                                                value={editedData.height}
                                                                onChange={e => setEditedData({ ...editedData, height: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="col-span-full space-y-3 mt-2">
                                                            <div className="flex items-center gap-2 ml-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                                <label className="text-[10px] font-black uppercase text-foreground/70 tracking-[0.2em] leading-none">Pie Dominante</label>
                                                            </div>
                                                            <div className="relative">
                                                                <select
                                                                    className="w-full h-14 bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-5 text-foreground text-sm font-black outline-none focus:border-primary focus:bg-primary/5 appearance-none cursor-pointer transition-all uppercase shadow-inner"
                                                                    value={editedData.preferredFoot}
                                                                    onChange={e => setEditedData({ ...editedData, preferredFoot: e.target.value })}
                                                                >
                                                                    <option value="Derecha">Diestro</option>
                                                                    <option value="Zurda">Zurdo</option>
                                                                    <option value="Ambidiestro">Ambidiestro</option>
                                                                </select>
                                                                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 rotate-90 pointer-events-none" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-y-10 gap-x-6">
                                                        {[
                                                            { label: 'Ciclos', value: displayAge, unit: 'Años', dot: 'bg-primary' },
                                                            { label: 'Estatura', value: displayHeight, unit: 'cm', dot: 'bg-blue-400' },
                                                            { label: 'Eje Hábil', value: displayFoot, unit: '', dot: 'bg-accent' },
                                                            { label: 'Alineación', value: teamName, unit: '', dot: 'bg-purple-400', isTeam: true }
                                                        ].map((item, idx) => (
                                                            <div key={idx} className="space-y-3 bg-background/30 p-5 rounded-[2rem] border border-foreground/[0.03] hover:border-foreground/10 transition-colors">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={cn("w-1.5 h-1.5 rounded-full", item.dot)} />
                                                                    <span className="text-[10px] font-black uppercase text-foreground/50 tracking-[0.3em] leading-none">{item.label}</span>
                                                                </div>
                                                                <p className={cn(
                                                                    "text-2xl lg:text-3xl font-black italic uppercase tracking-tighter truncate",
                                                                    item.isTeam ? "text-primary hover:text-white transition-colors cursor-pointer" : "text-foreground"
                                                                )}>
                                                                    {item.value} <span className="text-foreground/40 text-sm not-italic ml-1 tracking-normal font-bold">{item.unit}</span>
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className={cn("glass-premium p-10 lg:p-12 rounded-[3.5rem] border border-foreground/10 space-y-10 relative overflow-hidden group transition-all duration-700", isEditing && "opacity-30 blur-sm pointer-events-none grayscale")}>
                                            <div className="absolute top-0 left-0 w-64 h-64 bg-accent/10 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                            <div className="flex items-center justify-between relative z-10 border-b border-foreground/5 pb-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-[1.5rem] bg-background/50 flex items-center justify-center border border-accent/20 shadow-[0_0_20px_rgba(245,158,11,0.1)] group-hover:scale-110 transition-transform">
                                                        <Zap className="w-6 h-6 text-accent" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground italic leading-none">Rendimiento</h3>
                                                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] mt-1">Métricas de Juego</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-8 relative z-10 w-full">
                                                {[
                                                    { label: 'Victorias Totales', value: displayMatchesWon, color: 'text-foreground' },
                                                    { label: 'Win Rate', value: `${displayMatches > 0 ? Math.min(100, Math.round((displayMatchesWon / displayMatches) * 100)) : 0}%`, color: 'text-foreground' },
                                                    { label: 'MVP Frecuencia', value: `${displayMatches > 0 ? Math.min(100, ((displayMvpCount / displayMatches) * 100)).toFixed(1) : '0.0'}%`, color: 'text-accent', isLarge: true }
                                                ].map((stat, idx) => (
                                                    <div key={idx} className="flex justify-between items-center group/item p-4 rounded-2xl hover:bg-foreground/[0.02] transition-colors border border-transparent hover:border-foreground/5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="font-mono text-[9px] text-foreground/20 italic font-bold">0{idx + 1}</div>
                                                            <span className="text-[11px] font-black uppercase text-foreground/50 tracking-[0.3em] group-hover/item:text-foreground transition-colors">{stat.label}</span>
                                                        </div>
                                                        <span className={cn(
                                                            "font-black italic tracking-tighter leading-none text-right",
                                                            stat.isLarge ? "text-4xl lg:text-5xl drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "text-3xl lg:text-4xl",
                                                            stat.color
                                                        )}>
                                                            {stat.value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Team Section */}
                                    {userTeam && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={cn("glass-premium p-10 lg:p-12 rounded-[3.5rem] border border-foreground/10 relative overflow-hidden group/team cursor-default transition-all duration-700 z-10",
                                                isEditing ? "opacity-30 blur-sm pointer-events-none grayscale" : "hover:border-primary/40 hover:shadow-[0_0_50px_rgba(16,185,129,0.1)] focus-within:border-primary/40"
                                            )}
                                        >
                                            <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-gradient-radial from-primary/10 via-transparent to-transparent -translate-y-1/2 translate-x-1/4 opacity-0 group-hover/team:opacity-100 transition-opacity duration-1000 blur-3xl" />
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover/team:opacity-100 transition-opacity duration-1000" />

                                            <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                                                {/* Team Crest/Logo */}
                                                <div className="relative shrink-0 perspective-1000">
                                                    <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full scale-110 group-hover/team:scale-150 transition-transform duration-1000" />
                                                    <div className="w-36 h-36 md:w-48 md:h-48 rounded-[3rem] bg-background/80 border border-foreground/10 flex items-center justify-center overflow-hidden relative shadow-2xl group-hover/team:border-primary/50 transition-all duration-700 backdrop-blur-xl group-hover/team:-translate-y-2 group-hover/team:rotate-y-12">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/team:opacity-100 transition-opacity" />
                                                        {userTeam.logo_url ? (
                                                            <img
                                                                src={userTeam.logo_url}
                                                                alt={userTeam.name}
                                                                className="w-full h-full object-cover group-hover/team:scale-110 group-hover/team:rotate-3 transition-all duration-1000"
                                                            />
                                                        ) : (
                                                            <Shield className="w-20 h-20 md:w-28 md:h-28 text-foreground/20 group-hover/team:text-primary transition-colors duration-700 drop-shadow-md" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-8 text-center lg:text-left w-full">
                                                    <div className="space-y-3">
                                                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                                            <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2 group-hover/team:bg-primary/20 transition-colors">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">AFILIACIÓN ACTIVA</span>
                                                            </div>
                                                            <span className="text-[10px] font-black text-foreground/30 italic tracking-widest uppercase">NODE #{userTeam.id.slice(0, 8)}</span>
                                                        </div>
                                                        <h2 className="text-5xl md:text-7xl font-black italic text-foreground uppercase tracking-tighter leading-none group-hover/team:text-transparent group-hover/team:bg-clip-text group-hover/team:bg-gradient-to-r group-hover/team:from-foreground group-hover/team:to-primary transition-all duration-700">
                                                            {userTeam.name}
                                                        </h2>
                                                        {userTeam.motto && (
                                                            <p className="text-base md:text-xl font-bold text-foreground/40 italic uppercase tracking-tight max-w-2xl mx-auto lg:mx-0">
                                                                "{userTeam.motto}"
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 bg-background/30 p-6 rounded-[2.5rem] border border-foreground/[0.03]">
                                                        {[
                                                            { icon: Trophy, label: 'ELO Rango', value: userTeam.elo, color: 'text-primary' },
                                                            { icon: Users, label: 'Squad', value: userTeam.members_count, color: 'text-blue-500' },
                                                            { icon: Shield, label: 'Tier', value: userTeam.level || 1, color: 'text-accent' },
                                                            { icon: Zap, label: 'Win Rate', value: userTeam.wins + userTeam.losses > 0 ? ((userTeam.wins / (userTeam.wins + userTeam.losses + userTeam.draws)) * 100).toFixed(0) + '%' : '--', color: 'text-purple-500' }
                                                        ].map((stat, i) => (
                                                            <div key={i} className="flex flex-col items-center lg:items-start gap-2 group/stat">
                                                                <div className="flex items-center gap-2">
                                                                    <stat.icon className={cn("w-4 h-4 opacity-50 group-hover/stat:opacity-100 transition-opacity", stat.color)} />
                                                                    <span className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em]">{stat.label}</span>
                                                                </div>
                                                                <p className="text-3xl font-black text-foreground italic tracking-tighter uppercase group-hover/stat:scale-105 transition-transform origin-left">{stat.value}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                                        <Link
                                                            href={`/team?id=${userTeam.id}`}
                                                            className="h-14 px-10 rounded-[1.5rem] bg-foreground hover:bg-white text-background font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 group/link"
                                                        >
                                                            Acceder Sede
                                                            <ExternalLink className="w-5 h-5 group-hover/link:rotate-12 transition-transform" />
                                                        </Link>
                                                        {userTeam.captain_id === (id === 'me' || !id ? user?.id : id) && (
                                                            <div className="h-14 px-8 rounded-[1.5rem] border-2 border-primary bg-primary/10 flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                                                <Star className="w-5 h-5 text-primary fill-primary animate-pulse" />
                                                                <span className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">Capitán</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                </motion.div>
                            )}
                            {activeTab === 'history' && (
                                <motion.div
                                    key="history"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="space-y-6"
                                >
                                    {userMatches.filter(m => {
                                        if (m.is_completed) return true;
                                        const matchStart = new Date(`${m.date}T${m.time}`);
                                        const matchEnd = new Date(matchStart.getTime() + 60 * 60 * 1000);
                                        return new Date() > matchEnd;
                                    }).length > 0 ? (
                                        <div className="flex flex-col gap-6 w-full">
                                            {userMatches.filter(m => {
                                                if (m.is_completed) return true;
                                                const matchStart = new Date(`${m.date}T${m.time}`);
                                                const matchEnd = new Date(matchStart.getTime() + 60 * 60 * 1000);
                                                return new Date() > matchEnd;
                                            }).map((m, i) => {
                                                const isCompleted = m.is_completed;
                                                const scoreA = m.team_a_score ?? 0;
                                                const scoreB = m.team_b_score ?? 0;
                                                const userTeam = m.user_team;

                                                let result: 'win' | 'loss' | 'draw' | null = null;
                                                if (isCompleted && userTeam) {
                                                    if (scoreA === scoreB) result = 'draw';
                                                    else if (userTeam === 'A' && scoreA > scoreB) result = 'win';
                                                    else if (userTeam === 'B' && scoreB > scoreA) result = 'win';
                                                    else result = 'loss';
                                                }

                                                const resultConfig = result === 'win' ? { label: 'VICTORIA' } : 
                                                                    result === 'loss' ? { label: 'DERROTA' } : 
                                                                    result === 'draw' ? { label: 'EMPATE' } : { label: '' };

                                                return (
                                                    <Link
                                                        key={m.id}
                                                        href={`/match?id=${m.id}`}
                                                        className="block group relative"
                                                    >
                                                    <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-transparent group-hover:animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[2.5rem] p-[1px]" />
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="glass-premium p-6 sm:p-8 md:p-10 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-br from-surface/40 via-background/40 to-surface/40 group-hover:bg-foreground/[0.04] group-hover:border-primary/20 transition-all duration-700 shadow-2xl overflow-hidden relative z-10 gap-6 sm:gap-10 min-h-[160px] transform-gpu group-hover:-translate-y-1"
                                                    >
                                                        {/* Subtle Noise Layer */}
                                                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] group-hover:opacity-[0.04] mix-blend-overlay pointer-events-none transition-opacity duration-700" />
                                                        
                                                        {/* Left Edge Neon Bar */}
                                                        <div className={cn(
                                                            "absolute top-0 left-0 w-1.5 h-full transition-all duration-500",
                                                            result === 'win' ? "bg-gradient-to-b from-primary via-primary/40 to-transparent opacity-30 group-hover:opacity-100 group-hover:shadow-[0_0_15px_rgba(44,252,125,0.5)]" :
                                                            result === 'loss' ? "bg-gradient-to-b from-red-500 via-red-500/40 to-transparent opacity-30 group-hover:opacity-100 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]" :
                                                            result === 'draw' ? "bg-gradient-to-b from-amber-500 via-amber-500/40 to-transparent opacity-30 group-hover:opacity-100 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.5)]" :
                                                            "bg-gradient-to-b from-primary via-primary/40 to-transparent opacity-30 group-hover:opacity-100"
                                                        )} />

                                                        {/* Animated Hover Background FX */}
                                                        <div className="absolute -top-10 -right-20 w-64 h-64 bg-primary/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-full" />
                                                        <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-full" />

                                                        <div className="flex items-center gap-6 sm:gap-8 w-full md:w-auto relative z-10 pl-2">
                                                            {/* Date Ticket Block */}
                                                            <div className="w-20 h-20 rounded-[1.8rem] bg-background/80 border border-white/10 flex flex-col items-center justify-center shrink-0 shadow-inner group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:scale-105 transition-all duration-500 overflow-hidden relative">
                                                                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                                                                <span className="text-3xl font-black italic tracking-tighter text-foreground group-hover:text-primary transition-colors leading-none drop-shadow-md z-10 mt-1">
                                                                    {m.date.split('-')[2]}
                                                                </span>
                                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 italic mt-1 group-hover:text-primary/70 transition-colors z-10">
                                                                    {['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'][parseInt(m.date.split('-')[1]) - 1]}
                                                                </span>
                                                            </div>

                                                            {/* Location & Title */}
                                                            <div className="space-y-2 flex-1 min-w-0">
                                                                <h4 className="text-2xl sm:text-3xl font-black text-foreground italic uppercase tracking-tighter truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-foreground group-hover:to-primary transition-all duration-500 leading-none">
                                                                    {(() => {
                                                                        const venue = findVenueByLocation(m.location);
                                                                        return venue?.displayName || venue?.name || m.location;
                                                                    })()}
                                                                </h4>
                                                                <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] italic -mt-1 group-hover:text-foreground/50 transition-colors">
                                                                    {m.time.slice(0, 5)} HS · {m.level || 'Nivel General'}
                                                                </p>
                                                                <div className="flex flex-wrap items-center gap-3">
                                                                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(44,252,125,0.1)]">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/70 group-hover:bg-primary transition-colors animate-pulse shadow-[0_0_8px_rgba(44,252,125,1)]" />
                                                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">REPORTE OFICIAL</span>
                                                                    </div>
                                                                    {result && (
                                                                        <div className={cn(
                                                                            "px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.3em] shadow-sm transition-all duration-500",
                                                                            result === 'win' ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(44,252,125,0.1)]" :
                                                                            result === 'loss' ? "bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]" :
                                                                            "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.1)]"
                                                                        )}>
                                                                            {resultConfig.label}
                                                                        </div>
                                                                    )}
                                                                    <span className="px-3 py-1 rounded-full bg-background border border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/50 shadow-inner">
                                                                        {m.type}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Score Block */}
                                                        <div className="flex items-center gap-6 w-full md:w-auto justify-end relative z-10 mt-4 md:mt-0">
                                                            <div className={cn(
                                                                "flex items-center justify-center gap-4 w-full sm:w-auto px-8 sm:px-10 py-5 sm:py-6 rounded-[2rem] border overflow-hidden transition-all duration-700 relative shadow-2xl",
                                                                result === 'win' ? "bg-primary/10 border-primary/20 shadow-[0_0_40px_rgba(44,252,125,0.1)]" :
                                                                result === 'loss' ? "bg-red-500/10 border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]" :
                                                                result === 'draw' ? "bg-amber-500/10 border-amber-500/20 shadow-[0_0_40px_rgba(251,191,36,0.1)]" :
                                                                "bg-black/40 border-white/5"
                                                            )}>
                                                                {/* Shine effect inside score box */}
                                                                <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer pointer-events-none" />
                                                                
                                                                <span className={cn(
                                                                    "text-5xl sm:text-6xl font-black italic tracking-tighter leading-none transition-all duration-300 drop-shadow-[0_4px_15px_rgba(0,0,0,0.5)]",
                                                                    result === 'win' && userTeam === 'A' ? "text-primary" : 
                                                                    result === 'loss' && userTeam === 'A' ? "text-red-500" :
                                                                    "text-foreground"
                                                                )}>
                                                                    {scoreA}
                                                                </span>
                                                                <div className="flex flex-col gap-1.5 items-center mx-3 md:mx-5 opacity-20">
                                                                    <span className="w-5 h-[3px] rounded-full bg-foreground" />
                                                                    <span className="w-5 h-[3px] rounded-full bg-foreground" />
                                                                </div>
                                                                <span className={cn(
                                                                    "text-5xl sm:text-6xl font-black italic tracking-tighter leading-none transition-all duration-300 drop-shadow-[0_4px_15px_rgba(0,0,0,0.5)]",
                                                                    result === 'win' && userTeam === 'B' ? "text-primary" : 
                                                                    result === 'loss' && userTeam === 'B' ? "text-red-500" :
                                                                    "text-foreground"
                                                                )}>
                                                                    {scoreB}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="hidden md:flex flex-col items-center justify-center group/btn pl-3">
                                                                <div className="w-14 h-14 rounded-full bg-foreground/[0.02] border border-white/5 group-hover:border-primary/30 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-500 shadow-inner overflow-hidden relative">
                                                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                    <ChevronRight className="w-6 h-6 text-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all duration-500 relative z-10" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </Link>
                                            );
                                        })}
                                        </div>
                                    ) : (
                                        <div className="glass-premium p-20 rounded-[4rem] flex flex-col items-center justify-center text-center gap-10 border-dashed border-2 border-foreground/10 bg-foreground/[0.01]">
                                            <div className="w-24 h-24 rounded-[2.5rem] bg-foreground/5 border border-foreground/10 flex items-center justify-center shadow-2xl">
                                                <History className="w-10 h-10 text-foreground/10" />
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-2xl font-black text-foreground italic uppercase tracking-tighter">Sin Despliegues Registrados</p>
                                                <p className="text-[10px] font-black uppercase text-foreground/20 tracking-[0.3em]">{isMe ? 'Tu historial de partidos está listo para ser escrito.' : 'Este jugador aún no tiene partidos registrados.'}</p>
                                            </div>
                                            <Link href="/search">
                                                <button className="h-14 px-10 bg-primary/5 hover:bg-primary text-primary hover:text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-xl border border-primary/20 transition-all active:scale-95">INICIAR CONVOCATORIA</button>
                                            </Link>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                            {activeTab === 'wall' && (
                                <motion.div
                                    key="wall"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="max-w-7xl mx-auto pb-20"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                                        {/* Main Content: Comments List */}
                                        <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1 space-y-8">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                                    <h3 className="text-2xl font-black italic text-foreground uppercase tracking-tighter">Cronología de Mensajes</h3>
                                                </div>
                                                <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] italic">{comments.length} Comentarios</span>
                                            </div>

                                            <div className="space-y-6">
                                                {isLoadingComments ? (
                                                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                                                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Sincronizando Muro...</span>
                                                    </div>
                                                ) : comments.length > 0 ? (
                                                    comments.map((comment, i) => (
                                                        <motion.div
                                                            key={comment.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            className="glass-premium p-8 rounded-[2.5rem] border border-foreground/10 flex gap-6 group relative hover:bg-foreground/[0.02] transition-all duration-300"
                                                        >
                                                            <div className="shrink-0 w-14 h-14 rounded-2xl bg-foreground/5 overflow-hidden border border-foreground/10 group-hover:border-primary/20 transition-colors">
                                                                {comment.author?.avatar_url ? (
                                                                    <img src={comment.author.avatar_url} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-foreground/20 italic">Player</div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-sm font-black italic uppercase tracking-tight text-foreground">{comment.author?.name || 'Veterano'}</span>
                                                                        <span className="text-[9px] font-black text-foreground/20 italic uppercase tracking-widest">• {new Date(comment.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                                                                    </div>
                                                                    {(isMe || user?.id === comment.author_id) && (
                                                                        <button
                                                                            onClick={() => handleDeleteComment(comment.id)}
                                                                            className="p-2 rounded-lg text-foreground/10 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                                        >
                                                                            <Trash className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-foreground/70 leading-relaxed font-medium">
                                                                    {comment.content}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    ))
                                                ) : (
                                                    <div className="glass-premium p-20 rounded-[4rem] flex flex-col items-center justify-center text-center gap-10 border-dashed border-2 border-foreground/10 bg-foreground/[0.01] opacity-50">
                                                        <div className="w-20 h-20 rounded-[2.5rem] bg-foreground/5 border border-foreground/10 flex items-center justify-center">
                                                            <MessageSquare className="w-10 h-10 text-foreground/5" />
                                                        </div>
                                                        <div className="space-y-3">
                                                            <p className="text-xl font-black text-foreground italic uppercase tracking-tighter">Silencio en el Campo</p>
                                                            <p className="text-[10px] font-black uppercase text-foreground/20 tracking-[0.3em]">Sé el primero en dejar tu marca en este muro.</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Sidebar: Header + Submit Form */}
                                        <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2">
                                            <div className="lg:sticky lg:top-24 space-y-8">
                                                {/* Wall Header Card */}
                                                <div className="glass-premium p-8 rounded-[3rem] border border-foreground/10 space-y-6 relative overflow-hidden group/header text-center lg:text-left">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] opacity-0 group-hover/header:opacity-100 transition-opacity" />
                                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto lg:mx-0 shadow-2xl">
                                                        <MessageSquare className="w-8 h-8 text-primary" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-3xl font-black italic text-foreground uppercase tracking-tighter leading-tight">Muro de <span className="text-primary">Honor</span></h3>
                                                        <p className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.3em] leading-relaxed">Deja un mensaje para la posteridad en el perfil de este jugador.</p>
                                                    </div>
                                                </div>

                                                {/* Submit Comment Card */}
                                                {user && (
                                                    <form onSubmit={handlePostComment} className="glass-premium p-8 rounded-[3rem] border border-primary/20 space-y-6 relative overflow-hidden group/form shadow-[0_20px_50px_rgba(16,185,129,0.1)]">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] opacity-100 transition-opacity" />
                                                        <div className="flex items-center gap-4 mb-2">
                                                            <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-foreground/10 overflow-hidden shrink-0">
                                                                {user.user_metadata?.avatar_url ? (
                                                                    <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black">{user.name?.slice(0, 2).toUpperCase()}</div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60 italic leading-none">Publicar como</span>
                                                                <span className="text-sm font-black text-primary italic uppercase tracking-tight">{user.name}</span>
                                                            </div>
                                                        </div>
                                                        <div className="relative space-y-4">
                                                            <textarea
                                                                value={newComment}
                                                                onChange={(e) => setNewComment(e.target.value)}
                                                                placeholder="Escribe algo épico..."
                                                                className="w-full min-h-[140px] bg-background/50 border border-foreground/10 rounded-2xl p-5 text-foreground text-sm font-medium outline-none focus:border-primary/40 transition-all resize-none placeholder:text-foreground/10"
                                                                disabled={isPostingComment}
                                                            />
                                                            <button
                                                                type="submit"
                                                                disabled={isPostingComment || !newComment.trim()}
                                                                className="w-full h-14 rounded-2xl bg-primary text-black text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-white transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 active:scale-95"
                                                            >
                                                                {isPostingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                                Enviar Mensaje
                                                            </button>
                                                        </div>
                                                    </form>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="pb-32 lg:pb-12" />

            {/* FOOTER ACTIONS SECTION */}
            {isMe && (
                <div className="relative z-10 border-t border-foreground/10 pt-8 pb-8 flex flex-wrap gap-8 items-center">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="flex items-center gap-3 text-foreground/30 hover:text-primary transition-colors text-[11px] font-black uppercase tracking-widest group"
                    >
                        <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Cambiar Contraseña
                    </button>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-3 text-foreground/30 hover:text-red-500 transition-colors text-[11px] font-black uppercase tracking-widest group"
                        >
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Eliminar Cuenta
                        </button>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-4 max-w-md w-full"
                        >
                            <div className="flex items-center gap-3 text-red-500">
                                <AlertTriangle className="w-5 h-5" />
                                <h3 className="text-sm font-black uppercase tracking-widest">¿Estás seguro?</h3>
                            </div>
                            <p className="text-xs text-foreground/40 leading-relaxed">
                                Esta acción es irreversible. Se van a borrar todos tus datos: partidos, equipos, amigos y estadísticas.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="h-10 px-6 rounded-xl bg-foreground/5 border border-foreground/10 text-xs font-bold text-foreground/40 hover:text-foreground transition-all"
                                >
                                    No, cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        setIsDeleting(true);
                                        try {
                                            await deleteAccount();
                                        } catch (e) {
                                            setIsDeleting(false);
                                        }
                                    }}
                                    disabled={isDeleting}
                                    className="h-10 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Sí, eliminar todo
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* PASSWORD MODAL */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md glass-premium rounded-[2.5rem] p-8 lg:p-10 border border-foreground/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden bg-surface"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16 rounded-full" />

                            <form onSubmit={handleUpdatePassword} className="space-y-8 relative z-10">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black italic text-foreground uppercase tracking-tighter">Nueva <span className="text-primary">Clave</span></h2>
                                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em] italic">Seguridad de Jugador</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.3em] ml-1">Escribí tu nueva contraseña</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                            <Lock className="w-5 h-5 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            className="w-full h-14 pl-14 pr-6 bg-foreground/[0.02] border border-foreground/5 rounded-2xl text-foreground text-sm font-black outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest ml-1">Mínimo 6 caracteres</p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="flex-1 h-14 rounded-2xl bg-foreground/5 border border-foreground/5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-all active:scale-95 flex items-center justify-center"
                                    >
                                        CANCELAR
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdatingPassword}
                                        className="flex-[2] h-14 bg-primary text-background font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-2 hover:bg-foreground hover:text-background transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-primary/20"
                                    >
                                        {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "ACTUALIZAR"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
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
