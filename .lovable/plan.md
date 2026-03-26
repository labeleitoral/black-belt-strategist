## Plano: Criação de Usuários pelo Admin + Onboarding no Primeiro Acesso

### Status: ✅ Implementado

### O que foi feito:

1. **Migração:** Adicionada coluna `onboarding_completed` (boolean, default false) na tabela `profiles`
2. **Edge Function `create-user`:** Admin cria usuários via service role key com validação JWT
3. **Página de Onboarding:** Fluxo multi-step (4 etapas: foto/nome, profissional, redes sociais, bio)
4. **ProtectedRoute:** Verifica `onboarding_completed` e redireciona para `/onboarding` se necessário
5. **Admin.tsx:** Botão "+ Novo Usuário" com dialog (nome, email, senha, role)
6. **App.tsx:** Rota `/onboarding` adicionada
