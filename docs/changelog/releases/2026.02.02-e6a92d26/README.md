## CHANGELOG (Mon Feb 02 2026, 12:32 PM)

### 02.01.2026-beta.1 → 2026.02.02-e6a92d26 — Aprimoramento da root e versionamento

> [!IMPORTANT]
> Um novo **sistema de versionamento** foi implementado para o `@arcstudio/root`.
> Ele permite localizar a versão da source com mais facilidade e garantir consistência no ecossistema ARC Studio.
> Ao executar `pnpm build` globalmente, será exibido um formulário que **atualiza automaticamente a versão** no formato `YYYY.MM.DD-[build-hash]`.
> ![Captura de tela 2026-02-02 123228](./public/images/Captura%20de%20tela%202026-02-02%20123228.png)
> Isso mantém o ecossistema mais organizado e rastreável.

---

### Alterações em:

* `auth/*` → suporte UI/UIX para dispositivos de telas menores
* `scripts/*` → criação do **novo sistema de versionamento** ([open source](../../../../scripts/src/lib/version.ts))

---

## ⚠️ Versionamento do Projeto (OFICIAL)

O versionamento do `package.json` na raiz do monorepo segue **formato baseado em data** e **não usa Semantic Versioning**.

### 📦 Formato oficial

```json
"version": "YYYY.MM.DD-hash"
```

* **Exemplo:** `2026.02.02-4f5e6d7a`
* O **hash** é gerado no build e garante que cada versão seja **única**

> [!WARNING]
>
> * Padrão **obrigatório**
> * Versionamentos fora desse formato **não serão aceitos**
> * Aplica-se **apenas ao package.json da raiz**
> * Pré-releases e releases seguem o mesmo padrão
> * O changelog é **opcional**, criado em `docs/changelog/<tipo>/<version>.md` quando solicitado

---

### 🔄 Atualização de Versão

Use o script dedicado para atualizar o root:

```bash
pnpm run update:version
```

#### Fluxo do script

1. Solicita **descrição da versão** (ex: `Correção de bugs`)
2. Pergunta o **tipo de release** (`release` ou `pre-release`)
3. Gera automaticamente a **versão no formato `YYYY.MM.DD-HASH`**
4. Atualiza o `package.json` do root
5. Pergunta se deseja **criar o changelog** (opcional)
6. Mostra no console **versão antiga → nova** e o caminho do changelog, se criado

#### Exemplo de saída

```text
Versão atualizada com sucesso!

Versão de build atualizada: 2026.01.02-a1b2c3d → 2026.02.02-4f5e6d7a
Changelog criado em: docs/changelog/release/2026.02.02-4f5e6d7a.md
```

---

### ⚙️ Observações

* Cada build gera um **hash único**, mesmo sem novos commits
* O fluxo garante **consistência e rastreabilidade de builds**

> [!IMPORTANT] 
> #### **Uso recomendado:**
> * Sempre rode `pnpm run update:version` antes de enviar commits
> * Configure a criação do changelog, se necessário
> * Depois de gerar versão e changelog, faça commit e push com segurança


**Autor:** [Israel R. Jatobá](https://yeytaken.vercel.app/)
