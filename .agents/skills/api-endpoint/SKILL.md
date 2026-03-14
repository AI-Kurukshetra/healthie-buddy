---
name: api-endpoint
description: >
  Use for implementing API routes, server actions, request validation, and data mutations.
  Triggers on: "create endpoint", "server action", "POST/PUT/DELETE route".
  Does NOT trigger for: pure UI styling or standalone schema migrations.
allow_implicit_invocation: true
---

# API Endpoint Skill

## Purpose
Build backend interfaces in `app/api/` and server actions with typed validation, RBAC checks, and clear error handling.

## Workflow
1. Review `/doc/PRD.md` and `/doc/TASKS.md` for scope.
2. Define request/response contracts and validation (prefer Zod).
3. Implement route/action with Supabase SSR server client.
4. Enforce role checks and ownership checks before mutations.
5. Return consistent status codes and machine-readable error messages.
6. Add/update tests where applicable.
7. Run lint/typecheck and document outputs in `/doc` logs.

## Guardrails
- Never expose service role keys to client code.
- Do not bypass RLS through insecure patterns.
- Keep business logic server-side.
