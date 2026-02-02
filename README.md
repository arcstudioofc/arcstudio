<p align="center">
  <img src="https://github.com/arcstudioofc/.github/blob/main/profile/public/images/arcstudio.png" alt="ARC Studio Logo" style="border-radius: 16px;">
</p>

<p align="center">
  <strong>Onde grandes ideias ganham forma. Executamos seu projeto com a excelência que ele merece.</strong>
</p>

<p align="center">
  <a href="https://www.arcstudio.online/">
    <img src="https://img.shields.io/badge/Website-arcstudio.online-blue?style=for-the-badge&logo=googlechrome&color=b7bdf8&labelColor=302D41" />
  </a>
  <a href="https://instagram.com/arcstudio.oficial">
    <img src="https://img.shields.io/badge/Instagram-@arcstudio.oficial-purple?style=for-the-badge&logo=instagram&color=b7bdf8&labelColor=302D41" />
  </a>
</p>

<br>

## 🏛️ Sobre a ARC Studio

Bem-vindo ao repositório oficial da **ARC Studio**.  
Somos um estúdio criativo focado em transformar ideias em produtos digitais sólidos, escaláveis e bem executados. Cada projeto é tratado como único, do planejamento à entrega final.

Este repositório faz parte do **ecossistema ARC Studio**, estruturado como uma **monorepo** moderna, com foco em padronização, performance e evolução contínua.

---

## ✨ Serviços

- **Criação de Sites**  
  Websites modernos, responsivos e otimizados para negócios reais.

- **Desenvolvimento de Aplicativos**  
  Aplicações mobile personalizadas para iOS e Android.

- **Automação com Bots**  
  Bots inteligentes para atendimento, integrações e processos internos.

- **Desenvolvimento de Jogos**  
  Projetos completos, da concepção ao lançamento.

---

## 🧩 Arquitetura do Ecossistema

A ARC Studio funciona como um **ecossistema integrado**.  
É **obrigatório** que os três serviços principais estejam configurados e funcionando:

| Serviço | Porta | Descrição |
|------|------|---------|
| API | `localhost:3333` | Backend |
| Auth | `localhost:3000` | Autenticação |
| Web | `localhost:5117` | Frontend |

---

## 🛠️ Contribuição & Suporte para Desenvolvedores

Contribuições são bem-vindas, desde que sigam **rigorosamente** o padrão do projeto.

### 📌 Requisitos obrigatórios
- **Node.js:** `v24.*`
- **Gerenciador de pacotes:** `PNPM`
- Workspace baseada em **Turborepo**

Sem exceções.

---
### ⚠️ Versionamento do Projeto (OFICIAL)

O versionamento do `package.json` **na raiz do monorepo** segue um **formato baseado em data**, **não usando Semantic Versioning**.

---

#### 📦 Formato oficial

```json
"version": "YYYY.MM.DD-hash"
```

* **Exemplo:** `2026.02.02-4f5e6d7a`

---

### 📅 Padrão de data

* Ano.Mês.Dia → `YYYY.MM.DD`
* O **hash** é gerado no momento do build e garante que cada versão seja **única**

---

> [!WARNING]
> * Este padrão é **obrigatório**
> * Versionamentos fora desse formato **não serão aceitos**
> * A regra se aplica **apenas ao `package.json` da raiz**
> * Pré-releases e releases seguem o **mesmo padrão**
> * O changelog é **opcional** e será criado em `docs/changelog/<tipo>/<version>.md` quando solicitado

---

### 🔄 Atualização de Versão

Para atualizar a versão do root, use o script dedicado:

```bash
pnpm run update:version
```

#### Como funciona

1. O script pede uma **descrição da versão** (ex: `Correção de bugs`)
2. Pergunta o **tipo de release** (`release` ou `pre-release`) — ambos seguem o mesmo padrão de versão
3. Gera automaticamente uma **versão no formato `YYYY.MM.DD-HASH`**
4. Atualiza o `package.json` do root
5. Pergunta se você deseja **criar o changelog** (opcional)
6. Mostra no console a **versão antiga → nova** e o caminho do changelog, caso criado

#### Exemplo de saída

```text
Versão atualizada com sucesso!

Versão de build atualizada: 2026.01.02-a1b2c3d → 2026.02.02-4f5e6d7a
Changelog criado em: docs/changelog/release/2026.02.02-4f5e6d7a.md
```

---

### ⚙️ Observações

* Cada build gera um **hash único**, mesmo que não haja novos commits
* O fluxo garante **consistência do versionamento** e facilita rastreabilidade de builds

> [!IMPORTANT]
> **Quando deve ser usado?**  
> - Toda vez que for fazer um commit e enviar, **deve-se rodar primeiro `pnpm run update:version`**  
> - Se optar por criar o changelog, configure-o antes  
> - Depois de gerar a versão e (opcionalmente) o changelog, só então faça o commit e envie com segurança


---

### 🚀 Iniciando o projeto

1. Instale as dependências na raiz da monorepo:

```bash
pnpm install
```

2. Configure os arquivos de ambiente:

* `auth/.env.example` → criar `auth/.env.local`
* `api/.env.example` → criar:

  * `api/.env.local`
  * `api/.env.development.local`
* `web/.env.example` → criar `web/.env.local`

3. Build do projeto (recomendado globalmente):

```bash
pnpm build
```

4. Inicie todos os serviços:

```bash
pnpm start
```

O Turborepo cuidará da orquestração entre os pacotes.

---

### 🔄 Alterações e novos projetos

* Qualquer **nova pasta**, **novo serviço** ou **mudança estrutural**
  **deve obrigatoriamente** ser documentada no `CHANGELOG.md`.
* Siga as instruções descritas no próprio changelog para gerar novas entradas.

Mudança sem changelog não existe.

---

## 📞 Contato

* **🌐 Website:** [https://www.arcstudio.online](https://www.arcstudio.online)
* **📸 Instagram:** [https://instagram.com/arcstudio.oficial](https://instagram.com/arcstudio.oficial)
* **🐦 X (Twitter):** [https://twitter.com/arcstudio_ofc](https://twitter.com/arcstudio_ofc)
* **💼 Fundador:** [https://github.com/yeyTaken](https://github.com/yeyTaken)

<br>


<div style="text-align: center;">
<pre style="display: inline-block;">
          _____   _____    _____ _             _ _          _____              
    /\   |  __ \ / ____|  / ____| |           | (_)        |_   _|             
   /  \  | |__) | |      | (___ | |_ _   _  __| |_  ___      | |  _ __   ___   
  / /\ \ |  _  /| |       \___ \| __| | | |/ _` | |/ _ \     | | | '_ \ / __|  
 / ____ \| | \ \| |____   ____) | |_| |_| | (_| | | (_) |   _| |_| | | | (__ _ 
/_/    \_\_|  \_\\_____| |_____/ \__|\__,_|\__,_|_|\___( ) |_____|_| |_|\___(_)
                                                       |/                      
</pre>
</div>



<br>

<p align="center">
  <img src="https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/footers/gray0_ctp_on_line.svg?sanitize=true">
</p>

<p align="center">
  Copyright © 2025  
  <a href="https://github.com/yeyTaken" target="_blank">Israel R. Jatobá</a> &  
  <a href="https://www.arcstudio.online/" target="_blank">ARC Studio, Inc</a>
</p>

<p align="center">
  <a href="https://github.com/arcstudioofc/.github/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/arcstudioofc/.github?style=for-the-badge&logo=github&color=b7bdf8&labelColor=302D41" />
  </a>
</p>