# Content Migration Workflow (Self-Contained)

> **Complete guide for AI agents to update existing lessons with new features**
>
> This file contains EVERYTHING needed - no other files required.

---

## Project Context

**German Learning PWA for Persian Speakers**
- Framework: SvelteKit + TypeScript
- Content: JSON lessons following CEFR (A1-B2)
- Audio: Google Cloud TTS
- Target: Persian speakers learning German

### File Locations

| Type | Path |
|------|------|
| Lessons | `content/de-fa/{Level}/module-{NN}/{LessonID}.json` |
| Audio | `apps/web/static/audio/{LessonID}/` |
| Scripts | `scripts/` |

### Lesson ID Format
`{Level}-M{Module}-L{Lesson}` → Example: `A1-M01-L03`

---

## Characters (USE THESE ONLY)

| Character | Role | Age | Personality |
|-----------|------|-----|-------------|
| **Eli** | Primary | 43, female | German teacher, calm, supportive |
| **Tom** | Primary | 35-37, male | Language instructor, reliable guide |
| **Lisa** | Secondary | 18-20, female | Young companion, playful |
| **Alex** | Secondary | 21-22, male | German student, adaptable |

**Service roles** (no names, use titles): Kellner, Verkäufer, Arzt, etc.

---

## Grammar Progression (CRITICAL - Follow Strictly!)

| Lesson Range | Allowed Grammar Features | NOT Allowed Yet |
|--------------|-------------------------|-----------------|
| **L01-L06** | Vocabulary ONLY | Any grammar tips |
| **L07-L10** | du/Sie, basic word order | Conjugation details |
| **L11-L18** | Verb conjugation, negation | Articles, cases |
| **L19-L25** | Articles (der/die/das), plurals | Accusative case |
| **L26-L32** | Accusative case | Dative case, W-Fragen |
| **L33-L40** | **W-Fragen** (Was, Wo, Wer, Wie) | Dative case |
| **L41-L48** | Dative case, separable verbs | Past tense |
| **L49-L56** | Modal verbs, Perfekt | Complex grammar |
| **L57-L60** | All A1 grammar | B1 grammar |

---

## Migration Tasks Overview

| # | Task | Priority | Applies To |
|---|------|----------|------------|
| 1 | Syllable-Spelling | **REQUIRED** | ALL lessons with new-word steps |
| 2 | Vocabulary Grammar Metadata | **REQUIRED** | ALL lessons |
| 3 | Grammar Popup Steps | Required | L07+ only |
| 4 | Feedback Tips on Exercises | **REQUIRED** | ALL exercises |
| 5 | Dialog Questions | **REQUIRED** | ALL dialogs |
| 6 | Dictation Steps | Required | ALL lessons |
| 7 | Story Enhancements | Optional | Dialogs |

---

## Task 1: Syllable-Spelling Steps (REQUIRED FOR ALL VOCABULARY)

### Why This Matters (Pedagogy)
Based on **Miller's Chunking Theory**:
- Breaking words into syllables reduces cognitive load
- Learners process 3-4 chunks more easily than 7+ letters
- Scaffolded progression builds confidence before full spelling
- Critical for German compound words (Entschuldigung, Wiedersehen)

### Rule: EVERY new-word step MUST be followed by syllable-spelling

**⚠️ DISTRACTORS ARE REQUIRED for all syllable-spelling exercises!**

```
new-word (introduce "Guten Morgen")
    ↓
syllable-spelling (practice "Gu-ten Mor-gen" with distractors)
    ↓
[optional: spelling step for full word]
    ↓
exercise (test the word)
```

### Handling Short vs Long Words

| Word Type | Syllables Array | Distractors | Example |
|-----------|----------------|-------------|---------|
| Multi-syllable | Split by syllables | Similar syllables | `"Hallo"` → `["Hal", "lo"]` + `["Hel", "la", "le"]` |
| Monosyllabic | Split by letter groups | Confusing letters | `"nein"` → `["n", "ei", "n"]` + `["ie", "a", "e"]` |

### German Spelling Confusions (Use as Distractors)

| Sound | Correct | Distractor | Teaching Point |
|-------|---------|------------|----------------|
| "eye" sound | ei | ie | "ei" = آی, "ie" = ای |
| "oy" sound | eu/äu | au/oi | "eu" = اوی |
| Umlaut ü | ü | u, ue | Different from "u" |
| Umlaut ö | ö | o, oe | Different from "o" |
| German W | w | v | "w" = و (not English w) |
| German J | j | y | "j" = ی (like English y) |
| sch sound | sch | sh, ch | German "sch" = ش |

### Schema

