drop policy if exists "students select own or taught-section roster" on public.students;
create policy "students select own or taught-section roster"
on public.students
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.enrollments e
    join public.sections sec on sec.id = e.section_id
    join public.faculty f on f.id = sec.faculty_id
    where e.student_id = students.id
      and e.status in ('enrolled', 'completed')
      and f.user_id = (select auth.uid())
  )
);

drop policy if exists "users select own or taught student users" on public.users;
create policy "users select own or taught student users"
on public.users
for select
to authenticated
using (
  id = (select auth.uid())
  or exists (
    select 1
    from public.students s
    join public.enrollments e on e.student_id = s.id
    join public.sections sec on sec.id = e.section_id
    join public.faculty f on f.id = sec.faculty_id
    where s.user_id = users.id
      and e.status in ('enrolled', 'completed')
      and f.user_id = (select auth.uid())
  )
);
