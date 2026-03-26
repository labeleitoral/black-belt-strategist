import { useState, useEffect } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentCard } from "@/components/ui/content-card";
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

const caseImages = [
  "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&h=500&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=800&h=500&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=500&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=500&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop&auto=format&q=80",
];

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
    <div className="max-w-5xl space-y-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cases.map((c, i) => (
            <ContentCard
              key={c.id}
              title={c.title}
              subtitle={c.profiles?.full_name || "Anônimo"}
              description={c.context}
              image={caseImages[i % caseImages.length]}
              badge={c.category || "Geral"}
              footer={
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {c.comments_count}</span>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
