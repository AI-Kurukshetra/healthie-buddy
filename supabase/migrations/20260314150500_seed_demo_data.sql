-- Demo data seed for hackathon flows.
-- Idempotent by design: deterministic IDs + ON CONFLICT upserts.
-- Uses INSERT statements only; no truncation.

-- 1) Roles
insert into public.roles (code, name)
values
  ('student', 'Student'),
  ('faculty', 'Faculty'),
  ('admin', 'Admin')
on conflict (code) do update
set
  name = excluded.name;

-- 2) Auth users (39 total: 30 students, 8 faculty, 1 admin)
with seed_users as (
  select *
  from (
    values
      -- students
      ('00000000-0000-0000-0000-000000000101'::uuid, 'student', 'aarav.sharma@demo-campus.edu', 'Aarav Sharma'),
      ('00000000-0000-0000-0000-000000000102'::uuid, 'student', 'ishita.verma@demo-campus.edu', 'Ishita Verma'),
      ('00000000-0000-0000-0000-000000000103'::uuid, 'student', 'rohan.gupta@demo-campus.edu', 'Rohan Gupta'),
      ('00000000-0000-0000-0000-000000000104'::uuid, 'student', 'ananya.reddy@demo-campus.edu', 'Ananya Reddy'),
      ('00000000-0000-0000-0000-000000000105'::uuid, 'student', 'kunal.mehta@demo-campus.edu', 'Kunal Mehta'),
      ('00000000-0000-0000-0000-000000000106'::uuid, 'student', 'priya.nair@demo-campus.edu', 'Priya Nair'),
      ('00000000-0000-0000-0000-000000000107'::uuid, 'student', 'aditya.singh@demo-campus.edu', 'Aditya Singh'),
      ('00000000-0000-0000-0000-000000000108'::uuid, 'student', 'sneha.kulkarni@demo-campus.edu', 'Sneha Kulkarni'),
      ('00000000-0000-0000-0000-000000000109'::uuid, 'student', 'rahul.iyer@demo-campus.edu', 'Rahul Iyer'),
      ('00000000-0000-0000-0000-000000000110'::uuid, 'student', 'neha.patel@demo-campus.edu', 'Neha Patel'),
      ('00000000-0000-0000-0000-000000000111'::uuid, 'student', 'vikram.joshi@demo-campus.edu', 'Vikram Joshi'),
      ('00000000-0000-0000-0000-000000000112'::uuid, 'student', 'pooja.menon@demo-campus.edu', 'Pooja Menon'),
      ('00000000-0000-0000-0000-000000000113'::uuid, 'student', 'arjun.malhotra@demo-campus.edu', 'Arjun Malhotra'),
      ('00000000-0000-0000-0000-000000000114'::uuid, 'student', 'diya.kapoor@demo-campus.edu', 'Diya Kapoor'),
      ('00000000-0000-0000-0000-000000000115'::uuid, 'student', 'nikhil.desai@demo-campus.edu', 'Nikhil Desai'),
      ('00000000-0000-0000-0000-000000000116'::uuid, 'student', 'aisha.khan@demo-campus.edu', 'Aisha Khan'),
      ('00000000-0000-0000-0000-000000000117'::uuid, 'student', 'siddharth.rao@demo-campus.edu', 'Siddharth Rao'),
      ('00000000-0000-0000-0000-000000000118'::uuid, 'student', 'meera.chawla@demo-campus.edu', 'Meera Chawla'),
      ('00000000-0000-0000-0000-000000000119'::uuid, 'student', 'yash.agarwal@demo-campus.edu', 'Yash Agarwal'),
      ('00000000-0000-0000-0000-000000000120'::uuid, 'student', 'tanvi.bhatt@demo-campus.edu', 'Tanvi Bhatt'),
      ('00000000-0000-0000-0000-000000000121'::uuid, 'student', 'harsh.vyas@demo-campus.edu', 'Harsh Vyas'),
      ('00000000-0000-0000-0000-000000000122'::uuid, 'student', 'ritika.sinha@demo-campus.edu', 'Ritika Sinha'),
      ('00000000-0000-0000-0000-000000000123'::uuid, 'student', 'devansh.jain@demo-campus.edu', 'Devansh Jain'),
      ('00000000-0000-0000-0000-000000000124'::uuid, 'student', 'kriti.arora@demo-campus.edu', 'Kriti Arora'),
      ('00000000-0000-0000-0000-000000000125'::uuid, 'student', 'manav.saxena@demo-campus.edu', 'Manav Saxena'),
      ('00000000-0000-0000-0000-000000000126'::uuid, 'student', 'nandini.pillai@demo-campus.edu', 'Nandini Pillai'),
      ('00000000-0000-0000-0000-000000000127'::uuid, 'student', 'pranav.shetty@demo-campus.edu', 'Pranav Shetty'),
      ('00000000-0000-0000-0000-000000000128'::uuid, 'student', 'simran.kaur@demo-campus.edu', 'Simran Kaur'),
      ('00000000-0000-0000-0000-000000000129'::uuid, 'student', 'omkar.pawar@demo-campus.edu', 'Omkar Pawar'),
      ('00000000-0000-0000-0000-000000000130'::uuid, 'student', 'ira.banerjee@demo-campus.edu', 'Ira Banerjee'),

      -- faculty
      ('00000000-0000-0000-0000-000000000201'::uuid, 'faculty', 'ananya.iyer@demo-campus.edu', 'Ananya Iyer'),
      ('00000000-0000-0000-0000-000000000202'::uuid, 'faculty', 'rohan.kulkarni@demo-campus.edu', 'Rohan Kulkarni'),
      ('00000000-0000-0000-0000-000000000203'::uuid, 'faculty', 'meera.nair@demo-campus.edu', 'Meera Nair'),
      ('00000000-0000-0000-0000-000000000204'::uuid, 'faculty', 'arvind.menon@demo-campus.edu', 'Arvind Menon'),
      ('00000000-0000-0000-0000-000000000205'::uuid, 'faculty', 'priya.bhat@demo-campus.edu', 'Priya Bhat'),
      ('00000000-0000-0000-0000-000000000206'::uuid, 'faculty', 'sandeep.rao@demo-campus.edu', 'Sandeep Rao'),
      ('00000000-0000-0000-0000-000000000207'::uuid, 'faculty', 'kavita.sharma@demo-campus.edu', 'Kavita Sharma'),
      ('00000000-0000-0000-0000-000000000208'::uuid, 'faculty', 'vivek.patel@demo-campus.edu', 'Vivek Patel'),

      -- admin
      ('00000000-0000-0000-0000-000000000301'::uuid, 'admin', 'aditi.narang@demo-campus.edu', 'Aditi Narang')
  ) as t(id, role_code, email, full_name)
), instance_ref as (
  select coalesce((select id from auth.instances limit 1), '00000000-0000-0000-0000-000000000000'::uuid) as instance_id
)
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at
)
select
  su.id,
  ir.instance_id,
  'authenticated',
  'authenticated',
  su.email,
  crypt('Demo@12345', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', su.full_name, 'role', su.role_code),
  false,
  now(),
  now()
from seed_users su
cross join instance_ref ir
on conflict (id) do update
set
  email = excluded.email,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

-- 3) App users
with seed_users as (
  select *
  from (
    values
      ('00000000-0000-0000-0000-000000000101'::uuid, 'student', 'aarav.sharma@demo-campus.edu', 'Aarav Sharma'),
      ('00000000-0000-0000-0000-000000000102'::uuid, 'student', 'ishita.verma@demo-campus.edu', 'Ishita Verma'),
      ('00000000-0000-0000-0000-000000000103'::uuid, 'student', 'rohan.gupta@demo-campus.edu', 'Rohan Gupta'),
      ('00000000-0000-0000-0000-000000000104'::uuid, 'student', 'ananya.reddy@demo-campus.edu', 'Ananya Reddy'),
      ('00000000-0000-0000-0000-000000000105'::uuid, 'student', 'kunal.mehta@demo-campus.edu', 'Kunal Mehta'),
      ('00000000-0000-0000-0000-000000000106'::uuid, 'student', 'priya.nair@demo-campus.edu', 'Priya Nair'),
      ('00000000-0000-0000-0000-000000000107'::uuid, 'student', 'aditya.singh@demo-campus.edu', 'Aditya Singh'),
      ('00000000-0000-0000-0000-000000000108'::uuid, 'student', 'sneha.kulkarni@demo-campus.edu', 'Sneha Kulkarni'),
      ('00000000-0000-0000-0000-000000000109'::uuid, 'student', 'rahul.iyer@demo-campus.edu', 'Rahul Iyer'),
      ('00000000-0000-0000-0000-000000000110'::uuid, 'student', 'neha.patel@demo-campus.edu', 'Neha Patel'),
      ('00000000-0000-0000-0000-000000000111'::uuid, 'student', 'vikram.joshi@demo-campus.edu', 'Vikram Joshi'),
      ('00000000-0000-0000-0000-000000000112'::uuid, 'student', 'pooja.menon@demo-campus.edu', 'Pooja Menon'),
      ('00000000-0000-0000-0000-000000000113'::uuid, 'student', 'arjun.malhotra@demo-campus.edu', 'Arjun Malhotra'),
      ('00000000-0000-0000-0000-000000000114'::uuid, 'student', 'diya.kapoor@demo-campus.edu', 'Diya Kapoor'),
      ('00000000-0000-0000-0000-000000000115'::uuid, 'student', 'nikhil.desai@demo-campus.edu', 'Nikhil Desai'),
      ('00000000-0000-0000-0000-000000000116'::uuid, 'student', 'aisha.khan@demo-campus.edu', 'Aisha Khan'),
      ('00000000-0000-0000-0000-000000000117'::uuid, 'student', 'siddharth.rao@demo-campus.edu', 'Siddharth Rao'),
      ('00000000-0000-0000-0000-000000000118'::uuid, 'student', 'meera.chawla@demo-campus.edu', 'Meera Chawla'),
      ('00000000-0000-0000-0000-000000000119'::uuid, 'student', 'yash.agarwal@demo-campus.edu', 'Yash Agarwal'),
      ('00000000-0000-0000-0000-000000000120'::uuid, 'student', 'tanvi.bhatt@demo-campus.edu', 'Tanvi Bhatt'),
      ('00000000-0000-0000-0000-000000000121'::uuid, 'student', 'harsh.vyas@demo-campus.edu', 'Harsh Vyas'),
      ('00000000-0000-0000-0000-000000000122'::uuid, 'student', 'ritika.sinha@demo-campus.edu', 'Ritika Sinha'),
      ('00000000-0000-0000-0000-000000000123'::uuid, 'student', 'devansh.jain@demo-campus.edu', 'Devansh Jain'),
      ('00000000-0000-0000-0000-000000000124'::uuid, 'student', 'kriti.arora@demo-campus.edu', 'Kriti Arora'),
      ('00000000-0000-0000-0000-000000000125'::uuid, 'student', 'manav.saxena@demo-campus.edu', 'Manav Saxena'),
      ('00000000-0000-0000-0000-000000000126'::uuid, 'student', 'nandini.pillai@demo-campus.edu', 'Nandini Pillai'),
      ('00000000-0000-0000-0000-000000000127'::uuid, 'student', 'pranav.shetty@demo-campus.edu', 'Pranav Shetty'),
      ('00000000-0000-0000-0000-000000000128'::uuid, 'student', 'simran.kaur@demo-campus.edu', 'Simran Kaur'),
      ('00000000-0000-0000-0000-000000000129'::uuid, 'student', 'omkar.pawar@demo-campus.edu', 'Omkar Pawar'),
      ('00000000-0000-0000-0000-000000000130'::uuid, 'student', 'ira.banerjee@demo-campus.edu', 'Ira Banerjee'),
      ('00000000-0000-0000-0000-000000000201'::uuid, 'faculty', 'ananya.iyer@demo-campus.edu', 'Ananya Iyer'),
      ('00000000-0000-0000-0000-000000000202'::uuid, 'faculty', 'rohan.kulkarni@demo-campus.edu', 'Rohan Kulkarni'),
      ('00000000-0000-0000-0000-000000000203'::uuid, 'faculty', 'meera.nair@demo-campus.edu', 'Meera Nair'),
      ('00000000-0000-0000-0000-000000000204'::uuid, 'faculty', 'arvind.menon@demo-campus.edu', 'Arvind Menon'),
      ('00000000-0000-0000-0000-000000000205'::uuid, 'faculty', 'priya.bhat@demo-campus.edu', 'Priya Bhat'),
      ('00000000-0000-0000-0000-000000000206'::uuid, 'faculty', 'sandeep.rao@demo-campus.edu', 'Sandeep Rao'),
      ('00000000-0000-0000-0000-000000000207'::uuid, 'faculty', 'kavita.sharma@demo-campus.edu', 'Kavita Sharma'),
      ('00000000-0000-0000-0000-000000000208'::uuid, 'faculty', 'vivek.patel@demo-campus.edu', 'Vivek Patel'),
      ('00000000-0000-0000-0000-000000000301'::uuid, 'admin', 'aditi.narang@demo-campus.edu', 'Aditi Narang')
  ) as t(id, role_code, email, full_name)
), role_map as (
  select id, code
  from public.roles
  where code in ('student', 'faculty', 'admin')
)
insert into public.users (
  id,
  role_id,
  email,
  full_name,
  is_active,
  created_at,
  updated_at
)
select
  su.id,
  rm.id,
  su.email,
  su.full_name,
  true,
  now(),
  now()
