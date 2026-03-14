---
name: new-session
description: >
  Use at the beginning of a new session to restore project context from /doc files.
  Triggers on: "$new-session" and session-start context refresh requests.
allow_implicit_invocation: true
---

# New Session Skill

## Purpose
Quickly rehydrate project state and continue execution from the next highest-priority unblocked task.

## Workflow
1. Read `/doc/TASKS.md`, `/doc/PROGRESS.md`, and `/doc/BLOCKERS.md` first.
2. Summarize:
   - last completed work
   - currently in-progress items
   - active blockers
3. Identify the next uncompleted, unblocked task.
4. State the immediate execution plan and proceed.
5. Keep summaries concise and action-oriented.

## Guardrails
- Do not start new work without checking blockers.
- If requirements are ambiguous, write blocker entry before proceeding.
