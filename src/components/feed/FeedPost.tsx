import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageSquare, Lightbulb, Briefcase, FileText } from "lucide-react";
import { Link } from "react-router-dom";

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
  author: {
    id: string;
    full_name: string | null;
    headline: string | null;
    avatar_url: string | null;
  };
}

const typeConfig = {
  insight: { icon: Lightbulb, label: "Insight", color: "text-yellow-400" },
  case: { icon: Briefcase, label: "Case", color: "text-emerald-400" },
  post: { icon: FileText, label: "Discussão", color: "text-blue-400" },
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

export function FeedPost({ item }: { item: FeedItem }) {
  const config = typeConfig[item.type];
  const TypeIcon = config.icon;

  const initials = item.author.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  const detailLink =
    item.type === "insight"
      ? "/insights"
      : item.type === "case"
      ? "/cases"
      : "/lab";

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-fade-in hover:border-primary/20 border border-transparent transition-all">
      <div className="p-4">
        {/* Author header */}
        <div className="flex items-start gap-3">
          <Link to={`/rede/${item.author.id}`}>
            <Avatar className="h-10 w-10 border border-border hover:border-primary/30 transition-colors">
              <AvatarImage src={item.author.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary text-primary font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
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
              <span className="text-xs text-muted-foreground shrink-0">
                {timeAgo(item.created_at)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {item.author.headline || "Membro Black Belt"}
            </p>
          </div>

          <div className={`flex items-center gap-1 text-xs ${config.color} shrink-0`}>
            <TypeIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{config.label}</span>
          </div>
        </div>

        {/* Content */}
        <div className="mt-3">
          {item.title && (
            <h3 className="font-display font-semibold text-sm mb-1">
              {item.title}
            </h3>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
            {item.content}
          </p>
        </div>

        {/* Tags / Category */}
        {(item.tags?.length || item.category) && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.category && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {item.category}
              </span>
            )}
            {item.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center border-t border-border">
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground hover:text-primary hover:bg-secondary/30 transition-colors">
          <Heart className="h-4 w-4" />
          <span className="text-xs">{item.likes_count || ""}</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground hover:text-primary hover:bg-secondary/30 transition-colors">
          <MessageSquare className="h-4 w-4" />
          <span className="text-xs">{item.comments_count || ""}</span>
        </button>
        <Link
          to={detailLink}
          className="flex-1 flex items-center justify-center py-2.5 text-xs text-muted-foreground hover:text-primary hover:bg-secondary/30 transition-colors"
        >
          Ver mais
        </Link>
      </div>
    </div>
  );
}
