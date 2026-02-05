## CHANGELOG (Thu Feb 05 2026 05/02/2026, 12:33:46 AM)

### 2026.02.02-e6a92d26 → 2026.02.05-f18a041f (releases) — Atualiza o monorepo com melhorias de sessão, organizações e API.

#### Updates
- Auth/* -> v0.3.0
- API/* -> v0.1.0-prerelease

#### ✨ Destaques
* Sessão do usuário expandida com edição de perfil, avatar com recorte e validações de nickname.
* Suporte completo a organizações: listar, criar, editar, ativar, excluir, sair e convidar membros.
* Novas rotas na API para busca de usuários e listagem de organizações por usuário.
* Novas traduções (`pt-br`, `en-us`, `es-es`) cobrindo sessão e organizações.

---

#### 🖥️ Auth / UI (Session)
* Novo layout da sessão com cabeçalho de perfil, status de verificação de e-mail e badge de admin.
* Edição de perfil com nome de exibição, nickname e checagem de disponibilidade.
* Upload de avatar com preview, recorte circular e salvamento.
* Busca de usuários com dropdown de resultados e visualização somente leitura de outros perfis.
* Ações rápidas: copiar ID do usuário e confirmação de logout.
* Organizações no front com seleção de ativa, edição de dados (nome/slug/logo) e estados de carregamento/erro.
* Convites: notificações com aceitar/recusar e formulário de convite por e-mail e cargo.

#### 🔌 Auth Client
* Cliente `better-auth` agora habilita plugins `username` e `organization`.

#### 🧩 API
* Validação de nickname no backend no padrão Discord: minúsculas, números, `_` e `.`, sem `..`, entre 2 e 32 caracteres.
* Plugin `organization` habilitado no `better-auth`.
* Nova rota `/users/search` com busca por nome, username e ID, com limites de resultado.
* Nova rota `/users/:id/organizations` para listar organizações e roles do usuário.
* `server.ts` registra `usersRoutes`.
* Versão do pacote `@arcstudio/api` ajustada para `0.1.0-prerelease`.

#### 🌍 i18n
* Novas chaves e mensagens para sessão, organizações, convites e feedbacks em `pt-br`, `en-us`, `es-es`.

---

#### ⚠️ Notas
* As regras de nickname agora seguem o padrão: minúsculas, números, `_` e `.`, sem `..`, entre 2 e 32 caracteres.
* A UI de organizações depende do plugin de organização habilitado no backend.
