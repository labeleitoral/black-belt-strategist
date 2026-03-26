import { useState, useEffect } from "react";
import { Shield, Search, Pencil, Trash2, Plus, ToggleLeft, ToggleRight, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

interface UserRow {
  id: string; full_name: string | null; email?: string; specialty: string | null;
  location: string | null; headline: string | null; bio: string | null; created_at: string; role: string;
}
interface InsightRow { id: string; title: string; content: string; tags: string[]; created_at: string; }
interface CaseRow {
  id: string; title: string; category: string; context: string; problem: string;
  strategy: string; execution: string; result: string; learnings: string; created_at: string;
}
interface AgentRow {
  id: string; name: string; description: string; style: string; image_url: string | null;
  icon: string; is_active: boolean; suggested_questions: string[]; created_at: string;
}

const roleLabels: Record<string, string> = { admin: "Admin", mentor: "Mentor", membro: "Membro" };

export default function Admin() {
  const { role: currentRole, user } = useAuth();
  const [tab, setTab] = useState("users");

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchUsers, setSearchUsers] = useState("");
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [userForm, setUserForm] = useState({ full_name: "", headline: "", specialty: "", location: "", bio: "" });
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ full_name: "", email: "", password: "", role: "membro" });
  const [creatingUser, setCreatingUser] = useState(false);

  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [editInsight, setEditInsight] = useState<InsightRow | null>(null);
  const [newInsight, setNewInsight] = useState(false);
  const [insightForm, setInsightForm] = useState({ title: "", content: "", tags: "" });

  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [editCase, setEditCase] = useState<CaseRow | null>(null);
  const [newCase, setNewCase] = useState(false);
  const [caseForm, setCaseForm] = useState({ title: "", category: "", context: "", problem: "", strategy: "", execution: "", result: "", learnings: "" });

  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [editAgent, setEditAgent] = useState<AgentRow | null>(null);
  const [newAgent, setNewAgent] = useState(false);
  const [agentForm, setAgentForm] = useState({ name: "", description: "", style: "", image_url: "", icon: "brain", suggested_questions: "" });

  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const roleMap = new Map(roles?.map((r: any) => [r.user_id, r.role]) ?? []);
    setUsers((profiles ?? []).map((p: any) => ({ ...p, role: roleMap.get(p.id) ?? "membro" })));
    setLoadingUsers(false);
  };
  const fetchInsights = async () => {
    const { data } = await supabase.from("insights").select("id, title, content, tags, created_at").order("created_at", { ascending: false });
    setInsights(data ?? []); setLoadingInsights(false);
  };
  const fetchCases = async () => {
    const { data } = await supabase.from("cases").select("*").order("created_at", { ascending: false });
    setCases(data ?? []); setLoadingCases(false);
  };
  const fetchAgents = async () => {
    const { data } = await supabase.from("agents").select("*").order("created_at", { ascending: false });
    setAgents(data ?? []); setLoadingAgents(false);
  };

  useEffect(() => { fetchUsers(); fetchInsights(); fetchCases(); fetchAgents(); }, []);

  if (currentRole !== "admin") return <Navigate to="/" replace />;

  // ── User handlers ──
  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("user_roles").update({ role: newRole as any }).eq("user_id", userId);
    if (error) { toast.error("Erro ao alterar role"); return; }
    toast.success(`Role alterado para ${roleLabels[newRole]}`);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };
  const openEditUser = (u: UserRow) => {
    setUserForm({ full_name: u.full_name || "", headline: u.headline || "", specialty: u.specialty || "", location: u.location || "", bio: u.bio || "" });
    setEditUser(u);
  };
  const saveUser = async () => {
    if (!editUser) return;
    const { error } = await supabase.from("profiles").update({
      full_name: userForm.full_name, headline: userForm.headline,
      specialty: userForm.specialty, location: userForm.location, bio: userForm.bio,
    }).eq("id", editUser.id);
    if (error) { toast.error("Erro ao salvar"); return; }
    toast.success("Usuário atualizado"); setEditUser(null); fetchUsers();
  };

  // ── Insight handlers ──
  const openEditInsight = (i: InsightRow) => {
    setInsightForm({ title: i.title, content: i.content, tags: i.tags.join(", ") }); setEditInsight(i);
  };
  const openNewInsight = () => {
    setInsightForm({ title: "", content: "", tags: "" }); setNewInsight(true);
  };
  const saveInsight = async () => {
    const tags = insightForm.tags.split(",").map(t => t.trim()).filter(Boolean);
    if (editInsight) {
      const { error } = await supabase.from("insights").update({ title: insightForm.title, content: insightForm.content, tags }).eq("id", editInsight.id);
      if (error) { toast.error("Erro ao salvar"); return; }
      toast.success("Insight atualizado"); setEditInsight(null);
    } else {
      const { error } = await supabase.from("insights").insert({ title: insightForm.title, content: insightForm.content, tags, author_id: user!.id });
      if (error) { toast.error("Erro ao criar"); return; }
      toast.success("Insight criado"); setNewInsight(false);
    }
    fetchInsights();
  };
  const deleteInsight = async (id: string) => {
    const { error } = await supabase.from("insights").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Insight excluído"); fetchInsights();
  };

  // ── Case handlers ──
  const openEditCase = (c: CaseRow) => {
    setCaseForm({ title: c.title, category: c.category, context: c.context, problem: c.problem, strategy: c.strategy, execution: c.execution, result: c.result, learnings: c.learnings });
    setEditCase(c);
  };
  const openNewCase = () => {
    setCaseForm({ title: "", category: "", context: "", problem: "", strategy: "", execution: "", result: "", learnings: "" }); setNewCase(true);
  };
  const saveCase = async () => {
    if (editCase) {
      const { error } = await supabase.from("cases").update(caseForm).eq("id", editCase.id);
      if (error) { toast.error("Erro ao salvar"); return; }
      toast.success("Case atualizado"); setEditCase(null);
    } else {
      const { error } = await supabase.from("cases").insert({ ...caseForm, author_id: user!.id });
      if (error) { toast.error("Erro ao criar"); return; }
      toast.success("Case criado"); setNewCase(false);
    }
    fetchCases();
  };
  const deleteCase = async (id: string) => {
    const { error } = await supabase.from("cases").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Case excluído"); fetchCases();
  };

  // ── Agent handlers ──
  const openEditAgent = (a: AgentRow) => {
    setAgentForm({ name: a.name, description: a.description, style: a.style, image_url: a.image_url || "", icon: a.icon, suggested_questions: a.suggested_questions.join("\n") });
    setEditAgent(a);
  };
  const openNewAgent = () => {
    setAgentForm({ name: "", description: "", style: "", image_url: "", icon: "brain", suggested_questions: "" }); setNewAgent(true);
  };
  const saveAgent = async () => {
    const questions = agentForm.suggested_questions.split("\n").map(q => q.trim()).filter(Boolean);
    const payload = { name: agentForm.name, description: agentForm.description, style: agentForm.style, image_url: agentForm.image_url || null, icon: agentForm.icon, suggested_questions: questions };
    if (editAgent) {
      const { error } = await supabase.from("agents").update(payload).eq("id", editAgent.id);
      if (error) { toast.error("Erro ao salvar"); return; }
      toast.success("Agente atualizado"); setEditAgent(null);
    } else {
      const { error } = await supabase.from("agents").insert(payload);
      if (error) { toast.error("Erro ao criar"); return; }
      toast.success("Agente criado"); setNewAgent(false);
    }
    fetchAgents();
  };
  const toggleAgent = async (a: AgentRow) => {
    const { error } = await supabase.from("agents").update({ is_active: !a.is_active }).eq("id", a.id);
    if (error) { toast.error("Erro ao alterar status"); return; }
    toast.success(a.is_active ? "Agente desativado" : "Agente ativado"); fetchAgents();
  };
  const deleteAgent = async (id: string) => {
    const { error } = await supabase.from("agents").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Agente excluído"); fetchAgents();
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
                    <TableHead className="w-16">Ações</TableHead>
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
                          <div>
                            <p className="text-sm font-medium">{u.full_name || "Sem nome"}</p>
                            <p className="text-xs text-muted-foreground">{u.email || ""}</p>
                          </div>
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
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditUser(u)}><Pencil className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <Dialog open={!!editUser} onOpenChange={o => !o && setEditUser(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Editar Usuário</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Nome</Label><Input value={userForm.full_name} onChange={e => setUserForm(f => ({ ...f, full_name: e.target.value }))} /></div>
                  <div><Label>Headline</Label><Input value={userForm.headline} onChange={e => setUserForm(f => ({ ...f, headline: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Especialidade</Label><Input value={userForm.specialty} onChange={e => setUserForm(f => ({ ...f, specialty: e.target.value }))} /></div>
                  <div><Label>Localização</Label><Input value={userForm.location} onChange={e => setUserForm(f => ({ ...f, location: e.target.value }))} /></div>
                </div>
                <div><Label>Bio</Label><Textarea value={userForm.bio} onChange={e => setUserForm(f => ({ ...f, bio: e.target.value }))} rows={3} /></div>
                <Button onClick={saveUser} className="w-full gold-gradient text-primary-foreground">Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ── INSIGHTS ── */}
        <TabsContent value="insights" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={openNewInsight} className="gold-gradient text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Novo Insight</Button>
          </div>
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
          <Dialog open={!!editInsight || newInsight} onOpenChange={o => { if (!o) { setEditInsight(null); setNewInsight(false); } }}>
            <DialogContent>
              <DialogHeader><DialogTitle>{editInsight ? "Editar Insight" : "Novo Insight"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Título</Label><Input value={insightForm.title} onChange={e => setInsightForm(f => ({ ...f, title: e.target.value }))} /></div>
                <div><Label>Conteúdo</Label><Textarea value={insightForm.content} onChange={e => setInsightForm(f => ({ ...f, content: e.target.value }))} rows={5} /></div>
                <div><Label>Tags (separadas por vírgula)</Label><Input value={insightForm.tags} onChange={e => setInsightForm(f => ({ ...f, tags: e.target.value }))} /></div>
                <Button onClick={saveInsight} className="w-full gold-gradient text-primary-foreground">Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ── CASES ── */}
        <TabsContent value="cases" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={openNewCase} className="gold-gradient text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Novo Case</Button>
          </div>
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
          <Dialog open={!!editCase || newCase} onOpenChange={o => { if (!o) { setEditCase(null); setNewCase(false); } }}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editCase ? "Editar Case" : "Novo Case"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Título</Label><Input value={caseForm.title} onChange={e => setCaseForm(f => ({ ...f, title: e.target.value }))} /></div>
                  <div><Label>Categoria</Label><Input value={caseForm.category} onChange={e => setCaseForm(f => ({ ...f, category: e.target.value }))} /></div>
                </div>
                <div><Label>Contexto</Label><Textarea value={caseForm.context} onChange={e => setCaseForm(f => ({ ...f, context: e.target.value }))} rows={2} /></div>
                <div><Label>Problema</Label><Textarea value={caseForm.problem} onChange={e => setCaseForm(f => ({ ...f, problem: e.target.value }))} rows={2} /></div>
                <div><Label>Estratégia</Label><Textarea value={caseForm.strategy} onChange={e => setCaseForm(f => ({ ...f, strategy: e.target.value }))} rows={2} /></div>
                <div><Label>Execução</Label><Textarea value={caseForm.execution} onChange={e => setCaseForm(f => ({ ...f, execution: e.target.value }))} rows={2} /></div>
                <div><Label>Resultado</Label><Textarea value={caseForm.result} onChange={e => setCaseForm(f => ({ ...f, result: e.target.value }))} rows={2} /></div>
                <div><Label>Aprendizados</Label><Textarea value={caseForm.learnings} onChange={e => setCaseForm(f => ({ ...f, learnings: e.target.value }))} rows={2} /></div>
                <Button onClick={saveCase} className="w-full gold-gradient text-primary-foreground">Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ── AGENTS ── */}
        <TabsContent value="agents" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={openNewAgent} className="gold-gradient text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Novo Agente</Button>
          </div>
          {loadingAgents ? <p className="text-muted-foreground text-sm">Carregando...</p> : (
            <div className="glass-card rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Estilo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-32">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="text-sm font-medium">{a.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{a.style}</TableCell>
                      <TableCell>
                        <button onClick={() => toggleAgent(a)} className="flex items-center gap-1.5">
                          {a.is_active ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                          <span className={`text-xs ${a.is_active ? "text-primary" : "text-muted-foreground"}`}>{a.is_active ? "Ativo" : "Inativo"}</span>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditAgent(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteAgent(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <Dialog open={!!editAgent || newAgent} onOpenChange={o => { if (!o) { setEditAgent(null); setNewAgent(false); } }}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editAgent ? "Editar Agente" : "Novo Agente"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Nome</Label><Input value={agentForm.name} onChange={e => setAgentForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div><Label>Ícone</Label>
                    <Select value={agentForm.icon} onValueChange={v => setAgentForm(f => ({ ...f, icon: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brain">Brain</SelectItem>
                        <SelectItem value="compass">Compass</SelectItem>
                        <SelectItem value="bar-chart-3">BarChart</SelectItem>
                        <SelectItem value="pen-tool">PenTool</SelectItem>
                        <SelectItem value="target">Target</SelectItem>
                        <SelectItem value="megaphone">Megaphone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Descrição</Label><Textarea value={agentForm.description} onChange={e => setAgentForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
                <div><Label>Estilo</Label><Input value={agentForm.style} onChange={e => setAgentForm(f => ({ ...f, style: e.target.value }))} /></div>
                <div><Label>URL da Imagem</Label><Input value={agentForm.image_url} onChange={e => setAgentForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." /></div>
                <div><Label>Perguntas Sugeridas (uma por linha)</Label><Textarea value={agentForm.suggested_questions} onChange={e => setAgentForm(f => ({ ...f, suggested_questions: e.target.value }))} rows={4} /></div>
                <Button onClick={saveAgent} className="w-full gold-gradient text-primary-foreground">Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
