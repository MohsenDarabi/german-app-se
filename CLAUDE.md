# AI Agent Entry Point: German Learning App

> **Read this first.** This file provides essential context for AI agents working on this project.

---

## Project Overview

**Deutschlern** - A German learning PWA for **Persian speakers** (Farsi).

| Aspect | Details |
|--------|---------|
| **Framework** | SvelteKit + TypeScript |
| **Content** | JSON lessons following CEFR levels (A1, A2, B1, B2) |
| **Languages** | German → Persian (bilingual) |
| **Audio** | Google Cloud TTS (Chirp3-HD) |
| **Target** | Adult Persian speakers learning German |

---

## Workspaces

```
THIS APP (Integration):
/Volumes/External_ssd_mohsen/WorkspaceExtern/german-learning-app-main

CONTENT LAB (Creation):
/Volumes/External_ssd_mohsen/WorkspaceExtern/languageAppContent
```

**Important**: Content is created in two places and merged here. See Content Pipeline below.

---

## Content Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                      CONTENT SOURCES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Source 1: languageAppContent/phase3-lessons/                   │
│            (Created from PDF textbooks by Content Creator Agent)│
│                                                                 │
│  Source 2: extracted-content/busuu/                             │
│            (Extracted from Busuu app)                           │
│                                                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COMPARISON & MERGE                           │
│         docs/tasks/content-comparison-task.md                   │
│                                                                 │
│  • Compare vocabulary coverage                                  │
│  • Identify gaps in both sources                                │
│  • Add Persian-specific cultural notes                          │
│  • Create unique merged content                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FINAL LESSONS                                │
│              content/de-fa/{level}/                             │
│                                                                 │
│  • Validated JSON format                                        │
│  • German + Persian translations                                │
│  • Grammar tips for Persian speakers                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌──────────────────────┐    ┌──────────────────────┐
│   AUDIO GENERATION   │    │   MULTIMEDIA TASKS   │
│ scripts/generate-    │    │ docs/multimedia-     │
│ audio.js             │    │ tasks/START-HERE.md  │
│                      │    │                      │
│ • Chirp3-HD TTS      │    │ • Images by concept  │
│ • Deduplication      │    │ • Asset registry     │
│ • Auto-manifest      │    │ • Colleague creates  │
└──────────────────────┘    └──────────────────────┘
```

---

## Current Status

| Level | Lessons | Content | Audio | Multimedia |
|-------|---------|---------|-------|------------|
| **A1** | 1 | 🔄 New pipeline started | ✅ 1 lesson | 🔄 1 task file |
| **A2** | 0 | ⏳ Pending | ❌ Not generated | ❌ Not created |
| **B1** | 0 | ⏳ Busuu extracted, needs fusion | ❌ Not generated | ❌ Not created |
| **B2** | 0 | ⏳ Busuu extracted, needs fusion | ❌ Not generated | ❌ Not created |

> **Note:** Legacy 35 lessons archived to `/Volumes/External_ssd_mohsen/WorkspaceExtern/content-archive/legacy-v1/`
> See `docs/CONTENT_ARCHIVE.md` for details.

---

## Key Documents

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **`docs/LESSON_CREATION_PIPELINE.md`** | **Step-by-step lesson creation (MANDATORY)** | **Before creating ANY lesson** |
| `docs/CONTENT_ARCHIVE.md` | Legacy content archive reference | When needing old lessons |
| `scripts/content-fusion-agent.md` | Content fusion prompt template | When merging Babbel + Busuu |
| `scripts/multimedia-task-agent.md` | Multimedia task generation prompt | When creating task files |
| `docs/TODO-AUTH-BYPASS.md` | Dev mode auth bypass (temporary) | When debugging auth |

---

## Lesson Creation Pipeline (AI Agent MUST Follow)

```
1. Create lesson JSON (merge Babbel + Busuu)
2. Run validation: node scripts/validate-lesson.js <file>  ← MANDATORY
3. Fix any validation errors
4. Generate multimedia tasks
5. Generate audio
6. Update modules.ts
7. Test in browser
8. Commit
```

**See `docs/LESSON_CREATION_PIPELINE.md` for full details and 21 validation rules.**

---

## AI Agent Roles

### Role 1: Content Integrator (THIS AGENT)
**Workspace**: This app (`german-learning-app-main`)

Responsibilities:
- Merge Babbel + Busuu content using fusion agent prompt
- **Run validation script on EVERY lesson created**
- Generate multimedia task files
- Generate TTS audio
- Update modules.ts
- Test and commit

### Role 2: Multimedia Creator (Human Colleague)
**Reference**: `docs/multimedia-tasks/{Level}/{LessonId}-tasks.json`

Responsibilities:
- Create images/videos following task specs
- Save to `apps/web/static/images/shared/{category}/`
- Mark tasks complete in task files

---

## Critical Commands

```bash
# Validate a lesson (MANDATORY before audio/commit)
node scripts/validate-lesson.js content/de-fa/A1/module-01/A1-M01-L01.json

# Validate all lessons
node scripts/validate-lesson.js --all

