import { useState, useEffect } from "react";
import { Heart, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Post {
  id: string;
  content: string;
  author_id: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

export default function Lab() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts_lab")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });
    if (data) setPosts(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleCreate = async () => {
    if (!content.trim() || !user) return;
    const { error } = await supabase.from("posts_lab").insert({ content: content.trim(), author_id: user.id });
    if (error) { toast.error("Erro ao publicar"); return; }
    toast.success("Publicação criada");
    setContent(""); setOpen(false);
    fetchPosts();
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    return `${Math.floor(hrs / 24)}d atrás`;
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Lab</h1>
          <p className="text-muted-foreground mt-1">Espaço aberto para troca, debate e construção de ideias.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-primary-foreground" size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Publicação</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Publicação</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Textarea placeholder="Compartilhe uma ideia, análise ou provocação..." value={content} onChange={e => setContent(e.target.value)} rows={5} />
              <Button onClick={handleCreate} className="w-full gold-gradient text-primary-foreground">Publicar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma publicação ainda. Seja o primeiro!</p>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="glass-card rounded-lg p-5 animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                  {(post.profiles?.full_name || "A").charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{post.profiles?.full_name || "Anônimo"}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-secondary-foreground">{post.content}</p>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Heart className="h-3 w-3" /> {post.likes_count}
                </button>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <MessageSquare className="h-3 w-3" /> {post.comments_count}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