from seed_users su
join role_map rm on rm.code = su.role_code
on conflict (id) do update
set
  role_id = excluded.role_id,
  email = excluded.email,
  full_name = excluded.full_name,
  is_active = excluded.is_active,
  updated_at = now();

-- 4) Students (30)
with seed_students as (
  select *
  from (
    values
      ('00000000-0000-0000-0000-000000001101'::uuid, '00000000-0000-0000-0000-000000000101'::uuid, 'ST2026001', 'B.Sc. Data Science', 2026),
      ('00000000-0000-0000-0000-000000001102'::uuid, '00000000-0000-0000-0000-000000000102'::uuid, 'ST2026002', 'B.Com', 2026),
      ('00000000-0000-0000-0000-000000001103'::uuid, '00000000-0000-0000-0000-000000000103'::uuid, 'ST2026003', 'BBA', 2026),
      ('00000000-0000-0000-0000-000000001104'::uuid, '00000000-0000-0000-0000-000000000104'::uuid, 'ST2026004', 'B.A. Economics', 2026),
      ('00000000-0000-0000-0000-000000001105'::uuid, '00000000-0000-0000-0000-000000000105'::uuid, 'ST2026005', 'B.Sc. Mathematics', 2026),
      ('00000000-0000-0000-0000-000000001106'::uuid, '00000000-0000-0000-0000-000000000106'::uuid, 'ST2026006', 'Diploma in Computer Applications', 2026),
      ('00000000-0000-0000-0000-000000001107'::uuid, '00000000-0000-0000-0000-000000000107'::uuid, 'ST2026007', 'B.Sc. Data Science', 2026),
      ('00000000-0000-0000-0000-000000001108'::uuid, '00000000-0000-0000-0000-000000000108'::uuid, 'ST2026008', 'B.Com', 2026),
      ('00000000-0000-0000-0000-000000001109'::uuid, '00000000-0000-0000-0000-000000000109'::uuid, 'ST2026009', 'BBA', 2026),
      ('00000000-0000-0000-0000-000000001110'::uuid, '00000000-0000-0000-0000-000000000110'::uuid, 'ST2026010', 'B.A. Economics', 2026),
      ('00000000-0000-0000-0000-000000001111'::uuid, '00000000-0000-0000-0000-000000000111'::uuid, 'ST2026011', 'B.Sc. Mathematics', 2026),
      ('00000000-0000-0000-0000-000000001112'::uuid, '00000000-0000-0000-0000-000000000112'::uuid, 'ST2026012', 'Diploma in Computer Applications', 2026),
      ('00000000-0000-0000-0000-000000001113'::uuid, '00000000-0000-0000-0000-000000000113'::uuid, 'ST2026013', 'B.Sc. Data Science', 2026),
      ('00000000-0000-0000-0000-000000001114'::uuid, '00000000-0000-0000-0000-000000000114'::uuid, 'ST2026014', 'B.Com', 2026),
      ('00000000-0000-0000-0000-000000001115'::uuid, '00000000-0000-0000-0000-000000000115'::uuid, 'ST2026015', 'BBA', 2026),
      ('00000000-0000-0000-0000-000000001116'::uuid, '00000000-0000-0000-0000-000000000116'::uuid, 'ST2026016', 'B.A. Economics', 2026),
      ('00000000-0000-0000-0000-000000001117'::uuid, '00000000-0000-0000-0000-000000000117'::uuid, 'ST2026017', 'B.Sc. Mathematics', 2026),
      ('00000000-0000-0000-0000-000000001118'::uuid, '00000000-0000-0000-0000-000000000118'::uuid, 'ST2026018', 'Diploma in Computer Applications', 2026),
      ('00000000-0000-0000-0000-000000001119'::uuid, '00000000-0000-0000-0000-000000000119'::uuid, 'ST2026019', 'B.Sc. Data Science', 2026),
      ('00000000-0000-0000-0000-000000001120'::uuid, '00000000-0000-0000-0000-000000000120'::uuid, 'ST2026020', 'B.Com', 2026),
      ('00000000-0000-0000-0000-000000001121'::uuid, '00000000-0000-0000-0000-000000000121'::uuid, 'ST2026021', 'BBA', 2026),
      ('00000000-0000-0000-0000-000000001122'::uuid, '00000000-0000-0000-0000-000000000122'::uuid, 'ST2026022', 'B.A. Economics', 2026),
      ('00000000-0000-0000-0000-000000001123'::uuid, '00000000-0000-0000-0000-000000000123'::uuid, 'ST2026023', 'B.Sc. Mathematics', 2026),
      ('00000000-0000-0000-0000-000000001124'::uuid, '00000000-0000-0000-0000-000000000124'::uuid, 'ST2026024', 'Diploma in Computer Applications', 2026),
      ('00000000-0000-0000-0000-000000001125'::uuid, '00000000-0000-0000-0000-000000000125'::uuid, 'ST2026025', 'B.Sc. Data Science', 2026),
      ('00000000-0000-0000-0000-000000001126'::uuid, '00000000-0000-0000-0000-000000000126'::uuid, 'ST2026026', 'B.Com', 2026),
      ('00000000-0000-0000-0000-000000001127'::uuid, '00000000-0000-0000-0000-000000000127'::uuid, 'ST2026027', 'BBA', 2026),
      ('00000000-0000-0000-0000-000000001128'::uuid, '00000000-0000-0000-0000-000000000128'::uuid, 'ST2026028', 'B.A. Economics', 2026),
      ('00000000-0000-0000-0000-000000001129'::uuid, '00000000-0000-0000-0000-000000000129'::uuid, 'ST2026029', 'B.Sc. Mathematics', 2026),
      ('00000000-0000-0000-0000-000000001130'::uuid, '00000000-0000-0000-0000-000000000130'::uuid, 'ST2026030', 'Diploma in Computer Applications', 2026)
  ) as t(id, user_id, student_number, program_name, enrollment_year)
)
insert into public.students (
  id,
  user_id,
  student_number,
  program_name,
  enrollment_year,
  created_at,
  updated_at
)
select
  ss.id,
  ss.user_id,
  ss.student_number,
  ss.program_name,
  ss.enrollment_year,
  now(),
  now()
