import { useState, useEffect } from "react";
import { Heart, MessageSquare, Bookmark, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentCard } from "@/components/ui/content-card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Insight {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author_id: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles?: { full_name: string | null } | null;
  author_role?: string;
}

const filters = ["Todos", "Análise", "Dados", "Narrativa", "Estratégia", "Digital"];

const insightImages = [
  "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&h=500&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=500&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=500&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=500&fit=crop&auto=format&q=80",
];

export default function Insights() {
  const { user, role } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const canPublish = role === "admin" || role === "mentor";

  const fetchInsights = async () => {
    const { data, error } = await supabase
      .from("insights")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });
    if (!error && data) {
      const authorIds = [...new Set(data.map((i: any) => i.author_id))];
      const { data: roles } = await supabase.from("user_roles").select("user_id, role").in("user_id", authorIds);
      const roleMap = new Map(roles?.map((r: any) => [r.user_id, r.role]) ?? []);
      setInsights(data.map((i: any) => ({ ...i, author_role: roleMap.get(i.author_id) ?? "membro" })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchInsights(); }, []);

  const handleCreate = async () => {
    if (!title.trim() || !user) return;
    const { error } = await supabase.from("insights").insert({
      title: title.trim(),
      content: content.trim(),
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      author_id: user.id,
    });
    if (error) { toast.error("Erro ao criar insight"); return; }
    toast.success("Insight publicado");
    setTitle(""); setContent(""); setTags(""); setOpen(false);
    fetchInsights();
  };

  const roleLabel: Record<string, string> = { admin: "Equipe", mentor: "Mentor", membro: "Membro" };

  const filtered = activeFilter === "Todos" ? insights : insights.filter(i => i.tags.some(t => t.toLowerCase().includes(activeFilter.toLowerCase())));

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Central de Insights</h1>
          <p className="text-muted-foreground mt-1">Leituras que ajudam a tomar decisões melhores.</p>
        </div>
        {canPublish && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gold-gradient text-primary-foreground" size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Insight</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Publicar Insight</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />
                <Textarea placeholder="Conteúdo" value={content} onChange={e => setContent(e.target.value)} rows={5} />
                <Input placeholder="Tags (separadas por vírgula)" value={tags} onChange={e => setTags(e.target.value)} />
                <Button onClick={handleCreate} className="w-full gold-gradient text-primary-foreground">Publicar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${f === activeFilter ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}>{f}</button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum insight encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((insight, i) => (
            <ContentCard
              key={insight.id}
              title={insight.title}
              subtitle={`${insight.profiles?.full_name || "Anônimo"} · ${roleLabel[insight.author_role ?? "membro"]}`}
              description={insight.content}
              image={insightImages[i % insightImages.length]}
              badge={insight.tags[0]}
              footer={
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {insight.likes_count}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {insight.comments_count}</span>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
