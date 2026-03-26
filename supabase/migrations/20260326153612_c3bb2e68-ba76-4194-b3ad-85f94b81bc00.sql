
CREATE TABLE public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  style text NOT NULL DEFAULT '',
  image_url text,
  icon text NOT NULL DEFAULT 'brain',
  is_active boolean NOT NULL DEFAULT true,
  suggested_questions text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active agents"
  ON public.agents FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can insert agents"
  ON public.agents FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update agents"
  ON public.agents FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete agents"
  ON public.agents FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed default agents
INSERT INTO public.agents (name, description, style, image_url, icon, suggested_questions) VALUES
  ('Leitura Política', 'Análise de cenários, correlações de força e movimentos políticos.', 'Analítico e provocador', 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=500&fit=crop&auto=format&q=80', 'compass', ARRAY['Como avaliar a viabilidade de um candidato em cenário fragmentado?', 'Quais são os principais movimentos políticos do momento?', 'Como mapear correlações de força em um cenário eleitoral?']),
  ('Dados e Tendências', 'Interpretação de pesquisas, dados eleitorais e tendências sociais.', 'Objetivo e questionador', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop&auto=format&q=80', 'bar-chart-3', ARRAY['Quais indicadores antecipam mudança de voto em pesquisas?', 'Como interpretar margem de erro em pesquisas eleitorais?', 'Quais tendências sociais impactam o comportamento eleitoral?']),
  ('Narrativa', 'Construção de discurso, posicionamento e arquitetura de mensagem.', 'Reflexivo e desafiador', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=500&fit=crop&auto=format&q=80', 'pen-tool', ARRAY['Como construir narrativa de renovação para candidato à reeleição?', 'Qual a melhor estrutura de discurso para debate?', 'Como posicionar um candidato novo no cenário político?']),
  ('Estratégia', 'Planejamento de campanha, alocação de recursos e tomada de decisão.', 'Estruturado e incisivo', 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=500&fit=crop&auto=format&q=80', 'target', ARRAY['Como alocar recursos em campanha com orçamento limitado?', 'Qual a melhor estratégia para segundo turno?', 'Como priorizar ações em campanha de curto prazo?']),
  ('Comunicação', 'Canais, formato, timing e gestão de crise na comunicação política.', 'Prático e direto', 'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800&h=500&fit=crop&auto=format&q=80', 'megaphone', ARRAY['Como gerenciar uma crise de comunicação política?', 'Qual o melhor timing para lançar uma campanha?', 'Como escolher os canais certos para cada público?']);
