import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface Member {
  id: string;
  full_name: string | null;
  specialty: string | null;
  location: string | null;
  bio: string | null;
  role?: string;
}

const roleLabels: Record<string, string> = { admin: "Admin", mentor: "Mentor", membro: "Membro" };

export default function Network() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const roleMap = new Map(roles?.map((r: any) => [r.user_id, r.role]) ?? []);
      setMembers((profiles ?? []).map((p: any) => ({ ...p, role: roleMap.get(p.id) ?? "membro" })));
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = members.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (m.full_name?.toLowerCase().includes(q)) ||
      (m.specialty?.toLowerCase().includes(q)) ||
      (m.location?.toLowerCase().includes(q));
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Rede de Membros</h1>
        <p className="text-muted-foreground mt-1">Networking qualificado entre estrategistas.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, especialidade ou localização..." className="pl-9 bg-secondary border-border" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum membro encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(m => (
            <div key={m.id} className="glass-card rounded-lg p-5 hover:border-primary/20 transition-all cursor-pointer animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                  {(m.full_name || "?").charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm">{m.full_name || "Sem nome"}</h3>
                  <p className="text-xs text-primary">{roleLabels[m.role ?? "membro"]}</p>
                  {m.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {m.location}
                    </p>
                  )}
                  {m.specialty && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded">{m.specialty}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