```json
{
  "type": "syllable-spelling",
  "id": "syllable-{N}",
  "word": "German word/phrase",
  "translation": "Persian translation",
  "syllables": ["Syl", "la", "bles"],
  "distractors": ["Sal", "le", "blos"],  // REQUIRED!
  "hint": "۳ بخش - brief Persian description"
}
```

**Examples:**

```json
// Multi-syllable word
{
  "type": "syllable-spelling",
  "id": "syllable-1",
  "word": "Hallo",
  "translation": "سلام",
  "syllables": ["Hal", "lo"],
  "distractors": ["Hel", "Hol", "la", "le"],
  "hint": "۲ بخش"
}

// Short word (letter-based)
{
  "type": "syllable-spelling",
  "id": "syllable-2",
  "word": "nein",
  "translation": "نه",
  "syllables": ["n", "ei", "n"],
  "distractors": ["ie", "a", "e"],
  "hint": "۳ حرف - ei صدای آی"
}
```

### Syllable Breaking Rules for German

| Pattern | Rule | Example | Syllables |
|---------|------|---------|-----------|
| Simple 2-syllable | Split at consonant | Hallo | `["Hal", "lo"]` |
| Compound words | Split each word | Guten Morgen | `["Gu", "ten", "Mor", "gen"]` |
| Prefix words | Separate prefix | Entschuldigung | `["Ent", "schul", "di", "gung"]` |
| -ung ending | Keep -ung together | Wohnung | `["Woh", "nung"]` |
| -tion ending | ti-on split | Information | `["In", "for", "ma", "ti", "on"]` |
| -chen ending | Keep -chen | Mädchen | `["Mäd", "chen"]` |
| Double consonants | Split between | Kaffee | `["Kaf", "fee"]` |
| sch/ch clusters | Keep together | Deutschland | `["Deutsch", "land"]` |

### Complete A1 Syllable Reference

| Word | Syllables | Hint |
|------|-----------|------|
| Hallo | `["Hal", "lo"]` | ۲ بخش - سلام |
| Danke | `["Dan", "ke"]` | ۲ بخش - ممنون |
| Bitte | `["Bit", "te"]` | ۲ بخش - لطفاً |
| Ja | `["Ja"]` | ۱ بخش - بله |
| Nein | `["Nein"]` | ۱ بخش - نه |
| Guten Morgen | `["Gu", "ten", "Mor", "gen"]` | ۴ بخش - صبح بخیر |
| Guten Tag | `["Gu", "ten", "Tag"]` | ۳ بخش - روز بخیر |
| Guten Abend | `["Gu", "ten", "A", "bend"]` | ۴ بخش - عصر بخیر |
| Gute Nacht | `["Gu", "te", "Nacht"]` | ۳ بخش - شب بخیر |
| Auf Wiedersehen | `["Auf", "Wie", "der", "se", "hen"]` | ۵ بخش - خداحافظ |
| Tschüss | `["Tschüss"]` | ۱ بخش - خداحافظ |
| Entschuldigung | `["Ent", "schul", "di", "gung"]` | ۴ بخش - ببخشید |
| Wie geht's | `["Wie", "geht's"]` | ۲ بخش - چطوری |
| Wie geht es Ihnen | `["Wie", "geht", "es", "Ih", "nen"]` | ۵ بخش - حالتان چطور است |
| Deutschland | `["Deutsch", "land"]` | ۲ بخش - آلمان |
| Frühstück | `["Früh", "stück"]` | ۲ بخش - صبحانه |
| Mittagessen | `["Mit", "tag", "es", "sen"]` | ۴ بخش - ناهار |
| Abendessen | `["A", "bend", "es", "sen"]` | ۴ بخش - شام |
| Kaffee | `["Kaf", "fee"]` | ۲ بخش - قهوه |
| Wasser | `["Was", "ser"]` | ۲ بخش - آب |
| Ich heiße | `["Ich", "hei", "ße"]` | ۳ بخش - اسم من است |
| Ich komme aus | `["Ich", "kom", "me", "aus"]` | ۴ بخش - من اهل ... هستم |
| Freut mich | `["Freut", "mich"]` | ۲ بخش - خوشوقتم |
| der Mann | `["der", "Mann"]` | ۲ بخش - مرد |
| die Frau | `["die", "Frau"]` | ۲ بخش - زن |
| das Kind | `["das", "Kind"]` | ۲ بخش - بچه |

### Hint Format
Format: `{Persian number} بخش - {brief meaning}`
- ۱ بخش = 1 syllable
- ۲ بخش = 2 syllables
- ۳ بخش = 3 syllables
- etc.

---

## Task 2: Vocabulary Grammar Metadata (REQUIRED)

### Every vocabulary item MUST have a `grammar` field

### Part of Speech Values

