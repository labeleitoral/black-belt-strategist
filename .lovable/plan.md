

## Plano: Feed Profissional estilo LinkedIn na Home

### Resumo

Transformar a página inicial (`Index.tsx`) em um feed profissional com layout de 3 colunas (desktop) que colapsa para 1 coluna (mobile), inspirado no LinkedIn mas com a estética Black Belt (preto, dourado, glass, progressive blur).

### Layout

```text
Desktop (lg+):
┌──────────┬────────────────────┬──────────┐
│  Profile │      Feed          │ Sidebar  │
│  Card    │  Criar publicação  │ Members  │
│  (280px) │  Posts do feed     │ Insights │
│  + Nav   │  (insights+cases+  │ Agentes  │
│          │   posts_lab)       │          │
└──────────┴────────────────────┴──────────┘

Mobile:
┌──────────────────────┐
│ Mini profile banner  │
│ Criar publicação     │
│ Feed posts           │
│ (sidebar hidden)     │
└──────────────────────┘
```

### 1. Coluna Esquerda — Mini Profile Card

- Avatar do usuário logado com progressive blur de fundo
- Nome, headline, especialidade
- Gradient dourado na borda superior do card
- Links rápidos: Meu Perfil, Rede, Insights, Cases
- Esconde no mobile, substitui por um banner compacto horizontal

### 2. Coluna Central — Feed

**Composer (criar publicação):**
- Caixa "Compartilhe algo com a comunidade..." com avatar do user
- Botões: Insight, Case, Discussão (abrem links para criar ou dialog simples)
- Glass card com borda dourada sutil

**Feed unificado:**
- Buscar `insights`, `cases` e `posts_lab` do Supabase com join em `profiles`
- Unificar em array ordenado por `created_at` desc
- Cada post mostra: avatar do autor, nome, headline, tempo, conteúdo (truncado), tags/categoria, contagem de likes/comments
- Cards com glass-card style, hover com borda dourada
- Lazy load / limite inicial de 10 posts

### 3. Coluna Direita — Sidebar Widgets

- **Membros em destaque:** 3-4 perfis com avatar + nome + especialidade (link para /rede/:id)
- **Insights recentes:** top 3 insights resumidos
- **Agentes rápidos:** ícones dos 5 agentes com link para /agentes
- Glass cards empilhados
- Esconde no mobile (ou move abaixo do feed)

### 4. Estética Black Belt

- Progressive blur no topo do profile card (imagem de fundo com blur gradient)
- Gold gradient borders nos cards (`border-image: linear-gradient(...)`)
- Glass morphism via classe `glass-card` existente
- Animações `animate-fade-in` nos posts
- Cores: fundo `background`, cards `card`, destaques `primary` (dourado)

### 5. Responsividade

- `lg:grid-cols-[280px_1fr_280px]` → `md:grid-cols-[1fr_280px]` → `grid-cols-1`
- Profile card: card horizontal compacto no mobile
- Sidebar: esconde em telas < lg, conteúdo acessível via navegação
- Composer: largura total no mobile

### 6. Arquivos

| Arquivo | Ação |
|---------|------|
| `src/pages/Index.tsx` | Reescrever completamente com layout de feed |
| `src/components/feed/FeedComposer.tsx` | Criar — caixa de publicação |
| `src/components/feed/FeedPost.tsx` | Criar — card de post do feed |
| `src/components/feed/FeedSidebar.tsx` | Criar — widgets da coluna direita |
| `src/components/feed/FeedProfileCard.tsx` | Criar — card de perfil esquerdo |

### Detalhes Técnicos

- Feed unifica 3 tabelas: `insights` (type: "insight"), `cases` (type: "case"), `posts_lab` (type: "post")
- Cada tipo terá renderização ligeiramente diferente (cases mostram categoria, insights mostram tags)
- Busca com `Promise.all` + merge + sort por data
- Usa `useAuth()` para dados do perfil logado + busca complementar em `profiles`
- Sem migração de banco necessária — usa tabelas existentes