from seed_students ss
on conflict (user_id) do update
set
  student_number = excluded.student_number,
  program_name = excluded.program_name,
  enrollment_year = excluded.enrollment_year,
  updated_at = now();

-- 5) Faculty (8)
with seed_faculty as (
  select *
  from (
    values
      ('00000000-0000-0000-0000-000000001201'::uuid, '00000000-0000-0000-0000-000000000201'::uuid, 'FAC2026001', 'Computer Science'),
      ('00000000-0000-0000-0000-000000001202'::uuid, '00000000-0000-0000-0000-000000000202'::uuid, 'FAC2026002', 'Mathematics'),
      ('00000000-0000-0000-0000-000000001203'::uuid, '00000000-0000-0000-0000-000000000203'::uuid, 'FAC2026003', 'Physics'),
      ('00000000-0000-0000-0000-000000001204'::uuid, '00000000-0000-0000-0000-000000000204'::uuid, 'FAC2026004', 'Electronics'),
      ('00000000-0000-0000-0000-000000001205'::uuid, '00000000-0000-0000-0000-000000000205'::uuid, 'FAC2026005', 'English'),
      ('00000000-0000-0000-0000-000000001206'::uuid, '00000000-0000-0000-0000-000000000206'::uuid, 'FAC2026006', 'Economics'),
      ('00000000-0000-0000-0000-000000001207'::uuid, '00000000-0000-0000-0000-000000000207'::uuid, 'FAC2026007', 'Data Science'),
      ('00000000-0000-0000-0000-000000001208'::uuid, '00000000-0000-0000-0000-000000000208'::uuid, 'FAC2026008', 'Management')
  ) as t(id, user_id, employee_number, department_name)
)
insert into public.faculty (
  id,
  user_id,
  employee_number,
  department_name,
  created_at,
  updated_at
)
select
  sf.id,
  sf.user_id,
  sf.employee_number,
  sf.department_name,
  now(),
  now()
