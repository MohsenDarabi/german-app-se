# AI Agent Roles & Workflows

> Detailed documentation for AI agents working on the German Learning App.

---

## Overview

This project uses multiple AI agents with distinct roles:

| Role | Workspace | Primary Function |
|------|-----------|------------------|
| **Content Creator** | languageAppContent | Extract & create from textbooks |
| **Content Integrator** | german-learning-app-main | Merge, validate, generate audio |
| **Multimedia Creator** | german-learning-app-main | Create images/videos (human) |

---

## Role 1: Content Creator Agent

### Workspace
```
/Volumes/External_ssd_mohsen/WorkspaceExtern/languageAppContent
```

### Purpose
Extract content from PDF German textbooks and create structured lesson proposals.

### Key Files
- `AI_CONTENT_CREATION_PROMPTS.md` - Master prompts
- `pdfBooks/` - Source PDF textbooks
- `phase1-extracted/` - Raw extractions
- `phase2-proposals/` - Structure proposals
- `phase3-lessons/` - Final lesson JSONs

### Workflow

```
PDF Textbooks (Menschen, Schritte, etc.)
            │
            ▼ Phase 1: Extract
┌─────────────────────────────────┐
│  Extract vocabulary, grammar,  │
│  exercises, dialogs from PDFs  │
│  Output: phase1-extracted/     │
└─────────────────────────────────┘
            │
            ▼ Phase 2: Propose
┌─────────────────────────────────┐
│  Analyze extracted content     │
│  Propose lesson structure      │
│  Human approves structure      │
│  Output: phase2-proposals/     │
└─────────────────────────────────┘
            │
            ▼ Phase 3: Create
┌─────────────────────────────────┐
│  Generate lesson JSON files    │
│  German + Persian translations │
│  Match app schema format       │
│  Output: phase3-lessons/       │
└─────────────────────────────────┘
```

### Output Format
Files in `phase3-lessons/{level}/`:
- `A1-1-M01-L01.json` - Level A1, Part 1, Module 1, Lesson 1
- `A2-2-M10-L07.json` - Level A2, Part 2, Module 10, Lesson 7

---

## Role 2: Content Integrator Agent

### Workspace
```
/Volumes/External_ssd_mohsen/WorkspaceExtern/german-learning-app-main
```

### Purpose
Merge content from multiple sources, validate, generate audio, and create multimedia tasks.

### Key Files
- `CLAUDE.md` - Entry point (read first!)
- `docs/tasks/content-comparison-task.md` - Comparison prompts
- `extracted-content/busuu/` - Busuu extracted content
- `content/de-fa/` - Final lesson files
- `scripts/generate-audio.js` - TTS generator

### Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    INPUT SOURCES                                │
│                                                                 │
│  languageAppContent/phase3-lessons/  +  extracted-content/busuu │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COMPARE & MERGE                              │
│                                                                 │
│  1. Read both sources for same module/chapter                   │
│  2. Compare vocabulary coverage                                 │
│  3. Compare grammar explanations                                │
│  4. Identify gaps and overlaps                                  │
│  5. Generate merged content with:                               │
│     - Best vocabulary from both                                 │
│     - Enhanced grammar tips                                     │
│     - Persian cultural notes                                    │
│     - Exercises targeting Persian speaker challenges            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDATE & SAVE                              │
│                                                                 │
│  1. Validate against content-model Zod schemas                  │
│  2. Save to content/de-fa/{level}/module-{n}/lesson-{n}.json   │
│  3. Update curriculum status (A1_CURRICULUM.md)                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   GENERATE AUDIO         │    │   CREATE MULTIMEDIA      │
│                          │    │   TASKS                  │
│   node scripts/generate- │    │                          │
│   audio.js --level=A1    │    │   Create JSON task files │
│                          │    │   Update START-HERE.md   │
│   Output:                │    │   Update asset-registry  │
│   static/audio/{lesson}/ │    │                          │
└──────────────────────────┘    └──────────────────────────┘
```

### Comparison Prompt Template

When comparing content, use this structure:

```markdown
## Task: Compare and Enhance Module [X]: [Topic]

### Context
You are comparing German learning content from two sources:
1. **languageAppContent**: Persian-focused, from textbooks
2. **Busuu**: English-based, commercial course

