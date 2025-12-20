# 🇩🇪 Deutschlern-PWA Project Plan

> **Vision:** A "Busuu-like" German learning app specifically tailored for Persian (Farsi) speakers.
> **Approach:** AI-Assisted Iterative Development (Fast, User-Centric).
> **Status:** Phase 1.5 (Core Features Complete) → Phase 2 (Practice & Polish)

---

## 🏗 Architecture & Tech Stack

- **Monorepo:** TurboRepo + PNPM Workspaces
- **Frontend (App):** SvelteKit 2.5.0 (`apps/web`) + Custom CSS
- **Backend (API):** Supabase (PostgreSQL + Auth + Real-time)
- **Database (Local):** Dexie.js (IndexedDB) for offline-first capability
- **Database (Remote):** Supabase PostgreSQL with Row Level Security (RLS)
- **Content:** Static JSON (typed via `@pkg/content-model`) - 12 lessons across 6 modules (A1 level)
- **Auth:** Supabase Auth with Google OAuth
- **Sync:** Background cloud sync (local-first architecture)
- **SRS Engine:** Leitner System (5 boxes) for vocabulary review
- **TTS:** Web Speech API for German pronunciation

---

## 🚦 Current Status Snapshot
*Last Updated: Dec 20, 2024*

### ✅ Completed Features

**Core Infrastructure:**
- ✅ TurboRepo monorepo with PNPM workspaces
- ✅ SvelteKit app with SSR and static builds
- ✅ Supabase integration (Auth + Database)
- ✅ Cloud sync engine (local IndexedDB ↔ Supabase PostgreSQL)
- ✅ Offline-first architecture with background sync
- ✅ Persian (RTL) UI throughout the app
- ✅ Responsive design for mobile/tablet/desktop

**Authentication & User Management:**
- ✅ Supabase Auth with Google OAuth
- ✅ Row Level Security (RLS) policies
- ✅ Session management
- ✅ Login/Logout flow with account picker

**Content & Lessons:**
- ✅ 12 lessons across 6 modules (A1 level complete)
- ✅ Content model with multiple step types:
  - ✅ New Word Steps (Busuu-style vocab cards)
  - ✅ Multiple Choice Quiz
  - ✅ Dialog Practice
  - ✅ Grammar Tips
  - ✅ Fill in the Blank
  - ✅ True/False
  - ✅ Matching
- ✅ Lesson runner with step-by-step navigation
- ✅ Progress tracking (resume from where you left off)
- ✅ Score calculation and XP rewards

**Vocabulary System:**
- ✅ Save words to vocabulary list
- ✅ Leitner SRS system (5 boxes: 1 day → 3 days → 1 week → 2 weeks → 1 month)
- ✅ Flashcard review interface
- ✅ Flip animation for flashcards
- ✅ Auto-scheduling of reviews
- ✅ Wrong answers tracking for review

**Audio & Pronunciation:**
- ✅ TTS integration (Web Speech API)
- ✅ German pronunciation for new words
- ✅ Playback controls in vocabulary cards
- ✅ Speed control for audio

**Progress Tracking:**
- ✅ User stats (XP, streak, study time)
- ✅ Daily streak calculation
- ✅ Lesson completion status (locked/unlocked/in-progress/completed)
- ✅ Score per lesson
- ✅ Wrong answers database
- ✅ Progress page with:
  - ✅ Overview statistics
  - ✅ Module progress breakdown
  - ✅ Vocabulary mastery by SRS level
  - ✅ Encouragement messages

**UI/UX Components:**
- ✅ Dashboard with lesson timeline
- ✅ Navigation bar with auth state
- ✅ Module organization (6 modules)
- ✅ VocabPill design system (reusable pill/badge components)
- ✅ VocabPillList parser (auto-renders vocab pairs as pills)
- ✅ Footer with quick links
- ✅ Responsive layouts

**Deployment:**
- ✅ Vercel deployment (production)
- ✅ Capacitor Android setup (static build)
- ✅ Environment configuration
- ✅ Git repository (GitHub)

### 🚧 In Progress / Known Issues

- 🚧 `/practice` route (404 - needs implementation)
- 🚧 Language switcher (buttons exist but not functional)
- 🚧 Android APK not fully functional (launcher icon issue)

### 🔴 Not Started

- 🔴 Listening comprehension exercises
- 🔴 Speaking practice with recording
- 🔴 Writing exercises (sentence construction)
- 🔴 Community features (native speaker corrections)
- 🔴 Gamification (badges, leaderboards)
- 🔴 Push notifications
- 🔴 A2/B1 level content

---

## 📋 Current Sprint: Practice Hub Implementation

### **NEXT UP: LAN-13 - Practice Hub (Simple & Practical)**

**Goal:** Create `/practice` route with a practice hub that centralizes practice activities and leverages existing features.

