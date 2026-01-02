# German Learning App - AI Agent Entry Point

> German learning PWA for **Persian speakers**. SvelteKit + TypeScript.

---

## Quick Start

```bash
# For content creation workflows, use:
claude --prompt-file ai-workspace/PROMPT.md

# Or read ai-workspace/CURRENT_TASK.md to resume interrupted work
```

---

## Project Overview

| Aspect | Details |
|--------|---------|
| **Framework** | SvelteKit + TypeScript |
| **Content** | JSON lessons (CEFR A1-B2) in `content/de-fa/` |
| **Audio** | Google Cloud TTS (Chirp3-HD) |
| **Target** | Persian speakers learning German |

---

## Essential Commands

```bash
# Validate lesson (MANDATORY before commit)
node scripts/validate-lesson.js content/de-fa/A1/module-01/A1-M01-L01.json

# Generate audio
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --lesson=A1-M01-L01

# Run dev server
pnpm run dev

# Type check
pnpm run check
```

---

## Lesson Creation Pipeline

```
1. Create lesson JSON (merge Babbel + Busuu sources)
2. Validate: node scripts/validate-lesson.js <file>
3. Generate audio
4. Test in browser
5. Commit
```

**Full workflow:** `ai-workspace/workflows/content-fusion.md`

---

## Project Structure

```
german-learning-app-main/
├── apps/web/                    # SvelteKit PWA
│   ├── src/lib/components/      # UI components
│   └── static/audio/            # TTS audio files
├── content/de-fa/               # Lesson JSON files
│   ├── A1/module-*/
│   └── A2/module-*/
├── ai-workspace/                # AI workflows & progress
│   ├── PROMPT.md                # Entry point
│   ├── CURRENT_TASK.md          # Resume point
│   ├── STATUS.md                # Current state
│   ├── workflows/               # Step-by-step guides
│   └── references/              # Step types, templates
├── packages/content-model/      # Zod schemas
└── scripts/
    ├── generate-audio.js
    └── validate-lesson.js
```

---

## Content Sources (External)

| Source | Location | Content |
|--------|----------|---------|
| **Babbel** | `/Volumes/.../babbel-extractor-yolo/output/` | 232 lessons |
| **Busuu** | `/Volumes/.../content-extractors/screen-flow-mapper/output/` | 482 lessons |
| **Archive** | `/Volumes/.../content-archive/` | Legacy content, symlinks |

---

## Key Rules for Persian Learners

1. **Grammar notes** - German has gender (der/die/das), Persian doesn't
2. **Word order** - German V2 vs Persian SOV
3. **Formality** - Sie/du maps to شما/تو but usage differs
4. **BiDi text** - First word determines direction in mixed text

**Full reference:** `ai-workspace/references/rules-and-tips.md`

---

## Key Documents

| Document | Purpose |
|----------|---------|
| `ai-workspace/PROMPT.md` | Start here for content work |
| `ai-workspace/workflows/content-fusion.md` | Lesson creation guide |
| `ai-workspace/references/step-types.md` | All 17 step types |
| `docs/LESSON_CREATION_PIPELINE.md` | Validation rules |

---

## Restore Full Version

```bash
# Full CLAUDE.md is tagged at:
git show claude-md-full-v1:CLAUDE.md > CLAUDE.md
```
