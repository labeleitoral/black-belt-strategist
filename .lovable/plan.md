

## Plano: Admin CRUD Completo

### Resumo
Tornar o painel admin totalmente funcional com criação, edição e exclusão de usuários, insights, cases e agentes. Criar tabela `agents` no banco e substituir dados estáticos.

### 1. Migração: Criar tabela `agents`

```sql
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

-- RLS: autenticados leem, admins gerenciam
```

### 2. Reescrever `Admin.tsx`

Adicionar para cada aba:

**Usuários:**
- Botao "Editar" abre dialog com: nome, email, especialidade, localização, headline, bio
- Update via `supabase.from("profiles").update(...)`
- Role change já funciona (manter)

**Insights:**
- Botão "+ Novo Insight" abre dialog de criação (título, conteúdo, tags)
- Insert com `author_id = user.id`
- Formulário de edição completo (já existe parcialmente, expandir)

**Cases:**
- Botão "+ Novo Case" com todos os campos: título, categoria, contexto, problema, estratégia, execução, resultado, aprendizados
- Formulário de edição com todos os campos (atual tem apenas 4 de 8)

**Agentes:**
- CRUD completo: criar, editar, excluir agentes
- Campos: nome, descrição, estilo, URL da imagem, ícone, perguntas sugeridas, status ativo/inativo
- Toggle de ativo/inativo

### 3. Atualizar `Agents.tsx`

- Buscar agentes do Supabase em vez de array estático
- Filtrar apenas `is_active = true`
- Usar `suggested_questions` do banco

### 4. Arquivos

| Arquivo | Ação |
|---------|------|
| `supabase/migrations/...` | Criar tabela `agents` + RLS |
| `src/pages/Admin.tsx` | Reescrever com CRUD completo |
| `src/pages/Agents.tsx` | Buscar do Supabase |
| `src/integrations/supabase/types.ts` | Auto-atualizado |

