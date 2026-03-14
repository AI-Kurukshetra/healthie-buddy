# Database Schema & RLS Log

## Status
- Initial core migration created for hackathon MVP schema.

## Active Schema (Hackathon MVP)

### `roles`
- `id uuid` PK
- `code text` unique
- `name text`
- `created_at timestamptz`

### `users` (app users mapped to `auth.users`)
- `id uuid` PK, FK -> `auth.users.id`
- `role_id uuid` FK -> `roles.id`
- `email text` unique
- `full_name text`
- `is_active boolean`
- `created_at`, `updated_at`

### `students`
- `id uuid` PK
- `user_id uuid` unique FK -> `users.id`
- `student_number text` unique
- `program_name text`
- `enrollment_year int`
- `created_at`, `updated_at`

### `faculty`
- `id uuid` PK
- `user_id uuid` unique FK -> `users.id`
- `employee_number text` unique
- `department_name text`
- `created_at`, `updated_at`

### `courses`
- `id uuid` PK
- `code text` unique
- `title text`
- `description text`
- `credits numeric(3,1)` with positive check
- `created_at`, `updated_at`

### `sections`
- `id uuid` PK
- `course_id uuid` FK -> `courses.id`
- `faculty_id uuid` FK -> `faculty.id`
- `term text`
- `section_code text`
- `day_of_week smallint` (1..7)
- `start_time time`, `end_time time` with `start_time < end_time`
- `room text`
- `capacity int` positive
- Unique: `(term, section_code)`
- `created_at`, `updated_at`

### `enrollments`
- `id uuid` PK
- `student_id uuid` FK -> `students.id`
- `section_id uuid` FK -> `sections.id`
- `status text` in `enrolled | dropped | completed`
- `enrolled_at timestamptz`
- Unique: `(student_id, section_id)`
- `created_at`, `updated_at`
- Trigger: conflict prevention for overlapping section times in same term/day

### `grades`
- `id uuid` PK
- `enrollment_id uuid` unique FK -> `enrollments.id`
- `letter_grade text` (A/A-/B+.../F/I/W)
- `grade_points numeric(3,2)` (0.00..4.00)
- `submitted_by uuid` FK -> `faculty.id`
- `submitted_at timestamptz`
- `created_at`, `updated_at`

### `transcripts`
- `id uuid` PK
- `student_id uuid` FK -> `students.id`
- `enrollment_id uuid` unique FK -> `enrollments.id`
- `grade_id uuid` unique FK -> `grades.id` (nullable, `set null` on delete)
- `gpa_credits_attempted numeric(5,2)`
- `gpa_credits_earned numeric(5,2)`
- `quality_points numeric(6,2)`
- `created_at`, `updated_at`

### `gradebook_items`
- `id uuid` PK
- `section_id uuid` FK -> `sections.id`
- `title text`
- `description text` (nullable)
- `max_points numeric(6,2)` with positive check
- `due_at timestamptz` (nullable)
- `created_at`, `updated_at`

### `gradebook_scores`
- `id uuid` PK
- `item_id uuid` FK -> `gradebook_items.id`
- `student_id uuid` FK -> `students.id`
- `score numeric(6,2)` with non-negative check
- `feedback text` (nullable)
- `graded_at timestamptz`
- Unique: `(item_id, student_id)`
- `created_at`, `updated_at`

## Migration History
- `20260314103657_init_hackathon_core_schema.sql`
  - Created tables: `roles`, `users`, `students`, `faculty`, `courses`, `sections`, `enrollments`, `grades`, `transcripts`
  - Added indexes and `updated_at` triggers
  - Added enrollment conflict-check trigger function
  - Enabled RLS and created baseline policies for student/faculty access boundaries
- `20260314103930_seed_roles_and_auth_insert_policies.sql`
  - Seeded role rows: `student`, `faculty`, `admin`
  - Added insert policies for self-registration profile creation on `users`, `students`, `faculty`
- `20260314125345_add_gradebook_tables.sql`
  - Created tables: `gradebook_items`, `gradebook_scores`
  - Added FK links: `gradebook_items.section_id -> sections.id`, `gradebook_scores.item_id -> gradebook_items.id`, `gradebook_scores.student_id -> students.id`
  - Added unique constraint: `gradebook_scores(item_id, student_id)`
  - Added `updated_at` triggers and indexes for gradebook lookup paths
  - Enabled RLS and added faculty write / student own-score read policies
- `20260314150500_seed_demo_data.sql`
  - Seeded deterministic demo records across all core tables and `auth.users` using idempotent insert/upsert patterns.
  - Dataset targets:
    - Roles: `student`, `faculty`, `admin`
    - Users: `30` students, `8` faculty, `1` admin
    - Courses: `10`
    - Sections: `10`
    - Enrollments: deterministic `3-4` sections per seeded student
    - Gradebook: `4` items per seeded section
    - Scores: realistic 60–100% scoring bands
    - Grades and transcripts: derived from score aggregates and course credits
  - Maintains FK/unique constraints and avoids truncation for repeatable demo resets.
- `20260314152500_backfill_demo_auth_identities.sql`
  - Backfills `auth.identities` email-provider rows for demo users created in `20260314150500_seed_demo_data.sql`
  - Normalizes seeded email identities to use `provider = 'email'` and `provider_id = auth.users.id`
  - Repairs both missing identity rows and any previously mis-keyed demo identity rows
- `20260314162358_repair_seeded_demo_auth_users.sql`
  - Normalizes SQL-seeded demo `auth.users` rows used by the hackathon dataset
  - Reasserts email-provider auth metadata and confirmed-email fields for `@demo-campus.edu` accounts
  - Fills auth token columns with empty-string defaults when those columns exist in the current Supabase auth schema, avoiding password-login failures caused by null auth fields

## RLS Policy Log
- RLS enabled on all core tables:
  - `roles`, `users`, `students`, `faculty`, `courses`, `sections`, `enrollments`, `grades`, `transcripts`, `gradebook_items`, `gradebook_scores`
- Key policies:
  - `roles`: authenticated users can read roles
  - `users`: users can select/update/insert only their own record
  - `students` and `faculty`: own-profile read/update/insert only (role-aware insert checks)
  - `courses` and `sections`: authenticated read access
  - `enrollments`: students can manage their own enrollments; faculty can read enrollments for their sections
  - `grades`: faculty can read/write grades for sections they teach; students can read their own grades
  - `transcripts`: students can read own transcripts; faculty can read transcript rows tied to their taught sections
  - `gradebook_items`: authenticated read; faculty can insert/update/delete items for their own sections
  - `gradebook_scores`: faculty can insert/update/delete/read scores for their own sections; students can read only their own scores
