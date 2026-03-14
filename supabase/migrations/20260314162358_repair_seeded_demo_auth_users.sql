-- Normalize SQL-seeded demo auth.users rows for password login.
-- Supabase auth can reject otherwise valid seeded users when certain token fields
-- remain NULL even though the table allows them.

do $$
declare
  demo_instance_id uuid;
begin
  select coalesce(
    (select id from auth.instances limit 1),
    '00000000-0000-0000-0000-000000000000'::uuid
  )
  into demo_instance_id;

  update auth.users
  set
    instance_id = coalesce(instance_id, demo_instance_id),
    aud = coalesce(nullif(aud, ''), 'authenticated'),
    role = coalesce(nullif(role, ''), 'authenticated'),
    email = lower(email),
    encrypted_password = coalesce(nullif(encrypted_password, ''), crypt('Demo@12345', gen_salt('bf'))),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb),
    updated_at = now()
  where email ilike '%@demo-campus.edu';

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'users'
      and column_name = 'confirmation_token'
  ) then
    execute $sql$
      update auth.users
      set confirmation_token = coalesce(confirmation_token, '')
      where email ilike '%@demo-campus.edu'
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'users'
      and column_name = 'recovery_token'
  ) then
    execute $sql$
      update auth.users
      set recovery_token = coalesce(recovery_token, '')
      where email ilike '%@demo-campus.edu'
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'users'
      and column_name = 'email_change'
  ) then
    execute $sql$
      update auth.users
      set email_change = coalesce(email_change, '')
      where email ilike '%@demo-campus.edu'
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'users'
      and column_name = 'email_change_token_new'
  ) then
    execute $sql$
      update auth.users
      set email_change_token_new = coalesce(email_change_token_new, '')
      where email ilike '%@demo-campus.edu'
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'users'
      and column_name = 'email_change_token_current'
  ) then
    execute $sql$
      update auth.users
      set email_change_token_current = coalesce(email_change_token_current, '')
      where email ilike '%@demo-campus.edu'
    $sql$;
  end if;
end
$$;