from seed_faculty sf
on conflict (user_id) do update
set
  employee_number = excluded.employee_number,
  department_name = excluded.department_name,
  updated_at = now();

-- 6) Courses (10)
insert into public.courses (
  id,
  code,
  title,
  description,
  credits,
  created_at,
  updated_at
)
values
  ('00000000-0000-0000-0000-000000002101'::uuid, 'CSE101', 'Introduction to Programming', 'Foundations of procedural programming and problem solving.', 4.0, now(), now()),
  ('00000000-0000-0000-0000-000000002102'::uuid, 'MAT101', 'Calculus I', 'Limits, derivatives, applications, and introductory integration.', 3.0, now(), now()),
  ('00000000-0000-0000-0000-000000002103'::uuid, 'PHY101', 'Applied Physics', 'Mechanics, waves, electricity, and lab-oriented problem solving.', 4.0, now(), now()),
  ('00000000-0000-0000-0000-000000002104'::uuid, 'ENG101', 'Academic Writing', 'College-level writing, argumentation, and communication.', 3.0, now(), now()),
  ('00000000-0000-0000-0000-000000002105'::uuid, 'ECO101', 'Principles of Economics', 'Micro and macroeconomic fundamentals for first-year students.', 3.0, now(), now()),
  ('00000000-0000-0000-0000-000000002106'::uuid, 'MGT101', 'Business Communication', 'Professional communication, presentation, and teamwork.', 3.0, now(), now()),
  ('00000000-0000-0000-0000-000000002107'::uuid, 'DSA201', 'Data Structures', 'Arrays, lists, trees, hashing, and algorithmic complexity.', 4.0, now(), now()),
  ('00000000-0000-0000-0000-000000002108'::uuid, 'STA201', 'Statistics for Computing', 'Descriptive statistics, probability, inference, and regression.', 3.0, now(), now()),
  ('00000000-0000-0000-0000-000000002109'::uuid, 'WEB201', 'Web Development', 'Frontend and backend web fundamentals with project work.', 4.0, now(), now()),
  ('00000000-0000-0000-0000-000000002110'::uuid, 'DBS201', 'Database Systems', 'Relational modeling, SQL, normalization, and transactions.', 4.0, now(), now())
