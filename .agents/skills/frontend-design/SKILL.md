---
name: frontend-design
description: >
  Use for any new UI page, component, layout, or styling iteration in the Next.js app.
  Triggers on: "build a page", "create a component", "style this", "redesign".
  Does NOT trigger for: API routes, database migrations, backend-only work.
allow_implicit_invocation: true
---

# Frontend Design Skill
- Always read doc/UI_GUIDELINES.md before generating UI.
- Follow these rules strictly.

## Purpose
Implement and refine frontend UI in `app/` and `components/` using Next.js App Router, Tailwind CSS v3, and shadcn/ui conventions.

## Workflow
1. Read `/doc/PRD.md`, `/doc/TASKS.md`, and relevant feature files before editing.
2. Prefer server components; use `'use client'` only for interactivity/browser APIs.
3. Build mobile-first responsive UI with Tailwind utilities.
4. Reuse shared components before creating new ones.
5. Include loading, empty, and error states for new screens.
6. Validate accessibility basics: semantic HTML, labels, keyboard navigation.
7. Run `npm run lint` and `npm run typecheck` after changes.
8. Log outputs in `/doc/PROGRESS.md` and `/doc/CHANGELOG.md`.

## Guardrails
- Do not modify database schema or migrations.
- Do not add API contracts here unless the request is explicitly mixed scope.
- Keep components concise; extract subcomponents when needed.