# Generate TTS audio for a level
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --level=A1

# Dry-run audio (see what would be generated)
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --level=A1 --dry-run
```

---

## Screen Flow Mapper (Busuu Extractor v2)

**Status:** 🔄 A1 Extraction IN PROGRESS (Dec 28, 2025)

A screen-by-screen Busuu content extractor with auto-solving and progress tracking.

### Location & Files

| Path | Purpose |
|------|---------|
| `scripts/screen-flow-mapper/` | Main extractor code |
| `scripts/screen-flow-mapper/output/` | Extracted JSON (hierarchical: `A1/chapter-01/lesson.json`) |
| `scripts/screen-flow-mapper/progress-{level}.json` | Progress tracking per level |
| `scripts/screen-flow-mapper/cookies.json` | Busuu login session |
| `docs/busuu-research/` | Screen type documentation |

### Commands

```bash
cd scripts/screen-flow-mapper

# Extract all lessons for a level (auto mode, headless)
node index.js --level=a1 --auto --headless

# Extract with visible browser (for debugging)
node index.js --level=a1 --auto

# Extract single lesson
node index.js --lesson <url>

# Interactive mode with validation
node index.js --level=a1

# Check progress
cat progress-a1.json | jq '.completedLessons | length'

# Clear progress to restart fresh
rm progress-a1.json && rm -rf output/A1/
```

### Supported Exercise Types (12 total)

| Type | Selector | Auto-Solve |
|------|----------|------------|
| Flashcard | `ex-flashcard` | ✅ Click continue |
| Fill Gap | `ex-fillgap-dragdrop` | ✅ Click words in order |
| Phrase Builder | `ex-phrase-builder` | ✅ Click words in order |
| MCQ | `ex-mcq` | ✅ Click correct option |
| True/False | `ex-true-false` | ✅ Click correct button |
| Matchup | `ex-matchup` | ✅ Match pairs |
| Spelling | `ex-spelling` | ✅ Click letters in order |
| Typing | `ex-typing` | ✅ Type correct answer |
| Highlighter | `ex-highlighter` | ✅ Click ALL correct words |
| Comprehension | `ex-comprehension` | ⚠️ Manual (video) |
| Grammar Tip | `ex-tip` | ✅ Continue |
| Conversation | `ex-conversation` | ⚠️ Skipped (community) |

### Output Data Structure

```json
{
  "level": "A1",
  "chapter": { "number": 1, "title": "Introductions" },
  "lesson": { "number": 1, "title": "Hallo!", "url": "...", "objectiveId": "..." },
  "screens": [
    {
      "type": "flashcard",
      "content": { "german": "Hallo!", "english": null, "media": {...} }
    },
    {
      "type": "feedback",
      "content": { "tip": "\"Hallo\" is the most common greeting...", "highlights": ["Hallo"] }
    }
  ],
  "screenCount": 8,
  "extractedAt": "2025-12-28T..."
}
```

### Current Extraction Status (Dec 28, 2025)

| Level | Total | Extracted | Status |
|-------|-------|-----------|--------|
| A1 | 170 | 🔄 In Progress | Running in background |
| A2 | ~150 | ❌ | Pending |
| B1 | ~150 | ❌ | Pending |
| B2 | ~150 | ❌ | Pending |

### How to Resume After Interruption

The script saves progress after each lesson. To resume:

```bash
cd scripts/screen-flow-mapper
node index.js --level=a1 --auto --headless
```

It will automatically skip already-completed lessons and continue from where it stopped.

### Fixes Applied (Dec 28, 2025)

1. **Phrase-builder empty words** - Fixed selector to capture words before solving
2. **Flashcard translation** - Returns `null` instead of duplicating German
3. **Highlighter exercises** - Clicks ALL correct words (multi-select)
4. **Interstitial pages** - Auto-clicks Continue on checkpoint/challenge screens
5. **"Well done" detection** - Properly detects lesson end with personalized names
6. **Stuck detection** - Escape+Enter recovery after repeated failures
7. **Generic fallback** - Catches unknown `data-qa-ex` types

### MCP Server (Chrome DevTools)

Configured in `~/.claude.json` for this project:
```json
"chrome-devtools": {
  "command": "npx",
  "args": ["chrome-devtools-mcp@latest"]
}
```
Restart Claude Code to activate. Provides DOM inspection, console, network monitoring.

---

## Babbel Content Extractor

**Status:** ✅ Ready to run (Dec 29, 2025)

Automated extraction of German learning content from Babbel with issue capture for unknown screens.

### Location & Files

| Path | Purpose |
|------|---------|
| `scripts/babbel-extractor/` | Main extractor code |
| `scripts/babbel-extractor/output/` | Extracted JSON (hierarchical: `A11/unit-01/lesson-01.json`) |
| `scripts/babbel-extractor/issues/` | Captured issues (screenshot + DOM) for debugging |
| `scripts/babbel-extractor/progress-a11.json` | Progress tracking per level |
| `docs/babbel-research/screen-types-summary.md` | Screen type documentation with screenshots |

### Prerequisites

1. Chrome running with remote debugging:
   ```bash
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
   ```
2. Logged into Babbel with active subscription

### Commands

```bash
cd scripts/babbel-extractor

