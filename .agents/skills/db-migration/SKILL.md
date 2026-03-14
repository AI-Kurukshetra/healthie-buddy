---
name: db-migration
description: >
  Use for schema changes, new tables, constraints, indexes, and RLS policy updates.
  Triggers on: "create table", "migration", "RLS", "schema change".
  Does NOT trigger for: frontend-only styling or page layout work.
allow_implicit_invocation: true
---

# DB Migration Skill

## Purpose
Create and update Supabase SQL migrations in `supabase/migrations/` with safe schema design and RLS enabled by default.

## Workflow
1. Read `/doc/PRD.md`, `/doc/TASKS.md`, and `/doc/SCHEMA.md`.
2. Design schema with explicit PK/FK constraints, indexes, and check constraints.
3. Enable RLS on all new tables.
4. Add least-privilege policies for required roles and access paths.
5. Use timestamped migration files: `YYYYMMDDHHMMSS_name.sql`.
6. Document migration and policy updates in `/doc/SCHEMA.md`.
7. Add changelog/progress entries after changes.

## Guardrails
- Never disable RLS on production tables.
- Avoid destructive operations unless explicitly requested.
- Keep migrations idempotent where practical (`if exists` / `if not exists`).
