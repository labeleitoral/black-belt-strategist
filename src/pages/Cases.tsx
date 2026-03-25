import { useState, useEffect } from "react";
import { MessageSquare, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Case {
  id: string;
  title: string;
  category: string;
  context: string;
  result: string;
  comments_count: number;
  author_id: string;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

export default function Cases() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", category: "", context: "", result: "" });

  const fetchCases = async () => {
    const { data } = await supabase
      .from("cases")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });
    if (data) setCases(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchCases(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !user) return;
    const { error } = await supabase.from("cases").insert({
      ...form,
      author_id: user.id,
    });
    if (error) { toast.error("Erro ao publicar case"); return; }
    toast.success("Case publicado");
    setForm({ title: "", category: "", context: "", result: "" });
    setOpen(false);
    fetchCases();
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Hub de Cases</h1>
          <p className="text-muted-foreground mt-1">Experiências reais que revelam o que funciona na prática.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-primary-foreground" size="sm"><Plus className="h-4 w-4 mr-1" /> Publicar Case</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Case</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Título" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <Input placeholder="Categoria (ex: Gestão de Crise)" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              <Textarea placeholder="Contexto" value={form.context} onChange={e => setForm(f => ({ ...f, context: e.target.value }))} rows={3} />
              <Textarea placeholder="Resultado" value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))} rows={2} />
              <Button onClick={handleCreate} className="w-full gold-gradient text-primary-foreground">Publicar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : cases.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum case publicado ainda.</p>
      ) : (
        <div className="space-y-4">
          {cases.map(c => (
            <div key={c.id} className="glass-card rounded-lg p-5 hover:border-primary/20 transition-all cursor-pointer animate-fade-in group">
              <div className="flex items-start justify-between">
                <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{c.category || "Geral"}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-display font-semibold mt-3 group-hover:text-primary transition-colors">{c.title}</h3>
              {c.context && <p className="text-sm text-muted-foreground mt-2">{c.context}</p>}
              {c.result && (
                <div className="mt-3 p-3 rounded-md bg-primary/5 border border-primary/10">
                  <p className="text-sm"><span className="text-primary font-medium">Resultado:</span> {c.result}</p>
                </div>
              )}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">{c.profiles?.full_name || "Anônimo"}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" /> {c.comments_count} comentários
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
