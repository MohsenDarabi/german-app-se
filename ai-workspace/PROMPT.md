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

1. **Read CURRENT_TASK.md** - Resume interrupted work (MOST IMPORTANT!)
2. **Read STATUS.md** - Understand overall priorities
3. **Check progress/** - See what's done and what's pending
4. **Follow workflows/** - Step-by-step guides for each task

```bash
# Quick resume check (always run this first!)
cat ai-workspace/CURRENT_TASK.md
cat ai-workspace/STATUS.md
```

> **After conversation compaction**: CURRENT_TASK.md tells you exactly where you left off!

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
| `/Volumes/.../babbel-extractor-yolo/output/` | Crawled Babbel (A1.1-B2) |
| `scripts/screen-flow-mapper/output/` | Busuu full mapping (482 lessons) |

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

## References

| Reference | File |
|-----------|------|
| All 17 step types with examples | `references/step-types.md` |
| Navigate source content (Babbel/Busuu/PDF) | `references/source-content.md` |
| Critical rules & troubleshooting | `references/rules-and-tips.md` |
| Lesson JSON template | `references/lesson-template.md` |

---

## Rules

1. **Update CURRENT_TASK.md** when starting AND finishing tasks (critical for recovery!)
2. **Update STATUS.md** after completing significant work
3. **Track progress** in `progress/*.json` files
4. **One lesson at a time** - complete fully before moving to next
5. **Multimedia tasks** - create for each lesson, save to `progress/multimedia-pending.json`
6. **Test before commit** - run `pnpm run dev` and verify lesson works

> **CRITICAL**: Always update CURRENT_TASK.md so the next session knows where to resume!

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
