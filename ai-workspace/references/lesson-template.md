# Lesson Template

> Copy and adapt this template for new lessons

---

## Lesson JSON Template

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

    // ========== VOCABULARY INTRODUCTION (4-6 words) ==========

    {
      "type": "new-word",
      "id": "s1",
      "word": { "de": "Wie geht's?", "fa": "حالت چطوره؟" },
      "example": {
        "text": { "de": "Hallo Max! Wie geht's?", "fa": "سلام مکس! حالت چطوره؟" }
      },
      "header": "یاد بگیر!"
    },

    {
      "type": "new-word",
      "id": "s2",
      "word": { "de": "Gut", "fa": "خوب" },
      "example": {
        "text": { "de": "Mir geht's gut!", "fa": "حالم خوبه!" }
      },
      "header": "یاد بگیر!"
    },

    {
      "type": "new-word",
      "id": "s3",
      "word": { "de": "Danke", "fa": "ممنون" },
      "example": {
        "text": { "de": "Danke, gut!", "fa": "ممنون، خوبم!" }
      },
      "header": "یاد بگیر!"
    },

    {
      "type": "new-word",
      "id": "s4",
      "word": { "de": "Und dir?", "fa": "تو چطوری؟" },
      "example": {
        "text": { "de": "Gut, danke. Und dir?", "fa": "خوبم، ممنون. تو چطوری؟" }
      },
      "header": "یاد بگیر!"
    },

    // ========== GRAMMAR TIP ==========

    {
      "type": "grammar-tip",
      "id": "s5",
      "title": "پرسیدن حال در آلمانی",
      "content": "برای پرسیدن حال کسی از این عبارات استفاده می‌کنیم:\n\n**Wie geht's?** = حالت چطوره؟ (غیررسمی)\n**Wie geht es dir?** = حالت چطوره؟ (کامل‌تر)\n**Wie geht es Ihnen?** = حالتان چطور است؟ (رسمی)\n\n⚠️ در پاسخ معمولاً می‌گوییم:\n**Gut, danke!** = خوبم، ممنون!",
      "examples": [
        { "de": "Wie geht's?", "fa": "حالت چطوره؟" },
        { "de": "Mir geht's gut!", "fa": "حالم خوبه!" }
      ]
    },

    // ========== GAME 1: RAPID FIRE (after vocab) ==========

    {
      "type": "rapid-fire",
      "id": "g1",
      "title": "آزمون سریع",
      "instruction": "ترجمه درست را انتخاب کنید!",
      "timePerQuestion": 5,
      "questions": [
        { "prompt": "Wie geht's?", "left": "خداحافظ", "right": "حالت چطوره؟", "correctSide": "right" },
        { "prompt": "Gut", "left": "خوب", "right": "بد", "correctSide": "left" },
        { "prompt": "Danke", "left": "لطفاً", "right": "ممنون", "correctSide": "right" },
        { "prompt": "Und dir?", "left": "تو چطوری؟", "right": "من خوبم", "correctSide": "left" }
      ]
    },

    // ========== EXERCISES ==========

    {
      "type": "multiple-choice",
      "id": "s6",
      "question": "چگونه حال کسی را به آلمانی می‌پرسید؟",
      "options": ["Tschüss", "Danke", "Wie geht's?", "Hallo"],
      "correctAnswerIndex": 2,
      "feedback": {
        "explanation": "Wie geht's? یعنی 'حالت چطوره؟'"
      }
    },

    {
      "type": "fill-in-blank",
      "id": "s7",
      "instruction": "جمله را کامل کنید",
      "sentence": "Wie {0} dir?",
      "options": ["geht's", "bin", "bist", "heißt"],
      "correctAnswers": [0],
      "feedback": {
        "explanation": "Wie geht's dir? یعنی 'حالت چطوره؟'"
      }
    },

    {
      "type": "word-order",
      "id": "s8",
      "instruction": "کلمات را مرتب کنید",
      "words": ["danke", "Gut,"],
      "correctOrder": [1, 0],
      "correctSentence": {
        "de": "Gut, danke",
        "fa": "خوبم، ممنون"
      }
    },

    {
      "type": "matching",
      "id": "s9",
      "instruction": "جفت‌های درست را پیدا کنید",
      "items": [
        { "id": "i1", "text": "Wie geht's?" },
        { "id": "i2", "text": "Gut" },
        { "id": "i3", "text": "Danke" },
        { "id": "i4", "text": "Und dir?" }
      ],
      "matches": [
        { "id": "m1", "text": "حالت چطوره؟" },
        { "id": "m2", "text": "خوب" },
        { "id": "m3", "text": "ممنون" },
        { "id": "m4", "text": "تو چطوری؟" }
      ],
      "correctPairs": [["i1", "m1"], ["i2", "m2"], ["i3", "m3"], ["i4", "m4"]],
      "shuffleTargets": true
    },

    // ========== GAME 2: MEMORY MATCH ==========

    {
      "type": "memory-match",
      "id": "g2",
      "title": "بازی حافظه",
      "pairs": [
        { "de": "Wie geht's?", "fa": "حالت چطوره؟" },
        { "de": "Gut", "fa": "خوب" },
        { "de": "Danke", "fa": "ممنون" },
        { "de": "Und dir?", "fa": "تو چطوری؟" }
      ],
      "timeLimit": 60
    },

    // ========== DIALOG ==========

    {
      "type": "dialog",
      "id": "s10",
      "title": "مکالمه روزانه",
      "lines": [
        { "speaker": "Lena", "text": { "de": "Hallo Max!", "fa": "سلام مکس!" } },
        { "speaker": "Max", "text": { "de": "Hi Lena! Wie geht's?", "fa": "سلام لنا! حالت چطوره؟" } },
        { "speaker": "Lena", "text": { "de": "Gut, danke! Und dir?", "fa": "خوبم، ممنون! تو چطوری؟" } },
        { "speaker": "Max", "text": { "de": "Auch gut!", "fa": "منم خوبم!" } }
      ],
      "feedback": {
        "explanation": "این یک مکالمه ساده روزانه برای احوالپرسی است."
      }
    },

    // ========== MORE EXERCISES ==========

    {
      "type": "true-false",
      "id": "s11",
      "instruction": "درست یا غلط؟",
      "statement": "برای پاسخ دادن به 'Wie geht's?' می‌گوییم 'Gut, danke!'",
      "correctAnswer": true,
      "feedback": {
        "explanation": "بله! پاسخ معمول 'Gut, danke!' (خوبم، ممنون!) است."
      }
    },

    {
      "type": "translation",
      "id": "s12",
      "sourceText": "خوبم، ممنون!",
      "sentenceTemplate": "{0}, {1}!",
      "options": ["Danke", "Gut", "Hallo", "Tschüss"],
      "correctAnswers": [1, 0],
      "correctTranslation": {
        "de": "Gut, danke!",
        "fa": "خوبم، ممنون!"
      }
    },

    {
      "type": "spelling",
      "id": "s13",
      "word": "Danke",
      "translation": "ممنون",
      "hint": "DAN-keh",
      "instruction": "این کلمه را هجی کنید"
    },

    // ========== GAME 3: VOCAB CHECK ==========

    {
      "type": "vocab-check",
      "id": "g3",
      "title": "خودارزیابی",
      "instruction": "این کلمات را چقدر یاد گرفتید؟",
      "words": [
        { "de": "Wie geht's?", "fa": "حالت چطوره؟" },
        { "de": "Gut", "fa": "خوب" },
        { "de": "Danke", "fa": "ممنون" },
        { "de": "Und dir?", "fa": "تو چطوری؟" }
      ]
    },

    // ========== COMPLETION (always last) ==========

    {
      "type": "completion",
      "id": "s14",
      "message": "آفرین! درس دوم را تمام کردید!",
      "vocabularyLearned": [
        { "word": { "de": "Wie geht's?", "fa": "حالت چطوره؟" } },
        { "word": { "de": "Gut", "fa": "خوب" } },
        { "word": { "de": "Danke", "fa": "ممنون" } },
        { "word": { "de": "Und dir?", "fa": "تو چطوری؟" } }
      ]
    }
  ],
  "tags": ["greetings", "feelings", "A1"]
}
```

---

## Step Pattern

A typical 15-20 step lesson follows this pattern:

```
1-4:   new-word (4 vocabulary items)
5:     grammar-tip
6:     ← GAME: rapid-fire
7-10:  multiple-choice, fill-in-blank, word-order, matching
11:    ← GAME: memory-match
12:    dialog
13-15: true-false, translation, spelling
16:    ← GAME: vocab-check (optional)
17:    completion
```

---

## Naming Convention

| Field | Format | Example |
|-------|--------|---------|
| Lesson ID | `{Level}-M{Module}-L{Lesson}` | `A1-M01-L02` |
| Step IDs | `s1`, `s2`, ... | Learning steps |
| Game IDs | `g1`, `g2`, ... | Game steps |
| File path | `content/de-fa/{Level}/module-{NN}/{ID}.json` | `content/de-fa/A1/module-01/A1-M01-L02.json` |

---

## Quick Copy Blocks

### New Word Step
```json
{
  "type": "new-word",
  "id": "s1",
  "word": { "de": "GERMAN_WORD", "fa": "PERSIAN" },
  "example": {
    "text": { "de": "GERMAN_EXAMPLE", "fa": "PERSIAN_EXAMPLE" }
  },
  "header": "یاد بگیر!"
}
```

### Multiple Choice Step
```json
{
  "type": "multiple-choice",
  "id": "s6",
  "question": "PERSIAN_QUESTION?",
  "options": ["OPTION1", "OPTION2", "OPTION3", "OPTION4"],
  "correctAnswerIndex": 0,
  "feedback": { "explanation": "PERSIAN_EXPLANATION" }
}
```

### Dialog Step
```json
{
  "type": "dialog",
  "id": "s10",
  "title": "PERSIAN_TITLE",
  "lines": [
    { "speaker": "NAME", "text": { "de": "GERMAN", "fa": "PERSIAN" } }
  ]
}
```

### Rapid Fire Game
```json
{
  "type": "rapid-fire",
  "id": "g1",
  "title": "آزمون سریع",
  "instruction": "ترجمه درست را انتخاب کنید!",
  "timePerQuestion": 5,
  "questions": [
    { "prompt": "GERMAN", "left": "WRONG", "right": "CORRECT", "correctSide": "right" }
  ]
}
```