| POS | Value | Use For |
|-----|-------|---------|
| Noun | `"noun"` | der/die/das words |
| Verb | `"verb"` | Action words |
| Adjective | `"adjective"` | Descriptive words |
| Adverb | `"adverb"` | Manner words |
| Preposition | `"preposition"` | Location/direction words |
| Pronoun | `"pronoun"` | ich, du, er, etc. |
| Conjunction | `"conjunction"` | und, aber, oder |
| Interjection | `"interjection"` | Ach!, Oh! |
| Phrase | `"phrase"` | Multi-word expressions |
| Particle | `"particle"` | Modal particles: doch, mal, ja, auch, eben |

### Noun Schema (REQUIRED for all nouns)

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

**Article Values:**
| Value | Gender | Article | Color Code |
|-------|--------|---------|------------|
| `"m"` | Masculine | der | Blue |
| `"f"` | Feminine | die | Pink/Red |
| `"n"` | Neuter | das | Green |

### Verb Schema

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

### Common A1 Verb Conjugations

| Verb | ich | du | er/sie/es | wir | ihr | sie/Sie |
|------|-----|-----|-----------|-----|-----|---------|
| sein | bin | bist | ist | sind | seid | sind |
| haben | habe | hast | hat | haben | habt | haben |
| kommen | komme | kommst | kommt | kommen | kommt | kommen |
| heißen | heiße | heißt | heißt | heißen | heißt | heißen |
| wohnen | wohne | wohnst | wohnt | wohnen | wohnt | wohnen |
| sprechen | spreche | sprichst | spricht | sprechen | sprecht | sprechen |
| arbeiten | arbeite | arbeitest | arbeitet | arbeiten | arbeitet | arbeiten |
| lernen | lerne | lernst | lernt | lernen | lernt | lernen |
| gehen | gehe | gehst | geht | gehen | geht | gehen |
| machen | mache | machst | macht | machen | macht | machen |

### Phrase Schema

```json
{
  "de": "Guten Morgen",
  "fa": "صبح بخیر",
  "grammar": {
    "pos": "phrase"
  }
}
```

### Adjective Schema

```json
{
  "de": "gut",
  "fa": "خوب",
  "grammar": {
    "pos": "adjective"
  }
}
```

---

## Task 3: Grammar Popup Steps (L07+ ONLY)

### When to Add
- **ONLY for lessons L07 and above**
- Place BEFORE exercises that test the grammar concept
- 1-2 grammar popups per lesson maximum

### Schema

```json
{
  "type": "grammar-popup",
  "id": "grammar-{N}",
  "title": "نکته!",
  "explanation": "Persian explanation of the grammar rule",
  "highlights": ["key", "terms", "to highlight"],
  "examples": [
    {
      "de": "German example sentence",
      "fa": "Persian translation",
      "highlights": ["word", "to", "highlight"]
    }
  ],
  "grammarConcept": "concept-id"
}
```

### Grammar Concepts by Lesson Range

| Concept ID | Lessons | Persian Title | Explanation Template |
|------------|---------|---------------|---------------------|
| `du-vs-sie` | L07-L10 | تو و شما | در آلمانی «du» برای دوستان و «Sie» برای افراد رسمی استفاده می‌شود. |
| `v2-word-order` | L07+ | ترتیب کلمات | در آلمانی فعل همیشه در جایگاه دوم است. |
| `verb-conjugation` | L11+ | صرف فعل | فعل‌های آلمانی بر اساس فاعل صرف می‌شوند. |
| `sein-conjugation` | L11+ | صرف فعل sein | فعل «sein» (بودن) نامنظم است. |
| `haben-conjugation` | L13+ | صرف فعل haben | فعل «haben» (داشتن) نامنظم است. |
| `negation-nicht` | L17+ | منفی‌سازی با nicht | برای منفی کردن از «nicht» استفاده می‌کنیم. |
| `negation-kein` | L18+ | منفی‌سازی با kein | برای منفی کردن اسم‌ها از «kein» استفاده می‌کنیم. |
| `article-gender` | L19+ | جنسیت اسم | هر اسم آلمانی یک جنسیت دارد: مذکر (der)، مونث (die)، خنثی (das). |
| `definite-articles` | L19+ | حروف تعریف معرفه | der/die/das مثل «the» در انگلیسی است. |
| `indefinite-articles` | L21+ | حروف تعریف نکره | ein/eine مثل «a/an» در انگلیسی است. |
| `possessive-pronouns` | L23+ | ضمایر ملکی | mein/dein/sein/ihr برای مالکیت استفاده می‌شوند. |
| `accusative-case` | L26+ | حالت مفعولی | در حالت مفعولی فقط der به den تغییر می‌کند. |
| `w-questions` | L33+ | سوالات با W | Was (چه)، Wo (کجا)، Wer (چه کسی)، Wie (چطور) |
| `dative-case` | L41+ | حالت مفعول‌به | در حالت مفعول‌به: der→dem، die→der، das→dem |

