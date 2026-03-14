-- Core schema for hackathon MVP: identity, enrollment, and academics

create extension if not exists pgcrypto;

-- Roles
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

-- App users mapped 1:1 with Supabase auth.users
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  role_id uuid not null references public.roles (id),
  email text not null unique,
  full_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Student profile
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  student_number text not null unique,
  program_name text,
  enrollment_year int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Faculty profile
create table if not exists public.faculty (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  employee_number text not null unique,
  department_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Course master
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  credits numeric(3,1) not null check (credits > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Section offerings
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  faculty_id uuid not null references public.faculty (id),
  term text not null,
  section_code text not null,
  day_of_week smallint not null check (day_of_week between 1 and 7),
  start_time time not null,
  end_time time not null,
  room text,
  capacity int not null check (capacity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sections_time_window_ck check (start_time < end_time),
  constraint sections_unique_key unique (term, section_code)
);

-- Enrollment records
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  section_id uuid not null references public.sections (id) on delete cascade,
  status text not null default 'enrolled' check (status in ('enrolled', 'dropped', 'completed')),
  enrolled_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint enrollments_unique_student_section unique (student_id, section_id)
);

-- Grade submissions (one record per enrollment)
create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references public.enrollments (id) on delete cascade,
  letter_grade text not null check (letter_grade in ('A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'I', 'W')),
  grade_points numeric(3,2) not null check (grade_points >= 0 and grade_points <= 4.00),
  submitted_by uuid not null references public.faculty (id),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Transcript entries for student-facing view
create table if not exists public.transcripts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  enrollment_id uuid not null unique references public.enrollments (id) on delete cascade,
  grade_id uuid unique references public.grades (id) on delete set null,
  gpa_credits_attempted numeric(5,2) not null default 0,
  gpa_credits_earned numeric(5,2) not null default 0,
  quality_points numeric(6,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_role_id on public.users (role_id);
create index if not exists idx_students_user_id on public.students (user_id);
create index if not exists idx_faculty_user_id on public.faculty (user_id);
create index if not exists idx_sections_course_id on public.sections (course_id);
create index if not exists idx_sections_faculty_id on public.sections (faculty_id);
create index if not exists idx_sections_term on public.sections (term);
create index if not exists idx_enrollments_student_id on public.enrollments (student_id);
create index if not exists idx_enrollments_section_id on public.enrollments (section_id);
create index if not exists idx_grades_enrollment_id on public.grades (enrollment_id);
create index if not exists idx_transcripts_student_id on public.transcripts (student_id);

-- updated_at trigger utility
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at
before update on public.users
for each row execute function public.handle_updated_at();

create trigger trg_students_updated_at
before update on public.students
for each row execute function public.handle_updated_at();

create trigger trg_faculty_updated_at
before update on public.faculty
for each row execute function public.handle_updated_at();

create trigger trg_courses_updated_at
before update on public.courses
for each row execute function public.handle_updated_at();

create trigger trg_sections_updated_at
before update on public.sections
for each row execute function public.handle_updated_at();

create trigger trg_enrollments_updated_at
before update on public.enrollments
for each row execute function public.handle_updated_at();

create trigger trg_grades_updated_at
before update on public.grades
for each row execute function public.handle_updated_at();

create trigger trg_transcripts_updated_at
before update on public.transcripts
for each row execute function public.handle_updated_at();

-- Enrollment conflict check (same day/time overlap in same term for same student)
create or replace function public.prevent_enrollment_time_conflict()
returns trigger
language plpgsql
as $$
declare
  new_day smallint;
  new_start time;
  new_end time;
  new_term text;
  conflict_found boolean;
begin
  select s.day_of_week, s.start_time, s.end_time, s.term
  into new_day, new_start, new_end, new_term
  from public.sections s
  where s.id = new.section_id;

  select exists (
    select 1
    from public.enrollments e
    join public.sections s on s.id = e.section_id
    where e.student_id = new.student_id
      and e.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      and e.status in ('enrolled', 'completed')
      and s.term = new_term
      and s.day_of_week = new_day
      and s.start_time < new_end
      and new_start < s.end_time
  ) into conflict_found;

  if conflict_found then
    raise exception 'Schedule conflict detected for student enrollment.';
  end if;

  return new;
end;
$$;

create trigger trg_enrollments_conflict_check
before insert or update on public.enrollments
for each row
execute function public.prevent_enrollment_time_conflict();

-- Row Level Security
alter table public.roles enable row level security;
alter table public.users enable row level security;
alter table public.students enable row level security;
alter table public.faculty enable row level security;
alter table public.courses enable row level security;
alter table public.sections enable row level security;
alter table public.enrollments enable row level security;
alter table public.grades enable row level security;
alter table public.transcripts enable row level security;

-- roles policies
create policy "roles read authenticated"
on public.roles
for select
to authenticated
using (true);

-- users policies
create policy "users select own"
on public.users
for select
to authenticated
using (id = (select auth.uid()));

create policy "users update own"
on public.users
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- students policies
create policy "students select own profile"
on public.students
for select
to authenticated
using (
  user_id = (select auth.uid())
);

create policy "students update own profile"
on public.students
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- faculty policies
create policy "faculty select own profile"
on public.faculty
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "faculty update own profile"
on public.faculty
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- courses policies
create policy "courses read authenticated"
on public.courses
for select
to authenticated
using (true);

-- sections policies
create policy "sections read authenticated"
on public.sections
for select
to authenticated
using (true);

-- enrollments policies
create policy "students select own enrollments"
on public.enrollments
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = enrollments.student_id
      and s.user_id = (select auth.uid())
  )
);

create policy "students insert own enrollments"
on public.enrollments
for insert
to authenticated
with check (
  exists (
    select 1
    from public.students s
    where s.id = enrollments.student_id
      and s.user_id = (select auth.uid())
  )
);

create policy "students update own enrollments"
on public.enrollments
for update
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = enrollments.student_id
      and s.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.students s
    where s.id = enrollments.student_id
      and s.user_id = (select auth.uid())
  )
);

