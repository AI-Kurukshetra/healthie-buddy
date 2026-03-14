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
- [x] (2026-03-14 10:41 IST) Implement login/logout and session-based redirects.
- [x] (2026-03-14 10:41 IST) Implement RBAC guards for routes and server actions (`student`, `faculty`, `admin`).
- [x] (2026-03-14 10:50 IST) Define minimal demo data seed strategy for students and faculty users.

### M2 – Enrollment system
- [x] (2026-03-14 10:37 IST) Design schema for courses, sections, and enrollments (term stored on sections).
- [x] (2026-03-14 10:37 IST) Write migration + RLS policies for enrollment access boundaries.
- [x] (2026-03-14 10:51 IST) Implement course catalog browsing with section timing/capacity metadata.
- [ ] Implement enrollment flow with prerequisite and schedule conflict checks.
- [ ] Implement endpoint groups for `/courses` and `/enrollments`.
- [ ] Add unit tests for enrollment conflict-check logic.

### M3 – Academic records + dashboards
- [x] (2026-03-14 10:37 IST) Design schema for grades and transcripts.
- [x] (2026-03-14 10:37 IST) Write migration + RLS policies for grades/transcript visibility.
- [ ] Faculty grade entry and submission workflow.
- [ ] Student transcript view with GPA calculation.
- [ ] Build lightweight student dashboard (enrolled courses + GPA snapshot).
- [ ] Build lightweight faculty dashboard (assigned sections + grading queue).
- [ ] Implement endpoint groups for `/grades`, `/transcripts`, plus role-scoped `/students` and `/faculty`.
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
