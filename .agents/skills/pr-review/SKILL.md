---
name: pr-review
description: >
  Use when work is ready for review before merge/commit.
  Triggers on: explicit "$pr-review" invocation.
  Does NOT trigger implicitly.
allow_implicit_invocation: false
---

# PR Review Skill

## Purpose
Perform final review focused on correctness, regressions, type safety, security, and scope compliance.

## Workflow
1. Inspect changed files and map changes to `/doc/PRD.md` and `/doc/TASKS.md`.
2. Prioritize findings by severity: bugs, security gaps, regressions, missing validation/tests.
3. Verify RBAC/RLS and auth-sensitive paths when relevant.
4. Confirm lint/typecheck/tests status.
5. Summarize findings first, then open questions, then short change summary.
6. Add review entry to `/doc/CHANGELOG.md`.

## Guardrails
- Do not approve changes with unresolved high-severity findings.
- Prefer actionable fixes with file-level references.