on conflict (code) do update
set
  title = excluded.title,
  description = excluded.description,
  credits = excluded.credits,
  updated_at = now();

-- 7) Sections (10)
insert into public.sections (
  id,
  course_id,
  faculty_id,
  term,
  section_code,
  day_of_week,
  start_time,
  end_time,
  room,
  capacity,
  created_at,
  updated_at
)
values
  ('00000000-0000-0000-0000-000000003101'::uuid, '00000000-0000-0000-0000-000000002101'::uuid, '00000000-0000-0000-0000-000000001201'::uuid, 'Spring 2026', 'SPR26-A1', 1, '09:00', '10:30', 'C-201', 45, now(), now()),
  ('00000000-0000-0000-0000-000000003102'::uuid, '00000000-0000-0000-0000-000000002102'::uuid, '00000000-0000-0000-0000-000000001202'::uuid, 'Spring 2026', 'SPR26-A2', 2, '09:00', '10:30', 'M-102', 40, now(), now()),
  ('00000000-0000-0000-0000-000000003103'::uuid, '00000000-0000-0000-0000-000000002103'::uuid, '00000000-0000-0000-0000-000000001203'::uuid, 'Spring 2026', 'SPR26-A3', 3, '09:00', '10:30', 'P-110', 42, now(), now()),
  ('00000000-0000-0000-0000-000000003104'::uuid, '00000000-0000-0000-0000-000000002104'::uuid, '00000000-0000-0000-0000-000000001205'::uuid, 'Spring 2026', 'SPR26-A4', 4, '09:00', '10:30', 'E-305', 38, now(), now()),
  ('00000000-0000-0000-0000-000000003105'::uuid, '00000000-0000-0000-0000-000000002105'::uuid, '00000000-0000-0000-0000-000000001206'::uuid, 'Spring 2026', 'SPR26-A5', 5, '09:00', '10:30', 'B-210', 40, now(), now()),
  ('00000000-0000-0000-0000-000000003106'::uuid, '00000000-0000-0000-0000-000000002106'::uuid, '00000000-0000-0000-0000-000000001208'::uuid, 'Spring 2026', 'SPR26-A6', 1, '11:00', '12:30', 'B-112', 36, now(), now()),
  ('00000000-0000-0000-0000-000000003107'::uuid, '00000000-0000-0000-0000-000000002107'::uuid, '00000000-0000-0000-0000-000000001201'::uuid, 'Spring 2026', 'SPR26-A7', 2, '11:00', '12:30', 'C-204', 44, now(), now()),
  ('00000000-0000-0000-0000-000000003108'::uuid, '00000000-0000-0000-0000-000000002108'::uuid, '00000000-0000-0000-0000-000000001202'::uuid, 'Spring 2026', 'SPR26-A8', 3, '11:00', '12:30', 'M-205', 40, now(), now()),
  ('00000000-0000-0000-0000-000000003109'::uuid, '00000000-0000-0000-0000-000000002109'::uuid, '00000000-0000-0000-0000-000000001207'::uuid, 'Spring 2026', 'SPR26-A9', 4, '11:00', '12:30', 'C-310', 42, now(), now()),
  ('00000000-0000-0000-0000-000000003110'::uuid, '00000000-0000-0000-0000-000000002110'::uuid, '00000000-0000-0000-0000-000000001204'::uuid, 'Spring 2026', 'SPR26-A10', 5, '11:00', '12:30', 'D-120', 42, now(), now())
