import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Brain, ArrowRight, Lightbulb } from "lucide-react";

interface MemberPreview {
  id: string;
  full_name: string | null;
  specialty: string | null;
  avatar_url: string | null;
}

interface InsightPreview {
  id: string;
  title: string;
  created_at: string;
}

export function FeedSidebar() {
  const [members, setMembers] = useState<MemberPreview[]>([]);
  const [insights, setInsights] = useState<InsightPreview[]>([]);
  const [agents, setAgents] = useState<{ id: string; name: string; icon: string }[]>([]);

  useEffect(() => {
    Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, specialty, avatar_url")
        .not("full_name", "is", null)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("insights")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("agents")
        .select("id, name, icon")
        .eq("is_active", true)
        .limit(5),
    ]).then(([membersRes, insightsRes, agentsRes]) => {
      if (membersRes.data) setMembers(membersRes.data);
      if (insightsRes.data) setInsights(insightsRes.data);
      if (agentsRes.data) setAgents(agentsRes.data);
    });
  }, []);

  const getInitials = (name: string | null) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <div className="hidden lg:flex flex-col gap-4 sticky top-6">
      {/* Featured Members */}
      <div className="glass-card rounded-xl p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-sm">Membros em Destaque</h3>
          <Link
            to="/rede"
            className="text-xs text-primary hover:underline flex items-center gap-0.5"
          >
            Ver todos <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {members.map((m) => (
            <Link
              key={m.id}
              to={`/rede/${m.id}`}
              className="flex items-center gap-2.5 group"
            >
              <Avatar className="h-8 w-8 border border-border group-hover:border-primary/30 transition-colors">
                <AvatarImage src={m.avatar_url || undefined} />
                <AvatarFallback className="bg-secondary text-primary text-xs font-bold">
                  {getInitials(m.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {m.full_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {m.specialty || "Membro"}
                </p>
              </div>
            </Link>
          ))}
          {members.length === 0 && (
            <p className="text-xs text-muted-foreground">Nenhum membro ainda.</p>
          )}
        </div>
      </div>

      {/* Recent Insights */}
      <div className="glass-card rounded-xl p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-sm">Insights Recentes</h3>
          <Link
            to="/insights"
            className="text-xs text-primary hover:underline flex items-center gap-0.5"
          >
            Ver todos <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-2.5">
          {insights.map((i) => (
            <div key={i.id} className="flex items-start gap-2">
              <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground line-clamp-2 hover:text-foreground transition-colors cursor-pointer">
                {i.title}
              </p>
            </div>
          ))}
          {insights.length === 0 && (
            <p className="text-xs text-muted-foreground">Nenhum insight ainda.</p>
          )}
        </div>
      </div>

      {/* Quick Agents */}
      <div className="glass-card rounded-xl p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-sm">Agentes IA</h3>
          <Link
            to="/agentes"
            className="text-xs text-primary hover:underline flex items-center gap-0.5"
          >
            Acessar <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {agents.map((a) => (
            <Link
              key={a.id}
              to="/agentes"
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
              title={a.name}
            >
              <Brain className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-muted-foreground text-center truncate w-full">
                {a.name.split(" ")[0]}
              </span>
            </Link>
          ))}
          {agents.length === 0 && (
            <p className="text-xs text-muted-foreground col-span-5">Nenhum agente.</p>
          )}
        </div>
      </div>
    </div>
  );
}
