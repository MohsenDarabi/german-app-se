-- Migration: Fix Supabase Security Issues
-- Date: 2026-01-14
--
-- Fixes:
-- 1. update_updated_at_column function has mutable search_path
--
-- Run this in Supabase SQL Editor:
-- Dashboard > SQL Editor > New Query > Paste & Run

-- Fix 1: Secure the update_updated_at_column function
-- Setting search_path to empty prevents SQL injection attacks
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- Verify the fix
SELECT
    proname AS function_name,
    proconfig AS config
FROM pg_proc
WHERE proname = 'update_updated_at_column';

-- Note: For "Leaked password protection" (HaveIBeenPwned):
-- Go to: Authentication > Settings > Security > Enable "Leaked password protection"
-- This cannot be done via SQL, must be enabled in dashboard.