### Example Grammar Popups

**du vs Sie (L07-L10):**
```json
{
  "type": "grammar-popup",
  "id": "grammar-1",
  "title": "نکته!",
  "explanation": "در آلمانی دو نوع «شما» داریم:\n\n**du** = تو (برای دوستان، خانواده، بچه‌ها)\n**Sie** = شما (برای غریبه‌ها، محیط کار، افراد مسن‌تر)\n\n⚠️ در آلمان Sie بیشتر از فارسی استفاده می‌شود!",
  "highlights": ["du", "Sie"],
  "examples": [
    { "de": "Wie heißt du?", "fa": "اسمت چیه؟ (غیررسمی)", "highlights": ["du"] },
    { "de": "Wie heißen Sie?", "fa": "اسم شما چیست؟ (رسمی)", "highlights": ["Sie"] }
  ],
  "grammarConcept": "du-vs-sie"
}
```

**V2 Word Order (L07+):**
```json
{
  "type": "grammar-popup",
  "id": "grammar-2",
  "title": "نکته!",
  "explanation": "در آلمانی فعل همیشه در **جایگاه دوم** است.\n\nفرق با فارسی: در فارسی فعل آخر جمله است، اما در آلمانی دوم!",
  "highlights": ["جایگاه دوم", "فعل"],
  "examples": [
    { "de": "Ich heiße Tom.", "fa": "اسم من تام است.", "highlights": ["heiße"] },
    { "de": "Er kommt aus Berlin.", "fa": "او اهل برلین است.", "highlights": ["kommt"] }
  ],
  "grammarConcept": "v2-word-order"
}
```

**Article Gender (L19+):**
```json
{
  "type": "grammar-popup",
  "id": "grammar-3",
  "title": "نکته!",
  "explanation": "هر اسم آلمانی یک **جنسیت** دارد:\n\n🔵 **der** = مذکر (masculine)\n🔴 **die** = مونث (feminine)\n🟢 **das** = خنثی (neuter)\n\n⚠️ جنسیت را باید با اسم حفظ کنید!",
  "highlights": ["der", "die", "das"],
  "examples": [
    { "de": "der Mann", "fa": "مرد (مذکر)", "highlights": ["der"] },
    { "de": "die Frau", "fa": "زن (مونث)", "highlights": ["die"] },
    { "de": "das Kind", "fa": "بچه (خنثی)", "highlights": ["das"] }
  ],
  "grammarConcept": "article-gender"
}
```

---

## Task 4: Feedback Tips on Exercises (REQUIRED)

### Every exercise step MUST have feedbackTip

### Supported Exercise Types
- `multiple-choice`
- `fill-in-blank`
- `word-order`
- `true-false`
- `translation`
- `spelling`
- `matchup`

### FeedbackTip Schema

```json
{
  "feedbackTip": {
    "onCorrect": "آفرین! توضیح کوتاه چرا درست است.",
    "onWrong": "دقت کنید: توضیح چرا اشتباه است و قانون صحیح.",
    "errorCategory": "error-category-id",
    "highlights": ["کلمات", "کلیدی"]
  }
}
```

### Error Categories (Complete List)

| Category | Persian Label | When to Use | Example |
|----------|---------------|-------------|---------|
| `wrong-article` | حرف تعریف اشتباه | der/die/das confusion | Used "der Frau" instead of "die Frau" |
| `wrong-conjugation` | صرف فعل اشتباه | Verb form error | Used "ich komme" for "du" |
| `wrong-case` | حالت دستوری اشتباه | Accusative/Dative error | Used "der" instead of "den" |
| `word-order` | ترتیب کلمات اشتباه | V2 position error | Put verb at end |
| `spelling` | املای اشتباه | Spelling mistake | "Halo" instead of "Hallo" |
| `vocabulary` | واژه اشتباه | Wrong word choice | Confused "Mann" with "Frau" |
| `comprehension` | درک مطلب | Didn't understand question | - |
| `plural-form` | جمع/مفرد اشتباه | Plural error | "Mann" instead of "Männer" |
| `negation` | منفی‌سازی اشتباه | nicht/kein error | Wrong negation word |
| `gender-agreement` | تطابق جنسیت اشتباه | Adjective gender | "ein große Mann" |

### Example: Multiple Choice with FeedbackTip

