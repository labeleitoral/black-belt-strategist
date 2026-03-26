import { useState, useEffect } from "react";
import { Shield, Search, Pencil, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

interface UserRow {
  id: string;
  full_name: string | null;
  email?: string;
  specialty: string | null;
  location: string | null;
  created_at: string;
  role: string;
}

interface InsightRow { id: string; title: string; content: string; tags: string[]; created_at: string; }
interface CaseRow { id: string; title: string; category: string; context: string; result: string; created_at: string; }

const roleLabels: Record<string, string> = { admin: "Admin", mentor: "Mentor", membro: "Membro" };

export default function Admin() {
  const { role: currentRole, user } = useAuth();
  const [tab, setTab] = useState("users");

  // Users
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchUsers, setSearchUsers] = useState("");

  // Insights
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [editInsight, setEditInsight] = useState<InsightRow | null>(null);
  const [insightForm, setInsightForm] = useState({ title: "", content: "", tags: "" });

  // Cases
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [editCase, setEditCase] = useState<CaseRow | null>(null);
  const [caseForm, setCaseForm] = useState({ title: "", category: "", context: "", result: "" });

  // Agents (static config for now)
  const [agents] = useState([
    { id: "politica", name: "Leitura Política", style: "Analítico e provocador" },
    { id: "dados", name: "Dados e Tendências", style: "Objetivo e questionador" },
    { id: "narrativa", name: "Narrativa", style: "Reflexivo e desafiador" },
    { id: "estrategia", name: "Estratégia", style: "Estruturado e incisivo" },
    { id: "comunicacao", name: "Comunicação", style: "Prático e direto" },
  ]);

  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const roleMap = new Map(roles?.map((r: any) => [r.user_id, r.role]) ?? []);
    setUsers((profiles ?? []).map((p: any) => ({ ...p, role: roleMap.get(p.id) ?? "membro" })));
    setLoadingUsers(false);
  };

  const fetchInsights = async () => {
    const { data } = await supabase.from("insights").select("id, title, content, tags, created_at").order("created_at", { ascending: false });
    setInsights(data ?? []);
    setLoadingInsights(false);
  };

  const fetchCases = async () => {
    const { data } = await supabase.from("cases").select("id, title, category, context, result, created_at").order("created_at", { ascending: false });
    setCases(data ?? []);
    setLoadingCases(false);
  };

  useEffect(() => { fetchUsers(); fetchInsights(); fetchCases(); }, []);

  if (currentRole !== "admin") return <Navigate to="/" replace />;

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("user_roles").update({ role: newRole as any }).eq("user_id", userId);
    if (error) { toast.error("Erro ao alterar role"); return; }
    toast.success(`Role alterado para ${roleLabels[newRole]}`);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  // Insight CRUD
  const openEditInsight = (i: InsightRow) => {
    setInsightForm({ title: i.title, content: i.content, tags: i.tags.join(", ") });
    setEditInsight(i);
  };
  const saveInsight = async () => {
    if (!editInsight) return;
    const { error } = await supabase.from("insights").update({
      title: insightForm.title,
      content: insightForm.content,
      tags: insightForm.tags.split(",").map(t => t.trim()).filter(Boolean),
    }).eq("id", editInsight.id);
    if (error) { toast.error("Erro ao salvar"); return; }
    toast.success("Insight atualizado");
    setEditInsight(null);
    fetchInsights();
  };
  const deleteInsight = async (id: string) => {
    const { error } = await supabase.from("insights").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Insight excluído");
    fetchInsights();
  };

  // Case CRUD
  const openEditCase = (c: CaseRow) => {
    setCaseForm({ title: c.title, category: c.category, context: c.context, result: c.result });
    setEditCase(c);
  };
  const saveCase = async () => {
    if (!editCase) return;
    const { error } = await supabase.from("cases").update({
      title: caseForm.title,
      category: caseForm.category,
      context: caseForm.context,
      result: caseForm.result,
    }).eq("id", editCase.id);
    if (error) { toast.error("Erro ao salvar"); return; }
    toast.success("Case atualizado");
    setEditCase(null);
    fetchCases();
  };
  const deleteCase = async (id: string) => {
    const { error } = await supabase.from("cases").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Case excluído");
    fetchCases();
  };

  const filteredUsers = users.filter(u => {
    if (!searchUsers) return true;
    const q = searchUsers.toLowerCase();
    return (u.full_name?.toLowerCase().includes(q)) || (u.email?.toLowerCase().includes(q));
  });

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold">Painel Admin</h1>
          <p className="text-muted-foreground mt-1">Gerencie usuários, conteúdos e agentes da comunidade.</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="agents">Agentes</TabsTrigger>
        </TabsList>

        {/* ── USERS ── */}
        <TabsContent value="users" className="space-y-4 mt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar usuário..." className="pl-9 bg-secondary border-border" value={searchUsers} onChange={e => setSearchUsers(e.target.value)} />
            </div>
            <div className="text-sm text-muted-foreground">{users.length} usuários</div>
          </div>
          {loadingUsers ? <p className="text-muted-foreground text-sm">Carregando...</p> : (
            <div className="glass-card rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Desde</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(u => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full gold-gradient flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                            {(u.full_name || "?").charAt(0)}
                          </div>
                          <p className="text-sm font-medium">{u.full_name || "Sem nome"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.specialty || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.location || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <Select value={u.role} onValueChange={v => handleRoleChange(u.id, v)}>
                          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="mentor">Mentor</SelectItem>
                            <SelectItem value="membro">Membro</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ── INSIGHTS ── */}
        <TabsContent value="insights" className="space-y-4 mt-4">
          {loadingInsights ? <p className="text-muted-foreground text-sm">Carregando...</p> : insights.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum insight encontrado.</p>
          ) : (
            <div className="glass-card rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {insights.map(i => (
                    <TableRow key={i.id}>
                      <TableCell className="text-sm font-medium">{i.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{i.tags.join(", ")}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(i.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditInsight(i)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteInsight(i.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <Dialog open={!!editInsight} onOpenChange={o => !o && setEditInsight(null)}>
            <DialogContent>
              <DialogHeader><DialogTitle>Editar Insight</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Título" value={insightForm.title} onChange={e => setInsightForm(f => ({ ...f, title: e.target.value }))} />
                <Textarea placeholder="Conteúdo" value={insightForm.content} onChange={e => setInsightForm(f => ({ ...f, content: e.target.value }))} rows={5} />
                <Input placeholder="Tags (separadas por vírgula)" value={insightForm.tags} onChange={e => setInsightForm(f => ({ ...f, tags: e.target.value }))} />
                <Button onClick={saveInsight} className="w-full gold-gradient text-primary-foreground">Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ── CASES ── */}
        <TabsContent value="cases" className="space-y-4 mt-4">
          {loadingCases ? <p className="text-muted-foreground text-sm">Carregando...</p> : cases.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum case encontrado.</p>
          ) : (
            <div className="glass-card rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="text-sm font-medium">{c.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.category || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditCase(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCase(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <Dialog open={!!editCase} onOpenChange={o => !o && setEditCase(null)}>
            <DialogContent>
              <DialogHeader><DialogTitle>Editar Case</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Título" value={caseForm.title} onChange={e => setCaseForm(f => ({ ...f, title: e.target.value }))} />
                <Input placeholder="Categoria" value={caseForm.category} onChange={e => setCaseForm(f => ({ ...f, category: e.target.value }))} />
                <Textarea placeholder="Contexto" value={caseForm.context} onChange={e => setCaseForm(f => ({ ...f, context: e.target.value }))} rows={3} />
                <Textarea placeholder="Resultado" value={caseForm.result} onChange={e => setCaseForm(f => ({ ...f, result: e.target.value }))} rows={2} />
                <Button onClick={saveCase} className="w-full gold-gradient text-primary-foreground">Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ── AGENTS ── */}
        <TabsContent value="agents" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">Agentes configurados na plataforma. A edição avançada será habilitada com integração de IA.</p>
          <div className="glass-card rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Estilo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm font-medium">{a.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{a.style}</TableCell>
                    <TableCell><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Ativo</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
