# Content Fusion Workflow

> How to create UNIQUE lessons by fusing multiple sources

---

## Overview

Each lesson combines content from **THREE sources** to create **UNIQUE, ORIGINAL** content:

1. **PDF Textbooks** - Extracted from Menschen, Schritte, etc.
2. **Babbel** - Crawled vocabulary, exercises, dialogs
3. **Busuu** - Extracted exercises, grammar tips

**CRITICAL: We do NOT copy content directly. We CREATE UNIQUE lessons inspired by these sources.**

---

## Content Sources

### Source 1: PDF Textbooks (Primary Reference)

```
/Volumes/External_ssd_mohsen/WorkspaceExtern/languageAppContent/phase1-extracted/
```

Contains extracted content from professional German textbooks:

- Menschen A1/A2
- Schritte Plus
- Other CEFR-aligned materials

**Use for:** Vocabulary lists, grammar structures, topic progression

### Source 2: Babbel (Crawled)

```
/Volumes/External_ssd_mohsen/WorkspaceExtern/babbel-extractor-yolo/output/
├── A11/  (A1.1)
├── A12/  (A1.2)
├── A21/  (A2.1)
├── A22/  (A2.2)
├── B1/
└── B2/
```

Contains full curriculum with:

- Vocabulary with audio URLs
- Dialog scripts
- Exercise patterns

**Use for:** Exercise ideas, dialog structures

### Source 3: Busuu (Screen-Flow-Mapper - MOST COMPLETE)

```
/Volumes/External_ssd_mohsen/WorkspaceExtern/content-extractors/screen-flow-mapper/output/
├── A1/  (168 lessons)
├── A2/  (98 lessons)
├── B1/  (140 lessons)
└── B2/  (76 lessons)
```

Contains per-screen extracted content:

- Flashcards with translations
- Fill-in-blank exercises
- Grammar tips
- True/false questions
- Matchup exercises

**Use for:** Additional vocabulary, grammar explanations, exercise patterns

---

## CRITICAL: Creating UNIQUE Content

### Rule 1: Change ALL Names

**DO NOT** use names from source materials. Use common modern German names:

| Source Name   | Replace With       |
| ------------- | ------------------ | ---- |
| Anna (Babbel) | Lena, Sophie, Emma | Lisa |
| Tom (Babbel)  | Max, Felix, Leon   |
| Maria         | Hannah, Mia, Lea   |
| Peter         | Paul, Lukas, Jonas |

**Common German names to use:**

- Female: Lena, Sophie, Emma, Hannah, Mia, Lea, Laura, Anna, Lisa, Sarah
- Male: Max, Felix, Leon, Paul, Lukas, Jonas, Tim, David, Finn, Ben
- Persian names (for learner character): Amir, Sara, Maryam, Ali, Neda, Reza

### Rule 2: Rewrite Dialogs

Don't copy dialogs verbatim. Keep the structure, change the content:

**Source (Babbel):**

```
Anna: Hallo! Ich bin Anna.
Tom: Hallo Anna! Ich heiße Tom.
```

**Our version:**

```
Lena: Hallo! Ich bin Lena.
Max: Hi Lena! Ich heiße Max. Freut mich!
Lena: Freut mich auch, Max!
```

### Rule 3: Create Original Examples

Use the vocabulary, but create fresh example sentences:

**Source:** "Ich komme aus Deutschland."
**Our version:** "Ich komme aus Berlin." or "Max kommt aus München."

### Rule 4: Adapt for Persian Speakers

Add cultural notes and explanations specific to Persian speakers:

- Compare German/Persian grammar differences
- Explain cultural contexts (du vs Sie = تو vs شما but different usage)
- Note false friends and common mistakes

---

## Step 1: Research Sources

Before writing a lesson, check ALL three sources for the topic:

