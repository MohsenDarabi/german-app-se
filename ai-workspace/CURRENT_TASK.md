# Current Task State

> **This file is the recovery point after conversation compaction or restart.**
>
> AI agents MUST read this file first and update it when starting/finishing tasks.

---

## Active Task

**Status**: `idle` <!-- idle | in-progress | blocked -->

**Task**: None

**Started**: -

**Details**: -

---

## Last Completed

**Task**: Implement multimedia task management system + TTS fixes

**Completed**: 2026-01-06

**Result**:
- Fixed TTS bug: en-dash "–" was read as "Minus" by Google TTS
- Added validation rule `no-tts-unfriendly-chars` (now 29 rules total)
- Standardized characters to Lisa & Theo across all M01 lessons
- Created `scripts/generate-multimedia-tasks.js` for auto-generating image tasks
- Generated 12 multimedia tasks for L01-L04
- Updated docs: rules-and-tips.md, START-HERE.md

**Key Files Changed**:
- `scripts/generate-multimedia-tasks.js` - NEW
- `scripts/validate-lesson.js` - added TTS rule
- `ai-workspace/references/rules-and-tips.md` - Rule 12 + updated names
- `docs/multimedia-tasks/START-HERE.md` - colleague workflow
- `ai-workspace/progress/multimedia-tasks/*.json` - task files for L01-L04

---

## Pipeline Status

| Step | Status | Notes |
|------|--------|-------|
| Lesson JSONs | ✅ L01-L04 | Lisa & Theo characters |
| Validation | ✅ 29 rules | All pass |
| Audio | ✅ Generated | TTS-friendly content |
| Multimedia Tasks | ✅ 12 tasks | Pending for colleague |
| SRS Persistence | ❌ Gap | vocab-check ratings not saved |

---

## Known Issues

1. **SRS not persisting vocab-check ratings** - Ratings (easy/medium/hard) are collected but discarded after lesson. Need to connect VocabCheckStep → db.vocab → SRS scheduler.

2. **Multimedia tasks pending** - 12 image tasks waiting for colleague to create assets.

---

## Quick Resume Instructions

If you just started or conversation was compacted:

1. **Read this file** - understand current state
2. **Read STATUS.md** - see overall priorities
3. **Check progress/*.json** - see what's done
4. **Continue or start next task** - update this file!

---

## Useful Commands

```bash
# Validate all lessons
node scripts/validate-lesson.js --all

# Generate audio
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --lesson=A1-M01-L01

# Check multimedia task status
node scripts/generate-multimedia-tasks.js --status

# Update multimedia tasks after content changes
node scripts/generate-multimedia-tasks.js --all --update

# Run dev server
pnpm run dev
```

---

## Session History (last 5)

| Date | Task | Result |
|------|------|--------|
| 2026-01-06 | Multimedia task system | Completed - generate-multimedia-tasks.js, 12 tasks for L01-L04 |
| 2026-01-06 | TTS fixes + validation | Completed - removed dashes, added no-tts-unfriendly-chars rule |
| 2026-01-06 | Lisa & Theo standardization | Completed - all M01 dialogs use Lisa & Theo |
| 2026-01-02 | Create A1-M01-L01 (fusion workflow) | Completed - 20 steps, 7 vocab, audio generated |
| 2026-01-02 | Deep codebase cleanup | Completed - removed 47 orphaned audio folders |