on conflict (term, section_code) do update
set
  course_id = excluded.course_id,
  faculty_id = excluded.faculty_id,
  day_of_week = excluded.day_of_week,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  room = excluded.room,
  capacity = excluded.capacity,
  updated_at = now();

-- 8) Enrollments: each student gets 3-4 sections, deterministic and conflict-safe
with student_rows as (
  select id, row_number() over (order by student_number) as rn
  from public.students
  where student_number like 'ST2026%'
), section_rows as (
  select id, row_number() over (order by section_code) as rn
  from public.sections
  where term = 'Spring 2026' and section_code like 'SPR26-%'
), plan as (
  select st.id as student_id, s1.id as section_id, 1 as slot
  from student_rows st
  join section_rows s1 on s1.rn = ((st.rn - 1) % 10) + 1

  union all

  select st.id as student_id, s2.id as section_id, 2 as slot
  from student_rows st
  join section_rows s2 on s2.rn = ((st.rn + 1) % 10) + 1

  union all

  select st.id as student_id, s3.id as section_id, 3 as slot
  from student_rows st
  join section_rows s3 on s3.rn = ((st.rn + 4) % 10) + 1

  union all

  select st.id as student_id, s4.id as section_id, 4 as slot
  from student_rows st
  join section_rows s4 on s4.rn = ((st.rn + 6) % 10) + 1
  where (st.rn % 2 = 0)
), normalized_plan as (
  select distinct on (student_id, section_id)
    student_id,
    section_id,
    slot
  from plan
  order by student_id, section_id, slot
), seeded as (
  select
    (
      substr(md5(np.student_id::text || ':' || np.section_id::text), 1, 8) || '-' ||
      substr(md5(np.student_id::text || ':' || np.section_id::text), 9, 4) || '-' ||
      substr(md5(np.student_id::text || ':' || np.section_id::text), 13, 4) || '-' ||
      substr(md5(np.student_id::text || ':' || np.section_id::text), 17, 4) || '-' ||
      substr(md5(np.student_id::text || ':' || np.section_id::text), 21, 12)
    )::uuid as id,
    np.student_id,
    np.section_id,
    case when np.slot <= 2 then 'completed' else 'enrolled' end as status,
    (timestamp '2026-01-08 09:00:00+05:30' + ((np.slot - 1) * interval '5 days')) as enrolled_at
  from normalized_plan np
)
insert into public.enrollments (
  id,
  student_id,
  section_id,
  status,
  enrolled_at,
  created_at,
  updated_at
)
select
  s.id,
  s.student_id,
  s.section_id,
  s.status,
  s.enrolled_at,
  now(),
  now()
