import { Brain, ArrowRight, Compass, BarChart3, PenTool, Target, Megaphone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const agents = [
  { id: "politica", name: "Leitura Política", icon: Compass, description: "Análise de cenários, correlações de força e movimentos políticos.", style: "Analítico e provocador" },
  { id: "dados", name: "Dados e Tendências", icon: BarChart3, description: "Interpretação de pesquisas, dados eleitorais e tendências sociais.", style: "Objetivo e questionador" },
  { id: "narrativa", name: "Narrativa", icon: PenTool, description: "Construção de discurso, posicionamento e arquitetura de mensagem.", style: "Reflexivo e desafiador" },
  { id: "estrategia", name: "Estratégia", icon: Target, description: "Planejamento de campanha, alocação de recursos e tomada de decisão.", style: "Estruturado e incisivo" },
  { id: "comunicacao", name: "Comunicação", icon: Megaphone, description: "Canais, formato, timing e gestão de crise na comunicação política.", style: "Prático e direto" },
];

const suggestedQuestions = [
  "Como avaliar a viabilidade de um candidato em cenário fragmentado?",
  "Quais indicadores antecipam mudança de voto em pesquisas?",
  "Como construir narrativa de renovação para candidato à reeleição?",
];

export default function Agents() {
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");

  const selectedAgent = agents.find((a) => a.id === selected);

  if (selected && selectedAgent) {
    return (
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Agent header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => { setSelected(null); setMessages([]); }} className="text-muted-foreground hover:text-foreground text-sm">
            ← Voltar
          </button>
          <div className="h-4 w-px bg-border" />
          <selectedAgent.icon className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-display font-semibold">{selectedAgent.name}</h2>
            <p className="text-xs text-muted-foreground">{selectedAgent.style}</p>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-auto space-y-4 mb-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <selectedAgent.icon className="h-12 w-12 text-primary/30" />
              <div>
                <p className="text-muted-foreground text-sm">
                  Inicie uma conversa com o agente de <span className="text-foreground">{selectedAgent.name}</span>.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  O agente não entrega respostas prontas — ele provoca, questiona e estrutura seu raciocínio.
                </p>
              </div>
              <div className="space-y-2 w-full max-w-md">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="w-full text-left text-sm p-3 rounded-md bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/30 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] p-3 rounded-lg text-sm ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "glass-card"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Faça uma pergunta estratégica..."
            className="bg-secondary border-border"
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                setMessages((m) => [...m, { role: "user", content: input }]);
                setInput("");
                setTimeout(() => {
                  setMessages((m) => [
                    ...m,
                    {
                      role: "assistant",
                      content: "Antes de responder, preciso entender melhor: qual é o contexto político específico que você está analisando? Qual o perfil do eleitorado e quais são as forças em jogo nesse cenário?",
                    },
                  ]);
                }, 1000);
              }
            }}
          />
          <Button
            className="gold-gradient text-primary-foreground"
            onClick={() => {
              if (input.trim()) {
                setMessages((m) => [...m, { role: "user", content: input }]);
                setInput("");
              }
            }}
          >
            Enviar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Hub de Insights</h1>
        <p className="text-muted-foreground mt-1">
          Agentes que provocam, questionam e estruturam seu pensamento estratégico.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setSelected(agent.id)}
            className="glass-card rounded-lg p-5 text-left hover:border-primary/30 transition-all group animate-fade-in"
          >
            <div className="flex items-start justify-between">
              <agent.icon className="h-6 w-6 text-primary" />
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-display font-semibold mt-3">{agent.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
            <p className="text-xs text-primary/70 mt-2">Estilo: {agent.style}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
