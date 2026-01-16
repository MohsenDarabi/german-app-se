-- Migration: Add language_pair column for multi-language support
-- Date: 2026-01-16
--
-- Adds language_pair column to lesson_progress table to support
-- separate progress tracking for different language pairs (de-fa, en-fa, etc.)
--
-- Run this in Supabase SQL Editor:
-- Dashboard > SQL Editor > New Query > Paste & Run

-- ============================================================
-- Step 1: Add language_pair column with default value
-- ============================================================
ALTER TABLE public.lesson_progress
ADD COLUMN IF NOT EXISTS language_pair TEXT DEFAULT 'de-fa' NOT NULL;

-- ============================================================
-- Step 2: Drop the old unique constraint and create new one
-- Old: (user_id, lesson_id)
-- New: (user_id, language_pair, lesson_id)
-- ============================================================

-- First, find and drop existing unique constraint on user_id, lesson_id
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the constraint name
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'lesson_progress'
        AND tc.constraint_type = 'UNIQUE'
        AND tc.table_schema = 'public'
    GROUP BY tc.constraint_name
    HAVING COUNT(*) = 2
        AND SUM(CASE WHEN kcu.column_name IN ('user_id', 'lesson_id') THEN 1 ELSE 0 END) = 2;

    -- Drop if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.lesson_progress DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END IF;
END $$;

-- Also try dropping by common names (in case the above didn't find it)
ALTER TABLE public.lesson_progress DROP CONSTRAINT IF EXISTS lesson_progress_user_id_lesson_id_key;
ALTER TABLE public.lesson_progress DROP CONSTRAINT IF EXISTS lesson_progress_pkey;

-- Create new unique constraint including language_pair
ALTER TABLE public.lesson_progress
ADD CONSTRAINT lesson_progress_user_language_lesson_unique
UNIQUE (user_id, language_pair, lesson_id);

-- ============================================================
-- Step 3: Create index for better query performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_lesson_progress_language_pair
ON public.lesson_progress (user_id, language_pair);

-- ============================================================
-- Step 4: Update RLS policies to include language_pair check
-- (Users should only access their own progress for any language)
-- ============================================================

-- The existing RLS policies check user_id, which is sufficient
-- since language_pair is just a filter, not a security boundary

-- ============================================================
-- Verify the changes
-- ============================================================
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'lesson_progress'
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'lesson_progress'
  AND table_schema = 'public';
