import { BookOpen, FileText, Video, Download } from "lucide-react";

const materials = [
  { title: "Manual de Leitura de Cenários Políticos", type: "PDF", icon: FileText, category: "Referência" },
  { title: "Masterclass: Narrativa em Campanhas", type: "Vídeo", icon: Video, category: "Aula" },
  { title: "Framework de Análise de Pesquisas", type: "PDF", icon: FileText, category: "Ferramenta" },
  { title: "Guia de Ground Game para Cidades Médias", type: "PDF", icon: FileText, category: "Guia" },
  { title: "Webinar: Dados e Decisão na Campanha", type: "Vídeo", icon: Video, category: "Aula" },
];

export default function Library() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Biblioteca</h1>
        <p className="text-muted-foreground mt-1">Materiais de referência para aprofundamento estratégico.</p>
      </div>

      <div className="space-y-3">
        {materials.map((m, i) => (
          <div key={i} className="glass-card rounded-lg p-4 flex items-center gap-4 hover:border-primary/20 transition-all cursor-pointer animate-fade-in group">
            <div className="p-2 rounded-md bg-primary/10">
              <m.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium group-hover:text-primary transition-colors">{m.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{m.type}</span>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded">{m.category}</span>
              </div>
            </div>
            <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
