# Content Fusion Workflow

> How to create UNIQUE lessons by fusing multiple sources

**For updating EXISTING lessons:** See `workflows/content-migration.md`

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

### Rule 1: Use OUR Characters

**DO NOT** use names from source materials. Use our defined characters:

| Character | Role | Description |
|-----------|------|-------------|
| **Eli** | Primary | German teacher (43, female, calm and supportive) |
| **Tom** | Primary | Language instructor (35-37, male, reliable guide) |
| **Lisa** | Secondary | Young companion (18-20, female, playful) |
| **Alex** | Secondary | German student (21-22, male, adaptable) |

**Service roles** (no consistent visuals needed):
- Kellner, Verkäufer, Arzt (use role titles, not names)

### Rule 2: Rewrite Dialogs

Don't copy dialogs verbatim. Keep the structure, change the content:

**Source (Babbel):**

```
Anna: Hallo! Ich bin Anna.
Tom: Hallo Anna! Ich heiße Tom.
```

**Our version:**

```
Eli: Hallo! Ich bin Eli.
Tom: Hi Eli! Ich heiße Tom. Freut mich!
Eli: Freut mich auch, Tom!
```

### Rule 3: Create Original Examples

Use the vocabulary, but create fresh example sentences:

**Source:** "Ich komme aus Deutschland."
**Our version:** "Ich komme aus Berlin." or "Tom kommt aus München."

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
3. **Characters**: Use OUR characters (Eli, Tom, Lisa, Alex)
4. **Vocabulary**: From sources, with grammar metadata (see Step 3)
5. **Steps**: Plan 15-25 steps using this pattern:

### Required Step Sequence for Each New Word
```
new-word → syllable-spelling → [optional: spelling] → exercise
```

### Step Types to Use