```json
{
  "type": "multiple-choice",
  "id": "s5",
  "question": { "de": "Was bedeutet 'der Mann'?", "fa": "معنی 'der Mann' چیست؟" },
  "options": ["زن", "مرد", "بچه"],
  "correctIndex": 1,
  "feedbackTip": {
    "onCorrect": "آفرین! «der Mann» یعنی مرد. توجه کنید که «der» نشان‌دهنده جنس مذکر است.",
    "onWrong": "دقت کنید: «Mann» یعنی مرد (نه زن). «Frau» یعنی زن.",
    "errorCategory": "vocabulary",
    "highlights": ["der Mann", "مرد"]
  }
}
```

### Example: Fill-in-Blank with FeedbackTip

```json
{
  "type": "fill-in-blank",
  "id": "s8",
  "sentence": { "de": "Ich ___ aus Berlin.", "fa": "من اهل برلین ___." },
  "blank": { "answer": "komme", "position": 1 },
  "feedbackTip": {
    "onCorrect": "آفرین! با «ich» فعل به «-e» ختم می‌شود: ich komme.",
    "onWrong": "دقت کنید: با «ich» فعل باید «komme» باشد، نه «kommst» یا «kommt».",
    "errorCategory": "wrong-conjugation",
    "highlights": ["ich", "komme"]
  }
}
```

### Example: Word-Order with FeedbackTip

```json
{
  "type": "word-order",
  "id": "s10",
  "words": ["Ich", "aus", "Berlin", "komme"],
  "correctOrder": [0, 3, 1, 2],
  "translation": { "fa": "من اهل برلین هستم." },
  "feedbackTip": {
    "onCorrect": "آفرین! فعل «komme» در جایگاه دوم قرار گرفت.",
    "onWrong": "دقت کنید: در آلمانی فعل همیشه در جایگاه **دوم** است. ترتیب صحیح: Ich komme aus Berlin.",
    "errorCategory": "word-order",
    "highlights": ["komme", "جایگاه دوم"]
  }
}
```

### Example: True-False with FeedbackTip

```json
{
  "type": "true-false",
  "id": "s12",
  "statement": { "de": "«Frau» bedeutet Mann.", "fa": "«Frau» یعنی مرد." },
  "isTrue": false,
  "feedbackTip": {
    "onCorrect": "آفرین! «Frau» یعنی زن، نه مرد.",
    "onWrong": "دقت کنید: «Frau» = زن، «Mann» = مرد. این دو را اشتباه نگیرید!",
    "errorCategory": "vocabulary",
    "highlights": ["Frau", "زن"]
  }
}
```

---

## Task 5: Dialog Questions (REQUIRED)

### Every dialog step MUST have 1-3 comprehension questions

### Dialog Question Schema

```json
{
  "type": "dialog",
  "id": "s15",
  "lines": [...],
  "questionMode": "post-dialog",
  "questions": [
    {
      "question": "Persian question text?",
      "options": ["گزینه ۱", "گزینه ۲", "گزینه ۳"],
      "correctIndex": 0,
      "explanation": "Persian explanation with quote from dialog",
      "relatedLineIndex": 0
    }
  ]
}
```

### Question Modes

| Mode | Description | When to Use |
|------|-------------|-------------|
| `post-dialog` | Questions after full dialog | Default, most common |
| `mid-dialog` | Pause at specific lines | Long dialogs (5+ lines) |
| `both` | Both mid and post | Very long dialogs |

### Question Types to Include

| Type | Template | Example |
|------|----------|---------|
| **Speaker ID** | "چه کسی این را گفت: «{quote}»?" | "چه کسی گفت «Ich heiße Tom»?" |
| **Content Recall** | "{name} چه گفت?" | "تام چه گفت؟" |
| **Vocabulary** | "معنی «{word}» چیست?" | "معنی «Danke» چیست؟" |
| **Inference** | "{name} از کجا می‌آید?" | "الی کجا کار می‌کند؟" |
| **True/False** | "آیا {statement} درست است?" | "آیا تام از برلین است؟" |

### Complete Dialog Example with Questions