#### Phase 1: Practice Hub Dashboard (30 mins) - **PRIORITY**
- [ ] **LAN-13.1:** Create `/practice/+page.svelte` route
- [ ] **LAN-13.2:** Design practice hub layout with 4 practice modes:
  - [ ] Vocabulary Review (link to `/review/flashcards`)
  - [ ] Practice Your Mistakes (new feature)
  - [ ] Random Drill (mixed exercises)
  - [ ] Listening Practice (coming soon placeholder)
- [ ] **LAN-13.3:** Display real-time stats:
  - [ ] Cards due count (from `db.vocab`)
  - [ ] Wrong answers count (from `db.wrongAnswers`)
  - [ ] Completed lessons count
- [ ] **LAN-13.4:** Add Persian labels and RTL support
- [ ] **LAN-13.5:** Style cards with hover effects and icons

#### Phase 2: Practice Your Mistakes Feature (1-2 hours)
- [ ] **LAN-13.6:** Create `/practice/mistakes/+page.svelte` route
- [ ] **LAN-13.7:** Build mistake review component:
  - [ ] Load unreviewed wrong answers from `db.wrongAnswers`
  - [ ] Display question in original format
  - [ ] Show user's wrong answer vs. correct answer
  - [ ] Re-test user on the same question
  - [ ] Mark as reviewed when answered correctly
- [ ] **LAN-13.8:** Add navigation (Next/Previous/Exit)
- [ ] **LAN-13.9:** Update `reviewedAt` timestamp in database
- [ ] **LAN-13.10:** Show completion message when all mistakes reviewed

#### Phase 3: Testing & Polish (30 mins)
- [ ] **LAN-13.11:** Test all practice modes
- [ ] **LAN-13.12:** Ensure responsive design on mobile
- [ ] **LAN-13.13:** Verify sync works with cloud
- [ ] **LAN-13.14:** Commit and push changes

**Estimated Time:** 2-3 hours total
**Priority:** High (fixes 404 error in main navigation)

---

## 🗺 Detailed Roadmap

### ✅ Phase 1: Foundation (Complete)
**Goal:** A user can log in, select a lesson, complete it, and see progress saved.

#### 1.1 Project Setup & Auth ✅
- [x] Monorepo initialization (Turbo, PNPM)
- [x] Web App scaffolding (SvelteKit)
- [x] Configure Tailwind CSS & Fonts (Vazirmatn/Inter)
- [x] **Authentication:** Supabase Auth with Google OAuth
    - [x] Session management in `hooks.server.ts`
    - [x] Login Page UI with account picker
    - [x] Protected Routes setup
    - [x] Logout functionality

#### 1.2 Content Modeling & Management ✅
- [x] Define `Lesson` and `Step` schemas in `@pkg/content-model` (Zod)
- [x] **Expand Schema:** Multiple step types (Quiz, Dialog, Grammar, Fill Blank, etc.)
- [x] **Content Seeding:** 12 lessons across 6 modules (A1 complete)
- [x] **Content Loader:** Dynamic module resolution for lesson imports

#### 1.3 Core UI & Lesson Rendering ✅
- [x] **Dashboard:** Module/Lesson timeline with progress indicators
- [x] **Lesson Runner (The "Engine"):**
    - [x] `StepRenderer.svelte`: Dynamic component switching
    - [x] `MultipleChoiceStep.svelte`: Quiz UI
    - [x] `DialogStep.svelte`: Chat-like dialogs
    - [x] `GrammarTipStep.svelte`: Grammar explanations
    - [x] `NewWordStep.svelte`: Busuu-style vocabulary cards
    - [x] `FillBlankStep.svelte`: Fill in the blank exercises
    - [x] `TrueFalseStep.svelte`: True/false questions
    - [x] `MatchingStep.svelte`: Pair matching exercises
- [x] **Progress Bar:** Visual indicator during lessons
- [x] **Completion Screen:** Summary with score and XP gained
- [x] **Wrong Answers Review:** Display mistakes at end of lesson

#### 1.4 Local Persistence (Dexie.js) ✅
- [x] Initialize Dexie DB in `apps/web/src/lib/db.ts`
- [x] Define Stores: `users`, `lessonProgress`, `vocab`, `wrongAnswers`
- [x] Save lesson completion status locally
- [x] Track current step index for resume capability
- [x] Store scores and timestamps

#### 1.5 SRS Engine ✅
- [x] Implement Leitner System (5 boxes) in `srsScheduler.ts`
- [x] Connect "Review" session to fetch due cards from Dexie
- [x] Flashcard UI with flip animation
- [x] Auto-schedule next review dates
- [x] Vocabulary list page

---

### 🚧 Phase 2: Rich Experience (In Progress)
**Goal:** Add audio, practice modes, and polish the UI.

#### 2.1 Audio & Media ✅
- [x] TTS integration (Web Speech API)
- [x] Audio Player component for pronunciation
- [ ] **Microphone Integration:** Record user voice (future)

