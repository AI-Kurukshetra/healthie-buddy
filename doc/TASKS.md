# Master Task List

Legend: `[ ]` todo, `[~]` in-progress, `[x]` done, `[!]` blocked

## 0. Documentation Bootstrap
- [x] (2026-03-14 10:04 IST) Create `/doc` folder and initialize required docs from `AGENTS.md`.
- [x] (2026-03-14 10:04 IST) Draft initial `PRD.md` from `requirements.pdf` blueprint.
- [x] (2026-03-14 10:04 IST) Create initial prioritized execution backlog.

## 1. Product Foundation
- [x] (2026-03-14 10:12 IST) Confirm MVP institution profile as community college and update PRD rationale.
- [x] (2026-03-14 10:16 IST) Refine MVP boundary to hackathon prototype with 5 flows and update acceptance intent in PRD.
- [x] (2026-03-14 10:17 IST) Define 3-milestone hackathon plan (M1/M2/M3) in `TASKS.md`.

## 2. Hackathon Milestones

### M1 – Authentication + role model
- [x] (2026-03-14 10:29 IST) Initialize Next.js 15 + TypeScript strict workspace (using npm per user instruction).
- [x] (2026-03-14 10:29 IST) Configure Supabase SSR auth plumbing and environment variable scaffolding.
- [x] (2026-03-14 10:37 IST) Design role model schema (roles/users + student/faculty mapping) and baseline authorization boundaries via RLS.
- [x] (2026-03-14 10:41 IST) Implement student/faculty/admin registration flow with Supabase auth + profile provisioning.
- [x] (2026-03-14 11:39 IST) Fix registration role/profile provisioning when signup does not yield an immediate authenticated session.
- [x] (2026-03-14 12:08 IST) Fix register redirect UX when signup succeeds without immediate session and surface auth form errors.
- [x] (2026-03-14 12:15 IST) Add actionable register signup failure diagnostics (Supabase error code/message) to UI.
- [x] (2026-03-14 13:08 IST) Fix auth-route redirect loop (`/login` ↔ `/dashboard`) when authenticated users lack valid app role/profile rows.
- [x] (2026-03-14 10:41 IST) Implement login/logout and session-based redirects.
- [x] (2026-03-14 10:41 IST) Implement RBAC guards for routes and server actions (`student`, `faculty`, `admin`).
- [x] (2026-03-14 10:50 IST) Define minimal demo data seed strategy for students and faculty users.
- [x] (2026-03-14 11:56 IST) Add and run Playwright smoke checks for auth pages and unauthenticated route guards.

### M2 – Enrollment system
- [x] (2026-03-14 10:37 IST) Design schema for courses, sections, and enrollments (term stored on sections).
- [x] (2026-03-14 10:37 IST) Write migration + RLS policies for enrollment access boundaries.
- [x] (2026-03-14 10:51 IST) Implement course catalog browsing with section timing/capacity metadata.
- [x] (2026-03-14 12:37 IST) Implement enrollment flow with prerequisite and schedule conflict checks.
- [x] (2026-03-14 12:49 IST) Implement endpoint groups for `/courses` and `/enrollments`.
- [ ] Add unit tests for enrollment conflict-check logic.

### M3 – Academic records + dashboards
- [x] (2026-03-14 10:37 IST) Design schema for grades and transcripts.
- [x] (2026-03-14 10:37 IST) Write migration + RLS policies for grades/transcript visibility.
- [x] (2026-03-14 12:53 IST) Introduce gradebook schema (`gradebook_items`, `gradebook_scores`) with RLS policies.
- [x] (2026-03-14 14:08 IST) Faculty gradebook entry and submission workflow.
- [x] (2026-03-14 14:25 IST) Student transcript view with GPA calculation.
- [x] (2026-03-14 14:25 IST) Build lightweight student dashboard (enrolled courses + GPA snapshot).
- [x] (2026-03-14 14:35 IST) Build lightweight faculty dashboard (assigned sections + grading queue).
- [x] (2026-03-14 14:50 IST) Implement endpoint groups for `/grades`, `/transcripts`, plus role-scoped `/students` and `/faculty`.
- [ ] Add unit tests for grade submission and GPA calculation.
- [ ] Add E2E tests for the 5 core journeys (register/login, browse, enroll conflict, grade submit, transcript/GPA).

## 3. Cross-Milestone Quality & Release
- [ ] Publish API contracts and validation schemas for all in-scope flows.
- [ ] Run lint/typecheck/test gates and fix issues.
- [ ] Prepare hackathon demo script and fallback paths.

## 4. Documentation Updates (as work completes)
- [ ] Keep `SCHEMA.md` updated with each migration and RLS policy.
- [ ] Log completed tasks in `PROGRESS.md` and significant changes in `CHANGELOG.md`.

## Blocked / Decisions Needed
- None.
