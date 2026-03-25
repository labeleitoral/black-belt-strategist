import { useState, useEffect } from "react";
import { FileText, Video, Download, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface LibraryItem {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  file_url: string | null;
  created_at: string;
}

export default function Library() {
  const { role } = useAuth();
  const { user } = useAuth();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "PDF", category: "", file_url: "" });

  const canPublish = role === "admin" || role === "mentor";

  const fetchItems = async () => {
    const { data } = await supabase
      .from("library_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !user) return;
    const { error } = await supabase.from("library_items").insert({
      ...form,
      file_url: form.file_url || null,
      author_id: user.id,
    });
    if (error) { toast.error("Erro ao adicionar material"); return; }
    toast.success("Material adicionado");
    setForm({ title: "", description: "", type: "PDF", category: "", file_url: "" });
    setOpen(false);
    fetchItems();
  };

  const IconFor = ({ type }: { type: string }) => {
    if (type === "Vídeo") return <Video className="h-5 w-5 text-primary" />;
    return <FileText className="h-5 w-5 text-primary" />;
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Biblioteca</h1>
          <p className="text-muted-foreground mt-1">Materiais de referência para aprofundamento estratégico.</p>
        </div>
        {canPublish && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gold-gradient text-primary-foreground" size="sm"><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Material</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Título" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                <Textarea placeholder="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Vídeo">Vídeo</SelectItem>
                    <SelectItem value="Artigo">Artigo</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Categoria (ex: Referência, Aula)" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                <Input placeholder="URL do arquivo (opcional)" value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} />
                <Button onClick={handleCreate} className="w-full gold-gradient text-primary-foreground">Adicionar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum material disponível ainda.</p>
      ) : (
        <div className="space-y-3">
          {items.map(m => (
            <div key={m.id} className="glass-card rounded-lg p-4 flex items-center gap-4 hover:border-primary/20 transition-all cursor-pointer animate-fade-in group">
              <div className="p-2 rounded-md bg-primary/10">
                <IconFor type={m.type} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium group-hover:text-primary transition-colors">{m.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{m.type}</span>
                  {m.category && <span className="text-xs bg-secondary px-2 py-0.5 rounded">{m.category}</span>}
                </div>
              </div>
              {m.file_url && <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
