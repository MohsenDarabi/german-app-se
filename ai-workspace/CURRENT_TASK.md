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

**Task**: Create A1-M01-L05 (names/introductions)

**Completed**: 2026-01-06

**Result**:
- Created L05: "Wie heißt du?" (What's your name?)
- Vocabulary: heißen, Wie heißt du?, Ich heiße..., der Name, Freut mich!, auch
- 19 steps with games, dialog, exercises
- All 29 validation rules pass
- Audio generated (18 new texts, 285 chars)
- Multimedia task generated (1 dialog image)

**Key Files Changed**:
- `content/de-fa/A1/module-01/A1-M01-L05.json` - NEW
- `ai-workspace/progress/multimedia-tasks/A1-M01-L05.json` - NEW

**Previous**: Grammar simplification for L03/L04

---

## Pipeline Status

| Step | Status | Notes |
|------|--------|-------|
| Lesson JSONs | ✅ L01-L05 | Lisa & Theo characters |
| Validation | ✅ 29 rules | All pass |
| Audio | ✅ Generated | TTS-friendly content |
| Multimedia Tasks | ✅ 13 tasks | Pending for colleague |
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
| 2026-01-06 | Create A1-M01-L05 | Completed - names/introductions: Wie heißt du?, Freut mich! |
| 2026-01-06 | Grammar simplification L03/L04 | Completed - pattern-based explanations for A1 level |
| 2026-01-06 | Multimedia task system | Completed - generate-multimedia-tasks.js, 12 tasks for L01-L04 |
| 2026-01-06 | TTS fixes + validation | Completed - removed dashes, added no-tts-unfriendly-chars rule |
| 2026-01-06 | Lisa & Theo standardization | Completed - all M01 dialogs use Lisa & Theo |
