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

## Migration History
- `20260314103657_init_hackathon_core_schema.sql`
  - Created tables: `roles`, `users`, `students`, `faculty`, `courses`, `sections`, `enrollments`, `grades`, `transcripts`
  - Added indexes and `updated_at` triggers
  - Added enrollment conflict-check trigger function
  - Enabled RLS and created baseline policies for student/faculty access boundaries
- `20260314103930_seed_roles_and_auth_insert_policies.sql`
  - Seeded role rows: `student`, `faculty`, `admin`
  - Added insert policies for self-registration profile creation on `users`, `students`, `faculty`

## RLS Policy Log
- RLS enabled on all core tables:
  - `roles`, `users`, `students`, `faculty`, `courses`, `sections`, `enrollments`, `grades`, `transcripts`
- Key policies:
  - `roles`: authenticated users can read roles
  - `users`: users can select/update/insert only their own record
  - `students` and `faculty`: own-profile read/update/insert only (role-aware insert checks)
  - `courses` and `sections`: authenticated read access
  - `enrollments`: students can manage their own enrollments; faculty can read enrollments for their sections
  - `grades`: faculty can read/write grades for sections they teach; students can read their own grades
  - `transcripts`: students can read own transcripts; faculty can read transcript rows tied to their taught sections
