# HSC Backoffice Admin

Aplicação web administrativa do ecossistema HSC, construída em Angular. O Backoffice concentra operações internas de conteúdo, usuários, Seasons, contas/perfis de jogadores e outras rotinas administrativas autorizadas.

Este repositório contém somente a SPA administrativa. Ele **não** é a `hsc-auth-api`, não é o Portal público/player-facing e não é o ETL do CS2.

## Desenvolvimento local

### Pré-requisitos

- Node.js `22.22.3` ou superior dentro da linha suportada pelo Angular 22.
- npm `10.9.4` recomendado pelo `packageManager` do projeto.
- Angular CLI global não é obrigatório; o CLI do projeto é instalado por `npm ci`.

### Instalação

```bash
npm ci
```

O projeto não consome `.env.local` no estado atual. A integração local com a Auth API é feita pelo proxy do Angular CLI.

Para subir a aplicação sem proxy:

```bash
npm start
```

Para desenvolvimento integrado com a `hsc-auth-api` local, use o comando canônico:

```bash
npm run start:dev
```

Também é possível usar diretamente o CLI local:

```bash
npx ng serve
```

Consulte [`docs/setup.md`](docs/setup.md) para o fluxo completo de ambiente local, staging e validação.

## Variáveis de ambiente

| NOME_DA_VAR | DESCRIÇÃO |
| --- | --- |
| — | O frontend não consome variáveis de ambiente de build atualmente; configuração local de API é feita por proxy. |

Nunca registre segredos, cookies, tokens ou chaves em arquivos versionados de configuração ou documentação.

## Links úteis

- [Setup operacional](docs/setup.md)
- [Guia funcional e domínio](docs/domain.md)
- [Template de ADR](docs/adr/0001-template.md)
- [Regras para agentes de IA](AGENTS.md)
