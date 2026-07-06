-- Migration: Add 'staff' role
-- Run this in Supabase SQL Editor
-- Safe to re-run on existing database

-- 1. Update profiles role check constraint to include 'staff'
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'scanner', 'staff'));

-- 2. Allow staff to read guests (read-only, no insert/update/delete)
DROP POLICY IF EXISTS "Staff can read guests" ON public.guests;
CREATE POLICY "Staff can read guests"
  ON public.guests FOR select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'staff')
  );

-- 3. Allow staff to read events (already covered by "Anyone can read events", but explicit)
DROP POLICY IF EXISTS "Staff can read events" ON public.events;
CREATE POLICY "Staff can read events"
  ON public.events FOR select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'staff')
  );

-- 4. Allow staff to read activities
DROP POLICY IF EXISTS "Staff can read activities" ON public.activities;
CREATE POLICY "Staff can read activities"
  ON public.activities FOR select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'staff')
  );
