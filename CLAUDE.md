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
| **A1** | 18 | ✅ Complete (merged) | ✅ 18 lessons | 🔄 205 tasks created |
| **A2** | 12 | ✅ Complete (merged with Busuu) | ✅ 12 lessons | 🔄 97 tasks created |
| **B1** | - | ⚠️ Busuu extracted, needs lessons | ❌ Not generated | ❌ Not created |
| **B2** | - | ❌ Not extracted | ❌ Not generated | ❌ Not created |

---

## Key Documents

| Document | Purpose | When to Read |
|----------|---------|--------------|
| `docs/tasks/content-comparison-task.md` | Content merging workflow & prompts | Before merging content |
| `AI_CONTENT_CREATION_PROMPTS.md` | Phase 1-3 content creation prompts | When creating new content |
| `content/de-fa/A1/A1_CURRICULUM.md` | A1 lesson status tracker | When working on A1 |
| `docs/multimedia-tasks/START-HERE.md` | Multimedia task list | When creating images/videos |
| `scripts/media-data/asset-registry.json` | All 205 multimedia assets | When managing media |

---

## AI Agent Roles

### Role 1: Content Creator
**Workspace**: `/Volumes/External_ssd_mohsen/WorkspaceExtern/languageAppContent`

Responsibilities:
- Extract content from PDF textbooks (Menschen, Schritte, etc.)
- Follow `AI_CONTENT_CREATION_PROMPTS.md` Phase 1-3
- Output to `phase3-lessons/{level}/`
- Create structured lesson proposals

### Role 2: Content Integrator (THIS AGENT)
**Workspace**: This app (`german-learning-app-main`)

Responsibilities:
- Run Busuu extractor (`scripts/busuu-extractor/`)
- Compare content using `docs/tasks/content-comparison-task.md`
- Merge into final unique lessons in `content/de-fa/`
- Generate TTS audio
- Create multimedia task files
- Update curriculum status

### Role 3: Multimedia Creator (Human Colleague)
**Reference**: `docs/multimedia-tasks/START-HERE.md`

Responsibilities:
- Create images/videos following task specs
- Save to `apps/web/static/images/shared/{category}/`
- Update task status in START-HERE.md

---

## Critical Commands

```bash
# Generate TTS audio for a level
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --level=A2

# Check multimedia task progress
node scripts/check-asset-usage.js

# Regenerate asset registry from task files
node scripts/generate-asset-registry.js

# Regenerate START-HERE.md from registry
node scripts/generate-start-here.js

# Extract Busuu content (if needed)
cd scripts/busuu-extractor && node extractor.js --level=b2
```

---

## Next Tasks Queue

Priority order for continuing work:

1. **A2 Multimedia Tasks** ⏳
   - Create task files in `docs/multimedia-tasks/A2-*.json`
   - Update START-HERE.md with A2 assets

2. **B1 Content Creation** ⏳
   - Create lessons from Busuu B1 content (`extracted-content/busuu/B1/`)
   - Compare with `languageAppContent/phase3-lessons/B1-*/` if available
   - Follow A1/A2 merged pattern

3. **B1 Audio Generation** ⏳
   - Run `generate-audio.js --level=B1` after lessons created

4. **B2 Extraction & Content** ⏳
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
