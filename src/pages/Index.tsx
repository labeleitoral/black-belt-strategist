import { Brain, Lightbulb, Briefcase, Users, ArrowRight, TrendingUp, MessageSquare } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Link } from "react-router-dom";

const recentInsights = [
  { title: "Polarização e o papel da narrativa local nas eleições 2026", author: "Prof. Ricardo Mendes", time: "2h atrás" },
  { title: "Dados indicam mudança no comportamento do eleitor jovem", author: "Análise Black Belt", time: "5h atrás" },
  { title: "Estratégia de ground game: o que funciona em cidades médias", author: "Ana Carolina", time: "1d atrás" },
];

const activeCases = [
  { title: "Reposicionamento de candidato após crise de imagem", category: "Gestão de Crise", comments: 14 },
  { title: "Campanha digital com orçamento reduzido no interior", category: "Digital", comments: 8 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-display font-bold">
          Bem-vindo à <span className="gold-text">Comunidade Black Belt</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Seu ambiente de inteligência política e estratégia.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Insights" value="147" icon={Lightbulb} description="12 novos esta semana" />
        <StatCard title="Cases" value="43" icon={Briefcase} description="3 em discussão" />
        <StatCard title="Membros" value="234" icon={Users} description="Rede ativa" />
        <StatCard title="Agentes" value="5" icon={Brain} description="Prontos para interação" />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Insights */}
        <div className="glass-card rounded-lg p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Insights Recentes</h2>
            <Link to="/insights" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 group cursor-pointer">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                    {insight.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {insight.author} · {insight.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Cases */}
        <div className="glass-card rounded-lg p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Cases em Alta</h2>
            <Link to="/cases" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {activeCases.map((c, i) => (
              <div key={i} className="p-3 rounded-md bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                <p className="text-sm font-medium">{c.title}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{c.category}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> {c.comments}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access Agents */}
      <div className="glass-card rounded-lg p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">Agentes de Insight</h2>
          <Link to="/agentes" className="text-sm text-primary hover:underline flex items-center gap-1">
            Acessar Hub <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {["Leitura Política", "Dados e Tendências", "Narrativa", "Estratégia", "Comunicação"].map((agent) => (
            <Link
              key={agent}
              to="/agentes"
              className="p-4 rounded-md bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/30 transition-all text-center group"
            >
              <Brain className="h-5 w-5 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium">{agent}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
