import { Lightbulb, Heart, MessageSquare, Bookmark, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const insights = [
  {
    title: "O eleitor pragmático: por que ideologia perdeu espaço nas urnas",
    author: "Prof. Ricardo Mendes",
    role: "Mentor",
    date: "22 Mar 2026",
    tags: ["Comportamento Eleitoral", "Análise"],
    likes: 34,
    comments: 12,
  },
  {
    title: "Três erros comuns na leitura de pesquisas municipais",
    author: "Análise Black Belt",
    role: "Equipe",
    date: "21 Mar 2026",
    tags: ["Dados", "Pesquisas"],
    likes: 28,
    comments: 7,
  },
  {
    title: "Narrativa de crise: como candidatos transformaram escândalos em capital político",
    author: "Marina Costa",
    role: "Membro",
    date: "20 Mar 2026",
    tags: ["Narrativa", "Gestão de Crise"],
    likes: 45,
    comments: 19,
  },
  {
    title: "Redes sociais em 2026: o que mudou no alcance orgânico para campanhas",
    author: "Lucas Ferreira",
    role: "Mentor",
    date: "19 Mar 2026",
    tags: ["Digital", "Comunicação"],
    likes: 22,
    comments: 5,
  },
];

const filters = ["Todos", "Análise", "Dados", "Narrativa", "Estratégia", "Digital"];

export default function Insights() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Central de Insights</h1>
          <p className="text-muted-foreground mt-1">
            Leituras que ajudam a tomar decisões melhores.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-3 w-3" /> Filtrar
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              f === "Todos"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {insights.map((insight, i) => (
          <div key={i} className="glass-card rounded-lg p-5 hover:border-primary/20 transition-all cursor-pointer animate-fade-in">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-semibold hover:text-primary transition-colors">
                  {insight.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">{insight.author}</span>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{insight.role}</span>
                  <span className="text-xs text-muted-foreground">· {insight.date}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  {insight.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <Bookmark className="h-4 w-4 text-muted-foreground hover:text-primary shrink-0 cursor-pointer" />
            </div>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Heart className="h-3 w-3" /> {insight.likes}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" /> {insight.comments}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
