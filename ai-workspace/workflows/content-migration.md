# Content Migration Workflow

> How to update existing lessons with new features

---

## Overview

This workflow guides you through updating existing lesson content to include:
1. **Vocabulary Grammar Metadata** - Add gender, cases, conjugation to words
2. **Grammar Popup Steps** - Insert interactive grammar tips
3. **Feedback Tips** - Add error categories to exercises
4. **Dialog Questions** - Add comprehension questions to dialogs
5. **Dictation Steps** - Add listening practice exercises
6. **Story Enhancements** - Add narratives and scene context

---

## Before You Start

### Check Lesson Eligibility
Not all features apply to all lessons. Check the grammar progression:

| Lesson Range | Allowed Features |
|--------------|------------------|
| L01-L06 | Vocabulary only (no grammar tips) |
| L07-L10 | du/Sie tips, basic word order |
| L11-L18 | Verb conjugation tips |
| L19-L25 | Article tips (der/die/das) |
| L26-L31 | Accusative case tips |
| L32+ | All features allowed |

### Read the Lesson First
```bash
cat content/de-fa/A1/module-XX/A1-MXX-LYY.json | jq '.vocabulary, .steps[].type'
```

---

## Migration Task 1: Syllable-Spelling Steps (REQUIRED FOR ALL VOCABULARY)

### Pedagogical Rationale
Based on **Miller's Chunking Theory** and language acquisition research:
- Breaking words into syllables reduces cognitive load
- Learners process 3-4 chunks more easily than 7+ letters
- Scaffolded progression builds confidence before full spelling
- Especially critical for German compound words

### Rule: EVERY new vocabulary word needs syllable-spelling

**Placement:** After each `new-word` step, add a `syllable-spelling` step:

```
new-word (introduce "Guten Morgen")
  ↓
syllable-spelling (practice "Gu-ten Mor-gen")
  ↓
spelling (full word - optional, for reinforcement)
```

### Template
```json
{
  "type": "syllable-spelling",
  "id": "syllable-1",
  "word": {
    "de": "Guten Morgen",
    "fa": "صبح بخیر"
  },
  "syllables": ["Gu", "ten", "Mor", "gen"],
  "hint": "۴ بخش - سلام صبحگاهی"
}
```

### Syllable Breaking Rules for German

| Pattern | Example | Syllables |
|---------|---------|-----------|
| Simple words | Hallo | Hal-lo |
| Compound words | Guten Morgen | Gu-ten Mor-gen |
| Words with prefixes | Entschuldigung | Ent-schul-di-gung |
| Words with umlauts | Mädchen | Mäd-chen |
| Words ending in -ung | Wohnung | Woh-nung |
| Words ending in -tion | Information | In-for-ma-ti-on |

### Common A1 Vocabulary Syllables

| Word | Syllables | Hint |
|------|-----------|------|
| Hallo | ["Hal", "lo"] | ۲ بخش - سلام |
| Danke | ["Dan", "ke"] | ۲ بخش - ممنون |
| Bitte | ["Bit", "te"] | ۲ بخش - لطفاً |
| Guten Morgen | ["Gu", "ten", "Mor", "gen"] | ۴ بخش - صبح بخیر |
| Guten Tag | ["Gu", "ten", "Tag"] | ۳ بخش - روز بخیر |
| Auf Wiedersehen | ["Auf", "Wie", "der", "se", "hen"] | ۵ بخش - خداحافظ |
| Entschuldigung | ["Ent", "schul", "di", "gung"] | ۴ بخش - ببخشید |
| Wie geht's | ["Wie", "geht's"] | ۲ بخش - چطوری |
| Deutschland | ["Deutsch", "land"] | ۲ بخش - آلمان |
| Frühstück | ["Früh", "stück"] | ۲ بخش - صبحانه |

### Frequency Guidelines

| Lesson Type | Syllable-Spelling Frequency |
|-------------|----------------------------|
| Vocabulary-focused | After EVERY new-word step |
| Grammar-focused | After 50% of new-word steps |
| Review lessons | After difficult/long words only |

### Migration Script
```bash
# Add syllable-spelling to a lesson
node scripts/add-syllable-spelling.js --lesson=A1-M01-L03
```

---

## Migration Task 2: Vocabulary Grammar Metadata

### What to Add
Every vocabulary word needs a `grammar` field:

**For Nouns:**
```json
{
  "de": "der Apfel",
  "fa": "سیب",
  "grammar": {
    "pos": "noun",
    "noun": {
      "artikel": "m",
      "plural": "Äpfel"
    }
  }
}
```

