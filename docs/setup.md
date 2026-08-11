# Setup — HSC Backoffice Admin

Guia operacional para executar e validar o Backoffice localmente.

## Pré-requisitos

- Node.js compatível com Angular 22; o ambiente de desenvolvimento do projeto usa Node.js `22.22.3`.
- npm `10.9.4` recomendado pelo `packageManager` do projeto.
- Acesso a uma instância da `hsc-auth-api` quando a tarefa exigir integração real.

O Angular CLI global não é obrigatório. Os comandos podem usar o CLI instalado no próprio projeto.

## Instalação

```bash
npm ci
```

## Desenvolvimento local

### Frontend sem proxy

```bash
npm start
```

Equivalente ao `ng serve` local do projeto.

### Frontend integrado à Auth API local

Suba a `hsc-auth-api` localmente conforme as instruções do repositório backend e execute:

```bash
npm run start:dev
```

Esse é o fluxo canônico de integração local. O Angular CLI usa `proxy.conf.json`, cuja configuração atual aponta para a Auth API local.

## Integração com staging

O frontend não possui atualmente um sistema versionado de `.env` para selecionar a base da Auth API.

Para testar contra staging, use uma configuração de proxy local derivada de `proxy.conf.json` e altere somente o `target` para a URL de staging aprovada. Mantenha essa configuração fora do versionamento e inicie o Angular CLI apontando explicitamente para ela:

```bash
npx ng serve --proxy-config <arquivo-de-proxy-local>
```

Não altere URLs de produção ou políticas de proxy como efeito colateral de uma tarefa de frontend.

## Variáveis e perfis de ambiente

No estado atual:

- não há `.env.local` consumido pela aplicação;
- não há `src/environments` para configuração de API;
- em localhost, a aplicação usa base relativa e delega a resolução ao proxy;
- fora de localhost, a configuração pública de API é definida pelo código do frontend.

Os perfis de build Angular disponíveis são `development` e `production`, conforme `angular.json`.

Build de desenvolvimento:

```bash
npx ng build --configuration development
```

Build padrão de produção:

```bash
npm run build
```

Não introduza variáveis de build, arquivos de environment ou secrets sem uma decisão arquitetural explícita.

## Validação local

Testes:

```bash
npm test
```

Build:

```bash
npm run build
```

Validação Git complementar:

```bash
git diff --check
git status --short
```

O `package.json` atual não define script de lint. Portanto, não existe comando canônico de lint a documentar neste momento.

## Troubleshooting mínimo

Se a UI subir mas chamadas integradas falharem:

1. confirme que a `hsc-auth-api` escolhida está em execução e acessível;
2. confirme que o Angular foi iniciado com o proxy apropriado;
3. verifique erros do navegador e do terminal do dev server;
4. não contorne falhas de autenticação, sessão ou RBAC alterando contratos no frontend.
