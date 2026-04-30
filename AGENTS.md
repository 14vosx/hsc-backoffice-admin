# AGENTS.md — HSC Backoffice Admin

## Project context

This repository contains the HSC Backoffice Admin application.

Repository:

```text
hsc-backoffice-admin
```

Runtime stack:

```text
Angular 21
TypeScript
SCSS
Angular Router
Reactive/typed application services
Auth API integration through proxy
```

The application is an administrative SPA for HSC.

Current important areas:

```text
src/app/core/auth
src/app/core/config
src/app/core/guards
src/app/core/layout
src/app/features/auth
src/app/features/dashboard
src/app/features/error-pages
src/app/features/news
src/app/features/users
```

## Agent role

Codex should act as an implementation assistant for scoped frontend/admin tasks.

Codex may edit Angular components, services, guards, routes, tests, styles, and local documentation when the task is explicit.

Codex must not make product, architecture, authentication, RBAC, API contract, deployment, or infrastructure decisions independently.

## Local development

Install dependencies with:

```bash
npm ci
```

Run the local development server with API proxy:

```bash
npm run start:dev
```

The plain start command exists:

```bash
npm start
```

But for validating integration with the Auth API, prefer:

```bash
npm run start:dev
```

Build locally with:

```bash
npm run build
```

Run tests with:

```bash
npm test
```

## Proxy and API integration

The local proxy is configured in:

```text
proxy.conf.json
```

Do not change proxy behavior unless the task explicitly asks for it.

The Backoffice Admin consumes the HSC Auth API. Treat API contracts as external contracts.

Do not change or assume changes to Auth API routes, response shapes, auth/session semantics, or RBAC behavior without explicit approval.

If the UI task requires a backend contract change, stop and ask the human.

## Authentication and authorization rules

Authentication and access control are sensitive.

Do not change these areas without explicit task scope:

```text
src/app/core/auth/**
src/app/core/guards/**
src/app/core/config/api.config.ts
```

Allowed changes in these areas must be narrow and justified.

Do not independently change:

```text
magic link flow
session loading behavior
cookie/session assumptions
admin access guard semantics
role/RBAC assumptions
login/callback route behavior
```

If a task touches auth or access control, explain the risk and intended diff before editing.

## Allowed work

Codex may work on:

```text
Angular components
pages
feature-local services
data-access classes
SCSS
templates
routing updates with explicit scope
unit tests
small refactors
UX improvements
documentation updates
```

Good Codex tasks include:

```text
improve a table layout
create an admin form component
refactor duplicated template markup
add a loading or empty state
fix a build error
add tests for existing behavior
improve local UI validation
```

## Forbidden work without explicit approval

Do not perform or modify production-sensitive or repository-wide operations without explicit approval.

Forbidden by default:

```text
deployment changes
GitHub Actions changes
MCP configuration changes
VSCode task/launch changes
production URL changes
Auth API contract changes
RBAC policy changes
new dependencies
major Angular configuration changes
environment/secret handling changes
```

Do not modify these files unless the task explicitly asks for it:

```text
.vscode/**
angular.json
package.json
package-lock.json
proxy.conf.json
tsconfig*.json
```

Read-only review of those files is allowed when relevant.

## Secret and environment safety

This repository should not require local secret files for normal frontend development.

Do not create or commit:

```text
.env
.env.local
.env.production
src/environments/* with secrets
```

If configuration is required, use existing public configuration patterns and ask the human before introducing new environment files.

Never hardcode credentials, tokens, cookies, SMTP values, database URLs, or production secrets.

## Feature boundaries

Prefer working inside the relevant feature folder:

```text
src/app/features/news/**
src/app/features/users/**
src/app/features/dashboard/**
src/app/features/auth/**
```

Shared/core changes should be made only when reuse or architecture is already clear.

Do not move feature code into shared/core as a speculative abstraction.

## UX rules

The Backoffice Admin should prioritize clarity and operational safety.

Prefer:

```text
clear page titles
predictable forms
explicit loading states
explicit error states
confirmation for destructive actions
readable tables
simple navigation
visible save/publish/delete feedback
```

Avoid:

```text
overly decorative UI
ambiguous destructive actions
hidden errors
silent failures
large layout rewrites
generic dashboard clutter
```

## Validation

For code changes, run the most relevant local validation.

Baseline validation:

```bash
npm run build
```

For behavior changes with tests:

```bash
npm test
```

When validating API integration locally, use:

```bash
npm run start:dev
```

Always report:

```text
commands run
result
warnings/errors
git status --short
git diff --stat
```

## Git workflow

Work on a feature branch.

Before committing, verify:

```bash
git status --short
git diff --check
git diff --stat
```

Do not alter unrelated files.

Do not commit generated build artifacts such as:

```text
dist
.angular/cache
```

Prefer focused commits.

## Documentation

Repository-local documentation is limited.

Project-wide canonical documentation lives in the separate `hsc-docs` repository.

Do not assume access to `hsc-docs` from this workspace.

If context from `hsc-docs` is needed, ask the human to provide or open it.

## Implementation style

Use existing Angular patterns in this repository.

Prefer:

```text
standalone/signal-era Angular style when already used
feature-local data-access
small components
typed service methods
clear template conditions
SCSS scoped to component/page
```

Avoid broad rewrites.

Do not introduce global state or new dependencies without approval.

Do not convert large parts of the app to a new pattern unless explicitly requested.

## Stop and ask when

Stop and ask the human when the task involves:

```text
auth architecture
RBAC policy
session/cookie behavior
new backend endpoint
API contract changes
deployment
MCP configuration
VSCode workspace configuration
new dependencies
large Angular configuration changes
production URLs
secrets
```