**For Verbs:**
```json
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
        "er_sie_es": "kommt",
        "wir": "kommen",
        "ihr": "kommt",
        "sie_Sie": "kommen"
      }
    }
  }
}
```

**For Phrases/Other:**
```json
{
  "de": "Guten Morgen",
  "fa": "صبح بخیر",
  "grammar": {
    "pos": "phrase"
  }
}
```

### Article Values
| Value | Gender | Example |
|-------|--------|---------|
| `"m"` | Masculine (der) | der Mann, der Apfel |
| `"f"` | Feminine (die) | die Frau, die Katze |
| `"n"` | Neuter (das) | das Kind, das Haus |

---

## Migration Task 3: Grammar Popup Steps

### When to Add
- Before exercises that test a new grammar concept
- Only for lessons L07+ (see grammar progression)

### Template
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

### Grammar Concepts Reference
| Concept | For Lessons | Persian Title |
|---------|-------------|---------------|
| `du-vs-sie` | L07-L10 | تو و شما |
| `v2-word-order` | L07+ | ترتیب کلمات |
| `verb-conjugation` | L11+ | صرف فعل |
| `article-gender` | L19+ | جنسیت اسم |
| `accusative-case` | L26+ | حالت مفعولی |
| `dative-case` | L41+ | حالت مفعول‌به |

---

## Migration Task 4: Feedback Tips on Exercises

### What to Add
Every exercise step (`multiple-choice`, `fill-in-blank`, `word-order`, etc.) should have:

```json
{
  "type": "multiple-choice",
  "id": "s5",
  "question": { "de": "...", "fa": "..." },
  "options": [...],
  "correctIndex": 0,
  "feedbackTip": {
    "onCorrect": "آفرین! فعل را درست صرف کردید.",
    "onWrong": "دقت کنید: فعل «sein» صرف نامنظم دارد.",
    "errorCategory": "wrong-conjugation",
    "highlights": ["sein"]
  }
}
```

### Error Categories
| Category | Persian Label | Use When |
|----------|---------------|----------|
| `wrong-article` | حرف تعریف اشتباه | der/die/das confusion |
| `wrong-conjugation` | صرف فعل اشتباه | Verb form error |
| `wrong-case` | حالت دستوری اشتباه | Akkusativ/Dativ confusion |
| `word-order` | ترتیب کلمات اشتباه | V2 position error |
| `spelling` | املای اشتباه | Spelling mistake |
| `vocabulary` | واژه اشتباه | Wrong word choice |
| `comprehension` | درک مطلب | Didn't understand question |

---

## Migration Task 5: Dialog Questions

### What to Add
Every `dialog` step should have 1-3 comprehension questions:

```json
{
  "type": "dialog",
  "id": "s12",
  "lines": [...],
  "questionMode": "post-dialog",
  "questions": [
    {
      "question": "اسم مرد چیست؟",
      "options": ["آنا", "تام", "ماریا"],
      "correctIndex": 1,
      "explanation": "تام گفت: «Ich heiße Tom.»",
      "relatedLineIndex": 1
    }
  ]
}
```

### Question Modes
| Mode | When to Use |
|------|-------------|
| `post-dialog` | Questions after full dialog (default) |
| `mid-dialog` | Pause after specific lines for questions |
| `both` | Both mid and post questions |

### Question Types
1. **Speaker identification**: "چه کسی این را گفت؟"
2. **Content recall**: "تام چه گفت؟"
3. **Vocabulary check**: "معنی «Hallo» چیست؟"
4. **Inference**: "آنا از کجا می‌آید؟"

---

## Migration Task 6: Dictation Steps

### When to Add
Add 1-2 dictation steps per lesson, using vocabulary from that lesson.

### Template
```json
{
  "type": "dictation",
  "id": "dictation-1",
  "targetText": "Guten Morgen",
  "translation": "صبح بخیر",
  "difficulty": "A1"
}
```

### Difficulty Settings
| Level | Max Repeats | Show Translation | Show First Letter |
|-------|-------------|------------------|-------------------|
| `A1` | Unlimited | Yes | Yes |
| `A2` | 5 | Yes | No |
| `B1` | 3 | No | No |
| `B2` | 1 | No | No |

---

## Migration Task 7: Story Enhancements (Optional)

