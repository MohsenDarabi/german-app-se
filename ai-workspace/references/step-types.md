# Step Types Reference

> Complete reference for all 19 lesson step types

---

## Overview

| Category | Step Types |
|----------|------------|
| **Vocabulary** | `new-word`, `spelling` |
| **Grammar** | `grammar-tip`, `grammar-popup` (NEW) |
| **Exercises** | `multiple-choice`, `fill-in-blank`, `word-order`, `true-false`, `translation`, `matching` |
| **Media** | `dialog` (enhanced), `comprehension`, `dictation` (NEW), `story` (NEW) |
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

## 2b. grammar-popup (NEW)

Contextual grammar tips shown at optimal moments during lessons.

```json
{
  "type": "grammar-popup",
  "id": "s6",
  "title": "نکته!",
  "explanation": "در آلمانی فعل همیشه در جایگاه دوم است، نه آخر جمله.",
  "highlights": ["heiße", "bin"],
  "examples": [
    { "de": "Ich heiße Anna.", "fa": "اسم من آنا است.", "highlights": ["heiße"] },
    { "de": "Ich bin Tom.", "fa": "من تام هستم.", "highlights": ["bin"] }
  ],
  "grammarConcept": "V2-word-order",
  "minLesson": 9
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `title` | No | Title (default: "نکته!") |
| `explanation` | Yes | Main explanation in Persian |
| `highlights` | No | Words to highlight in examples |
| `examples` | No | Example sentences with German/Persian |
| `grammarConcept` | No | Reference to grammar concept |
| `minLesson` | No | Minimum lesson number for this tip (CEFR progression) |

**Usage**: Place before exercises testing a new grammar concept.

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

## 9. dialog (ENHANCED)

Conversation between speakers with questions, narratives, and scene support.

```json
{
  "type": "dialog",
  "id": "s13",
  "scene": {
    "location": "Café",
    "description": { "de": "In einem Café in Berlin.", "fa": "در یک کافه در برلین." },
    "imageId": "scenes/cafe-berlin"
  },
  "narratives": [
    { "position": 0, "text": { "de": "Eli wartet auf Tom.", "fa": "الی منتظر تام است." }},
    { "position": 2, "text": { "de": "Tom kommt rein.", "fa": "تام وارد می‌شود." }}
  ],
  "lines": [
    { "speaker": "Eli", "text": { "de": "Hallo!", "fa": "سلام!" }, "mood": "happy" },
    { "speaker": "Tom", "text": { "de": "Hi! Ich bin Tom.", "fa": "سلام! من تام هستم." }, "mood": "excited" },
    { "speaker": "Eli", "text": { "de": "Ich bin Eli.", "fa": "من الی هستم." } }
  ],
  "questions": [
    {
      "question": "اسم مرد چیست؟",
      "options": ["الی", "تام", "ماریا"],
      "correctIndex": 1,
      "explanation": "تام گفت: «Ich bin Tom.»",
      "relatedLineIndex": 1
    }
  ],
  "questionMode": "post-dialog"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `lines` | Yes | Array of speaker/text objects with optional `mood` |
| `scene` | No | Scene context with location, description, imageId |
| `narratives` | No | Text between dialog lines (position = after which line) |
| `questions` | No | Comprehension questions |
| `questionMode` | No | `mid-dialog`, `post-dialog`, or `both` (default: `post-dialog`) |
| `pauseAfterLines` | No | Line indices to pause for mid-dialog questions |

**Moods**: `neutral`, `happy`, `sad`, `angry`, `surprised`, `confused`, `excited`

**Image Required**: Every dialog should have a scene image.

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

## 12. dictation (NEW)

Listening dictation exercise - hear audio, type what you heard.

```json
{
  "type": "dictation",
  "id": "d1",
  "targetText": "Guten Morgen",
  "translation": "صبح بخیر",
  "difficulty": "A1",
  "audioId": "d1-audio"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `targetText` | Yes | Text the user should type |
| `translation` | Yes | Persian translation for feedback |
| `difficulty` | No | `A1`, `A2`, `B1`, `B2` (default: `A1`) |
| `audioId` | No | Pre-generated audio ID |
| `maxRepeats` | No | Override max audio repeats |
| `showHints` | No | Override hint visibility |

**Difficulty Settings:**
| Level | Max Repeats | Show Translation | Show First Letter |
|-------|-------------|------------------|-------------------|
| A1 | Unlimited | Yes | Yes |
| A2 | 5 | Yes | No |
| B1 | 3 | No | No |
| B2 | 1 | No | No |

---

## 13. story (NEW)

Engaging narrative with mixed segments - narration, dialog, and questions.

```json
{
  "type": "story",
  "id": "story1",
  "title": { "de": "Die verlorene Katze", "fa": "گربه گمشده" },
  "characters": ["Eli", "Tom"],
  "setting": { "location": "Park", "imageId": "park-scene" },
  "duration": "short",
  "tone": "funny",
  "segments": [
    {
      "type": "narration",
      "text": { "de": "Es ist Samstag Morgen.", "fa": "صبح شنبه است." }
    },
    {
      "type": "dialog",
      "speaker": "Eli",
      "text": { "de": "Wo ist meine Katze?", "fa": "گربه‌ام کجاست؟" },
      "mood": "confused"
    },
    {
      "type": "question",
      "question": "چه اتفاقی افتاده؟",
      "options": ["گربه الی گم شده", "تام دیر آمده"],
      "correctIndex": 0,
      "explanation": "الی گربه‌اش را گم کرده است."
    }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Bilingual story title |
| `segments` | Yes | Array of narration, dialog, or question segments |
| `characters` | No | List of characters |
| `setting` | No | Location and optional image |
| `duration` | No | `short` (1-2 min) or `medium` (2-3 min) |
| `tone` | No | `funny`, `dramatic`, `casual`, `romantic` |

**See also**: `ai-workspace/references/story-guidelines.md` for story writing rules.

---

## GAME STEPS

### 14. rapid-fire

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

### 15. memory-match

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

### 16. word-hunt

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

### 17. speed-challenge

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

### 18. vocab-check

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

## 19. completion

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