### Input Data
**languageAppContent Lesson**:
[Paste lesson JSON from phase3-lessons/]

**Busuu Chapter**:
[Paste chapter JSON from extracted-content/busuu/]

### Requirements

1. **Analyze** both sources for:
   - Vocabulary coverage and quality
   - Grammar explanations
   - Exercise effectiveness
   - Cultural context

2. **Identify** for Persian learners:
   - Missing essential vocabulary
   - Grammar needing Persian-specific explanation
   - Cultural differences to highlight
   - Common mistakes to address

3. **Generate** enhanced content:
   - Fill vocabulary gaps
   - Add Persian cultural notes
   - Create exercises for Persian speaker difficulties
   - Ensure CEFR level alignment

4. **Output** in app JSON format ready to save
```

---

## Role 3: Multimedia Creator (Human)

### Reference Document
```
docs/multimedia-tasks/START-HERE.md
```

### Purpose
Create images and videos for lessons based on task specifications.

### Workflow

```
1. Open START-HERE.md
2. Find unchecked task [ ]
3. Read description and specs
4. Create asset (image or video)
5. Save to: apps/web/static/images/shared/{category}/
6. Mark task as done [x]
7. Commit changes
```

### Asset Categories
- `transport/` - U-Bahn, buses, trains
- `food/` - Restaurant, food items
- `places/` - Bahnhof, Apotheke, buildings
- `people/` - Portraits, descriptions
- `weather/` - Seasons, weather types
- `grammar/` - Educational diagrams
- `greetings/` - Social situations

### Specifications
| Type | Format | Dimensions | Notes |
|------|--------|------------|-------|
| Image | JPG/PNG | 800x600 | Friendly, diverse, educational |
| Video | MP4 | 1080p | 15-30 seconds, clear German audio |

---

## Handoff Protocols

### Content Creator → Content Integrator

1. Content Creator completes `phase3-lessons/{level}/` files
2. Content Creator notifies via commit or message
3. Content Integrator:
   - Reads new lesson files
   - Compares with Busuu content
   - Merges and enhances
   - Generates audio
   - Creates multimedia tasks

### Content Integrator → Multimedia Creator

1. Content Integrator creates task files in `docs/multimedia-tasks/`
2. Content Integrator updates START-HERE.md
3. Multimedia Creator:
   - Checks START-HERE.md daily
   - Creates assets
   - Updates status

---

## Common Tasks

### Task: Add New Level Content

```bash
# 1. Check if Busuu content exists
ls extracted-content/busuu/{LEVEL}/

# 2. Check if languageAppContent exists
ls /Volumes/External_ssd_mohsen/WorkspaceExtern/languageAppContent/phase3-lessons/{LEVEL}/

# 3. Compare and merge
# Follow docs/tasks/content-comparison-task.md

# 4. Generate audio
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --level={LEVEL}

# 5. Create multimedia tasks
# Create docs/multimedia-tasks/{LEVEL}-*.json files
node scripts/generate-start-here.js
```

### Task: Update Existing Lesson

1. Edit `content/de-fa/{level}/module-{n}/lesson-{n}.json`
2. Validate format matches schema
3. Regenerate audio if text changed:
   ```bash
   node scripts/generate-audio.js --level={LEVEL} --force
   ```
4. Update curriculum status if needed

### Task: Check Project Status

```bash
# Check audio generation status
node scripts/generate-audio.js --status

# Check multimedia task progress
node scripts/check-asset-usage.js

# Check lesson count
ls content/de-fa/A1/module-*/lesson-*.json | wc -l
```

---

## Error Handling

### Missing Busuu Content
If Busuu content doesn't exist for a level:
```bash
cd scripts/busuu-extractor
node extractor.js --level={level}
node cleanup-content.js --level={level}
```

### Invalid Lesson JSON
Check against schema:
```bash
node scripts/validate-lessons.js
```

### Audio Generation Fails
1. Check GCP credentials exist
2. Check usage limits (90% of 1M chars/month)
3. Run with `--dry-run` first

---

## Best Practices

1. **Always read CLAUDE.md first** in new sessions
2. **Check status** before starting work
3. **Follow the pipeline** - don't skip steps
4. **Update curriculum docs** after completing lessons
5. **Commit frequently** with descriptive messages
6. **Document decisions** in relevant .md files
