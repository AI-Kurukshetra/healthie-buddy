---
name: agent-browser
description: >
  Use for end-to-end browser testing, user-journey validation, and UI regression checks.
  Triggers on: "test flow", "run e2e", "verify UI journey".
  Does NOT trigger for: backend-only code without user-facing impact.
allow_implicit_invocation: true
---

# Agent Browser Skill

## Purpose
Validate critical user journeys through browser-driven E2E coverage and smoke tests.

## Workflow
1. Identify the changed user journeys from `/doc/TASKS.md` and recent diffs.
2. Run existing E2E tests (`npm run test:e2e` if configured).
3. Add/adjust Playwright specs in `tests/e2e/` for new flows.
4. Capture failing step details and likely root causes.
5. Re-run target specs after fixes.
6. Log test outcomes in `/doc/PROGRESS.md` and `/doc/CHANGELOG.md`.

## Guardrails
- Focus on high-risk critical paths first.
- Avoid brittle selectors; prefer semantic roles/test ids.
- Clearly report flaky behavior separately from deterministic failures.
