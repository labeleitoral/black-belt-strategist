import { FlaskConical, MessageSquare, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const posts = [
  {
    author: "Carlos Silva",
    time: "3h atrás",
    content: "Alguém mais percebeu uma mudança no tom dos discursos de pré-candidatos do interior de SP? Parece que o eleitor local está respondendo melhor a abordagens mais técnicas e menos emocionais. Alguma leitura sobre isso?",
    likes: 12,
    comments: 5,
  },
  {
    author: "Marina Oliveira",
    time: "8h atrás",
    content: "Compartilhando um framework que tenho usado para mapear stakeholders em campanhas estaduais. Ainda em fase de teste, mas os resultados iniciais são promissores. Quem tiver feedback, agradeço.",
    likes: 23,
    comments: 9,
  },
  {
    author: "Lucas Ferreira",
    time: "1d atrás",
    content: "Dados interessantes: nas últimas 3 eleições, candidatos que investiram mais de 40% do orçamento em digital tiveram performance 22% superior nos centros urbanos. Mas a correlação inverte em cidades abaixo de 50 mil habitantes.",
    likes: 45,
    comments: 18,
  },
];

export default function Lab() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Lab</h1>
          <p className="text-muted-foreground mt-1">Espaço aberto para troca, debate e construção de ideias.</p>
        </div>
        <Button className="gold-gradient text-primary-foreground" size="sm">
          Nova Publicação
        </Button>
      </div>

      <div className="space-y-4">
        {posts.map((post, i) => (
          <div key={i} className="glass-card rounded-lg p-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{post.author}</p>
                <p className="text-xs text-muted-foreground">{post.time}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-secondary-foreground">{post.content}</p>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Heart className="h-3 w-3" /> {post.likes}
              </button>
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                <MessageSquare className="h-3 w-3" /> {post.comments}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
