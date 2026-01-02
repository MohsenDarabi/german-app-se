# Source Content Navigation Guide

> How to find and use content from the three sources

---

## Source Overview

| Source | Path | Content | Best For |
|--------|------|---------|----------|
| **PDF Textbooks** | `/Volumes/.../languageAppContent/phase1-extracted/` | Menschen, Schritte | Vocabulary lists, grammar structures |
| **Babbel** | `/Volumes/.../babbel-extractor-yolo/output/` | Full curriculum | Exercise patterns, dialogs |
| **Busuu** | `scripts/screen-flow-mapper/output/` | 482 lessons | Flashcards, grammar tips |

---

## Source 1: PDF Textbooks

### Location
```
/Volumes/External_ssd_mohsen/WorkspaceExtern/languageAppContent/phase1-extracted/
```

### Structure
```
phase1-extracted/
├── Menschen_A1/
│   ├── chapter-01/
│   │   ├── vocabulary.json
│   │   ├── grammar.json
│   │   └── dialogs.json
│   └── ...
├── Menschen_A2/
├── Schritte_Plus_A1/
└── ...
```

### Use For
- Official CEFR vocabulary lists
- Grammar explanations
- Textbook dialog patterns
- Topic progression ideas

### Example: Reading vocabulary
```bash
cat /Volumes/.../languageAppContent/phase1-extracted/Menschen_A1/chapter-01/vocabulary.json | jq '.words[:5]'
```

---

## Source 2: Babbel (Crawled)

### Location
```
/Volumes/External_ssd_mohsen/WorkspaceExtern/babbel-extractor-yolo/output/
```

### Structure
```
output/
├── A11/          # A1.1 (beginner part 1)
│   ├── unit-01/
│   │   ├── lesson-01.json
│   │   ├── lesson-02.json
│   │   └── ...
│   └── unit-02/
├── A12/          # A1.2 (beginner part 2)
├── A21/          # A2.1
├── A22/          # A2.2
├── B1/
└── B2/
```

### Lesson JSON Structure
```json
{
  "lessonId": "lesson-01",
  "title": "Hello and Goodbye",
  "screens": [
    {
      "type": "vocab-intro",
      "content": {
        "word": "Hallo",
        "translation": "Hello",
        "audio": "https://..."
      }
    },
    {
      "type": "mcq-translation",
      "content": {
        "question": "Hello",
        "options": ["Hallo", "Tschüss", "Danke"],
        "correct": 0
      }
    }
  ]
}
```

### Screen Types (17)
| Type | Description |
|------|-------------|
| `vocab-intro` | New word introduction |
| `vocab-card` | Flashcard with audio |
| `mcq-translation` | Multiple choice translation |
| `vocab-fillin` | Fill in the blank |
| `sentence-order` | Word ordering |
| `matching` | Match pairs |
| `spelling` | Spell the word |
| `dialogue` | Conversation |
| `listen-repeat` | Listen and repeat |
| `speech-exercise` | Pronunciation |
| `formality-choice` | Du vs Sie |

### Example: Exploring Babbel A1.1
```bash
# List all units
ls /Volumes/.../babbel-extractor-yolo/output/A11/

# Read first lesson
cat /Volumes/.../babbel-extractor-yolo/output/A11/unit-01/lesson-01.json | jq '.title, .screens[0]'

# Find all vocab-intro screens
cat /Volumes/.../babbel-extractor-yolo/output/A11/unit-01/lesson-01.json | jq '.screens[] | select(.type == "vocab-intro")'
```

---

## Source 3: Busuu (Screen-Flow-Mapper)

### Location
```
scripts/screen-flow-mapper/output/
```

### Structure
```
output/
├── A1/                              # 168 lessons
│   ├── chapter-01-introductions/
│   │   ├── lesson-01-hallo.json
│   │   └── ...
│   ├── chapter-02-greetings/
│   └── ...
├── A2/                              # 98 lessons
├── B1/                              # 140 lessons
└── B2/                              # 76 lessons
```

