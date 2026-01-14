-- Migration: Fix Supabase Security Issues
-- Date: 2026-01-14
--
-- Fixes:
-- 1. update_updated_at_column function has mutable search_path
-- 2. RLS policies re-evaluating auth.uid() for each row (performance)
--
-- Run this in Supabase SQL Editor:
-- Dashboard > SQL Editor > New Query > Paste & Run

-- ============================================================
-- Fix 1: Secure the update_updated_at_column function
-- Setting search_path to empty prevents SQL injection attacks
-- ============================================================
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- ============================================================
-- Fix 2: Optimize RLS policies on public.users
-- Change auth.uid() to (select auth.uid()) for single evaluation
-- ============================================================

-- Fix "Users can view own data"
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING ((select auth.uid()) = id);

-- Fix "Users can update own data"
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING ((select auth.uid()) = id);

-- Fix "Users can insert own data"
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- ============================================================
-- Verify the fixes
-- ============================================================
SELECT policyname, qual, with_check
FROM pg_policies
WHERE tablename = 'users' AND schemaname = 'public';

-- Note: For "Leaked password protection" (HaveIBeenPwned):
-- Go to: Authentication > Settings > Security > Enable "Leaked password protection"
-- This cannot be done via SQL, must be enabled in dashboard.
