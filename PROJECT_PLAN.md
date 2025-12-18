# 🇩🇪 Deutschlern-PWA Project Plan

> **Vision:** A "Busuu-like" German learning app specifically tailored for Persian (Farsi) speakers.
> **Approach:** AI-Assisted Vibe Coding (Iterative, Fast, User-Centric).
> **Status:** Phase 1 (Foundation) - *Active*

---

## 🏗 Architecture & Tech Stack

- **Monorepo:** TurboRepo + PNPM Workspaces
- **Frontend (App):** SvelteKit (`apps/web`) + Tailwind CSS
- **Backend (API):** Node.js/Hono/Fastify (Placeholder in `apps/api`) - *Planned for Phase 3*
- **Database (Local):** Dexie.js (IndexedDB) for offline-first capability.
- **Database (Remote):** Postgres (Supabase/Neon) + Prisma/Drizzle - *Planned for Phase 3*
- **Content:** Static JSON (typed via `@pkg/content-model`).
- **Auth:** Auth.js (Google Provider).
- **SRS Engine:** Custom Spaced Repetition Logic (`@pkg/srs-engine`).

---

## 🚦 Current Status Snapshot
*Last Updated: Dec 18, 2025*

- **✅ Repository Setup:** TurboRepo, Workspaces, TS Configured.
- **✅ Authentication:** Google Login implemented via Auth.js.
- **✅ Content Schema:** Basic Zod schemas for Lessons/Steps defined.
- **🚧 UI Components:** Basic Shell exists, need specific Learning components.
- **🚧 SRS Engine:** Placeholder only. Needs implementation.
- **🔴 Content Rendering:** Not started.
- **🔴 Backend Sync:** Not started.

---

## 🗺 Detailed Roadmap

### 🏁 Phase 1: Foundation (The "Offline" MVP)
**Goal:** A user can log in, select a lesson from a static JSON list, complete it, and see their local progress saved.

#### 1.1 Project Setup & Auth
- [x] Monorepo initialization (Turbo, PNPM).
- [x] Web App scaffolding (SvelteKit).
- [x] Configure Tailwind CSS & Fonts (Vazirmatn/Inter).
- [x] **Authentication:** Google Sign-In setup.
    - [x] `hooks.server.ts` integration.
    - [x] Login Page UI.
    - [x] Protected Routes setup.

#### 1.2 Content Modeling & Management
- [x] Define `Lesson` and `Step` schemas in `@pkg/content-model` (Zod).
- [ ] **Expand Schema:** Add more step types (Matching, FillBlank, Listening).
- [ ] **Content Seeding:** Create `content/de-fa/A1/module-01/lesson-01.json` with real data.
- [ ] **Content Loader:** Create a utility to read/import JSON content into the app.

#### 1.3 Core UI & Lesson Rendering
- [ ] **Dashboard:** Show list of Modules/Lessons.
- [ ] **Lesson Runner (The "Engine"):**
    - [ ] `StepRenderer.svelte`: A component that switches based on step type.
    - [ ] `QuizStep.svelte`: UI for multiple choice.
    - [ ] `DialogStep.svelte`: UI for chat-like dialogs.
    - [ ] `TheoryStep.svelte`: Markdown/Text explanation.
- [ ] **Progress Bar:** Visual indicator during the lesson.
- [ ] **Completion Screen:** "Lesson Finished" summary.

#### 1.4 Local Persistence (Dexie.js)
- [ ] Initialize Dexie DB in `apps/web/src/lib/db.ts`.
- [ ] Define Stores: `userProgress`, `srsItems`.
- [ ] Save lesson completion status locally.

#### 1.5 Basic SRS Engine
- [ ] Implement SM-2 or FSRS algorithm in `@pkg/srs-engine`.
- [ ] Connect "Review" session in UI to fetch due cards from Dexie.

---

### 🚀 Phase 2: The "Rich" Experience
**Goal:** Add audio, polish the UI, and ensure it feels like a native app.

#### 2.1 Audio & Media
- [ ] Audio storage strategy (Cloudinary/R2 or static assets).
- [ ] Audio Player component (for pronunciation).
- [ ] **Microphone Integration:** Record user voice (basic playback for self-check).

#### 2.2 Advanced Exercises
- [ ] **Drag & Drop:** Order words to form sentences.
- [ ] **Listening Comprehension:** Audio clip -> Question.
- [ ] **Pair Matching:** Connect German word to Persian translation.

#### 2.3 User Progress UI
- [ ] Profile Page.
- [ ] Daily Streak calculation (Local storage based).
- [ ] Level progression (A1 -> A2).

---

### ☁️ Phase 3: Backend & Cloud Sync
**Goal:** Users can switch devices and keep progress.

#### 3.1 Backend Setup (`apps/api`)
- [ ] Initialize Server framework (Hono/Express).
- [ ] Setup Remote Database (Postgres).
- [ ] Setup Prisma/Drizzle ORM.

#### 3.2 Synchronization Strategy
- [ ] **Sync Logic:** Merge Local Dexie data with Server DB.
- [ ] **API Endpoints:**
    - `POST /sync`: Push local changes.
    - `GET /profile`: Fetch remote state.

---

### 🏆 Phase 4: Social & Gamification (Busuu Vibes)
**Goal:** Increase retention through community and fun.

- [ ] **Community Corrections:** Users can submit text/audio for native speakers to correct.
- [ ] **Leaderboards:** Weekly XP rankings.
- [ ] **Badges/Achievements:** "7 Day Streak", "Vocab Master".
- [ ] **Push Notifications:** Reminders to practice.

---

### 📝 Immediate Next Steps (For the Team)
**Linear Board Active:** Tickets `LAN-5` to `LAN-8` created.

1.  **LAN-5 (Done):** Database - Set up Dexie.js Schema & Store.
2.  **LAN-6 (Done):** Content - Create the first real lesson JSON file.
3.  **LAN-7 (Done):** UI - Build `StepRenderer` component.
4.  **LAN-8 (Done):** Logic - Implement Lesson Runner state management.
5.  **LAN-9 (Done):** UI - Build Dashboard & Module List (Link to lessons).