```json
{
  "type": "dialog",
  "id": "s15",
  "scene": {
    "location": "café",
    "description": { "de": "In einem Café", "fa": "در یک کافه" }
  },
  "lines": [
    {
      "speaker": "Eli",
      "text": { "de": "Hallo! Ich bin Eli.", "fa": "سلام! من الی هستم." },
      "mood": "happy"
    },
    {
      "speaker": "Tom",
      "text": { "de": "Hallo Eli! Ich heiße Tom. Freut mich!", "fa": "سلام الی! اسم من تام است. خوشوقتم!" }
    },
    {
      "speaker": "Eli",
      "text": { "de": "Freut mich auch! Woher kommst du?", "fa": "منم خوشوقتم! اهل کجایی؟" }
    },
    {
      "speaker": "Tom",
      "text": { "de": "Ich komme aus Berlin.", "fa": "من اهل برلین هستم." }
    }
  ],
  "questionMode": "post-dialog",
  "questions": [
    {
      "question": "اسم زن چیست؟",
      "options": ["تام", "الی", "لیزا"],
      "correctIndex": 1,
      "explanation": "زن گفت: «Ich bin Eli.»",
      "relatedLineIndex": 0
    },
    {
      "question": "تام اهل کجاست؟",
      "options": ["مونیخ", "برلین", "هامبورگ"],
      "correctIndex": 1,
      "explanation": "تام گفت: «Ich komme aus Berlin.»",
      "relatedLineIndex": 3
    },
    {
      "question": "معنی «Freut mich» چیست؟",
      "options": ["خداحافظ", "متشکرم", "خوشوقتم"],
      "correctIndex": 2,
      "explanation": "«Freut mich» یعنی «خوشوقتم» و برای آشنایی استفاده می‌شود.",
      "relatedLineIndex": 1
    }
  ]
}
```

---

## Task 6: Dictation Steps (REQUIRED)

### Add 1-2 dictation steps per lesson

### Schema

```json
{
  "type": "dictation",
  "id": "dictation-{N}",
  "targetText": "German text to type",
  "translation": "Persian translation",
  "difficulty": "A1"
}
```

### Difficulty Settings

| Level | Max Repeats | Show Translation | Show First Letter | Accept Threshold |
|-------|-------------|------------------|-------------------|------------------|
| `A1` | Unlimited | Yes | Yes | 70% |
| `A2` | 5 | Yes | No | 80% |
| `B1` | 3 | No | No | 90% |
| `B2` | 1 | No | No | 95% |

### What to Use as targetText

| Lesson Focus | Dictation Content |
|--------------|-------------------|
| Vocabulary | Single words from lesson |
| Greetings | Common phrases |
| Dialogs | Key sentences from dialog |
| Grammar | Example sentences with target grammar |

### Examples

**A1 Single Word:**
```json
{
  "type": "dictation",
  "id": "dictation-1",
  "targetText": "Hallo",
  "translation": "سلام",
  "difficulty": "A1"
}
```

**A1 Phrase:**
```json
{
  "type": "dictation",
  "id": "dictation-2",
  "targetText": "Guten Morgen",
  "translation": "صبح بخیر",
  "difficulty": "A1"
}
```

**A2 Sentence:**
```json
{
  "type": "dictation",
  "id": "dictation-3",
  "targetText": "Ich komme aus Berlin.",
  "translation": "من اهل برلین هستم.",
  "difficulty": "A2"
}
```

---

## Task 7: Story Enhancements (Optional)

### Add to existing dialogs for richer storytelling

### Scene Context

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

**Common Locations:**
- `café` - کافه
- `restaurant` - رستوران
- `street` - خیابان
- `office` - دفتر
- `home` - خانه
- `school` - مدرسه
- `station` - ایستگاه
- `airport` - فرودگاه
- `supermarket` - سوپرمارکت

### Narratives (Text Between Lines)

```json
{
  "narratives": [
    {
      "position": 0,
      "text": {
        "de": "Eli kommt ins Café und sieht Tom.",
        "fa": "الی وارد کافه می‌شود و تام را می‌بیند."
      }
    },
    {
      "position": 2,
      "text": {
        "de": "Tom lächelt.",
        "fa": "تام لبخند می‌زند."
      }
    }
  ]
}
```

**Position:** After which line index (0 = before first line)

### Character Moods

```json
{
  "speaker": "Tom",
  "text": { "de": "Oh nein!", "fa": "اوه نه!" },
  "mood": "surprised"
}
```

**Available Moods:**
| Mood | Persian | Use When |
|------|---------|----------|
| `neutral` | عادی | Default |
| `happy` | خوشحال | Good news, greetings |
| `sad` | ناراحت | Bad news |
| `angry` | عصبانی | Frustration |
| `surprised` | متعجب | Unexpected |
| `confused` | گیج | Doesn't understand |
| `excited` | هیجان‌زده | Very happy |

---

## BiDi Text Rules (CRITICAL)

When mixing Persian and German text:

### Rule: First word determines text direction

| Scenario | Correct | Wrong |
|----------|---------|-------|
| Persian sentence with German | کلمه «Hallo» یعنی سلام | "Hallo" یعنی سلام |
| German example | Ich heiße Tom. | - |

### Examples

```
✅ CORRECT:
- کلمه «Hallo» یعنی سلام
- معنی «Danke» چیست؟
- فعل «kommen» به معنی آمدن است

❌ WRONG:
- "Hallo" یعنی سلام (starts with quotes)
- Danke یعنی ممنون (starts with German)
```

---

## Complete Migration Example

### BEFORE (Minimal Lesson)

