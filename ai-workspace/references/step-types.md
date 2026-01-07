# Step Types Reference

> Complete reference for all 17 lesson step types

---

## Overview

| Category | Step Types |
|----------|------------|
| **Vocabulary** | `new-word`, `spelling` |
| **Grammar** | `grammar-tip` |
| **Exercises** | `multiple-choice`, `fill-in-blank`, `word-order`, `true-false`, `translation`, `matching` |
| **Media** | `dialog`, `comprehension` |
| **Games** | `rapid-fire`, `memory-match`, `word-hunt`, `speed-challenge`, `vocab-check` |
| **Completion** | `completion` |

---

## Multimedia Requirements

| Step Type | Needs Image? | Needs Video? |
|-----------|--------------|--------------|
| `new-word` | Optional (concrete nouns) | No |
| `dialog` | ✅ Yes (scene) | Optional |
| `comprehension` | ✅ Yes | Optional |
| `grammar-tip` | Optional (diagrams) | No |
| All others | No | No |

**After creating a lesson**: Generate multimedia task file → `ai-workspace/progress/multimedia-tasks/{LessonID}.json`

See `workflows/multimedia-tasks.md` for task file format.

---

## 1. new-word

Introduces a new vocabulary word or phrase.

```json
{
  "type": "new-word",
  "id": "s1",
  "word": { "de": "Hallo", "fa": "سلام" },
  "example": {
    "text": { "de": "Hallo! Wie geht's?", "fa": "سلام! حالت چطوره؟" }
  },
  "header": "یاد بگیر!"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `word` | Yes | Bilingual word/phrase |
| `example` | No | Example sentence |
| `header` | No | Header text (default: "Look, something new!") |
| `imageId` | No | Path to image (e.g., `greetings/hello-wave.jpg`) |

**Image Usage**: For concrete nouns (objects, places, people), add an image task in `multimedia-tasks/{LessonID}.json`. After colleague creates it, add `imageId` to the step.

---

## 2. grammar-tip

Educational grammar explanation.

```json
{
  "type": "grammar-tip",
  "id": "s5",
  "title": "Du vs Sie - تو و شما",
  "content": "در آلمانی مثل فارسی دو نوع خطاب داریم:\n\n**du** = تو (غیررسمی)\n**Sie** = شما (رسمی)",
  "examples": [
    { "de": "Wie geht's dir?", "fa": "حالت چطوره؟" },
    { "de": "Wie geht es Ihnen?", "fa": "حالتان چطور است؟" }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `title` | No | Tip title |
| `content` | Yes | Main explanation (supports markdown) |
| `examples` | No | Example sentences |

---

## 3. multiple-choice

Select correct answer from options.

```json
{
  "type": "multiple-choice",
  "id": "s6",
  "question": "چگونه به آلمانی می‌گویید 'سلام'؟",
  "options": ["Tschüss", "Danke", "Hallo", "Bitte"],
  "correctAnswerIndex": 2,
  "feedback": {
    "explanation": "Hallo یعنی سلام."
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `question` | Yes | Question text |
| `options` | Yes | 2-4 answer choices |
| `correctAnswerIndex` | Yes | 0-based index of correct answer |
| `feedback` | No | Explanation shown after |

---

## 4. fill-in-blank

Complete sentence with correct word.

```json
{
  "type": "fill-in-blank",
  "id": "s8",
  "instruction": "جمله را کامل کنید",
  "sentence": "{0}! Wie geht's?",
  "options": ["Tschüss", "Hallo", "Danke", "Bitte"],
  "correctAnswers": [1],
  "feedback": {
    "explanation": "برای سلام کردن از Hallo استفاده می‌کنیم."
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `instruction` | No | Instruction text |
| `sentence` | Yes | Template with `{0}`, `{1}` for blanks |
| `options` | Yes | Word choices |
| `correctAnswers` | Yes | Array of correct indices for each blank |

---

## 5. word-order

Arrange words in correct order.

```json
{
  "type": "word-order",
  "id": "s11",
  "instruction": "کلمات را مرتب کنید",
  "words": ["Lisa", "bin", "Ich"],
  "correctOrder": [2, 1, 0],
  "correctSentence": {
    "de": "Ich bin Lisa",
    "fa": "من لیزا هستم"
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `instruction` | No | Instruction text |
| `words` | Yes | Words in scrambled order |
| `correctOrder` | Yes | Indices for correct order |
| `correctSentence` | Yes | Bilingual correct sentence |

---

## 6. true-false

Verify if statement is correct.

```json
{
  "type": "true-false",
  "id": "s14",
  "instruction": "درست یا غلط؟",
  "statement": "کلمه \"Hi\" رسمی‌تر از \"Hallo\" است.",
  "correctAnswer": false,
  "feedback": {
    "explanation": "Hi غیررسمی‌تر از Hallo است."
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `instruction` | No | Instruction text |
| `statement` | Yes | Statement to verify |
| `correctAnswer` | Yes | `true` or `false` |

---

## 7. translation

Translate sentence by selecting words.

```json
{
  "type": "translation",
  "id": "s15",
  "sourceText": "من لیزا هستم.",
  "sentenceTemplate": "{0} {1} {2}.",
  "options": ["bin", "Ich", "Lisa", "du"],
  "correctAnswers": [1, 0, 2],
  "correctTranslation": {
    "de": "Ich bin Lisa.",
    "fa": "من لیزا هستم."
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `sourceText` | Yes | Persian sentence to translate |
| `sentenceTemplate` | Yes | German template with blanks |
| `options` | Yes | Word choices |
| `correctAnswers` | Yes | Indices for blanks |
| `correctTranslation` | Yes | Full correct translation |

---

## 8. matching

Match German items to Persian translations.

```json
{
  "type": "matching",
  "id": "s12",
  "instruction": "جفت‌های درست را پیدا کنید",
  "items": [
    { "id": "i1", "text": "Hallo" },
    { "id": "i2", "text": "Tschüss" },
    { "id": "i3", "text": "danke" }
  ],
  "matches": [
    { "id": "m1", "text": "سلام" },
    { "id": "m2", "text": "خداحافظ" },
    { "id": "m3", "text": "ممنون" }
  ],
  "correctPairs": [["i1", "m1"], ["i2", "m2"], ["i3", "m3"]],
  "shuffleTargets": true
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `items` | Yes | German items with id/text |
| `matches` | Yes | Persian matches with id/text |
| `correctPairs` | Yes | Array of [itemId, matchId] pairs |
| `shuffleTargets` | No | Shuffle matches (default: true) |

---

## 9. dialog

Conversation between speakers.

```json
{
  "type": "dialog",
  "id": "s13",
  "title": "آشنایی اولیه",
  "lines": [
    { "speaker": "Eli", "text": { "de": "Hallo!", "fa": "سلام!" } },
    { "speaker": "Tom", "text": { "de": "Hi! Ich bin Tom.", "fa": "سلام! من تام هستم." } },
    { "speaker": "Eli", "text": { "de": "Ich bin Eli.", "fa": "من الی هستم." } }
  ],
  "feedback": {
    "explanation": "در این مکالمه دو نفر با هم آشنا می‌شوند."
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `title` | No | Dialog title |
| `lines` | Yes | Array of speaker/text objects |
| `imageId` | No | Path to scene image (e.g., `scenes/cafe-meeting.jpg`) |

**Image Required**: Every dialog should have a scene image. Add task in `multimedia-tasks/{LessonID}.json`.

---

## 10. spelling

Spell a word by clicking letters.

```json
{
  "type": "spelling",
  "id": "s16",
  "word": "Tschüss",
  "translation": "خداحافظ",
  "hint": "CHOOS",
  "instruction": "این کلمه را هجی کنید"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `word` | Yes | Word to spell |
| `translation` | Yes | Persian meaning |
| `hint` | No | Phonetic hint |
| `instruction` | No | Instruction text |

---

## 11. comprehension

Read/listen passage and answer questions.

```json
{
  "type": "comprehension",
  "id": "s20",
  "title": "درک مطلب",
  "passage": {
    "de": "Tom kommt aus Berlin. Er ist 25 Jahre alt.",
    "fa": "تام اهل برلین است. او ۲۵ ساله است."
  },
  "questions": [
    {
      "question": "تام اهل کجاست؟",
      "options": ["München", "Berlin", "Hamburg"],
      "correctIndex": 1
    }
  ],
  "instruction": "متن را بخوانید و به سوالات پاسخ دهید."
}
```

---

## GAME STEPS

### 12. rapid-fire

Quick-fire left/right choice game.

```json
{
  "type": "rapid-fire",
  "id": "g1",
  "title": "آزمون سریع",
  "instruction": "ترجمه درست را انتخاب کنید!",
  "timePerQuestion": 5,
  "questions": [
    { "prompt": "Hallo", "left": "خداحافظ", "right": "سلام", "correctSide": "right" },
    { "prompt": "Tschüss", "left": "خداحافظ", "right": "سلام", "correctSide": "left" }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `timePerQuestion` | No | Seconds per question (default: 5) |
| `questions` | Yes | Array with prompt, left, right, correctSide |

---

### 13. memory-match

Match German-Persian pairs by flipping cards.

```json
{
  "type": "memory-match",
  "id": "g2",
  "title": "بازی حافظه",
  "pairs": [
    { "de": "Hallo", "fa": "سلام" },
    { "de": "Tschüss", "fa": "خداحافظ" },
    { "de": "danke", "fa": "ممنون" }
  ],
  "timeLimit": 60
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `pairs` | Yes | 2-8 German/Persian word pairs |
| `timeLimit` | No | Seconds (default: 60) |

---

### 14. word-hunt

Find words in a letter grid.

```json
{
  "type": "word-hunt",
  "id": "g3",
  "title": "جستجوی کلمات",
  "instruction": "کلمات آلمانی این درس را پیدا کنید",
  "targetWords": ["Hallo", "Tschüss", "danke"],
  "gridSize": { "rows": 8, "cols": 8 },
  "timeLimit": 90
}
```

---

### 15. speed-challenge

Timed vocabulary sprint (module-end game).

```json
{
  "type": "speed-challenge",
  "id": "g4",
  "title": "چالش سرعت!",
  "timeLimit": 60,
  "questions": [
    {
      "question": "Hallo",
      "options": ["سلام", "خداحافظ", "ممنون"],
      "correctAnswerIndex": 0
    }
  ],
  "basePoints": 10,
  "comboEnabled": true
}
```

---

### 16. vocab-check

Self-assessment of learned words.

```json
{
  "type": "vocab-check",
  "id": "g5",
  "title": "خودارزیابی",
  "instruction": "این کلمات را چقدر یاد گرفتید؟",
  "words": [
    { "de": "Hallo", "fa": "سلام" },
    { "de": "Tschüss", "fa": "خداحافظ" }
  ]
}
```

---

## 17. completion

Lesson completion summary (always last step).

```json
{
  "type": "completion",
  "id": "s17",
  "message": "آفرین! درس را تمام کردید!",
  "vocabularyLearned": [
    { "word": { "de": "Hallo", "fa": "سلام" } },
    { "word": { "de": "Tschüss", "fa": "خداحافظ" } }
  ]
}
```

---

## Step ID Conventions

- Learning steps: `s1`, `s2`, `s3`, ...
- Game steps: `g1`, `g2`, `g3`, ...
- Completion: Usually last step ID (e.g., `s17` or `s20`)

---

## Game Placement Rules

Insert games every 5-7 learning steps:

1. `rapid-fire` - After 4-5 vocab introductions
2. `memory-match` - After matching/translation exercises
3. `word-hunt` - Before completion
4. `speed-challenge` - At module end only
5. `vocab-check` - Optional self-assessment before completion
