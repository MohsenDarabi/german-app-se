# Chunk Example: Basic Greetings

> Demonstrating the 3-way merge process with a small vocabulary cluster

---

## Chunk Definition

| Property | Value |
|----------|-------|
| **Chunk ID** | `A1-greetings-basic` |
| **Type** | Vocabulary Cluster |
| **Size** | 6 words (within 3-7 limit) |
| **Topic** | Greetings & Farewells |

---

## Step 1: Extract from Each Source

### Source A: PDF Textbook (Menschen A1-1, pages 10-11)

```
Raw OCR text:
"Hallo, Guten Tag, Guten Morgen, Guten Abend"
"Auf Wiedersehen, Tschüss"
```

**Extracted vocabulary:**
| German | Context |
|--------|---------|
| Hallo | General greeting |
| Guten Tag | Formal daytime greeting |
| Guten Morgen | Morning greeting |
| Guten Abend | Evening greeting |
| Auf Wiedersehen | Formal goodbye |
| Tschüss | Informal goodbye |

---

### Source B: Babbel (A1.1 Unit 1)

```json
{
  "type": "vocab-intro",
  "words": ["danke"]
}
```

**Note:** Babbel Unit 1 Lesson 1 starts with "danke" (thanks), not greetings.
Greetings likely in different unit - for this example, limited Babbel data.

---

### Source C: Busuu (Chapter 5: Greetings)

**Lesson 1 - Regional Greetings:**
```json
[
  {"german": "Moin (moin)!", "note": "Northern German"},
  {"german": "Servus!", "note": "Austrian/Southern German"},
  {"german": "Hoi!", "note": "Swiss German"}
]
```

**Lesson 3 - Saying Goodbye:**
```json
[
  {"german": "Bis bald!", "english": "See you soon"},
  {"german": "Schönen Tag!", "english": "Have a nice day"},
  {"german": "Schönes Wochenende!", "english": "Have a nice weekend"},
  {"german": "Dir auch!", "note": "informal reply"},
  {"german": "Ihnen auch!", "note": "formal reply"}
]
```

---

## Step 2: Compare Sources

| Word | PDF | Babbel | Busuu | Include? |
|------|-----|--------|-------|----------|
| Hallo | ✅ | - | - | ✅ Core |
| Guten Tag | ✅ | - | - | ✅ Core |
| Guten Morgen | ✅ | - | - | ✅ Core |
| Guten Abend | ✅ | - | - | ✅ Core |
| Auf Wiedersehen | ✅ | - | - | ✅ Core |
| Tschüss | ✅ | - | - | ✅ Core |
| Moin! | - | - | ✅ | ⚠️ Regional (save for later) |
| Servus! | - | - | ✅ | ⚠️ Regional (save for later) |
| Bis bald! | - | - | ✅ | ✅ Add to farewells |

**Decision:**
- Core 6 words from PDF (standard German)
- Add "Bis bald!" from Busuu (common phrase)
- Save regional variants for advanced lesson

---

## Step 3: Merge & Deduplicate

**Final Vocabulary Cluster (7 words):**

| German | Persian | Note |
|--------|---------|------|
| Hallo | سلام | Most common, informal |
| Guten Tag | روز بخیر | Formal, daytime |
| Guten Morgen | صبح بخیر | Morning only |
| Guten Abend | عصر بخیر | Evening only |
| Auf Wiedersehen | خداحافظ | Formal goodbye |
| Tschüss | خداحافظ (غیررسمی) | Informal goodbye |
| Bis bald | تا بعد / به زودی می‌بینمت | See you soon |

---

## Step 4: Create App Steps

### Output: 7 new-word steps

```json
[
  {
    "id": "A1-M01-L01-S01",
    "type": "new-word",
    "word": {
      "de": "Hallo",
      "fa": "سلام"
    },
    "phonetic": "ha-LO",
    "wordType": "greeting",
    "note": {
      "fa": "رایج‌ترین سلام در آلمانی، غیررسمی"
    },
    "header": "یه چیز جدید!"
  },
  {
    "id": "A1-M01-L01-S02",
    "type": "new-word",
    "word": {
      "de": "Guten Tag",
      "fa": "روز بخیر"
    },
    "phonetic": "GOO-ten tahk",
    "wordType": "greeting",
    "note": {
      "fa": "سلام رسمی، برای روز استفاده می‌شود"
    }
  },
  {
    "id": "A1-M01-L01-S03",
    "type": "new-word",
    "word": {
      "de": "Guten Morgen",
      "fa": "صبح بخیر"
    },
    "phonetic": "GOO-ten MOR-gen",
    "wordType": "greeting",
    "note": {
      "fa": "فقط صبح‌ها استفاده می‌شود"
    }
  },
  {
    "id": "A1-M01-L01-S04",
    "type": "new-word",
    "word": {
      "de": "Guten Abend",
      "fa": "عصر بخیر"
    },
    "phonetic": "GOO-ten AH-bent",
    "wordType": "greeting",
    "note": {
      "fa": "برای عصر و شب استفاده می‌شود"
    }
  },
  {
    "id": "A1-M01-L01-S05",
    "type": "new-word",
    "word": {
      "de": "Auf Wiedersehen",
      "fa": "خداحافظ"
    },
    "phonetic": "owf VEE-der-zey-en",
    "wordType": "farewell",
    "note": {
      "fa": "خداحافظی رسمی"
    }
  },
  {
    "id": "A1-M01-L01-S06",
    "type": "new-word",
    "word": {
      "de": "Tschüss",
      "fa": "خداحافظ"
    },
    "phonetic": "tchews",
    "wordType": "farewell",
    "note": {
      "fa": "خداحافظی غیررسمی، با دوستان"
    }
  },
  {
    "id": "A1-M01-L01-S07",
    "type": "new-word",
    "word": {
      "de": "Bis bald",
      "fa": "تا بعد"
    },
    "phonetic": "bis bahlt",
    "wordType": "farewell",
    "note": {
      "fa": "به معنی «به زودی می‌بینمت»"
    }
  }
]
```

---

## Step 5: Add Exercise (from same chunk)

### One fill-in-blank exercise using chunk vocabulary:

```json
{
  "id": "A1-M01-L01-S08",
  "type": "fill-in-blank",
  "instruction": "جای خالی را پر کنید",
  "sentence": "Anna: {0}! Wie geht's?\nTom: {1}, danke!",
  "options": ["Hallo", "Gut", "Tschüss", "Nein"],
  "correctAnswers": [0, 1],
  "feedback": {
    "explanation": "Hallo برای سلام کردن و Gut برای «خوبم» استفاده می‌شود"
  }
}
```

---

## Summary

| Metric | Value |
|--------|-------|
| **Words processed** | 7 |
| **Sources used** | 2 (PDF + Busuu) |
| **Steps created** | 8 (7 new-word + 1 exercise) |
| **Processing time** | ~5 minutes |
| **Quality** | High (manually verified) |

---

## Chunk Status

- [x] Extracted from PDF
- [x] Extracted from Busuu
- [x] Compared and merged
- [x] Persian translations added
- [x] Steps created
- [ ] **USER VERIFICATION NEEDED**

---

## Next Chunk

After approval, proceed to:
- `A1-greetings-regional` (Moin, Servus, Hoi)
- OR `A1-introductions-pronouns` (ich, du, Sie)