```json
{
  "id": "A1-M01-L03",
  "title": { "de": "Begrüßungen", "fa": "سلام و احوالپرسی" },
  "level": "A1",
  "module": 1,
  "lessonNumber": 3,
  "vocabulary": [
    { "de": "Hallo", "fa": "سلام" },
    { "de": "Guten Morgen", "fa": "صبح بخیر" },
    { "de": "Wie geht's?", "fa": "حالت چطوره؟" }
  ],
  "steps": [
    {
      "type": "new-word",
      "id": "s1",
      "word": { "de": "Hallo", "fa": "سلام" }
    },
    {
      "type": "new-word",
      "id": "s2",
      "word": { "de": "Guten Morgen", "fa": "صبح بخیر" }
    },
    {
      "type": "dialog",
      "id": "s3",
      "lines": [
        { "speaker": "Eli", "text": { "de": "Hallo!", "fa": "سلام!" } },
        { "speaker": "Tom", "text": { "de": "Hallo! Wie geht's?", "fa": "سلام! حالت چطوره؟" } }
      ]
    },
    {
      "type": "multiple-choice",
      "id": "s4",
      "question": { "de": "Was bedeutet 'Hallo'?", "fa": "معنی 'Hallo' چیست؟" },
      "options": ["خداحافظ", "سلام", "ممنون"],
      "correctIndex": 1
    }
  ]
}
```

### AFTER (Fully Migrated)

```json
{
  "id": "A1-M01-L03",
  "title": { "de": "Begrüßungen", "fa": "سلام و احوالپرسی" },
  "level": "A1",
  "module": 1,
  "lessonNumber": 3,
  "vocabulary": [
    {
      "de": "Hallo",
      "fa": "سلام",
      "grammar": { "pos": "interjection" }
    },
    {
      "de": "Guten Morgen",
      "fa": "صبح بخیر",
      "grammar": { "pos": "phrase" }
    },
    {
      "de": "Wie geht's?",
      "fa": "حالت چطوره؟",
      "grammar": { "pos": "phrase" }
    }
  ],
  "steps": [
    {
      "type": "new-word",
      "id": "s1",
      "word": { "de": "Hallo", "fa": "سلام" },
      "header": "یاد بگیر!"
    },
    {
      "type": "syllable-spelling",
      "id": "syllable-1",
      "word": { "de": "Hallo", "fa": "سلام" },
      "syllables": ["Hal", "lo"],
      "hint": "۲ بخش - سلام"
    },
    {
      "type": "new-word",
      "id": "s2",
      "word": { "de": "Guten Morgen", "fa": "صبح بخیر" },
      "header": "یاد بگیر!"
    },
    {
      "type": "syllable-spelling",
      "id": "syllable-2",
      "word": { "de": "Guten Morgen", "fa": "صبح بخیر" },
      "syllables": ["Gu", "ten", "Mor", "gen"],
      "hint": "۴ بخش - سلام صبحگاهی"
    },
    {
      "type": "new-word",
      "id": "s3",
      "word": { "de": "Wie geht's?", "fa": "حالت چطوره؟" },
      "header": "یاد بگیر!"
    },
    {
      "type": "syllable-spelling",
      "id": "syllable-3",
      "word": { "de": "Wie geht's?", "fa": "حالت چطوره؟" },
      "syllables": ["Wie", "geht's"],
      "hint": "۲ بخش - احوالپرسی"
    },
    {
      "type": "dialog",
      "id": "s4",
      "scene": {
        "location": "street",
        "description": { "de": "Auf der Straße", "fa": "در خیابان" }
      },
      "lines": [
        {
          "speaker": "Eli",
          "text": { "de": "Hallo!", "fa": "سلام!" },
          "mood": "happy"
        },
        {
          "speaker": "Tom",
          "text": { "de": "Hallo! Wie geht's?", "fa": "سلام! حالت چطوره؟" },
          "mood": "happy"
        },
        {
          "speaker": "Eli",
          "text": { "de": "Gut, danke! Und dir?", "fa": "خوبم، ممنون! تو چطوری؟" }
        },
        {
          "speaker": "Tom",
          "text": { "de": "Auch gut!", "fa": "منم خوبم!" }
        }
      ],
      "questionMode": "post-dialog",
      "questions": [
        {
          "question": "تام چطور است؟",
          "options": ["بد", "خوب", "خسته"],
          "correctIndex": 1,
          "explanation": "تام گفت: «Auch gut!» یعنی «منم خوبم!»",
          "relatedLineIndex": 3
        },
        {
          "question": "معنی «Wie geht's» چیست؟",
          "options": ["خداحافظ", "حالت چطوره؟", "ممنون"],
          "correctIndex": 1,
          "explanation": "«Wie geht's» برای احوالپرسی استفاده می‌شود.",
          "relatedLineIndex": 1
        }
      ]
    },
    {
      "type": "multiple-choice",
      "id": "s5",
      "question": { "de": "Was bedeutet 'Hallo'?", "fa": "معنی «Hallo» چیست؟" },
      "options": ["خداحافظ", "سلام", "ممنون"],
      "correctIndex": 1,
      "feedbackTip": {
        "onCorrect": "آفرین! «Hallo» رایج‌ترین سلام در آلمانی است.",
        "onWrong": "دقت کنید: «Hallo» = سلام، «Tschüss» = خداحافظ، «Danke» = ممنون",
        "errorCategory": "vocabulary",
        "highlights": ["Hallo", "سلام"]
      }
    },
    {
      "type": "dictation",
      "id": "dictation-1",
      "targetText": "Guten Morgen",
      "translation": "صبح بخیر",
      "difficulty": "A1"
    },
    {
      "type": "dictation",
      "id": "dictation-2",
      "targetText": "Wie geht's?",
      "translation": "حالت چطوره؟",
      "difficulty": "A1"
    }
  ]
}
```

