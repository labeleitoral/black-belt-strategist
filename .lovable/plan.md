

## Plano: Perfil Profissional Completo + Página de Detalhe da Rede

### Resumo

Adicionar campos de redes sociais e WhatsApp ao perfil, criar página de edição de perfil, upload de avatar, e página de detalhe do membro com design premium (progressive blur, foto em destaque).

### 1. Migração de Banco de Dados

Adicionar colunas à tabela `profiles`:

- `instagram_url` (text, nullable)
- `facebook_url` (text, nullable)
- `linkedin_url` (text, nullable)
- `twitter_url` (text, nullable)
- `whatsapp_number` (text, nullable)
- `portfolio_url` (text, nullable)

Criar bucket de storage `avatars` (público) com RLS para upload pelo próprio usuário.

### 2. Página de Perfil/Edição (`/perfil`)

Formulário completo com:
- Upload de foto de perfil (Supabase Storage)
- Nome, headline, bio, currículo (textarea)
- Especialidade, localização, área de atuação em marketing político
- Background acadêmico, resumo de experiência
- Links: Instagram, Facebook, LinkedIn, X, portfólio
- WhatsApp (opcional)
- Botão salvar com update na tabela `profiles`

### 3. Página de Detalhe do Membro (`/rede/:id`)

Design premium com:
- Hero com foto do membro em tela cheia + progressive blur overlay
- Nome, headline, badge de verificação (admin/mentor)
- Bio completa, áreas de atuação, experiência
- Grid de links sociais com ícones (Instagram, Facebook, LinkedIn, X)
- Botão de WhatsApp (se disponível)
- Link de portfólio
- Currículo / background acadêmico

### 4. Atualização do ProfileCard e Network

- Tornar os cards clicáveis, navegando para `/rede/:id`
- Exibir headline no card em vez de descrição genérica
- Remover followers/following (não implementado) e substituir por especialidade + localização

### 5. Rota e Navegação

- Adicionar rota `/perfil` em `App.tsx`
- Adicionar rota `/rede/:id` em `App.tsx`
- Adicionar link "Meu Perfil" no dropdown do header

### Arquivos Modificados/Criados

| Arquivo | Ação |
|---------|------|
| `supabase/migrations/...` | Nova migração (colunas + storage bucket) |
| `src/pages/Profile.tsx` | Criar - formulário de edição de perfil |
| `src/pages/MemberDetail.tsx` | Criar - página de detalhe do membro |
| `src/pages/Network.tsx` | Editar - cards clicáveis com navigate |
| `src/components/ui/profile-card.tsx` | Editar - adicionar onClick, ajustar conteúdo |
| `src/App.tsx` | Editar - novas rotas |
| `src/components/AppHeader.tsx` | Editar - link "Meu Perfil" |