```bash
# 1. Check PDF extracted content
ls /Volumes/External_ssd_mohsen/WorkspaceExtern/languageAppContent/phase1-extracted/

# 2. Check Babbel lessons
ls /Volumes/External_ssd_mohsen/WorkspaceExtern/babbel-extractor-yolo/output/A11/
cat /Volumes/External_ssd_mohsen/WorkspaceExtern/babbel-extractor-yolo/output/A11/unit-01/lesson-01.json | jq '.screens[].content'

# 3. Check Busuu lessons (screen-flow-mapper)
ls /Volumes/External_ssd_mohsen/WorkspaceExtern/content-extractors/screen-flow-mapper/output/A1/
cat /Volumes/External_ssd_mohsen/WorkspaceExtern/content-extractors/screen-flow-mapper/output/A1/chapter-01-introductions/*.json | jq '.screens[].content'
```

**Extract from each:**

- Vocabulary list (words to teach)
- Grammar points (structures to explain)
- Dialog patterns (conversation templates)
- Exercise types (quiz formats)

---

## Step 2: Plan UNIQUE Lesson

Create an original lesson plan:

1. **Lesson ID**: `{Level}-M{Module}-L{Lesson}` (e.g., `A1-M01-L02`)
2. **Theme**: Topic from CEFR curriculum
3. **Characters**: Use OUR names (Max, Lena, etc.)
4. **Vocabulary**: From sources, but with original examples
5. **Steps**: Plan 15-25 steps:
   - `new-word` (vocabulary introduction)
   - `grammar-tip` (explanations for Persian speakers)
   - `multiple-choice`, `fill-in-blank`, `word-order` (exercises)
   - `dialog` (original conversations)
   - `true-false` (comprehension)
   - Games: `rapid-fire`, `memory-match`, `word-hunt` (every 5-7 steps)

---

## Step 3: Create Lesson JSON

### File location

```
content/de-fa/{Level}/module-{NN}/{LessonID}.json
```

### Required structure

```json
{
  "id": "A1-M01-L02",
  "title": {
    "de": "Wie geht's?",
    "fa": "حالت چطوره؟"
  },
  "level": "A1",
  "module": 1,
  "lessonNumber": 2,
  "estimatedMinutes": 15,
  "steps": [
    // ... steps here
  ],
  "tags": ["greetings", "feelings"]
}
```

---

## Step 4: Write Steps (with original content)

### new-word step

```json
{
  "type": "new-word",
  "id": "s1",
  "word": { "de": "Wie geht's?", "fa": "حالت چطوره؟" },
  "example": {
    "text": { "de": "Hallo Max! Wie geht's?", "fa": "سلام مکس! حالت چطوره؟" }
  },
  "header": "یاد بگیر!"
}
```

### dialog step (ORIGINAL - not copied)

```json
{
  "type": "dialog",
  "id": "s10",
  "lines": [
    {
      "speaker": "Lena",
      "text": { "de": "Hallo Max! Wie geht's?", "fa": "سلام مکس! حالت چطوره؟" }
    },
    {
      "speaker": "Max",
      "text": { "de": "Gut, danke! Und dir?", "fa": "خوبم، ممنون! تو چطوری؟" }
    },
    {
      "speaker": "Lena",
      "text": { "de": "Auch gut!", "fa": "منم خوبم!" }
    }
  ]
}
```

### grammar-tip step (Persian-specific)

```json
{
  "type": "grammar-tip",
  "id": "s5",
  "title": "Du vs Sie - تو و شما",
  "content": "در آلمانی مثل فارسی دو نوع خطاب داریم:\n\n**du** = تو (غیررسمی، برای دوستان و خانواده)\n**Sie** = شما (رسمی، برای غریبه‌ها و محیط کار)\n\n⚠️ تفاوت مهم: در آلمان Sie را حتی با همکاران مسن‌تر استفاده می‌کنند!",
  "examples": [
    { "de": "Wie geht's dir?", "fa": "حالت چطوره؟ (غیررسمی)" },
    { "de": "Wie geht es Ihnen?", "fa": "حالتان چطور است؟ (رسمی)" }
  ]
}
```

