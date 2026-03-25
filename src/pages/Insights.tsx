import { useState, useEffect } from "react";
import { Heart, MessageSquare, Bookmark, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      // fetch roles for authors
      const authorIds = [...new Set(data.map((i: any) => i.author_id))];
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", authorIds);
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

  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="max-w-4xl space-y-6">
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
        <div className="space-y-4">
          {filtered.map(insight => (
            <div key={insight.id} className="glass-card rounded-lg p-5 hover:border-primary/20 transition-all cursor-pointer animate-fade-in">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-semibold hover:text-primary transition-colors">{insight.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">{insight.profiles?.full_name || "Anônimo"}</span>
                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{roleLabel[insight.author_role ?? "membro"]}</span>
                    <span className="text-xs text-muted-foreground">· {formatDate(insight.created_at)}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {insight.tags.map(tag => (
                      <span key={tag} className="text-xs bg-secondary px-2 py-0.5 rounded text-secondary-foreground">{tag}</span>
                    ))}
                  </div>
                </div>
                <Bookmark className="h-4 w-4 text-muted-foreground hover:text-primary shrink-0 cursor-pointer" />
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                <span className="flex items-center gap-1 text-xs text-muted-foreground"><Heart className="h-3 w-3" /> {insight.likes_count}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground"><MessageSquare className="h-3 w-3" /> {insight.comments_count}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
