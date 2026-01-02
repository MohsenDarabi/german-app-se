# Content Fusion Agent

> **Purpose:** Merge Babbel + Busuu content into unified German-Persian lessons with games.

---

## Input Sources

### 1. Babbel Lesson JSON
Location: `scripts/babbel-extractor/output/{Level}/unit-{NN}/lesson-{NN}.json`

**Screen types:**
- `vocab-intro` → `new-word`
- `vocab-card` → `new-word` or `grammar-tip`
- `mcq-translation` → `multiple-choice`
- `matching` → `matching`
- `sentence-order` → `word-order`
- `spelling` → `spelling`
- `dialogue` → `dialog`
- `formality-choice` → `formality-choice`

### 2. Busuu Lesson JSON
Location: `scripts/screen-flow-mapper/output/{Level}/chapter-{NN}-{title}/{NN}-{title}.json`

**Screen types:**
- `flashcard` → `new-word`
- `fillgap` → `fill-in-blank`
- `phrase-builder` → `word-order`
- `mcq` → `multiple-choice`
- `true-false` → `true-false`
- `matchup` → `matching`
- `spelling` → `spelling`
- `typing` → `translation`
- `tip` / `feedback` → `grammar-tip` (extract tips)
- `comprehension` → `comprehension`

---

## Output Format

```json
{
  "id": "A1-M01-L01",
  "title": {
    "de": "Hallo und Tschüss",
    "fa": "سلام و خداحافظی"
  },
  "level": "A1",
  "module": 1,
  "lessonNumber": 1,
  "estimatedMinutes": 15,
  "steps": [
    // See step types below
  ]
}
```

---

## Step Type Templates

### new-word
```json
{
  "type": "new-word",
  "id": "s1",
  "word": {
    "de": "Hallo",
    "fa": "سلام"
  },
  "phonetic": "ha-LO",
  "wordType": "interjection",
  "example": {
    "text": {
      "de": "Hallo! Wie geht's?",
      "fa": "سلام! حالت چطوره؟"
    }
  },
  "note": {
    "fa": "احوالپرسی غیررسمی - در هر موقعیتی قابل استفاده است."
  }
}
```

### grammar-tip
```json
{
  "type": "grammar-tip",
  "id": "s5",
  "title": "ضمایر شخصی",
  "content": "در آلمانی سه ضمیر اول شخص داریم:\n\n- **ich** = من\n- **du** = تو (غیررسمی)\n- **Sie** = شما (رسمی)\n\n⚠️ توجه: Sie همیشه با حرف بزرگ نوشته می‌شود.",
  "examples": [
    { "de": "Ich bin Anna.", "fa": "من آنا هستم." },
    { "de": "Wie heißt du?", "fa": "اسم تو چیه؟" }
  ]
}
```

### multiple-choice
```json
{
  "type": "multiple-choice",
  "id": "s8",
  "question": "چگونه به آلمانی می‌گویید 'سلام'؟",
  "options": ["Tschüss", "Danke", "Hallo", "Bitte"],
  "correctAnswerIndex": 2,
  "feedback": {
    "explanation": "Hallo یعنی سلام - رایج‌ترین احوالپرسی در آلمان."
  }
}
```

**CRITICAL RULES for multiple-choice:**
- `correctAnswerIndex` must be RANDOMIZED (not always 0)
- Distribute correct answers across 0, 1, 2, 3 in a lesson
- NO duplicate options

### fill-in-blank
```json
{
  "type": "fill-in-blank",
  "id": "s10",
  "instruction": "جمله را کامل کنید",
  "sentence": "Ich {0} Anna.",
  "options": ["bist", "bin", "sind", "ist"],
  "correctAnswers": [1],
  "feedback": {
    "explanation": "با ich از bin استفاده می‌کنیم: Ich bin Anna."
  }
}
```

**CRITICAL RULES for fill-in-blank:**
- `correctAnswers` indices must vary (not always 0)
- Do NOT mix verb conjugations from different verb families
- Example BAD: options mixing "bin" (sein) and "heißt" (heißen)
- Example GOOD: all options from same verb (bin, bist, ist, sind)

### word-order
```json
{
  "type": "word-order",
  "id": "s12",
  "instruction": "کلمات را مرتب کنید",
  "words": ["Anna", "bin", "Ich"],
  "correctOrder": [2, 1, 0],
  "correctSentence": {
    "de": "Ich bin Anna",
    "fa": "من آنا هستم"
  }
}
```

**CRITICAL:** words array must be SCRAMBLED, not in correct order.

