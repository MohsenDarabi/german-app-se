# Content Fusion Workflow

> How to create a lesson by fusing Babbel + Busuu content

---

## Overview

Each lesson combines content from multiple sources:
1. **Babbel** - Vocabulary, exercises, dialogs
2. **Busuu** - Additional exercises, grammar tips
3. **Persian adaptation** - Translations, cultural notes

---

## Step 1: Identify Source Content

### Find Babbel lesson
```bash
# List Babbel A1.1 lessons
ls scripts/babbel-extractor/output/A11/

# Read a specific lesson
cat scripts/babbel-extractor/output/A11/unit-01/lesson-01.json | jq
```

### Find Busuu chapter
```bash
# List Busuu A1 chapters
ls extracted-content/busuu/A1/

# Read chapter content
cat extracted-content/busuu/A1/chapter-01/content.json | jq
```

---

## Step 2: Plan the Lesson

Before writing, decide:

1. **Lesson ID**: `{Level}-M{Module}-L{Lesson}` (e.g., `A1-M01-L02`)
2. **Theme**: What vocabulary/grammar topic?
3. **Steps**: Plan 15-25 steps mixing:
   - `new-word` (vocabulary introduction)
   - `grammar-tip` (explanations)
   - `multiple-choice`, `fill-in-blank`, `word-order` (exercises)
   - `dialog` (conversations)
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
    "de": "German title",
    "fa": "Persian title"
  },
  "level": "A1",
  "module": 1,
  "lessonNumber": 2,
  "estimatedMinutes": 15,
  "steps": [
    // ... steps here
  ],
  "tags": ["greetings", "introductions"]
}
```

---

## Step 4: Write Steps

### new-word step
```json
{
  "type": "new-word",
  "id": "s1",
  "word": { "de": "Hallo", "fa": "سلام" },
  "example": {
    "text": { "de": "Hallo, wie geht's?", "fa": "سلام، حالت چطوره؟" }
  },
  "header": "Look, something new!"
}
```

### grammar-tip step
```json
{
  "type": "grammar-tip",
  "id": "s5",
  "title": "Verb Conjugation",
  "content": "Explanation text here...",
  "examples": [
    { "de": "Ich bin Anna.", "fa": "من آنا هستم." }
  ]
}
```

### multiple-choice step
```json
{
  "type": "multiple-choice",
  "id": "s8",
  "question": "What does 'Hallo' mean?",
  "options": ["Hello", "Goodbye", "Thank you", "Please"],
  "correctAnswerIndex": 0
}
```

### Game steps (insert every 5-7 learning steps)
```json
{
  "type": "rapid-fire",
  "id": "s12",
  "title": "Quick Quiz",
  "instruction": "Answer quickly!",
  "timePerQuestion": 5,
  "questions": [
    {
      "prompt": "Hallo",
      "left": "سلام",
      "right": "خداحافظ",
      "correctSide": "left"
    }
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

- [ ] Lesson JSON created and valid
- [ ] All German text has Persian translation
- [ ] BiDi rule followed for mixed text
- [ ] Game steps inserted every 5-7 steps
- [ ] TypeScript check passes
- [ ] Lesson works in browser
- [ ] STATUS.md updated
- [ ] Multimedia tasks created
- [ ] Audio generated