create policy "faculty select section enrollments"
on public.enrollments
for select
to authenticated
using (
  exists (
    select 1
    from public.faculty f
    join public.sections sec on sec.faculty_id = f.id
    where sec.id = enrollments.section_id
      and f.user_id = (select auth.uid())
  )
);

-- grades policies
create policy "faculty read own section grades"
on public.grades
for select
to authenticated
using (
  exists (
    select 1
    from public.enrollments e
    join public.sections sec on sec.id = e.section_id
    join public.faculty f on f.id = sec.faculty_id
    where e.id = grades.enrollment_id
      and f.user_id = (select auth.uid())
  )
);

create policy "faculty write own section grades"
on public.grades
for insert
to authenticated
with check (
  exists (
    select 1
    from public.enrollments e
    join public.sections sec on sec.id = e.section_id
    join public.faculty f on f.id = sec.faculty_id
    where e.id = grades.enrollment_id
      and f.id = grades.submitted_by
      and f.user_id = (select auth.uid())
  )
);

create policy "faculty update own section grades"
on public.grades
for update
to authenticated
using (
  exists (
    select 1
    from public.enrollments e
    join public.sections sec on sec.id = e.section_id
    join public.faculty f on f.id = sec.faculty_id
    where e.id = grades.enrollment_id
      and f.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.enrollments e
    join public.sections sec on sec.id = e.section_id
    join public.faculty f on f.id = sec.faculty_id
    where e.id = grades.enrollment_id
      and f.id = grades.submitted_by
      and f.user_id = (select auth.uid())
  )
);

create policy "students read own grades"
on public.grades
for select
to authenticated
using (
  exists (
    select 1
    from public.enrollments e
    join public.students s on s.id = e.student_id
    where e.id = grades.enrollment_id
      and s.user_id = (select auth.uid())
  )
);

-- transcripts policies
create policy "students read own transcripts"
on public.transcripts
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = transcripts.student_id
      and s.user_id = (select auth.uid())
  )
);

create policy "faculty read transcripts for taught students"
on public.transcripts
for select
to authenticated
using (
  exists (
    select 1
    from public.enrollments e
    join public.sections sec on sec.id = e.section_id
    join public.faculty f on f.id = sec.faculty_id
    where e.id = transcripts.enrollment_id
      and f.user_id = (select auth.uid())
  )
);
