import { useState, useEffect } from "react";
import { Brain, Lightbulb, Briefcase, Users, ArrowRight, MessageSquare } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface RecentInsight {
  id: string;
  title: string;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

interface ActiveCase {
  id: string;
  title: string;
  category: string;
  comments_count: number;
}

export default function Dashboard() {
  const [insights, setInsights] = useState<RecentInsight[]>([]);
  const [cases, setCases] = useState<ActiveCase[]>([]);
  const [stats, setStats] = useState({ insights: 0, cases: 0, members: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [insightsRes, casesRes, profilesCount] = await Promise.all([
        supabase.from("insights").select("id, title, created_at, profiles(full_name)").order("created_at", { ascending: false }).limit(3),
        supabase.from("cases").select("id, title, category, comments_count").order("created_at", { ascending: false }).limit(3),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      if (insightsRes.data) setInsights(insightsRes.data as any);
      if (casesRes.data) setCases(casesRes.data as any);
      setStats({
        insights: insightsRes.data?.length ?? 0,
        cases: casesRes.data?.length ?? 0,
        members: profilesCount.count ?? 0,
      });
    };
    fetch();
  }, []);

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return "agora";
    if (hrs < 24) return `${hrs}h atrás`;
    return `${Math.floor(hrs / 24)}d atrás`;
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-display font-bold">
          Bem-vindo à <span className="gold-text">Comunidade Black Belt</span>
        </h1>
        <p className="text-muted-foreground mt-1">Seu ambiente de inteligência política e estratégia.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Insights" value={String(stats.insights)} icon={Lightbulb} description="publicados" />
        <StatCard title="Cases" value={String(stats.cases)} icon={Briefcase} description="compartilhados" />
        <StatCard title="Membros" value={String(stats.members)} icon={Users} description="na rede" />
        <StatCard title="Agentes" value="5" icon={Brain} description="prontos para interação" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-lg p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Insights Recentes</h2>
            <Link to="/insights" className="text-sm text-primary hover:underline flex items-center gap-1">Ver todos <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-4">
            {insights.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum insight ainda.</p>
            ) : insights.map(i => (
              <div key={i.id} className="flex items-start gap-3 group cursor-pointer">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">{i.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{i.profiles?.full_name || "Anônimo"} · {timeAgo(i.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-lg p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Cases em Alta</h2>
            <Link to="/cases" className="text-sm text-primary hover:underline flex items-center gap-1">Ver todos <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-4">
            {cases.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum case ainda.</p>
            ) : cases.map(c => (
              <div key={c.id} className="p-3 rounded-md bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                <p className="text-sm font-medium">{c.title}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{c.category || "Geral"}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {c.comments_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-lg p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">Agentes de Insight</h2>
          <Link to="/agentes" className="text-sm text-primary hover:underline flex items-center gap-1">Acessar Hub <ArrowRight className="h-3 w-3" /></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {["Leitura Política", "Dados e Tendências", "Narrativa", "Estratégia", "Comunicação"].map(agent => (
            <Link key={agent} to="/agentes" className="p-4 rounded-md bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/30 transition-all text-center group">
              <Brain className="h-5 w-5 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium">{agent}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
