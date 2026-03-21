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

    const displayMatches = getField('matches', 0);
    const displayElo = getField('elo', 0);
    const displayGoals = getField('goals', 0);
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
        <div className="flex flex-col gap-8 p-4 sm:p-6 lg:p-10 xl:p-14 2xl:p-16 max-w-[1600px] mx-auto min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Effects - More subtle and layered */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div 
                    className="absolute top-0 left-0 w-full h-[70dvh] bg-gradient-to-b via-transparent to-transparent opacity-40 transition-all duration-1000" 
                    style={{ backgroundImage: ambientColor ? `linear-gradient(to bottom, ${ambientColor}33, transparent)` : undefined }}
                />
                <div 
                    className={cn("absolute top-[-10%] right-[-10%] w-[60%] h-[60%] blur-[120px] rounded-full animate-pulse transition-all duration-1000", !ambientColor && "bg-primary/5")} 
                    style={{ backgroundColor: ambientColor ? `${ambientColor}22` : undefined }}
                />
                <div 
                    className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] blur-[100px] rounded-full opacity-20" 
                    style={{ backgroundColor: ambientColor ? `${ambientColor}11` : 'var(--primary-rgb)' }}
                />
            </div>

            {/* Header Area */}
            <div className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2 border-b border-foreground/5">
                <div className="space-y-4">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="flex -space-x-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic leading-none">Terminal de Atleta</span>
                    </motion.div>
                    
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black italic text-foreground uppercase tracking-tighter leading-[0.85] group">
                        {isMe ? (
                            <>
                                <span className="text-foreground/20 group-hover:text-primary/20 transition-colors duration-700">Mi</span>
                                <br />
                                <span className="relative">
                                    Perfil
                                    <motion.span 
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        className="absolute -bottom-2 left-0 h-4 bg-primary/10 -z-10 skew-x-[-20deg]"
                                    />
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-foreground/20 group-hover:text-primary/20 transition-colors duration-700">Perfil</span>
                                <br />
                                <span className="relative">
                                    Público
                                    <motion.span 
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        className="absolute -bottom-2 left-0 h-4 bg-primary/10 -z-10 skew-x-[-20deg]"
                                    />
                                </span>
                            </>
                        )}
                    </h1>
                </div>

                {isMe && (
                    <div className="flex items-center gap-4 self-end md:mb-2">
                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex gap-3"
                                >
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="h-12 px-6 rounded-2xl bg-foreground/5 border border-foreground/10 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-foreground/10 transition-all active:scale-95 disabled:opacity-50"
                                        disabled={isSaving}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="h-12 px-8 rounded-2xl bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:bg-white hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Sincronizar
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setIsEditing(true)}
                                    className="h-14 px-10 rounded-2xl bg-foreground/5 border border-foreground/10 text-[11px] font-black uppercase tracking-[0.3em] text-foreground hover:bg-foreground/10 hover:border-primary/30 transition-all flex items-center gap-4 group active:scale-95 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                    <Edit2 className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform duration-500" />
                                    <span>Modificar Perfil</span>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Hero Dashboard Area: Card on Left, Team & Data on Right */}
            <div className="relative z-20 flex flex-col lg:grid lg:grid-cols-[400px,1fr] xl:grid-cols-[450px,1fr] gap-12 lg:gap-16 pt-4">
                
                {/* Left: Identity Column */}
                <div className="space-y-10">
                    <div className="relative group">
                        {/* Glow behind card */}
                        <div 
                            className={cn("absolute -inset-10 blur-[100px] rounded-full pointer-events-none animate-pulse opacity-40 transition-all duration-1000", !ambientColor && "bg-primary/20")} 
                            style={{ backgroundColor: ambientColor ? `${ambientColor}44` : undefined }}
                        />
                        
                        <div className="relative perspective-1000">
                            <FifaCard player={{ 
                                ...displayPlayer, 
                                name: (isEditing ? editedData.name : displayPlayer.name) as string, 
                                position: (isEditing ? editedData.position : displayPlayer.position) as string,
                                image: avatarPreview || getField('avatar_url', undefined) as string | undefined,
                                mvpTrophies: mvpCount,
                                badges: userBadges.map(b => b.badge_type as string)
                            }} />
                            
                            {isEditing && (
                                <label className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-500 text-foreground border-4 border-dashed border-primary/30 rounded-[3rem] m-2">
                                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-bounce">
                                        <Camera className="w-8 h-8 text-primary" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Cargar Nueva Bio-Imagen</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Hierarchy Stats (Visible on all screens under card) */}
                    <div className="glass-premium p-8 rounded-[2.5rem] border border-foreground/5 flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-foreground/30 uppercase tracking-widest leading-none">Jerarquía de Atleta</span>
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-accent" />
                                <span className="text-sm font-black text-foreground uppercase tracking-tighter">PRO Nivel 12</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                            <span className="text-lg font-black text-accent italic">12</span>
                        </div>
                    </div>
                </div>

                {/* Right: Consolidated Team & Stats Panel */}
                <div className="space-y-10 flex flex-col justify-center">
                    
                    {/* Team Branding & Bio Info */}
                    <div className="glass-premium p-10 lg:p-14 rounded-[4rem] border border-foreground/10 relative overflow-hidden group/team-hero shadow-[0_40px_80px_rgba(0,0,0,0.2)]">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
                        
                        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                            {/* Team Logo or Placeholder */}
                            <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-foreground/5 border border-foreground/10 flex items-center justify-center overflow-hidden relative shadow-2xl shrink-0 group-hover/team-hero:border-primary/30 transition-all duration-700">
                                {userTeam?.logo_url ? (
                                    <img src={userTeam.logo_url} className="w-full h-full object-cover" alt="Team" />
                                ) : (
                                    <Shield className="w-16 h-16 text-foreground/10" />
                                )}
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                                        <div className="px-4 py-1 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">Status Operativo</span>
                                        </div>
                                        <div className="px-4 py-1 bg-foreground/5 border border-foreground/10 rounded-full">
                                            <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest italic">Activo desde {new Date().getFullYear()}</span>
                                        </div>
                                    </div>
                                    <h2 className="text-4xl md:text-6xl font-black italic text-foreground uppercase tracking-tighter leading-none">
                                        {userTeam?.name || 'Agente Independiente'}
                                    </h2>
                                    {userTeam?.motto && (
                                        <p className="text-lg font-bold text-foreground/30 italic uppercase tracking-tight max-w-sm">"{userTeam.motto}"</p>
                                    )}
                                </div>

                                {/* Bio Stats Strip Integrated Here */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 pt-4 border-t border-foreground/5">
                                    {[
                                        { label: 'EDAD', value: displayAge, unit: 'Años' },
                                        { label: 'ALTURA', value: displayHeight, unit: 'CM' },
                                        { label: 'PERFIL', value: displayFoot, unit: 'Pie' },
                                        { label: 'ELO EQUIPO', value: userTeam?.elo || '--', unit: 'Pts' }
                                    ].map((s, i) => (
                                        <div key={i} className="flex flex-col">
                                            <span className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.3em]">{s.label}</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-black text-foreground italic">{s.value}</span>
                                                <span className="text-[7px] font-black text-foreground/10 uppercase italic">{s.unit}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Core Performance Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            { icon: Zap, label: 'Estatus Radar', value: displayElo, color: 'text-primary', unit: 'ELO' },
                            { icon: History, label: 'Despliegues', value: displayMatches, color: 'text-blue-500', unit: 'EXP' },
                            { icon: Target, label: 'Efectividad', value: displayGoals, color: 'text-accent', unit: 'GOL' }
                        ].map((node, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                className="glass-premium-hover p-8 rounded-[3rem] border border-foreground/10 relative overflow-hidden group h-full flex flex-col justify-between bg-foreground/[0.01]"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                                    <node.icon className={cn("w-12 h-12", node.color)} />
                                </div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", 
                                        i === 0 ? "bg-primary/10 border-primary/20" : i === 1 ? "bg-blue-500/10 border-blue-500/20" : "bg-accent/10 border-accent/20"
                                    )}>
                                        <node.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[9px] font-black text-foreground/10 uppercase tracking-widest italic">IDX-0{i+1}</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-foreground italic tracking-tighter leading-none">{node.value}</span>
                                        <span className={cn("text-[9px] font-black uppercase tracking-widest", node.color)}>{node.unit}</span>
                                    </div>
                                    <p className="text-[9px] font-black uppercase text-foreground/30 tracking-[0.3em]">{node.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Tabs Section: Navigation + Tab Contents */}
            <div className="mt-16 sm:mt-24 space-y-12 relative z-20">
                <div className="sticky top-4 z-40 py-2">
                    <div className="flex p-2 bg-foreground/5 rounded-[2.5rem] border border-foreground/10 backdrop-blur-2xl shadow-2xl relative">
                            {[
                                { id: 'overview', label: 'Resumen', icon: Info },
                                { id: 'history', label: 'Cronología', icon: History },
                                { id: 'wall', label: 'Muro', icon: MessageSquare }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "flex-1 py-5 rounded-[2rem] transition-all relative z-10 flex items-center justify-center gap-3 overflow-hidden group/tab",
                                        activeTab === tab.id ? 'text-black' : 'text-foreground/40 hover:text-foreground'
                                    )}
                                >
                                    <tab.icon className={cn("w-4 h-4 transition-transform group-hover/tab:scale-110", activeTab === tab.id ? "text-black" : "text-foreground/40")} />
                                    <span className="text-[11px] font-black uppercase tracking-[0.4em] italic hidden sm:block">{tab.label}</span>
                                    
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="profile-tab-active-pill"
                                            className="absolute inset-0 bg-primary rounded-[1.8rem] shadow-[0_0_40px_rgba(var(--primary-rgb),0.5)]"
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Viewport Content */}
                    <div className="min-h-[500px] relative">
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="space-y-12"
                                >
                                    {/* Data Blocks */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {/* Biometrics Block */}
                                        <div className="glass-premium p-12 rounded-[3.5rem] border border-foreground/5 relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
                                            
                                            <div className="flex items-center gap-5 mb-12">
                                                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-black">
                                                    <Users className="w-7 h-7" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <h3 className="text-lg font-black uppercase tracking-[0.2em] italic text-foreground leading-none">Biometría</h3>
                                                    <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] mt-1">Identificador de Atleta</span>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-10">
                                                {isEditing ? (
                                                    <div className="grid grid-cols-1 gap-8">
                                                        <div className="grid grid-cols-2 gap-6">
                                                            <div className="space-y-3">
                                                                <label className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.2em] ml-2">EDAD</label>
                                                                <input
                                                                    type="number"
                                                                    className="w-full h-16 bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-6 text-foreground font-black outline-none focus:border-primary/50 transition-all text-lg"
                                                                    value={editedData.age}
                                                                    onChange={e => setEditedData({ ...editedData, age: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="space-y-3">
                                                                <label className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.2em] ml-2">ALTURA (CM)</label>
                                                                <input
                                                                    type="number"
                                                                    className="w-full h-16 bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-6 text-foreground font-black outline-none focus:border-primary/50 transition-all text-lg"
                                                                    value={editedData.height}
                                                                    onChange={e => setEditedData({ ...editedData, height: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.2em] ml-2">PERFIL DE PIERNA</label>
                                                            <div className="grid grid-cols-3 gap-3">
                                                                {['Derecha', 'Zurda', 'Ambidiestro'].map(foot => (
                                                                    <button
                                                                        key={foot}
                                                                        onClick={() => setEditedData({ ...editedData, preferredFoot: foot })}
                                                                        className={cn(
                                                                            "h-14 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all",
                                                                            editedData.preferredFoot === foot 
                                                                                ? "bg-primary border-primary text-black" 
                                                                                : "bg-foreground/5 border-foreground/10 text-foreground/50 hover:bg-foreground/10"
                                                                        )}
                                                                    >
                                                                        {foot}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-y-12">
                                                        {[
                                                            { label: 'Ciclos de Edad', value: `${displayAge} Años`, sub: 'Cronología' },
                                                            { label: 'Envergadura Vert.', value: `${displayHeight} CM`, sub: 'Antropometría' },
                                                            { label: 'Perfil Motriz', value: displayFoot, sub: 'Lateralidad' },
                                                            { label: 'Afiliación Activa', value: teamName, sub: 'Colectivo', primary: true }
                                                        ].map((item, i) => (
                                                            <motion.div 
                                                                key={i}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                whileInView={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: i * 0.1 }}
                                                                className="flex flex-col gap-2"
                                                            >
                                                                <span className="text-[10px] font-black uppercase text-foreground/30 tracking-[0.4em] mb-1">{item.label}</span>
                                                                <div className="flex flex-col">
                                                                    <p className={cn("text-2xl font-black italic uppercase tracking-tighter leading-none", item.primary ? "text-primary" : "text-foreground")}>
                                                                        {item.value}
                                                                    </p>
                                                                    <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest mt-1">{item.sub}</span>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    {/* Detailed Analytics Block */}
                                    <div className="glass-premium p-12 rounded-[3.5rem] border border-foreground/5 relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
                                        
                                        <div className="flex items-center gap-5 mb-12">
                                            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center transition-all group-hover:bg-accent group-hover:text-black">
                                                <Zap className="w-7 h-7" />
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="text-lg font-black uppercase tracking-[0.2em] italic text-foreground leading-none">Desempeño Analítico</h3>
                                                <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] mt-1">Computación de Campo</span>
                                            </div>
                                        </div>

                                        <div className="space-y-10">
                                            {[
                                                { label: 'Tasa de Conversión', value: displayMatches > 0 ? (displayGoals / displayMatches).toFixed(2) : '0.00', unit: 'GPG', sub: 'Efectividad Neta' },
                                                { label: 'MVP Dominio', value: displayMatches > 0 ? ((mvpCount / displayMatches) * 100).toFixed(0) : '0', unit: 'PCT', sub: 'Votos de Elite' },
                                                { label: 'Impacto Global', value: '--', unit: 'IDX', sub: 'Contribución Táctica' }
                                            ].map((stat, i) => (
                                                <div key={i} className="flex items-center justify-between border-b border-foreground/5 pb-6 group/stat last:border-0 last:pb-0">
                                                    <div className="space-y-1">
                                                        <span className="text-[11px] font-black uppercase text-foreground/40 tracking-[0.2em] group-hover/stat:text-foreground transition-colors duration-500">{stat.label}</span>
                                                        <div className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{stat.sub}</div>
                                                    </div>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-3xl font-black text-foreground italic">{stat.value}</span>
                                                        <span className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">{stat.unit}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Fast Link to Team Page (since branding is in hero) */}
                                    {userTeam && (
                                        <Link href={`/team?id=${userTeam.id}`}>
                                            <motion.div 
                                                whileHover={{ scale: 1.02 }}
                                                className="glass-premium p-8 rounded-[2.5rem] border border-primary/20 flex items-center justify-between group/teamlink"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                                                        {userTeam.logo_url ? <img src={userTeam.logo_url} className="w-full h-full object-cover" /> : <Shield className="w-8 h-8 text-primary" />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Perfil de Escuadra</span>
                                                        <p className="text-xl font-black text-foreground italic uppercase tracking-tighter">Gestionar {userTeam.name}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-6 h-6 text-primary group-hover/teamlink:translate-x-1 transition-transform" />
                                            </motion.div>
                                        </Link>
                                    )}
                                </motion.div>
                            )}
                            {activeTab === 'history' && (
                                <motion.div
                                    key="history"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center gap-4 mb-4 px-2">
                                        <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
                                        <h3 className="text-2xl font-black italic text-foreground uppercase tracking-tighter">Historial de Despliegues</h3>
                                    </div>

                                    {userMatches.filter(m => {
                                        if (m.is_completed) return true;
                                        const matchStart = new Date(`${m.date}T${m.time}`);
                                        const matchEnd = new Date(matchStart.getTime() + 60 * 60 * 1000);
                                        return new Date() > matchEnd;
                                    }).length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {userMatches.filter(m => {
                                                if (m.is_completed) return true;
                                                const matchStart = new Date(`${m.date}T${m.time}`);
                                                const matchEnd = new Date(matchStart.getTime() + 60 * 60 * 1000);
                                                return new Date() > matchEnd;
                                            }).map((m, i) => (
                                                <Link key={m.id} href={`/match?id=${m.id}`}>
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="glass-premium p-10 rounded-[3rem] border border-foreground/10 group overflow-hidden relative"
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/5 transition-all duration-700" />
                                                        
                                                        <div className="flex items-center justify-between gap-6 relative z-10">
                                                            <div className="flex items-center gap-8">
                                                                <div className="w-20 h-20 rounded-[1.8rem] bg-foreground/5 border border-foreground/10 flex flex-col items-center justify-center transition-all group-hover:border-blue-500/30 group-hover:bg-blue-500/5">
                                                                    <span className="text-3xl font-black italic text-foreground leading-none group-hover:scale-110 transition-transform">{m.date.split('-')[2]}</span>
                                                                    <span className="text-[10px] font-black uppercase text-foreground/20 italic group-hover:text-blue-400 transition-colors">
                                                                        {['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'][parseInt(m.date.split('-')[1]) - 1]}
                                                                    </span>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <h4 className="text-2xl font-black text-foreground italic uppercase tracking-tighter truncate w-32 group-hover:text-blue-400 transition-colors">{m.location}</h4>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">{m.type} · FINALIZADO</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-5 px-8 py-5 bg-background shadow-2xl rounded-[2rem] border border-foreground/5 group-hover:border-blue-500/20 transition-all">
                                                                <span className="text-4xl font-black text-foreground italic group-hover:text-blue-500 transition-colors">{m.team_a_score ?? 0}</span>
                                                                <span className="text-lg font-black text-foreground/10 italic">-</span>
                                                                <span className="text-4xl font-black text-foreground italic group-hover:text-blue-500 transition-colors">{m.team_b_score ?? 0}</span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="glass-premium p-24 rounded-[4rem] text-center space-y-10 bg-foreground/[0.01] border-dashed border-2 border-foreground/10">
                                            <div className="w-28 h-28 rounded-[2.5rem] bg-foreground/5 flex items-center justify-center mx-auto transition-all group-hover:scale-110">
                                                <History className="w-12 h-12 text-foreground/5" />
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-3xl font-black text-foreground italic uppercase tracking-tighter leading-none">Cero Despliegues</p>
                                                <p className="text-[11px] font-black uppercase text-foreground/20 tracking-[0.4em] italic">{isMe ? 'Tu historia de campo aún no ha sido escrita.' : 'Este atleta no registra misiones completadas.'}</p>
                                            </div>
                                            <Link href="/search" className="inline-flex h-16 px-12 rounded-[2rem] bg-blue-500 text-black text-[11px] font-black uppercase tracking-[0.3em] items-center gap-4 hover:bg-white transition-all shadow-2xl shadow-blue-500/20">
                                                INICIAR CONTRATO
                                            </Link>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                            {activeTab === 'wall' && (
                                <motion.div
                                    key="wall"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                                >
                                    {/* Wall Feed */}
                                    <div className="lg:col-span-12 xl:col-span-8 space-y-10 order-2 xl:order-1">
                                        <div className="flex items-center justify-between px-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-1.5 h-8 bg-primary rounded-full" />
                                                <h3 className="text-2xl font-black italic text-foreground uppercase tracking-tighter">Muro de Notificaciones</h3>
                                            </div>
                                            <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] italic">{comments.length} REGISTROS</span>
                                        </div>

                                        <div className="space-y-6">
                                            {isLoadingComments ? (
                                                <div className="py-24 flex flex-col items-center gap-6 opacity-40">
                                                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Sincronizando Feed...</span>
                                                </div>
                                            ) : comments.length > 0 ? (
                                                comments.map((comment, i) => (
                                                    <motion.div
                                                        key={comment.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="glass-premium p-10 rounded-[3rem] border border-foreground/5 flex gap-8 group relative hover:border-primary/20 transition-all duration-500 overflow-hidden"
                                                    >
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        
                                                        <div className="shrink-0 w-20 h-20 rounded-[1.8rem] bg-foreground/5 overflow-hidden border border-foreground/10 group-hover:border-primary/30 transition-all duration-500 p-1">
                                                            <div className="w-full h-full rounded-[1.4rem] overflow-hidden bg-background">
                                                                {comment.author?.avatar_url ? (
                                                                    <img src={comment.author.avatar_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-[11px] font-black text-foreground/20 italic">ID</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xl font-black italic uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{comment.author?.name || 'Veterano'}</span>
                                                                    <span className="text-[9px] font-black text-foreground/20 italic uppercase tracking-[0.2em]">{new Date(comment.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                                </div>
                                                                {(isMe || user?.id === comment.author_id) && (
                                                                    <button
                                                                        onClick={() => handleDeleteComment(comment.id)}
                                                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-foreground/10 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                                    >
                                                                        <Trash className="w-5 h-5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <p className="text-lg text-foreground/70 leading-relaxed font-kanit">
                                                                {comment.content}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="glass-premium p-24 rounded-[4rem] text-center space-y-10 bg-foreground/[0.01] border-dashed border-2 border-foreground/10">
                                                    <div className="w-28 h-28 rounded-[2.5rem] bg-foreground/5 flex items-center justify-center mx-auto opacity-20">
                                                        <MessageSquare className="w-12 h-12" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <p className="text-3xl font-black text-foreground italic uppercase tracking-tighter leading-none">Frecuencia Silenciosa</p>
                                                        <p className="text-[11px] font-black uppercase text-foreground/20 tracking-[0.4em] italic leading-relaxed">Transmisor listo. Sé el primero en emitir un mensaje.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Submit Section */}
                                    <div className="xl:col-span-4 space-y-8 order-1 xl:order-2">
                                        <div className="sticky top-24 space-y-8">
                                            {/* Submit Widget */}
                                            {user && (
                                                <div className="glass-premium p-10 rounded-[4rem] border border-primary/20 relative overflow-hidden group/submit shadow-[0_50px_100px_rgba(0,0,0,0.3)] bg-background/40">
                                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
                                                    
                                                    <div className="flex items-center gap-5 mb-10">
                                                        <div className="w-16 h-16 rounded-[1.8rem] bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                            <Send className="w-7 h-7 text-primary" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <h4 className="text-2xl font-black italic uppercase tracking-tighter text-foreground leading-none">Transmitir</h4>
                                                            <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] mt-1">Mensajería de Campo</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6 relative z-10">
                                                        <textarea
                                                            value={newComment}
                                                            onChange={(e) => setNewComment(e.target.value)}
                                                            placeholder="Dejar mensaje táctico..."
                                                            className="w-full min-h-[160px] bg-foreground/5 border border-foreground/10 rounded-[2.5rem] p-8 text-foreground font-kanit text-lg outline-none focus:border-primary/50 transition-all resize-none placeholder:text-foreground/10"
                                                            disabled={isPostingComment}
                                                        />
                                                        <button
                                                            onClick={handlePostComment}
                                                            disabled={isPostingComment || !newComment.trim()}
                                                            className="w-full h-16 rounded-[2.5rem] bg-primary text-black text-[12px] font-black uppercase tracking-[0.4em] italic shadow-2xl shadow-primary/20 hover:bg-white transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-4 active:scale-95 group/btn"
                                                        >
                                                            {isPostingComment ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                                            ENVIAR MENSAJE
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                </div>
            </div>

            <div className="pb-32 lg:pb-12" />

            {/* Footer Control Terminal */}
            {isMe && (
                <div className="relative z-30 flex flex-wrap gap-10 items-center justify-center lg:justify-start px-2 py-12 border-t border-foreground/5">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="flex items-center gap-4 text-foreground/20 hover:text-primary transition-all text-[11px] font-black uppercase tracking-[0.4em] italic group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                            <Lock className="w-4 h-4" />
                        </div>
                        Seguridad de Acceso
                    </button>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-4 text-foreground/20 hover:text-red-500 transition-all text-[11px] font-black uppercase tracking-[0.4em] italic group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                                <Trash2 className="w-4 h-4" />
                            </div>
                            Terminar Servicio
                        </button>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-8 rounded-[2.5rem] bg-red-500/5 border border-red-500/20 backdrop-blur-xl flex flex-col md:flex-row items-center gap-8 max-w-4xl"
                        >
                            <div className="flex items-center gap-4 text-red-500 shrink-0">
                                <AlertTriangle className="w-10 h-10" />
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-black uppercase tracking-tighter italic">¿Confirmar Borrado?</h3>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Esta acción es irreversible</span>
                                </div>
                            </div>
                            <p className="text-xs text-foreground/40 font-medium leading-relaxed max-w-md text-center md:text-left">
                                Se eliminarán todos tus despliegues, registros de equipo y datos biométricos de la plataforma Pelotify de forma permanente.
                            </p>
                            <div className="flex gap-4 shrink-0">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="h-14 px-8 rounded-2xl bg-foreground/5 border border-foreground/10 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-all"
                                >
                                    ABORTAR
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
                                    className="h-14 px-8 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95"
                                >
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    ELIMINAR TODO
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* PASSWORD SECURITY MODAL */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute inset-0 bg-background/60 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 40 }}
                            className="w-full max-w-xl glass-premium rounded-[4rem] p-12 md:p-16 border border-foreground/10 shadow-[0_100px_200px_rgba(0,0,0,0.8)] relative overflow-hidden bg-surface/80"
                        >
                            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none" />
                            
                            <form onSubmit={handleUpdatePassword} className="space-y-12 relative z-10">
                                <div className="space-y-4">
                                    <div className="w-20 h-20 rounded-[1.8rem] bg-primary/10 border border-primary/20 flex items-center justify-center mb-8">
                                        <Lock className="w-8 h-8 text-primary" />
                                    </div>
                                    <h2 className="text-5xl font-black italic text-foreground uppercase tracking-tighter leading-none">Nueva <span className="text-primary">Credencial</span></h2>
                                    <p className="text-[11px] font-black text-foreground/30 uppercase tracking-[0.5em] italic">Seguimiento de Seguridad de Atleta</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase text-foreground/40 tracking-[0.3em] ml-2">Asignar Nueva Contraseña</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            className="w-full h-20 pl-8 bg-foreground/[0.03] border border-foreground/10 rounded-[2.5rem] text-foreground text-xl font-black outline-none focus:border-primary/50 transition-all placeholder:text-foreground/5 shadow-inner"
                                            placeholder="••••••••••••"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 ml-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">Mínimo 6 caracteres alfanuméricos</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="flex-1 h-16 rounded-[2rem] bg-foreground/5 border border-foreground/5 text-[11px] font-black uppercase tracking-[0.4em] text-foreground/40 hover:text-foreground transition-all active:scale-95"
                                    >
                                        CANCELAR
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdatingPassword}
                                        className="flex-[1.5] h-16 bg-primary text-black font-black text-[11px] uppercase tracking-[0.4em] rounded-[2rem] flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-primary/20"
                                    >
                                        {isUpdatingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        ACTUALIZAR
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
