-- Seed base roles and allow self-service auth profile creation

insert into public.roles (code, name)
values
  ('student', 'Student'),
  ('faculty', 'Faculty'),
  ('admin', 'Admin')
on conflict (code) do update set name = excluded.name;

drop policy if exists "users insert own" on public.users;
create policy "users insert own"
on public.users
for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists "students insert own profile" on public.students;
create policy "students insert own profile"
on public.students
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.users u
    join public.roles r on r.id = u.role_id
    where u.id = students.user_id
      and r.code = 'student'
  )
);

drop policy if exists "faculty insert own profile" on public.faculty;
create policy "faculty insert own profile"
on public.faculty
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.users u
    join public.roles r on r.id = u.role_id
    where u.id = faculty.user_id
      and r.code = 'faculty'
  )
);
