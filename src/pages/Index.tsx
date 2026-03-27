import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FeedProfileCard } from "@/components/feed/FeedProfileCard";
import { FeedComposer } from "@/components/feed/FeedComposer";
import { FeedPost, type FeedItem } from "@/components/feed/FeedPost";
import { FeedSidebar } from "@/components/feed/FeedSidebar";

export default function Dashboard() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    setLoading(true);

    const [insightsRes, casesRes, postsRes] = await Promise.all([
      supabase
        .from("insights")
        .select("id, title, content, created_at, likes_count, comments_count, tags, author_id")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("cases")
        .select("id, title, context, category, comments_count, created_at, author_id")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("posts_lab")
        .select("id, content, created_at, likes_count, comments_count, author_id, category, image_url, video_url, link_url")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    // Collect unique author IDs
    const allItems = [
      ...(insightsRes.data || []).map((i) => ({ ...i, _type: "insight" as const })),
      ...(casesRes.data || []).map((c) => ({ ...c, _type: "case" as const })),
      ...(postsRes.data || []).map((p) => ({ ...p, _type: "post" as const })),
    ];

    const authorIds = [...new Set(allItems.map((i) => i.author_id))];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, headline, avatar_url")
      .in("id", authorIds.length > 0 ? authorIds : ["00000000-0000-0000-0000-000000000000"]);

    const profileMap = new Map(
      (profiles || []).map((p) => [p.id, p])
    );

    const getAuthor = (authorId: string) => {
      const p = profileMap.get(authorId);
      return {
        id: authorId,
        full_name: p?.full_name || null,
        headline: p?.headline || null,
        avatar_url: p?.avatar_url || null,
      };
    };

    const merged: FeedItem[] = [
      ...(insightsRes.data || []).map((i) => ({
        id: i.id,
        type: "insight" as const,
        title: i.title,
        content: i.content,
        created_at: i.created_at,
        likes_count: i.likes_count,
        comments_count: i.comments_count,
        tags: i.tags,
        author: getAuthor(i.author_id),
      })),
      ...(casesRes.data || []).map((c) => ({
        id: c.id,
        type: "case" as const,
        title: c.title,
        content: c.context,
        created_at: c.created_at,
        likes_count: 0,
        comments_count: c.comments_count,
        category: c.category,
        author: getAuthor(c.author_id),
      })),
      ...(postsRes.data || []).map((p) => ({
        id: p.id,
        type: "post" as const,
        content: p.content,
        created_at: p.created_at,
        likes_count: p.likes_count,
        comments_count: p.comments_count,
        category: (p as any).category || undefined,
        image_url: (p as any).image_url || undefined,
        video_url: (p as any).video_url || undefined,
        link_url: (p as any).link_url || undefined,
        author: getAuthor(p.author_id),
      })),
    ];

    merged.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setFeedItems(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6">
        {/* Left — Profile Card */}
        <FeedProfileCard />

        {/* Center — Feed */}
        <div className="space-y-4 min-w-0">
          <FeedComposer onPublished={fetchFeed} />

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="glass-card rounded-xl p-4 animate-pulse h-40"
                />
              ))}
            </div>
          ) : feedItems.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm">
                Nenhuma publicação ainda. Seja o primeiro a compartilhar!
              </p>
            </div>
          ) : (
            feedItems.map((item) => (
              <FeedPost key={`${item.type}-${item.id}`} item={item} onDeleted={fetchFeed} />
            ))
          )}
        </div>

        {/* Right — Sidebar */}
        <FeedSidebar />
      </div>
    </div>
  );
}
