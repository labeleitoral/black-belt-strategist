

## Plano: Criação de Usuários pelo Admin + Onboarding no Primeiro Acesso

### Resumo

1. Admin pode criar usuários diretamente pelo painel (via Supabase Edge Function com service role key)
2. No primeiro login, o usuário é redirecionado para um fluxo de onboarding multi-step para preencher seus dados profissionais

---

### 1. Edge Function: `create-user`

Criar `supabase/functions/create-user/index.ts`:
- Recebe `{ email, password, full_name, role }` via POST
- Valida que o chamador é admin (verifica JWT + `has_role`)
- Usa `supabase.auth.admin.createUser()` com service role key para criar o usuário
- Insere o role na tabela `user_roles` se diferente de "membro"
- Retorna o ID do usuário criado

### 2. Botão "Criar Usuário" no Admin

Adicionar no tab "Usuários" do `Admin.tsx`:
- Botão "+ Novo Usuário" abre dialog com campos: nome, email, senha, role
- Chama a edge function `create-user`
- Atualiza a lista após sucesso

### 3. Flag de Onboarding no Banco

Migração SQL:
- Adicionar coluna `onboarding_completed boolean NOT NULL DEFAULT false` na tabela `profiles`
- O trigger `handle_new_user` já cria o profile com valores vazios, então o default `false` funciona automaticamente

### 4. Componente de Onboarding (`src/pages/Onboarding.tsx`)

Fluxo multi-step com 3-4 etapas:

**Step 1 - Boas-vindas + Foto e Nome**
- Upload de avatar
- Nome completo, headline

**Step 2 - Dados Profissionais**
- Especialidade, localização, área de atuação em marketing político
- Background acadêmico

**Step 3 - Redes Sociais e Contato**
- Instagram, LinkedIn, Facebook, X
- WhatsApp (opcional), portfólio

**Step 4 - Bio e Experiência**
- Biografia, resumo de experiência
- Botão "Concluir" que salva tudo e marca `onboarding_completed = true`

Design: progress bar no topo, transições suaves, estética premium Black Belt.

### 5. Redirecionamento no ProtectedRoute

Atualizar `ProtectedRoute.tsx`:
- Após confirmar sessão, buscar `profiles.onboarding_completed`
- Se `false`, redirecionar para `/onboarding`
- Adicionar rota `/onboarding` no `App.tsx`

### 6. Arquivos

| Arquivo | Ação |
|---------|------|
| `supabase/functions/create-user/index.ts` | Criar - edge function |
| `supabase/migrations/...` | Adicionar `onboarding_completed` |
| `src/pages/Onboarding.tsx` | Criar - fluxo multi-step |
| `src/pages/Admin.tsx` | Adicionar dialog "Criar Usuário" |
| `src/components/ProtectedRoute.tsx` | Verificar onboarding |
| `src/App.tsx` | Adicionar rota `/onboarding` |