from seeded s
on conflict (student_id, section_id) do update
set
  status = excluded.status,
  enrolled_at = excluded.enrolled_at,
  updated_at = now();

-- 9) Gradebook items: 4 items per section
with item_templates as (
  select *
  from (
    values
      (1, 'assignment_1', 'Assignment 1', 'Problem solving set 1', 20.0::numeric, timestamp '2026-02-15 23:59:00+05:30'),
      (2, 'assignment_2', 'Assignment 2', 'Problem solving set 2', 20.0::numeric, timestamp '2026-03-10 23:59:00+05:30'),
      (3, 'midterm', 'Midterm Exam', 'In-class midterm exam', 30.0::numeric, timestamp '2026-04-05 23:59:00+05:30'),
      (4, 'final', 'Final Exam', 'Comprehensive final exam', 30.0::numeric, timestamp '2026-05-10 23:59:00+05:30')
  ) as t(slot, key_name, title, description, max_points, due_at)
), seeded as (
  select
    (
      substr(md5(sec.id::text || ':' || it.key_name), 1, 8) || '-' ||
      substr(md5(sec.id::text || ':' || it.key_name), 9, 4) || '-' ||
      substr(md5(sec.id::text || ':' || it.key_name), 13, 4) || '-' ||
      substr(md5(sec.id::text || ':' || it.key_name), 17, 4) || '-' ||
      substr(md5(sec.id::text || ':' || it.key_name), 21, 12)
    )::uuid as id,
    sec.id as section_id,
    it.title,
    it.description,
    it.max_points,
    it.due_at
  from public.sections sec
  cross join item_templates it
  where sec.term = 'Spring 2026' and sec.section_code like 'SPR26-%'
)
insert into public.gradebook_items (
  id,
  section_id,
  title,
  description,
  max_points,
  due_at,
  created_at,
  updated_at
)
select
  s.id,
  s.section_id,
  s.title,
  s.description,
  s.max_points,
  s.due_at,
  now(),
  now()
from seeded s
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  max_points = excluded.max_points,
  due_at = excluded.due_at,
  updated_at = now();

-- 10) Gradebook scores: realistic 60-100% scoring
with item_rank as (
  select
    gi.id,
    gi.section_id,
    gi.max_points,
    row_number() over (partition by gi.section_id order by gi.due_at nulls last, gi.created_at, gi.id) as item_pos
  from public.gradebook_items gi
  join public.sections sec on sec.id = gi.section_id
  where sec.term = 'Spring 2026' and sec.section_code like 'SPR26-%'
), target_enrollments as (
  select e.student_id, e.section_id, e.status
  from public.enrollments e
  join public.sections sec on sec.id = e.section_id
  where sec.term = 'Spring 2026' and sec.section_code like 'SPR26-%'
    and e.status in ('enrolled', 'completed')
), scoped as (
  select
    ir.id as item_id,
    te.student_id,
    ir.max_points,
    (
      60 + (
        abs((('x' || substr(md5(te.student_id::text || ':' || ir.id::text), 1, 8))::bit(32)::int)) % 41
      )
    )::numeric as pct,
    ir.item_pos,
    te.status
  from item_rank ir
  join target_enrollments te on te.section_id = ir.section_id
  where te.status = 'completed' or ir.item_pos <= 3
), seeded as (
  select
    (
      substr(md5(sc.item_id::text || ':' || sc.student_id::text), 1, 8) || '-' ||
      substr(md5(sc.item_id::text || ':' || sc.student_id::text), 9, 4) || '-' ||
      substr(md5(sc.item_id::text || ':' || sc.student_id::text), 13, 4) || '-' ||
      substr(md5(sc.item_id::text || ':' || sc.student_id::text), 17, 4) || '-' ||
      substr(md5(sc.item_id::text || ':' || sc.student_id::text), 21, 12)
    )::uuid as id,
    sc.item_id,
    sc.student_id,
    round((sc.max_points * sc.pct) / 100.0, 2) as score,
    case when sc.pct >= 90 then 'Excellent work'
         when sc.pct >= 75 then 'Good performance'
         else 'Needs improvement' end as feedback,
    timestamp '2026-05-15 18:00:00+05:30' as graded_at
  from scoped sc
)
insert into public.gradebook_scores (
  id,
  item_id,
  student_id,
  score,
  feedback,
  graded_at,
  created_at,
  updated_at
)
select
  s.id,
  s.item_id,
  s.student_id,
  s.score,
  s.feedback,
  s.graded_at,
  now(),
  now()
from seeded s
on conflict (item_id, student_id) do update
set
  score = excluded.score,
  feedback = excluded.feedback,
  graded_at = excluded.graded_at,
  updated_at = now();

