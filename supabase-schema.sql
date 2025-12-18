-- German Learning App - Supabase Database Schema
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: users
-- Stores user profile and learning stats
-- ============================================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_study_date TIMESTAMPTZ,
  total_study_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: lesson_progress
-- Tracks user progress through lessons
-- ============================================================================
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('locked', 'in-progress', 'completed')),
  current_step_index INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ============================================================================
-- TABLE: vocab_items
-- Stores user's saved vocabulary with SRS scheduling
-- ============================================================================
CREATE TABLE public.vocab_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  example TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  next_review TIMESTAMPTZ,
  srs_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: wrong_answers
-- Stores incorrect quiz answers for review
-- ============================================================================
CREATE TABLE public.wrong_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  step_type TEXT NOT NULL,
  question TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- Optimize common queries
-- ============================================================================
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX idx_vocab_items_user_id ON vocab_items(user_id);
CREATE INDEX idx_vocab_items_next_review ON vocab_items(next_review);
CREATE INDEX idx_wrong_answers_user_id ON wrong_answers(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS to ensure users can only access their own data
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrong_answers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: users table
-- ============================================================================
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- RLS POLICIES: lesson_progress table
-- ============================================================================
CREATE POLICY "Users can view own lesson progress" ON lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson progress" ON lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress" ON lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: vocab_items table
-- ============================================================================
CREATE POLICY "Users can view own vocab" ON vocab_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vocab" ON vocab_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vocab" ON vocab_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vocab" ON vocab_items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: wrong_answers table
-- ============================================================================
CREATE POLICY "Users can view own wrong answers" ON wrong_answers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wrong answers" ON wrong_answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- Auto-update updated_at timestamp on row updates
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vocab_items_updated_at BEFORE UPDATE ON vocab_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wrong_answers_updated_at BEFORE UPDATE ON wrong_answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPLETE!
-- Schema created successfully. Next steps:
-- 1. Enable Google OAuth in Authentication → Providers
-- 2. Add your Google OAuth credentials (AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET)
-- 3. Copy your Project URL and API keys to .env file
-- ============================================================================
