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