---

## Migration Checklist

### Per Lesson Checklist

```
□ Task 1: Syllable-Spelling
  □ Every new-word has syllable-spelling immediately after
  □ Syllables correctly broken using German rules
  □ Hint includes Persian count (۲ بخش) and meaning

□ Task 2: Vocabulary Grammar
  □ Every vocabulary item has grammar.pos
  □ Nouns have artikel (m/f/n) and optional plural
  □ Verbs have infinitiv and optional praesens
  □ Phrases marked as pos: "phrase"

□ Task 3: Grammar Popups (L07+ only)
  □ 1-2 grammar-popup steps added
  □ Placed BEFORE exercises testing that grammar
  □ grammarConcept matches lesson range
  □ Persian explanation with examples

□ Task 4: FeedbackTips
  □ EVERY exercise has feedbackTip
  □ onCorrect explains WHY it's correct
  □ onWrong explains the ERROR and correct rule
  □ errorCategory is appropriate

□ Task 5: Dialog Questions
  □ EVERY dialog has 1-3 questions
  □ questionMode set (usually "post-dialog")
  □ Questions cover: speaker ID, recall, vocabulary
  □ explanation references dialog line
  □ relatedLineIndex points to correct line

□ Task 6: Dictation
  □ 1-2 dictation steps added
  □ Uses vocabulary from lesson
  □ difficulty matches lesson level

□ Task 7: Story Enhancements (optional)
  □ scene added to dialogs
  □ narratives add context
  □ mood set for expressive lines
```

---

## Validation Commands

```bash
# 1. Validate JSON syntax
cat content/de-fa/A1/module-01/A1-M01-L03.json | jq .

# 2. Validate lesson schema
node scripts/validate-lesson.js content/de-fa/A1/module-01/A1-M01-L03.json

# 3. Check TypeScript types
pnpm run typecheck

# 4. Run full validation
pnpm run check
```

---

## After Migration

### Generate Audio

```bash
cd /Volumes/External_ssd_mohsen/WorkspaceExtern/german-learning-app-main

GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --lesson=A1-M01-L03
```

### Test in Browser

```bash
pnpm run dev
# Navigate to http://localhost:5173/learn/de-fa/A1/A1-M01-L03
```

### Upload to Cloud (R2)

```bash
# Upload lesson content
node scripts/upload-content-to-r2.js

# Upload audio
node scripts/upload-to-r2.js
```

---

## Quick Reference Cards

### Syllable Hint Format
```
{Persian number} بخش - {meaning}
Examples:
- ۱ بخش - بله
- ۲ بخش - سلام
- ۳ بخش - روز بخیر
- ۴ بخش - صبح بخیر
```

### Error Categories Quick Reference
```
vocabulary     → واژه اشتباه
wrong-article  → حرف تعریف اشتباه
wrong-conjugation → صرف فعل اشتباه
word-order     → ترتیب کلمات اشتباه
spelling       → املای اشتباه
wrong-case     → حالت دستوری اشتباه
comprehension  → درک مطلب
```

### Grammar Concepts by Lesson
```
L01-L06: NO GRAMMAR TIPS
L07-L10: du-vs-sie, v2-word-order
L11-L18: verb-conjugation, sein, haben, negation
L19-L25: article-gender, definite-articles, indefinite-articles
L26-L32: accusative-case
L33-L40: w-questions
L41+:    dative-case, separable-verbs, modal-verbs
```

### Article Colors
```
der (m) → 🔵 Blue
die (f) → 🔴 Pink/Red
das (n) → 🟢 Green
```
