-- Staff account seed data
-- Run this AFTER the staff_role_migration.sql
-- Default credentials: staff@bukutamu.id / staff123456
-- Safe to re-run (skips if user already exists)

-- Enable pgcrypto if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert staff user into auth.users only if not already exists
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_token,
  confirmation_token,
  confirmation_token_new,
  email_change_token_new,
  email_change,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  confirmation_token_new_sent_at,
  email_change_token_new_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_confirm_status
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'staff@bukutamu.id',
  crypt('staff123456', gen_salt('bf')),
  now(),
  '',
  '',
  '',
  '',
  '',
  '',
  0,
  0,
  null,
  null,
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "staff", "display_name": "Staff"}',
  now(),
  now(),
  null,
  null,
  '',
  '',
  0
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'staff@bukutamu.id'
);

-- Verify: this should show the staff profile
-- SELECT p.* FROM profiles p JOIN auth.users u ON p.id = u.id WHERE u.email = 'staff@bukutamu.id';
