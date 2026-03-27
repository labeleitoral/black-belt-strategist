import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageSquare, Lightbulb, Briefcase, FileText, Send, Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface FeedItem {
  id: string;
  type: "insight" | "case" | "post";
  title?: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  category?: string;
  tags?: string[];
  image_url?: string | null;
  video_url?: string | null;
  link_url?: string | null;
  author: {
    id: string;
    full_name: string | null;
    headline: string | null;
    avatar_url: string | null;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_name: string | null;
  author_avatar: string | null;
}

const categoryConfig: Record<string, { icon: typeof Lightbulb; label: string; color: string }> = {
  insight: { icon: Lightbulb, label: "Insight", color: "text-yellow-400" },
  case: { icon: Briefcase, label: "Case", color: "text-emerald-400" },
  discussao: { icon: MessageSquare, label: "Discussão", color: "text-blue-400" },
  recomendacao: { icon: Lightbulb, label: "Recomendação", color: "text-purple-400" },
  pesquisa: { icon: FileText, label: "Pesquisa", color: "text-cyan-400" },
  vaga: { icon: Briefcase, label: "Vaga", color: "text-orange-400" },
  post: { icon: FileText, label: "Post", color: "text-blue-400" },
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}sem`;
}

function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export function FeedPost({ item, onDeleted }: { item: FeedItem; onDeleted?: () => void }) {
  const { user, role } = useAuth();
  const cat = item.category || item.type;
  const config = categoryConfig[cat] || categoryConfig.post;
  const TypeIcon = config.icon;

  const canDelete = user && (user.id === item.author.id || role === "admin");

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likes_count);
  const [likeLoading, setLikeLoading] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(item.comments_count);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("target_id", item.id)
      .eq("target_type", item.type)
      .maybeSingle()
      .then(({ data }) => { if (data) setLiked(true); });
  }, [user, item.id, item.type]);

  useEffect(() => {
    supabase
      .from("likes")
      .select("id", { count: "exact", head: true })
      .eq("target_id", item.id)
      .eq("target_type", item.type)
      .then(({ count }) => { if (count !== null) setLikesCount(count); });
  }, [item.id, item.type]);

  const toggleLike = async () => {
    if (!user || likeLoading) return;
    setLikeLoading(true);
    if (liked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("target_id", item.id).eq("target_type", item.type);
      setLiked(false);
      setLikesCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("likes").insert({ user_id: user.id, target_id: item.id, target_type: item.type });
      setLiked(true);
      setLikesCount((c) => c + 1);
    }
    setLikeLoading(false);
  };

  const handleDeletePost = async () => {
    const table = item.type === "insight" ? "insights" : item.type === "case" ? "cases" : "posts_lab";
    const { error } = await supabase.from(table).delete().eq("id", item.id);
    if (error) {
      toast.error("Erro ao excluir publicação");
    } else {
      toast.success("Publicação excluída");
      onDeleted?.();
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("id, content, created_at, author_id")
      .eq("target_id", item.id)
      .eq("target_type", item.type)
      .order("created_at", { ascending: true });
    if (!data) return;
    const authorIds = [...new Set(data.map((c) => c.author_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", authorIds.length > 0 ? authorIds : ["00000000-0000-0000-0000-000000000000"]);
    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
    setComments(
      data.map((c) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        author_id: c.author_id,
        author_name: profileMap.get(c.author_id)?.full_name || null,
        author_avatar: profileMap.get(c.author_id)?.avatar_url || null,
      }))
    );
    setCommentsCount(data.length);
  };

  const toggleComments = () => {
    if (!showComments) fetchComments();
    setShowComments(!showComments);
  };

  const submitComment = async () => {
    if (!user || !commentText.trim() || commentLoading) return;
    setCommentLoading(true);
    const { error } = await supabase.from("comments").insert({
      author_id: user.id,
      target_id: item.id,
      target_type: item.type,
      content: commentText.trim(),
    });
    if (error) {
      toast.error("Erro ao comentar");
    } else {
      setCommentText("");
      await fetchComments();
    }
    setCommentLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) {
      toast.error("Erro ao excluir comentário");
    } else {
      await fetchComments();
    }
  };

  const initials = item.author.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  const getInitials = (name: string | null) =>
    name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  const embedUrl = item.video_url ? getYoutubeEmbedUrl(item.video_url) : null;

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-fade-in hover:border-primary/20 border border-transparent transition-all">
      <div className="p-4">
        {/* Author header — larger avatar card style */}
        <div className="flex items-start gap-3">
          <Link to={`/rede/${item.author.id}`} className="shrink-0">
            <div className="relative w-12 h-14 rounded-lg overflow-hidden group">
              {item.author.avatar_url ? (
                <img
                  src={item.author.avatar_url}
                  alt={item.author.full_name || ""}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{initials}</span>
                </div>
              )}
              {/* Progressive blur at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={`/rede/${item.author.id}`}
                className="font-medium text-sm hover:text-primary transition-colors truncate"
              >
                {item.author.full_name || "Membro"}
              </Link>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground shrink-0">{timeAgo(item.created_at)}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{item.author.headline || "Membro Black Belt"}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className={`flex items-center gap-1 text-xs ${config.color}`}>
              <TypeIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{config.label}</span>
            </div>
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir publicação?</AlertDialogTitle>
                    <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-3">
          {item.title && <h3 className="font-display font-semibold text-sm mb-1">{item.title}</h3>}
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-6">{item.content}</p>
        </div>

        {/* Image */}
        {item.image_url && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img src={item.image_url} alt="" className="w-full max-h-96 object-cover" />
          </div>
        )}

        {/* Video embed */}
        {embedUrl && (
          <div className="mt-3 rounded-lg overflow-hidden aspect-video">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Link preview */}
        {item.link_url && !embedUrl && (
          <a
            href={item.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-colors group"
          >
            <ExternalLink className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground group-hover:text-foreground truncate">{item.link_url}</span>
          </a>
        )}

        {/* Tags / Category */}
        {(item.tags?.length || item.category) && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.category && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{item.category}</span>
            )}
            {item.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">#{tag}</span>
            ))}
          </div>
        )}

        {/* Counts summary */}
        {(likesCount > 0 || commentsCount > 0) && (
          <div className="flex items-center gap-3 mt-3 pt-2 text-xs text-muted-foreground">
            {likesCount > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-primary fill-primary" /> {likesCount}
              </span>
            )}
            {commentsCount > 0 && (
              <button onClick={toggleComments} className="hover:text-foreground transition-colors">
                {commentsCount} comentário{commentsCount !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center border-t border-border">
        <button
          onClick={toggleLike}
          disabled={likeLoading}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm transition-colors ${
            liked ? "text-primary" : "text-muted-foreground hover:text-primary hover:bg-secondary/30"
          }`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-primary" : ""}`} />
          <span className="text-xs">{liked ? "Curtido" : "Curtir"}</span>
        </button>
        <button
          onClick={toggleComments}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground hover:text-primary hover:bg-secondary/30 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="text-xs">Comentar</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-border px-4 py-3 space-y-3 animate-fade-in">
          {comments.map((c) => {
            const canDeleteComment = user && (user.id === c.author_id || role === "admin");
            return (
              <div key={c.id} className="flex items-start gap-2.5 group">
                <Link to={`/rede/${c.author_id}`}>
                  <Avatar className="h-7 w-7 border border-border">
                    <AvatarImage src={c.author_avatar || undefined} className="object-cover" />
                    <AvatarFallback className="bg-secondary text-primary text-[10px] font-bold">
                      {getInitials(c.author_name)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0 bg-secondary/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{c.author_name || "Membro"}</span>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                    {canDeleteComment && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 break-words">{c.content}</p>
                </div>
              </div>
            );
          })}

          {/* New comment input */}
          <div className="flex items-center gap-2 pt-1">
            <Avatar className="h-7 w-7 border border-border shrink-0">
              <AvatarFallback className="bg-secondary text-primary text-[10px] font-bold">
                {user ? "EU" : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-1.5">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
                placeholder="Escreva um comentário..."
                className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={submitComment}
                disabled={!commentText.trim() || commentLoading}
                className="text-primary hover:text-primary/80 disabled:opacity-30 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