---

## Step 5: BiDi Text Rule

**CRITICAL**: When mixing Persian and German in one sentence:

- **First word determines direction**
- Persian sentence? Start with Persian word
- German sentence? Start with German word

```
WRONG: "Hallo" یعنی سلام
RIGHT: کلمه "Hallo" یعنی سلام
```

---

## Step 6: Validate JSON

```bash
# Check JSON syntax
cat content/de-fa/A1/module-01/A1-M01-L02.json | jq

# Run TypeScript check
pnpm run check
```

---

## Step 7: Generate Audio (DO THIS IMMEDIATELY!)

**IMPORTANT**: Generate audio RIGHT AFTER creating the lesson, not later!

```bash
cd /Volumes/External_ssd_mohsen/WorkspaceExtern/german-learning-app-main

GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --lesson=A1-M01-L02
```

**Why immediately?**
- Ensures audio is never forgotten
- Can test the complete lesson right away
- One lesson = one complete unit (content + audio)

**Verify audio was generated:**
```bash
ls apps/web/static/audio/A1-M01-L02/
```

---

## Step 8: Test in Browser

```bash
pnpm run dev
# Navigate to http://localhost:5173/learn/de-fa/A1/A1-M01-L02
# Complete all steps, verify audio plays
```

---

## Step 9: Create Multimedia Tasks

Create task file for images/videos needed:

```bash
# Create task file (see workflows/multimedia-tasks.md for format)
# Save to: ai-workspace/progress/multimedia-tasks/A1-M01-L02.json
```

---

## Step 10: Update Progress & Commit

```bash
# 1. Update CURRENT_TASK.md (mark as completed)
# 2. Update STATUS.md
# 3. Update progress/lessons-created.json
# 4. Update progress/audio-generated.json
# 5. Commit changes

git add content/de-fa/A1/module-01/A1-M01-L02.json \
        apps/web/static/audio/A1-M01-L02/ \
        ai-workspace/
git commit -m "feat: add lesson A1-M01-L02 with audio"
```

---

## Complete Lesson Pipeline (Summary)

```
┌─────────────────────────────────────────────────────────────┐
│  ONE LESSON = ONE COMPLETE UNIT                             │
│                                                             │
│  1. Research sources (Babbel + Busuu + PDF)                │
│  2. Plan unique lesson                                      │
│  3. Create lesson JSON                                      │
│  4. Validate JSON                                           │
│  5. ▶ GENERATE AUDIO IMMEDIATELY ◀                         │
│  6. Test in browser (content + audio)                       │
│  7. Create multimedia tasks                                 │
│  8. Update progress files                                   │
│  9. Commit everything together                              │
│                                                             │
│  ✅ THEN move to next lesson                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Checklist (Complete Before Next Lesson!)

### Content
- [ ] Researched ALL THREE sources for topic
- [ ] Used ORIGINAL names (Max, Lena, etc.)
- [ ] Wrote ORIGINAL dialogs
- [ ] Created ORIGINAL example sentences
- [ ] Added Persian-specific grammar notes
- [ ] All German text has Persian translation
- [ ] BiDi rule followed for mixed text
- [ ] Game steps inserted every 5-7 steps

### Validation
- [ ] JSON syntax valid (`jq` check)
- [ ] TypeScript check passes (`pnpm run check`)

### Audio (DO NOT SKIP!)
- [ ] Audio generated for this lesson
- [ ] Audio files exist in `apps/web/static/audio/{lessonId}/`
- [ ] Audio plays correctly in browser

### Progress
- [ ] CURRENT_TASK.md updated
- [ ] STATUS.md updated
- [ ] progress/lessons-created.json updated
- [ ] progress/audio-generated.json updated
- [ ] Multimedia tasks created
- [ ] Changes committed
