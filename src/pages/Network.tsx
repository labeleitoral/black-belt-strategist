import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

const members = [
  { name: "Carlos Silva", role: "Estrategista", location: "São Paulo, SP", specialties: ["Campanhas Municipais", "Gestão de Crise"] },
  { name: "Ana Paula Costa", role: "Consultora", location: "Belo Horizonte, MG", specialties: ["Digital", "Redes Sociais"] },
  { name: "Prof. Ricardo Mendes", role: "Mentor", location: "Brasília, DF", specialties: ["Análise Política", "Pesquisas"] },
  { name: "Marina Oliveira", role: "Diretora de Campanha", location: "Recife, PE", specialties: ["Narrativa", "Ground Game"] },
  { name: "Lucas Ferreira", role: "Analista de Dados", location: "Curitiba, PR", specialties: ["Dados Eleitorais", "Tendências"] },
  { name: "Juliana Souza", role: "Comunicadora", location: "Porto Alegre, RS", specialties: ["Comunicação", "TV e Rádio"] },
];

export default function Network() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Rede de Membros</h1>
        <p className="text-muted-foreground mt-1">Networking qualificado entre estrategistas.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, especialidade ou localização..." className="pl-9 bg-secondary border-border" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((m, i) => (
          <div key={i} className="glass-card rounded-lg p-5 hover:border-primary/20 transition-all cursor-pointer animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                {m.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm">{m.name}</h3>
                <p className="text-xs text-primary">{m.role}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" /> {m.location}
                </p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {m.specialties.map((s) => (
                    <span key={s} className="text-xs bg-secondary px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
