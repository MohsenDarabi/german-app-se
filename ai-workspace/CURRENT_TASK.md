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

**Task**: Move extractors and extracted content outside main app

**Completed**: 2026-01-02

**Result**: Moved babbel-extractor, screen-flow-mapper, busuu-extractor to /Volumes/.../content-extractors/. Moved extracted-content to content-archive. Updated all path references in CLAUDE.md and ai-workspace docs.

---

## Quick Resume Instructions

If you just started or conversation was compacted:

1. **Read this file** - understand current state
2. **Read STATUS.md** - see overall priorities
3. **Check progress/*.json** - see what's done
4. **Continue or start next task** - update this file!

---

## How to Update This File

### When STARTING a task:
```markdown
## Active Task

**Status**: `in-progress`

**Task**: Create multimedia tasks for A1-M01-L01

**Started**: 2026-01-02 15:30

**Details**:
- Reading lesson JSON
- Identifying dialog/grammar-tip steps
- Next: create task file
```

### When FINISHING a task:
```markdown
## Active Task

**Status**: `idle`

**Task**: None

**Started**: -

**Details**: -

---

## Last Completed

**Task**: Create multimedia tasks for A1-M01-L01

**Completed**: 2026-01-02 16:00

**Result**: Created ai-workspace/progress/multimedia-tasks/A1-M01-L01.json with 5 image tasks, 2 video tasks
```

### When BLOCKED:
```markdown
## Active Task

**Status**: `blocked`

**Task**: Generate audio for A1-M01-L02

**Started**: 2026-01-02 14:00

**Details**:
- BLOCKED: Missing GCP credentials
- Waiting for: User to provide service account key
- Can continue with: Creating next lesson instead
```

---

## Session History (last 5)

| Date | Task | Result |
|------|------|--------|
| 2026-01-02 | Move extractors outside main app | Completed - moved to content-extractors/, updated paths |
| 2026-01-02 | Set up ai-workspace references | Completed - 4 reference docs created |
| 2026-01-02 | Fix Busuu path in workflows | Completed - corrected to screen-flow-mapper |
| 2026-01-02 | Create ai-workspace structure | Completed - PROMPT.md, STATUS.md, workflows |
| 2026-01-02 | Fix BiDi text rule | Completed - documented in rules-and-tips.md |