| Step Type | Purpose | Frequency |
|-----------|---------|-----------|
| `new-word` | Introduce vocabulary | Per word |
| `syllable-spelling` | **REQUIRED** after each new-word | Per word |
| `grammar-popup` | Interactive grammar tips (L07+) | 1-2 per lesson |
| `dialog` | Conversations with questions | 1-2 per lesson |
| `dictation` | Listening practice | 1-2 per lesson |
| `multiple-choice`, `fill-in-blank`, `word-order` | Exercises with feedbackTip | Multiple |
| `true-false` | Comprehension | As needed |
| Games: `rapid-fire`, `memory-match`, `word-hunt` | Engagement | Every 5-7 steps |

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
  "vocabulary": [
    {
      "de": "der Mann",
      "fa": "مرد",
      "grammar": {
        "pos": "noun",
        "noun": { "artikel": "m", "plural": "Männer" }
      }
    },
    {
      "de": "kommen",
      "fa": "آمدن",
      "grammar": {
        "pos": "verb",
        "verb": {
          "infinitiv": "kommen",
          "praesens": {
            "ich": "komme",
            "du": "kommst",
            "er_sie_es": "kommt"
          }
        }
      }
    },
    {
      "de": "Guten Morgen",
      "fa": "صبح بخیر",
      "grammar": { "pos": "phrase" }
    }
  ],
  "steps": [
    // ... steps here
  ],
  "tags": ["greetings", "feelings"]
}
```

### Vocabulary Grammar Metadata (REQUIRED)

| Part of Speech | Required Fields |
|----------------|-----------------|
| **Noun** | `pos: "noun"`, `noun.artikel: "m"/"f"/"n"`, optional `plural` |
| **Verb** | `pos: "verb"`, `verb.infinitiv`, optional `praesens` conjugation |
| **Phrase** | `pos: "phrase"` |
| **Other** | `pos: "adjective"/"adverb"/"preposition"/etc.` |

---

## Step 4: Write Steps (with original content)

### new-word step

```json
{
  "type": "new-word",
  "id": "s1",
  "word": { "de": "Guten Morgen", "fa": "صبح بخیر" },
  "example": {
    "text": { "de": "Hallo! Guten Morgen!", "fa": "سلام! صبح بخیر!" }
  },
  "header": "یاد بگیر!"
}
```

### syllable-spelling step (REQUIRED after EVERY new-word!)

```json
{
  "type": "syllable-spelling",
  "id": "syllable-1",
  "word": "Guten Morgen",
  "translation": "صبح بخیر",
  "syllables": ["Gu", "ten", "Mor", "gen"],
  "distractors": ["Go", "tan", "Mar", "gan"]
}
```

**⚠️ CRITICAL Fields:**
- `word`: German word/phrase as **string** (NOT bilingual object!)
- `translation`: Persian translation as **string** (REQUIRED!)
- `syllables`: Array of syllable chunks
- `distractors`: Array of wrong syllables (REQUIRED, no substrings of correct syllables!)

**⚠️ CRITICAL: No Ambiguous Distractors!**

Distractors must NOT be substrings of correct syllables:

| ❌ WRONG | Why | ✅ CORRECT |
|----------|-----|-----------|
| syllables: `["ie"]`, distractor: `"i"` | "i" is substring of "ie" | Use `"a"` or `"o"` |
| syllables: `["ei"]`, distractor: `"i"` | "i" is substring of "ei" | Use `"o"` or `"u"` |
| syllables: `["chen"]`, distractor: `"en"` | "en" is substring of "chen" | Use `"te"` or `"on"` |

The validation script (`validate-lesson.js`) automatically catches these issues.

**Syllable Breaking Rules:**
| Pattern | Example | Syllables |
|---------|---------|-----------|
| Simple words | Hallo | Hal-lo |
| Compound words | Guten Morgen | Gu-ten Mor-gen |
| Prefixes | Entschuldigung | Ent-schul-di-gung |
| -ung endings | Wohnung | Woh-nung |

### dialog step (with questions - REQUIRED)

```json
{
  "type": "dialog",
  "id": "s10",
  "scene": {
    "location": "café",
    "description": { "de": "In einem Café", "fa": "در یک کافه" }
  },
  "lines": [
    {
      "speaker": "Eli",
      "text": { "de": "Hallo Tom! Wie geht's?", "fa": "سلام تام! حالت چطوره؟" },
      "mood": "happy"
    },
    {
      "speaker": "Tom",
      "text": { "de": "Gut, danke! Und dir?", "fa": "خوبم، ممنون! تو چطوری؟" }
    }
  ],
  "questionMode": "post-dialog",
  "questions": [
    {
      "question": "تام چطور است؟",
      "options": ["خوب", "بد", "خسته"],
      "correctIndex": 0,
      "explanation": "تام گفت: «Gut, danke!»",
      "relatedLineIndex": 1
    }
  ]
}
```

### grammar-popup step (for L07+ lessons)

```json
{
  "type": "grammar-popup",
  "id": "grammar-1",
  "title": "نکته!",
  "explanation": "در آلمانی فعل همیشه در جایگاه دوم است.",
  "highlights": ["فعل", "جایگاه دوم"],
  "examples": [
    {
      "de": "Ich heiße Anna.",
      "fa": "اسم من آنا است.",
      "highlights": ["heiße"]
    }
  ],
  "grammarConcept": "v2-word-order"
}
```

**Grammar Concepts by Lesson Range:**
| Lessons | Allowed Concepts |
|---------|-----------------|
| L07-L10 | `du-vs-sie`, `v2-word-order` |
| L11-L18 | + `verb-conjugation` |
| L19-L25 | + `article-gender` |
| L26-L31 | + `accusative-case` |

### Exercise with feedbackTip (REQUIRED)

```json
{
  "type": "multiple-choice",
  "id": "s5",
  "question": "معنی «der Mann» چیست؟",
  "options": ["زن", "مرد", "بچه"],
  "correctAnswerIndex": 1,
  "feedbackTip": {
    "category": "vocabulary",
    "tip": "«der Mann» یعنی مرد. «der» نشان‌دهنده جنس مذکر است."
  }
}
```

**FeedbackTip Schema:**
```json
{
  "feedbackTip": {
    "category": "error-category-id",
    "tip": "Persian explanation shown on wrong answer"
  }
}
```

**Error Categories (ONLY these 10 values are valid):**
| Category | Use When |
|----------|----------|
| `wrong-article` | der/die/das confusion |
| `wrong-conjugation` | Verb form error |
| `wrong-case` | Accusative/Dative error |
| `word-order` | V2 position error |
| `vocabulary` | Wrong word choice |
| `spelling` | Spelling mistake |
| `comprehension` | Didn't understand question |
| `plural-form` | Plural error |
| `negation` | nicht/kein error |
| `gender-agreement` | Adjective gender error |

### dictation step (1-2 per lesson)

```json
{
  "type": "dictation",
  "id": "dictation-1",
  "targetText": "Guten Morgen",
  "translation": "صبح بخیر",
  "difficulty": "A1"
}
```

**Difficulty by Level:**
| Level | Max Repeats | Show Translation | Show First Letter |
|-------|-------------|------------------|-------------------|
| A1 | Unlimited | Yes | Yes |
| A2 | 5 | Yes | No |
| B1 | 3 | No | No |

### grammar-tip step (Persian-specific - legacy)

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

> **Note:** Prefer `grammar-popup` for L07+ lessons. Use `grammar-tip` for general notes.

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

**REQUIRED after each lesson!** Assets are auto-generated from lesson content.

### 9.1 How it works
The asset registry script automatically detects:
- Every `new-word` step → vocabulary image
- Every `dialog` step → scene image
- Assigns characters based on category (greetings→Eli, actions→Eli/Tom, places→no character)

### 9.2 Regenerate asset registry
```bash
# Scans ALL lessons and regenerates the asset registry
node scripts/regenerate-asset-registry-full.js

# Output: apps/web/src/lib/data/asset-registry.json
```

### 9.3 Generate task summary for designer
```bash
# Creates pending task list with character refs
node scripts/generate-task-summary.js

