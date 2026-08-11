# AGENTS.md — HSC Backoffice Admin

Este arquivo contém somente regras de execução para agentes de IA trabalhando neste repositório.

## Escopo do repositório

O `hsc-backoffice-admin` é a SPA administrativa Angular do HSC.

Não implementar aqui funcionalidades player-facing, backend da Auth API, ETL, infraestrutura ou deploy, salvo instrução explícita do humano responsável.

## Autoridade de contratos

- Trate tipos, interfaces, services e testes do frontend como contrato local de código.
- Trate a `hsc-auth-api` como autoridade dos contratos backend.
- Não invente nem replique rotas, payloads ou schemas em Markdown.
- Se uma tarefa exigir mudança de contrato backend, RBAC, sessão, cookie ou autenticação, pare antes de alterar a arquitetura e sinalize a dependência.

## Limites de alteração

Pode alterar, quando estiver dentro do escopo da tarefa:

- componentes e páginas Angular;
- services/data-access do frontend;
- guards e routing quando explicitamente necessários;
- templates e SCSS;
- testes;
- documentação local enxuta.

Não alterar sem escopo explícito:

- autenticação, sessão ou RBAC;
- contratos da Auth API;
- dependências;
- `angular.json`;
- `package.json` ou `package-lock.json`;
- `proxy.conf.json`;
- `tsconfig*.json`;
- CI/CD, deploy ou infraestrutura;
- tratamento de segredos e credenciais.

## Segurança

Nunca criar, registrar ou commitar valores reais de:

- tokens;
- cookies;
- chaves;
- senhas;
- credenciais;
- secrets de serviços externos.

Não hardcodar segredos no código, documentação ou arquivos de ambiente.

## Princípios de implementação

- Preserve os padrões Angular já usados no projeto.
- Prefira mudanças pequenas e feature-local.
- Não crie abstrações compartilhadas especulativas.
- Não introduza novas dependências sem aprovação.
- Não altere arquivos não relacionados à tarefa.
- Para ações destrutivas na UI, preserve confirmação e feedback explícito.
- Mantenha estados de loading, erro e vazio quando aplicáveis.

## Validação

Antes de concluir mudanças de código, execute os checks relevantes disponíveis no projeto:

```bash
npm test
npm run build
git diff --check
git status --short
```

Não existe script de lint canônico no `package.json` atual; não invente um comando de lint.

Reporte ao final:

- arquivos alterados;
- validações executadas;
- falhas ou warnings relevantes;
- alterações não relacionadas detectadas no working tree.

## Documentação

A documentação local segue estratégia **Zero Bloat**:

- `README.md`: onboarding humano;
- `docs/setup.md`: operação local;
- `docs/domain.md`: papel funcional;
- `docs/adr/`: decisões arquiteturais imutáveis.

Não criar changelogs narrativos, documentação por PR/commit/release ou cópias manuais de contratos de API.