### Lesson JSON Structure
```json
{
  "level": "A1",
  "chapter": { "number": 1, "title": "Introductions" },
  "lesson": { "number": 1, "title": "Hallo!", "url": "..." },
  "screens": [
    {
      "type": "flashcard",
      "content": {
        "german": "Hallo!",
        "english": "Hello!",
        "media": { "image": "...", "audio": "..." }
      }
    },
    {
      "type": "fillgap",
      "content": {
        "sentence": "___ ist mein Name.",
        "options": ["Hallo", "Das", "Ich"],
        "correct": "Das"
      }
    },
    {
      "type": "tip",
      "content": {
        "title": "Grammar",
        "text": "In German, 'Das' means 'That'..."
      }
    }
  ],
  "screenCount": 8
}
```

### Screen Types (14)
| Type | Description | Count |
|------|-------------|-------|
| `fillgap` | Fill in blank | 2,037 |
| `flashcard` | Vocabulary card | 1,679 |
| `typing` | Type translation | 1,308 |
| `true-false` | True/false | 1,256 |
| `mcq` | Multiple choice | 1,210 |
| `tip` | Grammar tip | 686 |
| `matchup` | Match pairs | 540 |
| `fillgap-multiple` | Multiple blanks | 504 |
| `phrase-builder` | Word order | 476 |
| `spelling` | Spell word | 367 |
| `highlighter` | Select words | 328 |
| `comprehension` | Reading | 100 |

### Example: Exploring Busuu A1
```bash
# List chapters
ls scripts/screen-flow-mapper/output/A1/

# Count lessons
find scripts/screen-flow-mapper/output/A1 -name "*.json" | wc -l

# Read first lesson
cat scripts/screen-flow-mapper/output/A1/chapter-01-introductions/lesson-*.json | jq '.lesson.title, .screens[0]'

# Find all tips
cat scripts/screen-flow-mapper/output/A1/chapter-01-introductions/*.json | jq '.screens[] | select(.type == "tip")'
```

---

## Mapping Sources → App Types

| Source | Source Type | App Step Type |
|--------|-------------|---------------|
| Babbel | vocab-intro, vocab-card | `new-word` |
| Busuu | flashcard | `new-word` |
| Babbel | mcq-translation | `multiple-choice` |
| Busuu | mcq | `multiple-choice` |
| Babbel | vocab-fillin | `fill-in-blank` |
| Busuu | fillgap, fillgap-multiple | `fill-in-blank` |
| Babbel | sentence-order | `word-order` |
| Busuu | phrase-builder | `word-order` |
| Babbel | matching | `matching` |
| Busuu | matchup | `matching` |
| Babbel | spelling | `spelling` |
| Busuu | spelling | `spelling` |
| Babbel | dialogue | `dialog` |
| Busuu | tip | `grammar-tip` |
| Busuu | true-false | `true-false` |
| Busuu | typing | `translation` |

---

## Workflow: Finding Content for a Topic

### Example: Creating lesson about "Greetings"

1. **Check Babbel A1.1 Unit 1**
```bash
cat /Volumes/.../babbel-extractor-yolo/output/A11/unit-01/lesson-01.json | jq '.screens[] | .content.word // .content.question'
```

2. **Check Busuu A1 Chapter 1**
```bash
cat scripts/screen-flow-mapper/output/A1/chapter-01-*/*.json | jq '.screens[] | select(.type == "flashcard") | .content.german'
```

3. **Check PDF textbooks**
```bash
cat /Volumes/.../languageAppContent/phase1-extracted/Menschen_A1/chapter-01/vocabulary.json | jq '.words[] | select(.topic == "greetings")'
```

4. **Extract vocabulary list** (combine unique words)
5. **Note exercise patterns** (which exercises work well)
6. **Create ORIGINAL lesson** (change names, rewrite dialogs)

---

## Tips

1. **Don't copy verbatim** - Use sources for inspiration, create unique content
2. **Combine strengths** - Babbel has good dialogs, Busuu has good tips
3. **Check multiple sources** - Same topic may be covered differently
4. **Extract vocabulary first** - Make a list before designing exercises
5. **Note grammar points** - What grammar is introduced with each topic?
