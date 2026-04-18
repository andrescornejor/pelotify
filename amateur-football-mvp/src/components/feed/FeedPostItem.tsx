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
import Link from 'next/link';

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
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);

  const handleDoubleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticMedium();
    if (!post.user_has_liked) {
      onLike(post.id, false);
    }
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 800);
  };

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
      onDoubleClick={handleDoubleTap}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('a, button, input')) return;
        if (!standalonePostId) {
          window.location.href = `/post/${post.id}`;
        }
      }}
      className={cn(
        "p-4 sm:px-5 sm:py-4 border-b border-foreground/[0.06] transition-colors duration-200 relative flex gap-3 sm:gap-4 group/post animate-in fade-in slide-in-from-bottom-2",
        !standalonePostId && "hover:bg-foreground/[0.03] cursor-pointer",
        standalonePostId && "bg-background py-8 sm:py-10 border-b-2",
        post.author.is_pro ? "bg-gradient-to-r from-yellow-500/[0.03] to-transparent" : ""
      )}
    >
      <AnimatePresence>
        {showHeartOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ type: "spring", damping: 15 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <Heart className="w-24 h-24 text-pink-500 fill-pink-500 drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFTSIDE AVATAR */}
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

      {/* RIGHTSIDE CONTENT */}
      <div className="flex-1 min-w-0 mt-0.5">
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

          {isAuthor && (
            <div className="relative group/menu shrink-0">
              <button className="text-foreground/40 hover:text-blue-500 p-1.5 hover:bg-blue-500/10 rounded-full transition-colors mt-[-4px]">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-32 bg-surface-elevated border border-foreground/10 rounded-xl shadow-xl flex flex-col opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all z-20 overflow-hidden">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
                  className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-white/5 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={cn("mt-1 mb-2.5", standalonePostId ? "mt-4 mb-5" : "")}>
          <p className={cn("text-foreground whitespace-pre-wrap", standalonePostId ? "text-xl sm:text-[22px] font-medium leading-relaxed font-kanit tracking-tight" : "text-[15px] leading-snug")}>
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
              return <MatchPostCard matchId={matchIdMatch[1]} />;
            }
            return null;
          })()}
          {post.image_url && (
            <div
              className="mt-3 rounded-2xl overflow-hidden border border-foreground/[0.08] shadow-sm cursor-pointer hover:opacity-95 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onImageClick(post.image_url!);
              }}
            >
              <img src={post.image_url} alt="" loading="lazy" decoding="async" className="w-full max-h-[500px] object-cover" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-foreground/40 max-w-[425px] pr-2 -ml-2 pb-1">
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              hapticLight();
              onExpand(post.id); 
            }}
            className={cn("flex items-center gap-1.5 text-[13px] group/btn transition-colors", isExpanded ? "text-blue-500" : "hover:text-blue-500")}
          >
            <div className={cn("p-2 rounded-full transition-colors", isExpanded ? "bg-blue-500/10" : "group-hover/btn:bg-blue-500/10")}>
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <span className="font-medium -ml-0.5">{post.comments_count > 0 ? post.comments_count : ''}</span>
          </button>

          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              hapticLight();
              onBookmark(post.id); 
            }}
            className={cn("flex items-center gap-1.5 text-[13px] group/btn transition-colors", isBookmarked ? "text-green-500" : "hover:text-green-500")}
          >
            <div className={cn("p-2 rounded-full transition-colors", isBookmarked ? "bg-green-500/10" : "group-hover/btn:bg-green-500/10")}>
              {isBookmarked ? <BookmarkCheck className="w-4.5 h-4.5 fill-green-500" /> : <Bookmark className="w-4.5 h-4.5" />}
            </div>
          </button>

          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              hapticMedium();
              onLike(post.id, post.user_has_liked); 
            }}
            className={cn("flex items-center gap-1.5 text-[13px] group/btn transition-colors", post.user_has_liked ? "text-pink-600" : "hover:text-pink-600")}
          >
            <div className={cn("p-2 rounded-full transition-colors", post.user_has_liked ? "bg-pink-600/10" : "group-hover/btn:bg-pink-600/10")}>
              <Heart className={cn("w-4.5 h-4.5", post.user_has_liked && "fill-pink-600")} />
            </div>
            <span className="font-medium -ml-0.5">{post.likes_count > 0 ? post.likes_count : ''}</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onShare(post); }}
            className="flex items-center gap-1.5 text-[13px] group/btn transition-colors hover:text-primary"
          >
            <div className="p-2 rounded-full group-hover/btn:bg-primary/10 transition-colors">
              <Share2 className="w-4.5 h-4.5" />
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