-- 11) Grades: averages converted to letter grades for completed enrollments
with completed_enrollments as (
  select e.id as enrollment_id, e.student_id, e.section_id
  from public.enrollments e
  join public.sections sec on sec.id = e.section_id
  where e.status = 'completed'
    and sec.term = 'Spring 2026'
    and sec.section_code like 'SPR26-%'
), score_agg as (
  select
    ce.enrollment_id,
    sum(gs.score)::numeric as total_scored,
    sum(gi.max_points)::numeric as total_max
  from completed_enrollments ce
  join public.gradebook_items gi on gi.section_id = ce.section_id
  join public.gradebook_scores gs on gs.item_id = gi.id and gs.student_id = ce.student_id
  group by ce.enrollment_id
), graded as (
  select
    ce.enrollment_id,
    sec.faculty_id as submitted_by,
    round((sa.total_scored / nullif(sa.total_max, 0)) * 100.0, 2) as avg_pct
  from completed_enrollments ce
  join score_agg sa on sa.enrollment_id = ce.enrollment_id
  join public.sections sec on sec.id = ce.section_id
), mapped as (
  select
    (
      substr(md5(g.enrollment_id::text || ':grade'), 1, 8) || '-' ||
      substr(md5(g.enrollment_id::text || ':grade'), 9, 4) || '-' ||
      substr(md5(g.enrollment_id::text || ':grade'), 13, 4) || '-' ||
      substr(md5(g.enrollment_id::text || ':grade'), 17, 4) || '-' ||
      substr(md5(g.enrollment_id::text || ':grade'), 21, 12)
    )::uuid as id,
    g.enrollment_id,
    case
      when g.avg_pct >= 93 then 'A'
      when g.avg_pct >= 90 then 'A-'
      when g.avg_pct >= 87 then 'B+'
      when g.avg_pct >= 83 then 'B'
      when g.avg_pct >= 80 then 'B-'
      when g.avg_pct >= 77 then 'C+'
      when g.avg_pct >= 73 then 'C'
      when g.avg_pct >= 70 then 'C-'
      when g.avg_pct >= 65 then 'D'
      else 'F'
    end as letter_grade,
    case
      when g.avg_pct >= 93 then 4.00
      when g.avg_pct >= 90 then 3.70
      when g.avg_pct >= 87 then 3.30
      when g.avg_pct >= 83 then 3.00
      when g.avg_pct >= 80 then 2.70
      when g.avg_pct >= 77 then 2.30
      when g.avg_pct >= 73 then 2.00
      when g.avg_pct >= 70 then 1.70
      when g.avg_pct >= 65 then 1.00
      else 0.00
    end::numeric(3,2) as grade_points,
    g.submitted_by
  from graded g
)
insert into public.grades (
  id,
  enrollment_id,
  letter_grade,
  grade_points,
  submitted_by,
  submitted_at,
  created_at,
  updated_at
)
select
  m.id,
  m.enrollment_id,
  m.letter_grade,
  m.grade_points,
  m.submitted_by,
  timestamp '2026-05-20 17:00:00+05:30',
  now(),
  now()
from mapped m
on conflict (enrollment_id) do update
set
  letter_grade = excluded.letter_grade,
  grade_points = excluded.grade_points,
  submitted_by = excluded.submitted_by,
  submitted_at = excluded.submitted_at,
  updated_at = now();

-- 12) Transcripts: populate GPA-credit fields per completed enrollment
with completed_rows as (
  select
    e.id as enrollment_id,
    e.student_id,
    g.id as grade_id,
    g.grade_points,
    c.credits::numeric as credits
  from public.enrollments e
  join public.sections sec on sec.id = e.section_id
  join public.courses c on c.id = sec.course_id
  join public.grades g on g.enrollment_id = e.id
  where e.status = 'completed'
    and sec.term = 'Spring 2026'
    and sec.section_code like 'SPR26-%'
), seeded as (
  select
    (
      substr(md5(cr.enrollment_id::text || ':transcript'), 1, 8) || '-' ||
      substr(md5(cr.enrollment_id::text || ':transcript'), 9, 4) || '-' ||
      substr(md5(cr.enrollment_id::text || ':transcript'), 13, 4) || '-' ||
      substr(md5(cr.enrollment_id::text || ':transcript'), 17, 4) || '-' ||
      substr(md5(cr.enrollment_id::text || ':transcript'), 21, 12)
    )::uuid as id,
    cr.student_id,
    cr.enrollment_id,
    cr.grade_id,
    round(cr.credits, 2) as gpa_credits_attempted,
    round(case when cr.grade_points > 0 then cr.credits else 0 end, 2) as gpa_credits_earned,
    round(cr.grade_points * cr.credits, 2) as quality_points
  from completed_rows cr
)
insert into public.transcripts (
  id,
  student_id,
  enrollment_id,
  grade_id,
  gpa_credits_attempted,
  gpa_credits_earned,
  quality_points,
  created_at,
  updated_at
)
select
  s.id,
  s.student_id,
  s.enrollment_id,
  s.grade_id,
  s.gpa_credits_attempted,
  s.gpa_credits_earned,
  s.quality_points,
  now(),
  now()
from seeded s
on conflict (enrollment_id) do update
set
  grade_id = excluded.grade_id,
  gpa_credits_attempted = excluded.gpa_credits_attempted,
  gpa_credits_earned = excluded.gpa_credits_earned,
  quality_points = excluded.quality_points,
  updated_at = now();
