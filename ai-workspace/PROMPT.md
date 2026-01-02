# German Learning App - AI Workspace Entry Point

> Start Claude CLI with: `claude --prompt-file ai-workspace/PROMPT.md`

---

## Your Role

You are helping build a **German learning PWA for Persian speakers**. Your job is to:
1. Create lesson content by fusing Babbel + Busuu extracted content
2. Generate multimedia task files for a human colleague
3. Generate TTS audio for lessons
4. Fix bugs and improve the app

---

## First Steps Every Session

1. **Read STATUS.md** - Understand current state
2. **Check progress/** - See what's done and what's pending
3. **Follow workflows/** - Step-by-step guides for each task

```bash
# Quick status check
cat ai-workspace/STATUS.md
```

---

## Key Directories

| Path | Purpose |
|------|---------|
| `ai-workspace/` | Your workspace - docs, progress, workflows |
| `content/de-fa/` | Active lesson JSON files |
| `apps/web/` | SvelteKit PWA source code |
| `scripts/` | Audio generation, extractors |

### Source Content (for fusion) - THREE SOURCES
| Path | Content |
|------|---------|
| `/Volumes/.../languageAppContent/phase1-extracted/` | PDF textbooks (Menschen, Schritte) |
| `scripts/babbel-extractor/output/` | Crawled Babbel lessons |
| `extracted-content/busuu/` | Extracted Busuu lessons |

**CRITICAL RULE: Create UNIQUE content - do NOT copy directly!**
- Change ALL names to modern German names (Max, Lena, Felix, Sophie)
- Rewrite dialogs with original sentences
- Add Persian-specific grammar notes

### Archive (reference only)
| Path | Content |
|------|---------|
| `/Volumes/.../content-archive/legacy-v1/` | Old lessons (78 files) |
| `/Volumes/.../content-archive/legacy-multimedia-tasks/` | Old multimedia tasks (302) |

---

## Workflows

| Task | Workflow File |
|------|---------------|
| Create a lesson | `workflows/content-fusion.md` |
| Create multimedia tasks | `workflows/multimedia-tasks.md` |
| Generate audio | `workflows/audio-generation.md` |

---

## Rules

1. **Always update STATUS.md** after completing work
2. **Track progress** in `progress/*.json` files
3. **One lesson at a time** - complete fully before moving to next
4. **Multimedia tasks** - create for each lesson, save to `progress/multimedia-pending.json`
5. **Test before commit** - run `pnpm run dev` and verify lesson works

---

## Quick Commands

```bash
# Start dev server
cd /Volumes/External_ssd_mohsen/WorkspaceExtern/german-learning-app-main
pnpm run dev

# Generate audio for a lesson
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --lesson=A1-M01-L01

# Check TypeScript
pnpm run check
```

---

## Current Priority

Check `ai-workspace/STATUS.md` for current priority task.
