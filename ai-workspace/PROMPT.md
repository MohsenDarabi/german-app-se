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

---

## Output Locations (Where to Put Created Content)

| Type | Output Location | Created By |
|------|-----------------|------------|
| **Lesson JSON** | `content/de-fa/{Level}/module-{NN}/{LessonID}.json` | AI agent |
| **Audio files** | `apps/web/static/audio/{LessonID}/` | Audio script |
| **Images** | `apps/web/static/images/shared/{category}/` | Colleague |
| **Videos** | `apps/web/static/videos/shared/{category}/` | Colleague |
| **Progress logs** | `ai-workspace/progress/*.json` | AI agent |
| **Multimedia tasks** | `ai-workspace/progress/multimedia-tasks/{LessonID}.json` | AI agent |

**Example for lesson A1-M01-L02:**
```
content/de-fa/A1/module-01/A1-M01-L02.json          ← Lesson content
apps/web/static/audio/A1-M01-L02/s1-word.mp3        ← Audio files
ai-workspace/progress/multimedia-tasks/A1-M01-L02.json  ← Tasks for colleague
```

### Source Content (for fusion) - THREE SOURCES
| Path | Content |
|------|---------|
| `/Volumes/.../languageAppContent/phase1-extracted/` | PDF textbooks (Menschen, Schritte) |
| `/Volumes/.../babbel-extractor-yolo/output/` | Crawled Babbel (A1.1-B2) |
| `/Volumes/.../content-extractors/screen-flow-mapper/output/` | Busuu full mapping (482 lessons) |

**CRITICAL RULE: Create UNIQUE content - do NOT copy directly!**
- Use OUR characters: **Eli & Tom** (primary), **Lisa & Alex** (secondary)
- Rewrite dialogs with original sentences
- Add Persian-specific grammar notes

### Archive (reference only)
| Path | Content |
|------|---------|
| `/Volumes/.../content-archive/legacy-v1/` | Old lessons (78 files) |
| `/Volumes/.../content-archive/legacy-multimedia-tasks/` | Old multimedia tasks (302) |

---

## 🚨 SCOPE SYSTEM (MANDATORY)

Before creating ANY lesson content, you MUST follow the scope constraints:

### Scope Files Location
```
ai-workspace/curriculum/
├── canonical-scope.json              # Master scope - defines ALL 60 A1 lessons
├── official-sources/
│   ├── goethe-a1-wordlist.json      # 676 official Goethe A1 words
│   └── grammar-progression-reference.json  # When grammar is introduced
├── characters/
│   └── character-registry.json       # Eli, Tom, Lisa, Alex
└── resource-mapping/
    ├── babbel-a1-scope.json         # Vocabulary per Babbel lesson
    └── busuu-a1-scope.json          # Vocabulary per Busuu lesson
```

### Before Creating a Lesson

1. **Check canonical-scope.json** for target lesson:
   - What vocabulary is allowed (cumulative from all previous lessons)
   - What grammar is introduced/forbidden
   - Which characters can appear

2. **Key Rules**:
   - **W-Fragen (Was, Wo, Wer, Wie, etc.)**: Only from lesson L34+ (after accusative case)
   - **Characters**: Use Eli & Tom for 2-person scenes. Add Lisa/Alex only when 3+ people needed
   - **Vocabulary**: Max 15 new words per lesson. Check against Goethe A1 wordlist
   - **Grammar**: Never introduce before its scheduled lesson

3. **Validate after creating**:
   ```bash
   node scripts/validate-scope.js content/de-fa/A1/module-XX/A1-MXX-LYY.json
   ```

### Grammar Progression (Key Milestones)
| Lesson | Grammar Introduced |
|--------|-------------------|
| L01-L08 | No formal grammar (vocabulary only) |
| L07-L08 | du vs. Sie |
| L13-L16 | Verb conjugation (sein, haben, regular, irregular) |
| L17-L20 | Negation (nicht, kein) |
| L21-L24 | Articles (der/die/das, ein/eine) + Possessives |
| L29-L32 | Accusative case |
| L33-L36 | **W-Fragen** (only HERE, after accusative!) |
| L41-L44 | Dative case |
| L45-L48 | Separable verbs |
| L49-L52 | Modal verbs |
| L53-L56 | Perfekt (past tense) |

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
| **Curriculum Scope (CRITICAL)** | `curriculum/canonical-scope.json` |
| **Grammar Progression** | `curriculum/official-sources/grammar-progression-reference.json` |
| **Character Registry** | `curriculum/characters/character-registry.json` |
| All 17 step types with examples | `references/step-types.md` |
| Navigate source content (Babbel/Busuu/PDF) | `references/source-content.md` |
| Critical rules & troubleshooting | `references/rules-and-tips.md` |
| Lesson JSON template | `references/lesson-template.md` |

---

## Rules

1. **🚨 CHECK SCOPE FIRST** - Before creating ANY lesson, read `curriculum/canonical-scope.json`
2. **Update CURRENT_TASK.md** when starting AND finishing tasks (critical for recovery!)
3. **Update STATUS.md** after completing significant work
4. **Track progress** in `progress/*.json` files
5. **One lesson at a time** - complete fully before moving to next
6. **Multimedia tasks** - create for each lesson, save to `progress/multimedia-pending.json`
7. **Validate scope** - Run `node scripts/validate-scope.js` before committing
8. **Test before commit** - run `pnpm run dev` and verify lesson works

> **CRITICAL**: Always update CURRENT_TASK.md so the next session knows where to resume!
> **CRITICAL**: Never use W-Fragen (Was, Wo, Wer...) before lesson L34!

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
