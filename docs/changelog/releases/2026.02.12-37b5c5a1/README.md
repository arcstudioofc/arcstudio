## CHANGELOG (Thu Feb 12 2026 12/02/2026, 3:13:22 PM)

### 2026.02.07-2ab72fb9 → 2026.02.12-37b5c5a1 (releases) — i18n remoto e redesign completo dos switchers no auth/web

#### Updates
- `@arcstudio/i18n` -> `v1.0.0`
- `auth/*` -> integração total com i18n remoto + nova UX dos switchers
- `web/*` -> integração total com i18n remoto + nova UX dos switchers

---

## ✨ Destaques

- Novo pacote publicado `@arcstudio/i18n` com suporte a:
  - roteamento remoto de locales;
  - resolução de locale com fallback seguro;
  - carregamento de mensagens por escopo (`auth` e `web`);
  - labels de idiomas remotos para uso em UI.
- Migração completa de i18n no `auth` e no `web` para fonte remota, removendo dependência dos arquivos locais de mensagens.
- Redesign dos switchers de idioma e tema com HeroUI:
  - visual premium;
  - backdrop customizado no dropdown;
  - estados de seleção refinados;
  - melhor contraste e consistência entre light/dark.

---

## 🌍 i18n (Auth + Web)

- `routing.ts` agora usa `getRemoteRoutingConfig()` para carregar locales/defaultLocale dinamicamente.
- `request.ts` agora usa:
  - `resolveLocale(...)`;
  - `getScopedMessages({ scope: "auth" | "web" })`.
- Remoção dos arquivos locais de mensagens:
  - `auth/src/lib/i18n/message/{en-us,es-es,pt-br}.json`
  - `web/src/lib/i18n/message/{en-us,es-es,pt-br}.json`
- Dependências atualizadas para usar `@arcstudio/i18n` via `catalog:` (`auth` e `web`).

---

## 🎨 UI/UX — Switchers

### `auth`
- `LocaleSwitcher` totalmente redesenhado:
  - trigger em estilo pill;
  - indicador de locale com badge;
  - flags dinâmicas com fallback;
  - busca condicional para escala de idiomas;
  - dropdown com backdrop custom e animação refinada.
- `ThemeSwitcher` também redesenhado no mesmo padrão visual.
- Ajustes no header/session para remover wrappers e bordas redundantes ao redor do `ThemeSwitcher`.

### `web`
- `LocaleSwitcher` migrado para o mesmo padrão premium do auth, mantendo compatibilidade com Electron (`isElectronHeader`).
- `ThemeSwitcher` migrado para o mesmo padrão premium do auth, também preservando regras de renderização para Electron.
- Ajustes no Navbar para unificar uso do `ThemeSwitcher`.

---

## 🧩 Outros ajustes relevantes

- `auth/providers`: inclusão de footer com `LocaleSwitcher` e `ThemeSwitcher`.
- `auth/signin` e `auth/signup`: remoção de switchers duplicados internos aos cards.
- `packages/base/build.config.ts`: preset atualizado para `@arcstudio/config/build.preset`.
- `auth/src/lib/database/mongoose.ts`: removido do escopo atual.

---

## 🤝 Quer ajudar nas traduções?

Se quiser contribuir com a tradução do site/app:

1. Acesse o repositório: **https://github.com/arcstudioofc/arcstudio-i18n**
2. Siga as instruções do `README` do próprio repositório.
3. Envie sua contribuição via Pull Request.

Toda ajuda com revisão de termos, consistência e novos idiomas é muito bem-vinda.

**Authors:** @yeytaken