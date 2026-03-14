create or replace function public.auth_user_teaches_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.enrollments e
    join public.sections sec on sec.id = e.section_id
    join public.faculty f on f.id = sec.faculty_id
    where e.student_id = target_student_id
      and e.status in ('enrolled', 'completed')
      and f.user_id = auth.uid()
  );
$$;

create or replace function public.auth_user_teaches_app_user(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.students s
    join public.enrollments e on e.student_id = s.id
    join public.sections sec on sec.id = e.section_id
    join public.faculty f on f.id = sec.faculty_id
    where s.user_id = target_user_id
      and e.status in ('enrolled', 'completed')
      and f.user_id = auth.uid()
  );
$$;

revoke all on function public.auth_user_teaches_student(uuid) from public;
revoke all on function public.auth_user_teaches_app_user(uuid) from public;
grant execute on function public.auth_user_teaches_student(uuid) to authenticated;
grant execute on function public.auth_user_teaches_app_user(uuid) to authenticated;

drop policy if exists "students select own or taught-section roster" on public.students;
create policy "students select own or taught-section roster"
on public.students
for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.auth_user_teaches_student(id)
);

drop policy if exists "users select own or taught student users" on public.users;
create policy "users select own or taught student users"
on public.users
for select
to authenticated
using (
  id = (select auth.uid())
  or public.auth_user_teaches_app_user(id)
);