#### 2.2 Advanced Exercises 🚧
- [x] **Matching:** Connect German word to Persian translation
- [x] **Fill in the Blank:** Complete sentences
- [x] **True/False:** Comprehension questions
- [ ] **Drag & Drop:** Order words to form sentences (future)
- [ ] **Listening Comprehension:** Audio clip → Question (future)

#### 2.3 User Progress UI ✅
- [x] Progress Page (`/progress`)
- [x] Daily Streak calculation
- [x] XP and study time tracking
- [x] Module completion percentages
- [x] Vocabulary mastery by SRS level

#### 2.4 Practice Hub 🔴 **← CURRENT FOCUS**
- [ ] Practice Hub Dashboard (`/practice`)
- [ ] Practice Your Mistakes feature
- [ ] Random drill mode
- [ ] Listening practice (placeholder)

---

### ☁️ Phase 3: Backend & Cloud Sync ✅ (Complete)
**Goal:** Users can switch devices and keep progress.

#### 3.1 Backend Setup ✅
- [x] Supabase project setup
- [x] PostgreSQL database with RLS
- [x] Database schema (users, lesson_progress, vocab_items, wrong_answers)

#### 3.2 Synchronization Strategy ✅
- [x] **Sync Logic:** Background sync (IndexedDB ↔ Supabase)
- [x] **SyncEngine:** Push/pull changes every 30s
- [x] **Conflict Resolution:** Last-write-wins
- [x] **Offline Support:** Works without internet, syncs when online

#### 3.3 Deployment ✅
- [x] Vercel deployment (production)
- [x] Environment variables configuration
- [x] Static build for Capacitor

---

### 🏆 Phase 4: Social & Gamification (Future)
**Goal:** Increase retention through community and fun.

- [ ] **Community Corrections:** Users submit text/audio for native speakers
- [ ] **Leaderboards:** Weekly XP rankings
- [ ] **Badges/Achievements:** "7 Day Streak", "Vocab Master"
- [ ] **Push Notifications:** Reminders to practice
- [ ] **Friend System:** Compare progress with friends

---

## 📝 Completed Tickets

### Recent Completed Work
- **LAN-12 (Done):** UI - VocabPill Design System for better readability
- **LAN-11 (Done):** UI - My Progress page with Persian UI
- **LAN-10 (Done):** Feature - Vocabulary list and save feature
- **LAN-9 (Done):** UI - Dashboard & Module timeline
- **LAN-8 (Done):** Logic - Lesson runner state management
- **LAN-7 (Done):** UI - StepRenderer component with all step types
- **LAN-6 (Done):** Content - 12 lessons across 6 modules (A1 complete)
- **LAN-5 (Done):** Database - Dexie.js schema & store
- **LAN-4 (Done):** Feature - Cloud sync with Supabase
- **LAN-3 (Done):** Auth - Migrate to Supabase Auth
- **LAN-2 (Done):** Feature - TTS for German pronunciation
- **LAN-1 (Done):** Setup - Initial repository and SvelteKit config

---

## 🎯 Immediate Next Steps

### This Week's Focus: **Practice Hub**
1. **LAN-13 (Now):** Implement Practice Hub with 4 modes
   - Priority: Fix `/practice` 404 error
   - Add "Practice Your Mistakes" feature
   - Link to existing review features

### After Practice Hub:
2. **LAN-14:** Fix language switcher (FA/DE/EN buttons)
3. **LAN-15:** Add more lessons (extend to 20+ lessons for A1)
4. **LAN-16:** Listening comprehension exercises
5. **LAN-17:** Drag-and-drop sentence ordering
6. **LAN-18:** Speaking practice with recording

---

## 📊 Progress Metrics

### Content
- **Modules Created:** 6/6 (A1 level)
- **Lessons Created:** 12/20 (target 20 for A1)
- **Step Types:** 8/10 (missing: Drag-Drop, Listening Comprehension)

### Features
- **Core Features:** 95% complete
- **Practice Features:** 40% complete (flashcards done, practice hub pending)
- **Social Features:** 0% (planned for Phase 4)

### Deployment
- **Web App:** ✅ Live on Vercel
- **Mobile App:** 🚧 Capacitor configured, needs fixes

---

## 🛠 Technical Debt & Known Issues

1. **Android APK:** Launcher icon not visible, needs troubleshooting
2. **Language Switcher:** Buttons present but not functional
3. **Build artifacts:** `/build` folder committed (should be gitignored)
4. **Content loading:** Some edge cases with module resolution
5. **Sync conflicts:** Last-write-wins may cause data loss in rare cases (needs CRDT)

---

## 📚 Documentation Links

- **GitHub Repository:** https://github.com/MohsenDarabi/german-app-se
- **Vercel Deployment:** https://german-app-se.vercel.app
- **Supabase Project:** https://iultvpmyljdfpaswhhfl.supabase.co
- **Content Model:** `/packages/content-model/src/index.ts`
- **Database Schema:** `/apps/web/src/lib/db/index.ts`

---

*This plan is a living document. Update after each significant milestone.*
