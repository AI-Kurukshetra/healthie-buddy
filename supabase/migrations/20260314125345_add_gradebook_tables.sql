-- Gradebook schema: instructor-managed items and per-student scores.

create table if not exists public.gradebook_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections (id) on delete cascade,
  title text not null,
  description text,
  max_points numeric(6,2) not null check (max_points > 0),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gradebook_scores (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.gradebook_items (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  score numeric(6,2) not null check (score >= 0),
  feedback text,
  graded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gradebook_scores_unique_item_student unique (item_id, student_id)
);

create index if not exists idx_gradebook_items_section_id
  on public.gradebook_items (section_id);

create index if not exists idx_gradebook_scores_item_id
  on public.gradebook_scores (item_id);

create index if not exists idx_gradebook_scores_student_id
  on public.gradebook_scores (student_id);

drop trigger if exists trg_gradebook_items_updated_at on public.gradebook_items;
create trigger trg_gradebook_items_updated_at
before update on public.gradebook_items
for each row execute function public.handle_updated_at();

drop trigger if exists trg_gradebook_scores_updated_at on public.gradebook_scores;
create trigger trg_gradebook_scores_updated_at
before update on public.gradebook_scores
for each row execute function public.handle_updated_at();

alter table public.gradebook_items enable row level security;
alter table public.gradebook_scores enable row level security;

drop policy if exists "gradebook items read authenticated" on public.gradebook_items;
create policy "gradebook items read authenticated"
on public.gradebook_items
for select
to authenticated
using (true);

drop policy if exists "faculty insert gradebook items for own sections" on public.gradebook_items;
create policy "faculty insert gradebook items for own sections"
on public.gradebook_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.sections s
    join public.faculty f on f.id = s.faculty_id
    where s.id = gradebook_items.section_id
      and f.user_id = (select auth.uid())
  )
);

drop policy if exists "faculty update gradebook items for own sections" on public.gradebook_items;
create policy "faculty update gradebook items for own sections"
on public.gradebook_items
for update
to authenticated
using (
  exists (
    select 1
    from public.sections s
    join public.faculty f on f.id = s.faculty_id
    where s.id = gradebook_items.section_id
      and f.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.sections s
    join public.faculty f on f.id = s.faculty_id
    where s.id = gradebook_items.section_id
      and f.user_id = (select auth.uid())
  )
);

drop policy if exists "faculty delete gradebook items for own sections" on public.gradebook_items;
create policy "faculty delete gradebook items for own sections"
on public.gradebook_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.sections s
    join public.faculty f on f.id = s.faculty_id
    where s.id = gradebook_items.section_id
      and f.user_id = (select auth.uid())
  )
);

drop policy if exists "faculty read scores for own sections" on public.gradebook_scores;
create policy "faculty read scores for own sections"
on public.gradebook_scores
for select
to authenticated
using (
  exists (
    select 1
    from public.gradebook_items gi
    join public.sections s on s.id = gi.section_id
    join public.faculty f on f.id = s.faculty_id
    where gi.id = gradebook_scores.item_id
      and f.user_id = (select auth.uid())
  )
);

drop policy if exists "students read own gradebook scores" on public.gradebook_scores;
create policy "students read own gradebook scores"
on public.gradebook_scores
for select
to authenticated
using (
  exists (
    select 1
    from public.students st
    where st.id = gradebook_scores.student_id
      and st.user_id = (select auth.uid())
  )
);

drop policy if exists "faculty insert scores for own sections" on public.gradebook_scores;
create policy "faculty insert scores for own sections"
on public.gradebook_scores
for insert
to authenticated
with check (
  exists (
    select 1
    from public.gradebook_items gi
    join public.sections s on s.id = gi.section_id
    join public.faculty f on f.id = s.faculty_id
    where gi.id = gradebook_scores.item_id
      and f.user_id = (select auth.uid())
  )
);

drop policy if exists "faculty update scores for own sections" on public.gradebook_scores;
create policy "faculty update scores for own sections"
on public.gradebook_scores
for update
to authenticated
using (
  exists (
    select 1
    from public.gradebook_items gi
    join public.sections s on s.id = gi.section_id
    join public.faculty f on f.id = s.faculty_id
    where gi.id = gradebook_scores.item_id
      and f.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.gradebook_items gi
    join public.sections s on s.id = gi.section_id
    join public.faculty f on f.id = s.faculty_id
    where gi.id = gradebook_scores.item_id
      and f.user_id = (select auth.uid())
  )
);

drop policy if exists "faculty delete scores for own sections" on public.gradebook_scores;
create policy "faculty delete scores for own sections"
on public.gradebook_scores
for delete
to authenticated
using (
  exists (
    select 1
    from public.gradebook_items gi
    join public.sections s on s.id = gi.section_id
    join public.faculty f on f.id = s.faculty_id
    where gi.id = gradebook_scores.item_id
      and f.user_id = (select auth.uid())
  )
);
