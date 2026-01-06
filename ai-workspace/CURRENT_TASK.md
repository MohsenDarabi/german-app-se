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

**Task**: Implement Vocabulary Hints for German-only Questions

**Completed**: 2026-01-06

**Result**:
- Added `vocabHint` schema to BaseStepSchema (both packages/content-model and apps/web)
- Implemented expandable hint UI in TrueFalseStep.svelte
- Shows "نیاز به کمک؟" (Need help?) button for German-only questions
- Expands to show word-by-word translations + full sentence translation
- Added hint to L07 true-false question as example
- Pedagogical feature to reduce beginner anxiety

**Key Files Changed**:
- `packages/content-model/src/index.ts` - Added VocabHintSchema
- `apps/web/src/lib/content-model/index.ts` - Added VocabHintSchema
- `apps/web/src/lib/components/lesson/steps/TrueFalseStep.svelte` - Hint UI
- `content/de-fa/A1/module-01/A1-M01-L07.json` - Added vocabHint to s19
- `ai-workspace/ROADMAP.md` - Marked feature as done

**Previous**: Create A1-M01-L07 (Zahlen 1-10)

---

## Pipeline Status

| Step | Status | Notes |
|------|--------|-------|
| Lesson JSONs | 7 lessons | L01-L07 complete |
| Validation | 30 rules | All pass |
| Audio | Complete | All 7 lessons have audio |
| Multimedia Tasks | 19 tasks | Pending for colleague |
| SRS Persistence | Gap | vocab-check ratings not saved |

---

## Known Issues

1. **SRS not persisting vocab-check ratings** - Ratings (easy/medium/hard) are collected but discarded after lesson. Need to connect VocabCheckStep -> db.vocab -> SRS scheduler.

2. **Multimedia tasks pending** - 19 image tasks waiting for colleague to create assets.

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

# Validate single lesson
node scripts/validate-lesson.js content/de-fa/A1/module-01/A1-M01-L07.json

# Generate audio
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --lesson=A1-M01-L07

# Check multimedia task status
node scripts/generate-multimedia-tasks.js --status

# Generate multimedia tasks for a lesson
node scripts/generate-multimedia-tasks.js --lesson=A1-M01-L07

# Update multimedia tasks after content changes
node scripts/generate-multimedia-tasks.js --all --update

# Run dev server
pnpm run dev
```

---

## Session History (last 5)

| Date | Task | Result |
|------|------|--------|
| 2026-01-06 | Create A1-M01-L07 | Completed - Numbers 1-10: eins to zehn |
| 2026-01-06 | Create A1-M01-L06 | Completed - Wo wohnst du? (Where do you live?) |
| 2026-01-06 | Create A1-M01-L05 | Completed - names/introductions: Wie heißt du?, Freut mich! |
| 2026-01-06 | Grammar simplification L03/L04 | Completed - pattern-based explanations for A1 level |
| 2026-01-06 | Multimedia task system | Completed - generate-multimedia-tasks.js, tasks for L01-L07 |
