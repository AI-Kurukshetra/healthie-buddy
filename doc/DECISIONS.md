# Architecture & Product Decisions

Format:
- `[YYYY-MM-DD] Decision: <summary>`
- `Rationale: <why>`
- `Impact: <what changes>`

- [2026-03-14] Decision: Start with documentation bootstrap before code implementation.
  Rationale: `AGENTS.md` requires `/doc` files as the project control plane.
  Impact: Future sessions can track scope, blockers, and progress consistently.

- [2026-03-14] Decision: Treat `requirements.pdf` as the initial hackathon blueprint source for MVP planning.
  Rationale: It defines features, priorities, data entities, and endpoint groups.
  Impact: `PRD.md` and `TASKS.md` are now aligned to that baseline and ready for refinement.

- [2026-03-14] Decision: Confirm MVP pilot institution type as a community college.
  Rationale: Community colleges provide a focused, lower-complexity launch environment with strong enrollment and academic workflow density, enabling quicker validation of core SIS value.
  Impact: `PRD.md` now sets community college as the MVP pilot baseline; scope and future extensibility remain aligned for later small university expansion.

- [2026-03-14] Decision: Use `npm` for project bootstrap in this session.
  Rationale: User explicitly requested `npm` instead of `pnpm` during initialization.
  Impact: Initial scaffold and lockfile are npm-based; can be migrated to `pnpm` later if required.

- [2026-03-14] Decision: Use a two-step, idempotent demo user seeding strategy for student/faculty accounts.
  Rationale: `auth.users` cannot be safely seeded from standard SQL migrations in this setup, while the app already has a working self-service registration path with role-aware profile creation.
  Impact: Demo accounts are created first via registration (fixed emails/passwords), then future seed SQL can upsert role-linked academic records by joining on those emails/IDs; this keeps auth and domain seeding stable for repeated demo resets.

- [2026-03-14] Decision: Render course catalog as an authenticated server component that joins sections->courses and derives enrollment counts from `enrollments`.
  Rationale: Catalog browsing is read-heavy and a natural fit for RSC, while deriving counts from live enrollment rows keeps capacity metadata current without denormalized counters.
  Impact: `app/(dashboard)/student/page.tsx` now serves as the MVP catalog view with timing, room, and seat availability metadata.

- [2026-03-14] Decision: Make registration role lookup self-healing by upserting expected role codes in `getRoleIdByCode`.
  Rationale: Registration should not fail when role seed migrations were not applied in a given environment.
  Impact: `app/(auth)/actions.ts` now ensures `student|faculty|admin` role rows exist before user profile insertion.

- [2026-03-14] Decision: Run role lookup after signup in registration flow to satisfy RLS-authenticated reads.
  Rationale: Looking up roles before signup executes under anon context and can fail even when role rows exist.
  Impact: `registerAction` now signs up first, then resolves role ID and continues existing profile inserts.

- [2026-03-14] Decision: Use server-only service-role fallback for registration provisioning operations.
  Rationale: Supabase `signUp` may return a user without an authenticated session in the same request, which breaks RLS-gated role/profile operations.
  Impact: Registration role lookup and profile inserts now use `lib/supabase/admin.ts` when `SUPABASE_SERVICE_ROLE_KEY` is set, eliminating session-timing failures.

- [2026-03-14] Decision: Introduce Playwright smoke coverage focused on auth pages and route-guard behavior.
  Rationale: Registration/login and route protection are current high-risk paths and were recently modified.
  Impact: `tests/e2e/routes.spec.ts` now validates unauth redirects and auth-page UX contracts on every `npm run test:e2e` run.

- [2026-03-14] Decision: Treat `app/forbidden.tsx` as a special Next boundary file, not a direct route path.
  Rationale: Visiting `/forbidden` renders 404 in this app router setup; assertions should reflect actual framework behavior.
  Impact: E2E checks now validate `/forbidden` as non-routable while still covering role-guard redirects separately.

- [2026-03-14] Decision: Redirect post-registration users to login when Supabase signup does not establish a session in-request.
  Rationale: Email-confirmation or provider behavior can produce successful signup without an active session, making immediate dashboard redirects unreliable.
  Impact: Registration now routes to `/login?registered=1` for no-session outcomes, while preserving `/dashboard` redirect when a session is present.

- [2026-03-14] Decision: Expose Supabase signup failure diagnostics during registration troubleshooting.
  Rationale: Generic `signup_failed` messaging hides root cause (for example disabled signup provider, captcha enforcement, or project-level auth restrictions).
  Impact: Register redirects now carry `error_code` and `error_message`, and the register page surfaces them for faster environment debugging.

- [2026-03-14] Decision: Implement prerequisite checks in `/api/enrollments` with schema auto-detection and graceful fallback.
  Rationale: Current schema does not define a canonical prerequisite model, but enrollment API must enforce prerequisites when they are present.
  Impact: Endpoint now checks prerequisites if detected in one of three supported shapes (`course_prerequisites`, `courses.prerequisite_course_id`, or `courses.prerequisite_course_ids`), and skips prerequisite enforcement when none are defined.

- [2026-03-14] Decision: Centralize enrollment API business rules and auth checks into reusable server modules.
  Rationale: `/api/enrollments` and `/api/enrollments/my` need consistent student RBAC and enrollment rule enforcement while reducing route-level duplication.
  Impact: Added `lib/api/auth.ts`, `lib/api/enrollments.ts`, and `lib/api/http.ts`, and updated API handlers to consume those shared modules.

- [2026-03-14] Decision: Introduce gradebook as separate tables linked to sections and students, without modifying enrollment tables.
  Rationale: Gradebook needs item-level assessment tracking and per-student scores while preserving existing enrollment model stability.
  Impact: Added `gradebook_items` and `gradebook_scores` with FK relations, unique `(item_id, student_id)` constraint, and RLS policies for faculty write access on taught sections plus student own-score reads.

- [2026-03-14] Decision: Gate auth-route middleware redirects on app-profile validity to avoid session/profile mismatch loops.
  Rationale: A valid Supabase auth session does not always guarantee a valid `users` + `roles` app profile; redirecting such sessions away from `/login` causes `/login` ↔ `/dashboard` loops.
  Impact: Middleware now redirects `/login` and `/register` to `/dashboard` only when role mapping is present, allowing broken-profile sessions to stay on auth pages and recover.

- [2026-03-14] Decision: Support batch score submission in `/api/gradebook/scores` while keeping single-score backward compatibility.
  Rationale: Faculty gradebook UX requires editing multiple cells before one submit action; preserving single-score input avoids breaking existing clients.
  Impact: `POST /api/gradebook/scores` now accepts either one score payload or `{ scores: [...] }`, and applies the same section ownership + enrollment checks per row.
