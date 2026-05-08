# hsc-backoffice-admin

Backoffice administrativo Angular do HSC para gestao de conteudo, usuarios, noticias, Seasons e operacoes internas.

## Papel no ecossistema HSC

O `hsc-backoffice-admin` e a SPA administrativa do HSC. Ele consome o `hsc-auth-api` e atende fluxos internos/admin relacionados a conteudo, usuarios, noticias, Seasons e operacoes de apoio.

Este repositorio nao e:

- o Portal CS2 player-facing;
- a Auth API;
- o ETL;
- o Brand Hub.

## Escopo

- Autenticacao/admin session;
- guards e acesso administrativo;
- dashboard administrativo;
- gestao de usuarios/admin;
- gestao de News;
- uploads de imagem de News;
- gestao de Seasons;
- upload de cover image de Seasons;
- resumo competitivo de Seasons;
- componentes compartilhados de feedback, confirmacao e input;
- integracao com Angular Material/design tokens.

## Fora de escopo

- Portal CS2 publico/player-facing;
- geracao da Static API v2;
- MatchZy/SQLite/ETL;
- Auth API backend;
- deploy de backend;
- configuracao de Nginx/DNS/TLS;
- decisoes de RBAC/API contract sem aprovacao.

## Estrutura principal

- `src/app/core/auth`: servicos, estado e fluxos de autenticacao da aplicacao administrativa.
- `src/app/core/config`: configuracoes centrais usadas pelo frontend.
- `src/app/core/guards`: guards de rota e acesso administrativo.
- `src/app/core/layout`: estrutura de layout da SPA administrativa.
- `src/app/core/theme`: base de tema, tokens e integracao visual.
- `src/app/features/auth`: telas e fluxos frontend de autenticacao.
- `src/app/features/dashboard`: dashboard administrativo.
- `src/app/features/news`: gestao de News e recursos relacionados.
- `src/app/features/seasons`: gestao de Seasons e informacoes competitivas.
- `src/app/features/users`: gestao de usuarios/admin.
- `src/app/shared/ui`: componentes compartilhados de interface e feedback.
- `proxy.conf.json`: proxy local usado pelo Angular CLI para integracao com APIs durante o desenvolvimento.
- `angular.json`: configuracao Angular CLI do projeto.
- `AGENTS.md`: regras operacionais para agentes trabalhando neste repositorio.

## Desenvolvimento local

Instale as dependencias:

```bash
npm ci
```

Rode o servidor local com proxy:

```bash
npm run start:dev
```

O comando `start:dev` usa `proxy.conf.json` e e o modo preferencial para validar a integracao com a Auth API. O comando `npm start` existe, mas nao e o comando preferencial para integracao real.

A aplicacao normalmente roda em `localhost:4200` quando servida pelo Angular CLI.

## Build

```bash
npm run build
```

O build deve passar antes de finalizar PRs. Warnings devem ser tratados, nao ignorados. Para mudancas comportamentais relevantes, avalie tambem rodar `npm test`.

## Testes

```bash
npm test
```

Os testes usam o Angular test runner/Vitest conforme a configuracao do projeto. Eles devem cobrir comportamento, nao detalhes frageis de implementacao.

## Integracao com Auth API

O proxy local fica em `proxy.conf.json`.

Os contratos de API pertencem ao `hsc-auth-api`. Se uma feature exigir mudanca de contrato, pare e decida explicitamente antes de alterar a UI. Auth, session, RBAC e admin guards sao areas sensiveis.

## Seguranca

- Nao commitar `.env`.
- Nao criar `src/environments` com segredos.
- Nao hardcodar tokens, cookies, credenciais, SMTP ou URLs sensiveis.
- Nao alterar auth/session/RBAC sem escopo explicito.
- Nao expor Admin APIs neste README.
- Respeitar `AGENTS.md`.

## UI e design

Angular Material e a base atual da UI administrativa.

Prefira clareza operacional, estados de loading/error/empty, feedback de salvar/publicar/deletar e confirmacao para acoes destrutivas. Evite decoracao excessiva e alteracoes grandes de layout sem escopo.

Dark mode/toggle de tema nao e prioridade atual; mantenha foco no tema light e nos tokens existentes.

## Relacao com outros repos

- `hsc-auth-api`: backend consumido pelo Backoffice.
- `hsc-cs2-portal`: portal publico/player-facing separado.
- `hsc-cs2-etl`: gera Static API v2, separado do Backoffice.
- `hsc-docs`: documentacao canonica.
- `hsc-brand-hub`: superficie publica de marca.

## Documentacao relacionada

Docs canonicas em `hsc-docs`:

- `docs/00-governance/hsc-repositories-map.md`
- `docs/05-backoffice-admin/backoffice-admin-architecture-runtime.md`
- `docs/05-backoffice-admin/backoffice-admin-frontend-structure.md`
- `docs/05-backoffice-admin/backoffice-admin-operational-runbooks.md`
- `docs/05-backoffice-admin/backoffice-ui-material-foundation.md`
- `docs/05-backoffice-admin/news-admin-api-contracts.md`
- `docs/05-backoffice-admin/news-admin-frontend-implementation-runtime.md`
- `docs/05-backoffice-admin/seasons-admin-list-functional-smoke-guide.md`

## Workflow

- Trabalhe em branch.
- Prefira PRs pequenos.
- Antes de finalizar:

```bash
git diff --check
git diff --stat
git status --short
npm run build
```

- Para comportamento/testes, rode `npm test` quando relevante.
- Nao faca deploy como parte de PR de README.
