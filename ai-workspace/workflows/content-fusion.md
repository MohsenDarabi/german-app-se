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
scripts/screen-flow-mapper/output/
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

| Source Name | Replace With |
|-------------|--------------|
| Anna (Babbel) | Lena, Sophie, Emma |
| Tom (Babbel) | Max, Felix, Leon |
| Maria | Hannah, Mia, Lea |
| Peter | Paul, Lukas, Jonas |

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
ls scripts/screen-flow-mapper/output/A1/
cat scripts/screen-flow-mapper/output/A1/chapter-01-introductions/*.json | jq '.screens[].content'
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

## Step 6: Validate

```bash
# Check JSON syntax
cat content/de-fa/A1/module-01/A1-M01-L02.json | jq

# Run TypeScript check
pnpm run check

# Test in browser
pnpm run dev
# Navigate to lesson and complete all steps
```

---

## Step 7: Update Progress

After creating lesson:

1. Update `ai-workspace/STATUS.md`
2. Update `ai-workspace/progress/lessons-created.json`
3. Create multimedia tasks (see `workflows/multimedia-tasks.md`)
4. Generate audio (see `workflows/audio-generation.md`)

---

## Checklist

- [ ] Researched ALL THREE sources for topic
- [ ] Used ORIGINAL names (Max, Lena, etc. - not source names)
- [ ] Wrote ORIGINAL dialogs (not copied from sources)
- [ ] Created ORIGINAL example sentences
- [ ] Added Persian-specific grammar notes
- [ ] All German text has Persian translation
- [ ] BiDi rule followed for mixed text
- [ ] Game steps inserted every 5-7 steps
- [ ] TypeScript check passes
- [ ] Lesson works in browser
- [ ] STATUS.md updated
- [ ] Multimedia tasks created
- [ ] Audio generated
