import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProfileCard } from "@/components/ui/profile-card";
import { supabase } from "@/integrations/supabase/client";

interface Member {
  id: string;
  full_name: string | null;
  headline: string | null;
  specialty: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  role?: string;
}

const defaultAvatars = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=800&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=800&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop&auto=format&q=80",
];

export default function Network() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const roleMap = new Map(roles?.map((r: any) => [r.user_id, r.role]) ?? []);
      setMembers((profiles ?? []).map((p: any) => ({ ...p, role: roleMap.get(p.id) ?? "membro" })));
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const filtered = members.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (m.full_name?.toLowerCase().includes(q)) ||
      (m.specialty?.toLowerCase().includes(q)) ||
      (m.location?.toLowerCase().includes(q));
  });

  return (
    <div className="max-w-5xl space-y-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m, i) => (
            <ProfileCard
              key={m.id}
              name={m.full_name || "Sem nome"}
              description={m.headline || m.bio || undefined}
              image={m.avatar_url || defaultAvatars[i % defaultAvatars.length]}
              isVerified={m.role === "admin" || m.role === "mentor"}
              specialty={m.specialty || undefined}
              location={m.location || undefined}
              enableAnimations
              className="h-80"
              onClick={() => navigate(`/rede/${m.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
