'use client';

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Heart, Bookmark, BookmarkCheck, 
  Share2, Check, MoreHorizontal, Trash2, Zap, Send, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MatchPostCard from './MatchPostCard';
import { useInView } from 'react-intersection-observer';
import { useHaptic } from '@/hooks/useHaptic';
import { useMobileShare } from '@/hooks/useMobileShare';
import Link from 'next/link';
import { BottomSheet } from '@/components/BottomSheet';

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

interface FeedPostItemProps {
  post: Post;
  user: any;
  bookmarkedPosts: Set<string>;
  expandedPostId: string | null;
  comments: Record<string, Comment[]>;
  isCommenting: string | null;
  newCommentContent: string;
  standalonePostId?: string | null;
  onLike: (postId: string, hasLiked: boolean) => void;
  onBookmark: (postId: string) => void;
  onComment: (postId: string) => void;
  onDelete: (postId: string) => void;
  onShare: (post: Post) => void;
  onHashtagClick: (tag: string) => void;
  onExpand: (postId: string) => void;
  onCommentChange: (val: string) => void;
  onImageClick: (url: string) => void;
  timeAgo: (date: string) => string;
}

const FeedPostItem = memo(function FeedPostItem({
  post,
  user,
  bookmarkedPosts,
  expandedPostId,
  comments,
  isCommenting,
  newCommentContent,
  standalonePostId,
  onLike,
  onBookmark,
  onComment,
  onDelete,
  onShare,
  onHashtagClick,
  onExpand,
  onCommentChange,
  onImageClick,
  timeAgo
}: FeedPostItemProps) {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0,
    rootMargin: '200px 0px', // Load slightly before coming into view
  });
  const { hapticMedium, hapticLight } = useHaptic();
  const { shareContent } = useMobileShare();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!inView && !standalonePostId) {
    // If not in view, render a placeholder of approximately the same height to maintain scroll position
    return <div ref={ref} className="h-64 border-b border-foreground/[0.06]" />;
  }

  const isAuthor = post.author_id === user?.id;
  const isExpanded = expandedPostId === post.id;
  const isBookmarked = bookmarkedPosts.has(post.id);

  return (
    <div
      ref={ref}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('a, button, input')) return;
        if (!standalonePostId) {
          window.location.href = `/post/${post.id}`;
        }
      }}
      className={cn(
        "p-4 sm:px-6 sm:py-6 border-b border-foreground/[0.06] transition-colors duration-200 relative flex group/post animate-in fade-in slide-in-from-bottom-2",
        !standalonePostId ? "gap-3 sm:gap-4 hover:bg-foreground/[0.03] cursor-pointer" : "flex-col gap-4 sm:gap-6 bg-background py-6 sm:py-12 border-b-0 min-h-[60vh] px-5 sm:px-10",
        post.author.is_pro ? "bg-gradient-to-r from-yellow-500/[0.03] to-transparent" : ""
      )}
    >
      {/* HEADER ROW (Standalone) or AVATAR (Feed) */}
      {!standalonePostId ? (
        <div className="shrink-0 flex flex-col items-center">
          <Link href={`/feed/profile?id=${post.author.id}`} className={cn("w-12 h-12 rounded-full overflow-hidden shrink-0 relative hover:opacity-90 transition-opacity duration-200 z-10", post.author.is_pro ? "ring-2 ring-yellow-500/40" : "")}>
            {post.author.avatar_url ? (
              <img src={post.author.avatar_url} loading="lazy" decoding="async" className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center font-bold text-primary text-[15px]">
                {post.author.name.charAt(0)}
              </div>
            )}
          </Link>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Link href={`/feed/profile?id=${post.author.id}`} className={cn("w-14 h-14 rounded-full overflow-hidden shrink-0 relative hover:opacity-90 transition-opacity duration-200 z-10 shadow-md", post.author.is_pro ? "ring-2 ring-yellow-500" : "ring-1 ring-foreground/10")}>
              {post.author.avatar_url ? (
                <img src={post.author.avatar_url} loading="lazy" decoding="async" className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-lg">
                  {post.author.name.charAt(0)}
                </div>
              )}
            </Link>
            <div className="flex flex-col">
              <Link href={`/feed/profile?id=${post.author.id}`} className="group flex items-center gap-1.5 min-w-0">
                <span className={cn("font-black text-lg truncate group-hover:underline", post.author.is_pro ? "text-yellow-500" : "text-foreground")}>
                  {post.author.name}
                </span>
                {post.author.is_pro && <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />}
              </Link>
              <span className="text-foreground/40 text-[15px] truncate">
                @{post.author.handle || post.author.name.toLowerCase().replace(/\s+/g, '')}
              </span>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center gap-2">
             <span className="text-foreground/30 text-sm hidden sm:block">
              {timeAgo(post.created_at)}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                hapticLight();
                setIsMenuOpen(true);
              }}
              className="text-foreground/40 hover:text-primary p-2 hover:bg-primary/10 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className={cn("flex-1 min-w-0", !standalonePostId ? "mt-0.5" : "")}>
        {!standalonePostId && (
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
              <span className="text-foreground/40 text-[15px] hover:underline cursor-pointer">
                {timeAgo(post.created_at)}
              </span>
            </div>

            <div className="shrink-0">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  hapticLight();
                  setIsMenuOpen(true);
                }}
                className="text-foreground/40 hover:text-primary p-1.5 hover:bg-primary/10 rounded-full transition-colors mt-[-4px]"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <BottomSheet 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
          title="Opciones del Post"
        >
          <div className="flex flex-col gap-2">
            {isAuthor ? (
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  hapticMedium();
                  onDelete(post.id); 
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-5 py-4 text-base font-bold text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-2xl flex items-center gap-3 transition-colors"
              >
                <Trash2 className="w-5 h-5" /> Eliminar Publicación
              </button>
            ) : (
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  hapticLight();
                  // For now just close or add report logic here
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-5 py-4 text-base font-bold text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-2xl flex items-center gap-3 transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 opacity-50" /> Reportar (Próximamente)
              </button>
            )}
            
            <button
              onClick={async (e) => { 
                e.stopPropagation(); 
                setIsMenuOpen(false);
                await shareContent({
                  title: `Post de ${post.author.name}`,
                  text: post.content,
                  url: `${window.location.origin}/post/${post.id}`
                });
              }}
              className="w-full text-left px-5 py-4 text-base font-bold text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-2xl flex items-center gap-3 transition-colors mobile-touch-feedback"
            >
              <Share2 className="w-5 h-5" /> Compartir Post
            </button>
          </div>
        </BottomSheet>

        <div className={cn("mt-1 mb-2.5", standalonePostId ? "mt-2 mb-6" : "")}>
          {standalonePostId && (
            <div className="sm:hidden mb-4 text-foreground/30 text-xs font-bold uppercase tracking-widest">
              Publicado {timeAgo(post.created_at)}
            </div>
          )}
          <p className={cn("text-foreground whitespace-pre-wrap", standalonePostId ? "text-[22px] sm:text-[28px] font-medium leading-[1.3] font-outfit tracking-tight" : "text-[15px] leading-snug")}>
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
                      onClick={(e) => { e.stopPropagation(); onHashtagClick(part.slice(1)); }}
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
              return (
                <div className={cn(standalonePostId ? "mt-6" : "mt-2")}>
                  <MatchPostCard matchId={matchIdMatch[1]} />
                </div>
              );
            }
            return null;
          })()}
          {post.image_url && (
            <div
              className={cn(
                "rounded-2xl overflow-hidden border border-foreground/[0.08] shadow-sm cursor-pointer hover:opacity-95 transition-opacity",
                standalonePostId ? "mt-6" : "mt-3"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onImageClick(post.image_url!);
              }}
            >
              <img src={post.image_url} alt="" loading="lazy" decoding="async" className={cn("w-full object-cover", standalonePostId ? "max-h-[80vh]" : "max-h-[500px]")} />
            </div>
          )}
        </div>

        <div className={cn(
          "flex items-center justify-between text-foreground/40 pr-2 -ml-2 pb-1",
          standalonePostId ? "max-w-none mt-4 pt-4 border-t border-foreground/[0.08]" : "max-w-[425px]"
        )}>
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              hapticLight();
              onExpand(post.id); 
            }}
            className={cn("flex items-center gap-1.5 transition-colors", isExpanded ? "text-blue-500" : "hover:text-blue-500", standalonePostId ? "text-base" : "text-[13px]")}
          >
            <div className={cn("rounded-full transition-colors", isExpanded ? "bg-blue-500/10" : "group-hover/btn:bg-blue-500/10", standalonePostId ? "p-3" : "p-2")}>
              <MessageSquare className={cn(standalonePostId ? "w-6 h-6" : "w-4.5 h-4.5")} />
            </div>
            {post.comments_count > 0 && <span className="font-bold -ml-0.5">{post.comments_count}</span>}
          </button>

          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              hapticLight();
              onBookmark(post.id); 
            }}
            className={cn("flex items-center gap-1.5 transition-colors", isBookmarked ? "text-green-500" : "hover:text-green-500", standalonePostId ? "text-base" : "text-[13px]")}
          >
            <div className={cn("rounded-full transition-colors", isBookmarked ? "bg-green-500/10" : "group-hover/btn:bg-green-500/10", standalonePostId ? "p-3" : "p-2")}>
              {isBookmarked ? <BookmarkCheck className={cn("fill-green-500", standalonePostId ? "w-6 h-6" : "w-4.5 h-4.5")} /> : <Bookmark className={cn(standalonePostId ? "w-6 h-6" : "w-4.5 h-4.5")} />}
            </div>
          </button>

          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              hapticMedium();
              onLike(post.id, post.user_has_liked); 
            }}
            className={cn("flex items-center gap-1.5 transition-colors", post.user_has_liked ? "text-pink-600" : "hover:text-pink-600", standalonePostId ? "text-base" : "text-[13px]")}
          >
            <div className={cn("rounded-full transition-colors", post.user_has_liked ? "bg-pink-600/10" : "group-hover/btn:bg-pink-600/10", standalonePostId ? "p-3" : "p-2")}>
              <Heart className={cn(post.user_has_liked && "fill-pink-600", standalonePostId ? "w-6 h-6" : "w-4.5 h-4.5")} />
            </div>
            {post.likes_count > 0 && <span className="font-bold -ml-0.5">{post.likes_count}</span>}
          </button>

          <button
            onClick={async (e) => { 
              e.stopPropagation(); 
              await shareContent({
                title: `Post de ${post.author.name}`,
                text: post.content,
                url: `${window.location.origin}/post/${post.id}`
              });
            }}
            className={cn("flex items-center gap-1.5 transition-colors hover:text-primary mobile-touch-feedback", standalonePostId ? "text-base" : "text-[13px]")}
          >
            <div className={cn("group-hover/btn:bg-primary/10 transition-colors", standalonePostId ? "p-3" : "p-2")}>
              <Share2 className={cn(standalonePostId ? "w-6 h-6" : "w-4.5 h-4.5")} />
            </div>
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 border-t border-foreground/[0.04] pt-4 overflow-hidden animate-in fade-in duration-300">
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-surface-elevated overflow-hidden shrink-0 mt-1">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} loading="lazy" decoding="async" className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                    {user?.user_metadata?.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className="flex-1 relative">
                <input
                  value={newCommentContent}
                  onChange={(e) => onCommentChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onComment(post.id)}
                  placeholder="Escribí tu comentario..."
                  className="w-full bg-foreground/[0.03] border-none rounded-2xl px-4 py-2 text-sm focus:ring-1 focus:ring-primary/30 outline-none pr-10"
                />
                <button
                  onClick={() => onComment(post.id)}
                  disabled={!newCommentContent.trim() || isCommenting === post.id}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary disabled:opacity-30 p-1"
                >
                  {isCommenting === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-4 px-1">
              {comments[post.id]?.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <Link href={`/feed/profile?id=${comment.author.id}`} className={cn("w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1", comment.author.is_pro ? "ring-yellow-500/20" : "ring-foreground/[0.06]")}>
                    {comment.author.avatar_url ? (
                      <img src={comment.author.avatar_url} loading="lazy" decoding="async" className="w-full h-full object-cover" alt="" />
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
  );
});

export default FeedPostItem;