### Add Scene Context to Dialogs
```json
{
  "type": "dialog",
  "id": "s10",
  "scene": {
    "location": "café",
    "description": {
      "de": "In einem kleinen Café in Berlin",
      "fa": "در یک کافه کوچک در برلین"
    }
  },
  "lines": [...]
}
```

### Add Narratives Between Lines
```json
{
  "type": "dialog",
  "id": "s10",
  "lines": [...],
  "narratives": [
    {
      "position": 0,
      "text": {
        "de": "Eli kommt ins Café.",
        "fa": "الی وارد کافه می‌شود."
      }
    }
  ]
}
```

### Add Character Moods
```json
{
  "speaker": "Tom",
  "text": { "de": "Oh nein!", "fa": "اوه نه!" },
  "mood": "surprised"
}
```

Available moods: `neutral`, `happy`, `sad`, `angry`, `surprised`, `confused`, `excited`

---

## Migration Checklist

### Per Lesson
- [ ] **SYLLABLE-SPELLING for ALL new vocabulary words**
- [ ] All vocabulary has `grammar` field with `pos`
- [ ] Nouns have `artikel` (m/f/n)
- [ ] Common verbs have `praesens` conjugation
- [ ] Grammar popup added before new concepts (L07+)
- [ ] All exercises have `feedbackTip` with `errorCategory`
- [ ] All dialogs have 1-3 `questions`
- [ ] 1-2 dictation steps added
- [ ] (Optional) Scene/narrative enhancements

### Validation
```bash
# Validate the lesson
node scripts/validate-lesson.js content/de-fa/A1/module-XX/A1-MXX-LYY.json

# Check TypeScript types
pnpm run typecheck
```

---

## Quick Migration Script

For batch updates, use the migration scripts:

```bash
# 1. FIRST: Add syllable-spelling for ALL vocabulary (REQUIRED)
node scripts/add-syllable-spelling.js --lesson=A1-M01-L03

# 2. Add grammar metadata to vocabulary
node scripts/migrate-vocab-grammar.js --lesson=A1-M01-L03

# 3. Inject grammar popup steps
node scripts/inject-grammar-tips.js --lesson=A1-M01-L03

# 4. Add dialog questions
node scripts/inject-dialog-questions.js --lesson=A1-M01-L03

# 5. Add dictation steps
node scripts/inject-dictation-steps.js --lesson=A1-M01-L03
```

---

## Example: Complete Migration

**Before (minimal lesson):**
```json
{
  "vocabulary": [
    { "de": "der Mann", "fa": "مرد" }
  ],
  "steps": [
    {
      "type": "multiple-choice",
      "question": { "de": "Was bedeutet 'der Mann'?", "fa": "معنی 'der Mann' چیست؟" },
      "options": ["زن", "مرد", "بچه"],
      "correctIndex": 1
    }
  ]
}
```

**After (migrated):**
```json
{
  "vocabulary": [
    {
      "de": "der Mann",
      "fa": "مرد",
      "grammar": {
        "pos": "noun",
        "noun": { "artikel": "m", "plural": "Männer" }
      }
    }
  ],
  "steps": [
    {
      "type": "new-word",
      "id": "s1",
      "word": { "de": "der Mann", "fa": "مرد" },
      "header": "یاد بگیر!"
    },
    {
      "type": "syllable-spelling",
      "id": "syllable-1",
      "word": { "de": "der Mann", "fa": "مرد" },
      "syllables": ["der", "Mann"],
      "hint": "۲ بخش - حرف تعریف + اسم"
    },
    {
      "type": "grammar-popup",
      "id": "grammar-1",
      "title": "نکته!",
      "explanation": "در آلمانی هر اسم یک جنسیت دارد: مذکر (der)، مونث (die)، خنثی (das)",
      "examples": [
        { "de": "der Mann", "fa": "مرد (مذکر)", "highlights": ["der"] }
      ]
    },
    {
      "type": "multiple-choice",
      "id": "s2",
      "question": { "de": "Was bedeutet 'der Mann'?", "fa": "معنی 'der Mann' چیست؟" },
      "options": ["زن", "مرد", "بچه"],
      "correctIndex": 1,
      "feedbackTip": {
        "onCorrect": "آفرین! «der Mann» یعنی مرد.",
        "onWrong": "دقت کنید: «Mann» با حرف تعریف «der» همراه است و مذکر است.",
        "errorCategory": "vocabulary"
      }
    },
    {
      "type": "dictation",
      "id": "dictation-1",
      "targetText": "der Mann",
      "translation": "مرد",
      "difficulty": "A1"
    }
  ]
}
```
