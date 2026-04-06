-- =============================================================
-- Mock auth user for local/remote testing
-- Email:    alex.tan@example.com
-- Password: Test1234!
--
-- UUID matches seed.sql so all receipt data is already linked.
-- =============================================================

-- 1. Create the auth user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '8357269d-e69b-474e-9610-3a3776c14af1',
  'authenticated',
  'authenticated',
  'alex.tan@example.com',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Alex","last_name":"Tan"}',
  now(),
  now(),
  '',
  '',
  false
) ON CONFLICT (id) DO NOTHING;

-- 2. Create the identity record so email/password sign-in resolves correctly
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'alex.tan@example.com',
  '8357269d-e69b-474e-9610-3a3776c14af1',
  jsonb_build_object(
    'sub',            '8357269d-e69b-474e-9610-3a3776c14af1',
    'email',          'alex.tan@example.com',
    'email_verified', true
  ),
  'email',
  now(),
  now(),
  now()
) ON CONFLICT DO NOTHING;