# Output: ai-workspace/progress/multimedia-tasks/TASK-SUMMARY.md
```

Designer workflow is documented in `workflows/multimedia-tasks.md`

---

## Step 10: Register New Modules (CRITICAL!)

**If creating a NEW MODULE (not just a new lesson in an existing module), you MUST register it!**

Edit `apps/web/src/lib/data/modules.ts` and add the new module to `DE_FA_A1_MODULES`:

```typescript
{
  id: "module-07",
  title: "بخش ۷: خانواده (Familie)",
  level: "A1",
  lessons: [
    {
      id: "A1-M07-L01",
      title: "خانواده‌ام (Meine Familie)",
      description: "یاد بگیرید اعضای خانواده را به آلمانی بگویید",
      path: "/learn/de-fa/A1/A1-M07-L01"
    }
  ]
}
```

**When adding a new lesson to an existing module**, add it to the `lessons` array of that module.

---

## Step 11: Test Locally

**Dev mode automatically loads LOCAL content** (not CDN), so you can test immediately:

```bash
pnpm run dev
# Navigate to http://localhost:5173/learn/de-fa/A1/A1-M01-L02
# Console shows: "ContentService: Loaded A1-M01-L02 from LOCAL (dev mode)"
```

> **Note**: Local content is served via symlink: `apps/web/static/content -> content/`
> If symlink is missing: `ln -sfn "$(pwd)/content" apps/web/static/content`

---

## Step 12: Upload to Cloud (R2 CDN)

**IMPORTANT**: After testing locally, upload content to cloud storage for production.

### 11.1 Upload Lesson Content to R2
```bash
# Preview what will be uploaded
node scripts/upload-content-to-r2.js --dry-run

# Actually upload lessons
node scripts/upload-content-to-r2.js

# Flags:
# --force    Re-upload all (ignore existing)
# --lang=de-fa  Upload specific language pair only
```

### 11.2 Upload Audio to R2
```bash
# Upload audio files (uses hash-based deduplication)
node scripts/upload-to-r2.js --dry-run
node scripts/upload-to-r2.js
```

### 11.3 Verify Upload
- Content URL: `https://pub-[id].r2.dev/de-fa/content/index.json`
- Audio served from: `https://pub-[id].r2.dev/de-fa/audio/by-hash/`

**Production vs Dev:**
- **Dev mode**: Loads LOCAL content first (from `apps/web/static/content/`)
- **Production**: Loads from CDN, falls back to local if CDN fails

---

## Step 13: Update Progress & Commit

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
│  8. ▶ UPLOAD TO CLOUD (R2) ◀                               │
│  9. Update progress files                                   │
│  10. Commit everything together                             │
│                                                             │
│  ✅ THEN move to next lesson                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Checklist (Complete Before Next Lesson!)

### Content Basics
- [ ] Researched ALL THREE sources for topic
- [ ] Used OUR characters (Eli, Tom, Lisa, Alex)
- [ ] Wrote ORIGINAL dialogs
- [ ] Created ORIGINAL example sentences
- [ ] Added Persian-specific grammar notes
- [ ] All German text has Persian translation
- [ ] BiDi rule followed for mixed text
- [ ] Game steps inserted every 5-7 steps

### New Features (REQUIRED)
- [ ] **Vocabulary has grammar metadata** (pos, artikel for nouns, conjugation for verbs)
- [ ] **Syllable-spelling after EVERY new-word step**
- [ ] **Syllable-spelling distractors included** (no substrings of syllables!)
- [ ] **All dialogs have 1-3 comprehension questions**
- [ ] **All exercises have feedbackTip** with onCorrect/onWrong + errorCategory
- [ ] **1-2 dictation steps** added
- [ ] **Grammar-popup steps** for lessons L07+ (instead of/with grammar-tip)

### Module Registration (CRITICAL!)
- [ ] **If NEW MODULE**: Added to `apps/web/src/lib/data/modules.ts`
- [ ] **If NEW LESSON**: Added to existing module's `lessons` array

### Validation
- [ ] JSON syntax valid (`jq` check)
- [ ] TypeScript check passes (`pnpm run check`)

### Audio (DO NOT SKIP!)
- [ ] Audio generated for this lesson
- [ ] Audio files exist in `apps/web/static/audio/{lessonId}/`
- [ ] Audio plays correctly in browser

### Multimedia Tasks (DO NOT SKIP!)
- [ ] Asset registry regenerated: `node scripts/regenerate-asset-registry-full.js`
- [ ] Task summary generated: `node scripts/generate-task-summary.js`

### Cloud Upload (DO NOT SKIP!)
- [ ] Lesson JSON uploaded: `node scripts/upload-content-to-r2.js`
- [ ] Audio uploaded: `node scripts/upload-to-r2.js`
- [ ] Verified content is accessible on CDN

### Progress
- [ ] CURRENT_TASK.md updated
- [ ] STATUS.md updated
- [ ] progress/lessons-created.json updated
- [ ] progress/audio-generated.json updated
- [ ] Changes committed
