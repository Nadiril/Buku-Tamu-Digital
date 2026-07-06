-- Migration: Add no_hp column to profiles for staff/admin profile functionality
-- Run this in Supabase SQL Editor
-- Safe to re-run on existing database

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS no_hp text;

-- Allow users to update their own no_hp (already covered by existing RLS policy "Users can update own profile")
