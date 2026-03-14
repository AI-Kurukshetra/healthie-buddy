-- Backfill auth.identities for demo users seeded via 20260314150500_seed_demo_data.sql
-- Ensures email/password logins succeed by registering email provider identities.
-- Repairs both missing identities and any prior rows keyed with the wrong provider_id.

with seed_users as (
  select *
  from (
    values
      ('00000000-0000-0000-0000-000000000101'::uuid, 'aarav.sharma@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000102'::uuid, 'ishita.verma@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000103'::uuid, 'rohan.gupta@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000104'::uuid, 'ananya.reddy@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000105'::uuid, 'kunal.mehta@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000106'::uuid, 'priya.nair@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000107'::uuid, 'aditya.singh@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000108'::uuid, 'sneha.kulkarni@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000109'::uuid, 'rahul.iyer@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000110'::uuid, 'neha.patel@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000111'::uuid, 'vikram.joshi@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000112'::uuid, 'pooja.menon@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000113'::uuid, 'arjun.malhotra@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000114'::uuid, 'diya.kapoor@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000115'::uuid, 'nikhil.desai@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000116'::uuid, 'aisha.khan@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000117'::uuid, 'siddharth.rao@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000118'::uuid, 'meera.chawla@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000119'::uuid, 'yash.agarwal@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000120'::uuid, 'tanvi.bhatt@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000121'::uuid, 'harsh.vyas@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000122'::uuid, 'ritika.sinha@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000123'::uuid, 'devansh.jain@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000124'::uuid, 'kriti.arora@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000125'::uuid, 'manav.saxena@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000126'::uuid, 'nandini.pillai@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000127'::uuid, 'pranav.shetty@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000128'::uuid, 'simran.kaur@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000129'::uuid, 'omkar.pawar@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000130'::uuid, 'ira.banerjee@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000201'::uuid, 'ananya.iyer@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000202'::uuid, 'rohan.kulkarni@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000203'::uuid, 'meera.nair@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000204'::uuid, 'arvind.menon@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000205'::uuid, 'priya.bhat@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000206'::uuid, 'sandeep.rao@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000207'::uuid, 'kavita.sharma@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000208'::uuid, 'vivek.patel@demo-campus.edu'),
      ('00000000-0000-0000-0000-000000000301'::uuid, 'aditi.narang@demo-campus.edu')
  ) as t(user_id, email)
), existing_demo_users as (
  select au.id as user_id, au.email
  from auth.users au
  join seed_users su on su.user_id = au.id
), normalized_identities as (
  select
    edu.user_id,
    edu.user_id::text as provider_id,
    edu.email,
    jsonb_build_object(
      'sub',
      edu.user_id::text,
      'email',
      edu.email,
      'email_verified',
      true
    ) as identity_data
  from existing_demo_users edu
), updated_identities as (
  update auth.identities ai
  set
    provider_id = ni.provider_id,
    identity_data = ni.identity_data,
    updated_at = now()
  from normalized_identities ni
  where ai.user_id = ni.user_id
    and ai.provider = 'email'
  returning ai.user_id
)
insert into auth.identities (
  id,
  user_id,
  provider,
  provider_id,
  identity_data,
  created_at,
  updated_at
)
select
  ni.user_id,
  ni.user_id,
  'email',
  ni.provider_id,
  ni.identity_data,
  now(),
  now()
from normalized_identities ni
where not exists (
  select 1
  from auth.identities ai
  where ai.user_id = ni.user_id
    and ai.provider = 'email'
);
