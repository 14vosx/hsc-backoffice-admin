# HSC Backoffice Admin

SPA administrativa Angular do ecossistema HSC.

## Papel

O Backoffice é a interface autorizada para operações administrativas expostas pelo `hsc-auth-api`.

Domínios atuais incluem:

- conteúdo;
- News;
- Seasons;
- usuários/admin;
- PlayerAccounts;
- Membership management.

Ele não é:

- Auth API;
- Portal CS2;
- Match Room player-facing;
- ETL;
- servidor CS2.

## Stack

```text
Angular 22
TypeScript
Lego-oriented shared UI foundation
```

A aplicação já passou pela frente de upgrade/reestruturação para Angular 22 e pela evolução da fundação visual/arquitetural administrativa.

## Match Domain

O Backoffice **não está no caminho crítico atual** de:

```text
Portal Match Room
→ Draft/Veto
→ READY
→ PREPARED
→ JOINABLE
```

Não adicionar controles Match ao Backoffice sem necessidade operacional/admin concreta.

## Desenvolvimento

```bash
npm ci
npm run start:dev
```

## Validação

Usar os gates documentados no repositório e `git diff --check`.

## Fronteira de configuração

O frontend não deve carregar secrets ou credenciais de backend.

Integrações locais usam proxy quando aplicável.

## Segurança

- não logar cookies/tokens;
- não versionar secret;
- autorização real continua backend-side;
- guard/RBAC do frontend não substitui enforcement de API.