### matching
```json
{
  "type": "matching",
  "id": "s14",
  "instruction": "جفت‌های درست را پیدا کنید",
  "items": [
    { "id": "i1", "text": "Hallo" },
    { "id": "i2", "text": "Tschüss" },
    { "id": "i3", "text": "Danke" }
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

### dialog
```json
{
  "type": "dialog",
  "id": "s16",
  "title": "در کافه",
  "lines": [
    { "speaker": "Anna", "text": { "de": "Hallo!", "fa": "سلام!" } },
    { "speaker": "Max", "text": { "de": "Hi! Ich bin Max.", "fa": "سلام! من مکس هستم." } }
  ],
  "feedback": {
    "explanation": "در این مکالمه دو دوست با هم آشنا می‌شوند."
  }
}
```

### true-false
```json
{
  "type": "true-false",
  "id": "s18",
  "instruction": "درست یا غلط؟",
  "statement": "\"Sie\" همیشه با حرف بزرگ نوشته می‌شود.",
  "correctAnswer": true,
  "feedback": {
    "explanation": "بله! Sie به معنای شما (رسمی) همیشه با S بزرگ نوشته می‌شود."
  }
}
```

### translation
```json
{
  "type": "translation",
  "id": "s20",
  "sourceText": "من آنا هستم.",
  "sentenceTemplate": "{0} {1} {2}.",
  "options": ["bin", "Ich", "Anna", "du"],
  "correctAnswers": [1, 0, 2],
  "correctTranslation": {
    "de": "Ich bin Anna.",
    "fa": "من آنا هستم."
  }
}
```

### spelling
```json
{
  "type": "spelling",
  "id": "s22",
  "word": "Tschüss",
  "translation": "خداحافظ",
  "hint": "CHOOS",
  "instruction": "این کلمه را هجی کنید"
}
```

### comprehension
```json
{
  "type": "comprehension",
  "id": "s24",
  "title": "درک مطلب",
  "passage": {
    "de": "Anna kommt aus Berlin. Sie ist Studentin. Sie lernt Englisch.",
    "fa": "آنا اهل برلین است. او دانشجوست. او انگلیسی یاد می‌گیرد."
  },
  "questions": [
    {
      "question": "آنا اهل کجاست؟",
      "options": ["مونیخ", "برلین", "هامبورگ"],
      "correctIndex": 1
    }
  ]
}
```

---

## Game Step Templates (Insert every 5-7 steps)

### rapid-fire (After vocab introduction)
```json
{
  "type": "rapid-fire",
  "id": "g1",
  "title": "آزمون سریع",
  "instruction": "به سرعت پاسخ دهید!",
  "timePerQuestion": 5,
  "questions": [
    { "left": "Hallo", "right": "سلام", "correctSide": "right" },
    { "left": "خداحافظ", "right": "Tschüss", "correctSide": "left" }
  ]
}
```

**RULE:** Balance correctSide ~50% left, ~50% right.

### memory-match (After matching exercises)
```json
{
  "type": "memory-match",
  "id": "g2",
  "title": "بازی حافظه",
  "pairs": [
    { "de": "Hallo", "fa": "سلام" },
    { "de": "Tschüss", "fa": "خداحافظ" },
    { "de": "Danke", "fa": "ممنون" }
  ],
  "timeLimit": 60
}
```

### word-hunt (Before completion)
```json
{
  "type": "word-hunt",
  "id": "g3",
  "title": "شکار کلمات",
  "instruction": "همه کلمات آلمانی این درس را پیدا کنید",
  "targetWords": ["Hallo", "Tschüss", "Danke", "Bitte"],
  "gridSize": { "rows": 8, "cols": 8 },
  "timeLimit": 90
}
```

### vocab-check (Self-assessment)
```json
{
  "type": "vocab-check",
  "id": "g4",
  "title": "خودارزیابی",
  "instruction": "این کلمات را چقدر یاد گرفتید؟",
  "words": [
    { "de": "Hallo", "fa": "سلام" },
    { "de": "Tschüss", "fa": "خداحافظ" }
  ]
}
```

### speed-challenge (End of module)
```json
{
  "type": "speed-challenge",
  "id": "g5",
  "title": "چالش سرعت",
  "timeLimit": 60,
  "questions": [
    { "question": "Hallo", "options": ["سلام", "خداحافظ"], "correctAnswerIndex": 0 }
  ]
}
```

---

## Lesson Flow Pattern

```
1. [new-word] × 3-5
2. [grammar-tip] (if needed)
3. [multiple-choice] or [fill-in-blank]
4. [GAME: rapid-fire] ← After 5 steps
5. [word-order] or [matching]
6. [dialog] (if available)
7. [true-false] or [translation]
8. [GAME: memory-match] ← After 7 steps
9. More exercises...
10. [GAME: word-hunt] ← Before completion
11. [completion]
```

---

## Persian Translation Guidelines

1. **Natural Persian**: Use spoken Persian, not literary
2. **Cultural Notes**: Add Persian-specific explanations
   - German has grammatical gender (Persian doesn't)
   - German word order differs (V2 rule)
   - Sie/du formality ≈ شما/تو but culturally different

3. **Grammar Tips for Persians**:
   - Explain article system (der/die/das)
   - Explain case system (Nominativ, Akkusativ)
   - Compare verb conjugation patterns

---

## Validation Checklist

Before outputting lesson:
- [ ] All German text has Persian translation
- [ ] correctAnswerIndex varied (not all 0)
- [ ] word-order words are scrambled
- [ ] No duplicate options in exercises
- [ ] Games inserted every 5-7 steps
- [ ] Ends with completion step
- [ ] No mixed verb conjugations in fill-in-blank

---

## Example Prompt Usage

```
Create lesson A1-M01-L01 "Hallo und Tschüss" by merging:

Babbel: scripts/babbel-extractor/output/A11/unit-01/lesson-01.json
Busuu: scripts/screen-flow-mapper/output/A1/chapter-01-introductions/01-hallo.json

Target vocabulary:
- Hallo (hello)
- Hi (hi)
- Tschüss (bye)
- Danke (thanks)
- Bitte (please)

Include:
- Persian translations for all content
- Grammar tip about informal greetings
- rapid-fire game after vocab
- memory-match game after matching exercise
- word-hunt before completion
```