# Extract all lessons for a level
node index.js --level=a1.1

# Extract single lesson by URL
node index.js --lesson "https://my.babbel.com/en/lesson-player/DEU/..."

# Check progress
cat progress-a11.json | jq '.completedLessons | length'
```

### Supported Screen Types (23 total)

| Category | Types |
|----------|-------|
| Vocabulary | vocab-intro |
| Translation | mcq-translation |
| Listening | listening-fill, listening-choose-said |
| Grammar | grammar-tip |
| Matching | matching, response-matching |
| Building | word-sorting, sentence-order, spelling |
| Dialogue | dialogue, response-choice |
| Pronunciation | pronunciation-fill, listen-repeat, pronunciation-rule, pronunciation-quiz |
| Meta/Navigation | lesson-end, pronunciation-end, feedback-popup-tip, recap-intro, recap-end, formality-choice, story-intro |

### Issue Capture Workflow

When crawler encounters unknown screen or gets stuck:
1. Saves `screenshot.png` + `page.html` + `issue.json` to `issues/issue-{timestamp}/`
2. Exits with error message
3. You fix detector/extractor/solver code
4. Re-run same command - resumes from last completed lesson

### Level Path IDs

| Level | Path ID | Status |
|-------|---------|--------|
| A1.1 | `2c17d37bf4b8cb436d6cba815b3cb085` | ✅ Ready |
| A1.2 - B2 | TBD | ⏳ Need to discover |

---

## Next Tasks Queue

Priority order for continuing work:

1. **Screen Flow Mapper Testing** 🔄 (CURRENT)
   - Verify skip page fix works
   - Test on more A1 lessons
   - Then full re-crawl

2. **A2 Multimedia Tasks** ⏳
   - Create task files in `docs/multimedia-tasks/A2-*.json`
   - Update START-HERE.md with A2 assets

3. **B1 Content Creation** ⏳
   - Create lessons from Busuu B1 content (`extracted-content/busuu/B1/`)
   - Compare with `languageAppContent/phase3-lessons/B1-*/` if available
   - Follow A1/A2 merged pattern

4. **B1 Audio Generation** ⏳
   - Run `generate-audio.js --level=B1` after lessons created

5. **B2 Extraction & Content** ⏳
   - Extract Busuu B2 content first
   - Then create lessons

---

## Project Structure

```
german-learning-app-main/
├── apps/web/                    # SvelteKit PWA
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/      # UI components
│   │   │   ├── data/            # Module stubs, asset registry
│   │   │   └── utils/           # Audio, bidi, asset-resolver
│   │   └── routes/              # Pages
│   └── static/
│       ├── audio/               # TTS audio files
│       ├── images/shared/       # Reusable images by category
│       └── videos/shared/       # Video files
├── content/de-fa/               # Lesson JSON files
│   ├── A1/
│   │   ├── A1_CURRICULUM.md     # Status tracker
│   │   └── module-*/lesson-*.json
│   └── A2/
├── docs/
│   ├── tasks/                   # Task documentation
│   └── multimedia-tasks/        # Image/video task files
├── extracted-content/busuu/     # Extracted Busuu content
├── packages/content-model/      # Zod schemas for lessons
└── scripts/
    ├── generate-audio.js        # TTS generation
    ├── media-data/              # Asset registry
    └── busuu-extractor/         # Busuu content extractor
```

---

## Recent Important Changes

| Date | Commit | Change | Impact |
|------|--------|--------|--------|
| Dec 27 | `73be3a9` | A2 multimedia tasks | 97 new assets (85 images, 12 videos) for A2 |
| Dec 27 | `6f3ecec` | A2 audio generation | 334 audio files for 12 A2 lessons |
| Dec 27 | `4c3c32b` | A2 content merged | Busuu + textbook content merged with Persian notes |
| Dec 27 | `b210a43` | AI agent entry point | CLAUDE.md and docs/AI_AGENTS.md created |
| Dec 26 | `270e3bc` | Multimedia asset management | Assets organized by concept, reusable |
| Dec 25 | `85734f4` | Busuu content extractor | A1/A2/B1 content extracted |

---

## Persian-Specific Considerations

When creating content, always include:

1. **Grammar for Persians**:
   - German has grammatical gender (der/die/das) - Persian doesn't
   - German word order (V2) differs from Persian (SOV)
   - Sie/Du formality maps to Persian شما/تو but culturally different

2. **Cultural Notes**:
   - German punctuality vs Persian ta'arof
   - Direct communication style differences
   - Greeting and politeness customs

3. **Common Mistakes**:
   - Article confusion (no articles in Persian)
   - Case system (Persian has minimal cases)
   - Verb conjugation patterns

---

## Getting Started (New Session)

1. Read this file completely
2. Check current status table above
3. Review next tasks queue
4. Read relevant key documents for your task
5. Follow the content pipeline for any new content
