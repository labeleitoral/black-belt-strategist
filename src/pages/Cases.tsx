import { Briefcase, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const cases = [
  {
    title: "Reposicionamento de candidato após crise de imagem",
    category: "Gestão de Crise",
    context: "Candidato a prefeito em cidade de 200 mil habitantes enfrentou crise após vazamento de áudio.",
    result: "Eleito no 2º turno com 54% dos votos.",
    comments: 14,
    author: "Carlos Silva",
  },
  {
    title: "Campanha digital com orçamento reduzido no interior",
    category: "Digital",
    context: "Candidato a vereador com R$5 mil de orçamento em cidade sem acesso amplo à internet.",
    result: "Segundo mais votado entre 42 candidatos.",
    comments: 8,
    author: "Ana Paula",
  },
  {
    title: "Construção de narrativa para candidata jovem e desconhecida",
    category: "Narrativa",
    context: "Primeira candidatura, sem base política familiar, em reduto dominado por políticos tradicionais.",
    result: "Eleita com narrativa de renovação e proximidade.",
    comments: 21,
    author: "Prof. Ricardo Mendes",
  },
];

export default function Cases() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Hub de Cases</h1>
          <p className="text-muted-foreground mt-1">
            Experiências reais que revelam o que funciona na prática.
          </p>
        </div>
        <Button className="gold-gradient text-primary-foreground" size="sm">
          Publicar Case
        </Button>
      </div>

      <div className="space-y-4">
        {cases.map((c, i) => (
          <div key={i} className="glass-card rounded-lg p-5 hover:border-primary/20 transition-all cursor-pointer animate-fade-in group">
            <div className="flex items-start justify-between">
              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{c.category}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-display font-semibold mt-3 group-hover:text-primary transition-colors">{c.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{c.context}</p>
            <div className="mt-3 p-3 rounded-md bg-primary/5 border border-primary/10">
              <p className="text-sm"><span className="text-primary font-medium">Resultado:</span> {c.result}</p>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground">{c.author}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" /> {c.comments} comentários
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
