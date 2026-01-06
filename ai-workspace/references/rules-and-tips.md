# Rules, Tips & Troubleshooting

> Critical rules and common pitfalls for content creation

---

## CRITICAL RULES

### Rule 1: BiDi Text Direction

**The FIRST word of a sentence determines text direction.**

When mixing Persian and German/English in one sentence:

```
WRONG: "Hi" رسمی‌تر از "Hallo" است.
       ↑ First word is German, so whole line displays LTR (broken)

RIGHT: کلمه "Hi" رسمی‌تر از "Hallo" است.
       ↑ First word is Persian, so line displays RTL correctly
```

**Solution**: Start mixed sentences with a Persian word.

```
WRONG: "Hallo" یعنی سلام
RIGHT: کلمه "Hallo" یعنی سلام
RIGHT: واژه "Guten Tag" یعنی روز بخیر
```

---

### Rule 2: Create UNIQUE Content

**DO NOT copy content verbatim from sources.**

| DON'T | DO |
|-------|-----|
| Copy Anna/Tom from Babbel | Use **Eli & Tom** (primary characters) |
| Copy exact dialogs | Rewrite with same structure |
| Copy exact sentences | Create original examples |

**Primary Characters (use consistently across lessons):**
- **Eli** - German teacher (43, female, calm and supportive)
- **Tom** - Language instructor (35-37, male, reliable guide)

**Secondary characters** (if needed):
- Young/casual: Lisa (18-20), Alex (21-22)
- German: Max, Sophie, Leon, Emma
- Persian learners: Sara, Amir

---

### Rule 3: All German Text Needs Persian Translation

Every German word, sentence, or phrase MUST have a Persian translation.

```json
// WRONG - missing translation
"word": { "de": "Hallo" }

// RIGHT
"word": { "de": "Hallo", "fa": "سلام" }
```

---

### Rule 4: NO English in Persian Content

**Persian text must be 100% Persian - no English words.**

This applies to:
- Grammar tip titles and content
- Persian translations (.fa fields)
- Instructions and feedback text

| DON'T | DO |
|-------|-----|
| `aus vs in` | `aus در برابر in` |
| `with subject` | `با فاعل` |
| `Note: ...` | `نکته: ...` |
| `for example` | `برای مثال` |
| `first, then` | `اول، بعد` |

**Common Persian equivalents:**
- `vs` / `versus` → `در برابر` / `در مقابل`
- `and` → `و`
- `or` → `یا`
- `note` / `tip` → `نکته`
- `example` → `مثال`
- `first` → `اول` / `نخست`
- `then` → `بعد` / `سپس`

**Validation**: The validator checks for English words in Persian content (rule: `no-english-in-persian`).

---

### Rule 5: Game Steps Every 5-7 Steps

Insert games to maintain engagement:

```
Step 1-4:  [new-word] × 4
Step 5:    [rapid-fire] ← GAME
Step 6-10: [grammar-tip, multiple-choice, fill-in-blank, word-order, matching]
Step 11:   [memory-match] ← GAME
Step 12-15: [dialog, true-false, translation, spelling]
Step 16:   [vocab-check] ← GAME (optional)
Step 17:   [completion]
```

---

### Rule 5: Persian-Specific Grammar Notes

Add notes that help Persian speakers specifically:

**Include comparisons:**
- German cases vs Persian postpositions
- German word order (V2) vs Persian (SOV)
- German articles (der/die/das) - Persian has none
- Du/Sie vs تو/شما (similar but different usage)

**Example:**
```json
{
  "type": "grammar-tip",
  "content": "در آلمانی مثل فارسی 'تو' و 'شما' داریم:\n\n**du** = تو (غیررسمی)\n**Sie** = شما (رسمی)\n\n⚠️ تفاوت: در آلمان Sie را حتی با همکاران مسن‌تر استفاده می‌کنند!"
}
```

---

### Rule 6: Randomize Answer Positions

**CRITICAL**: `correctAnswerIndex` must NOT always be 0.

```json
// BAD - correct answer always first
{
  "options": ["Hallo", "Tschüss", "Danke", "Bitte"],
  "correctAnswerIndex": 0  // WRONG! Always 0
}

// GOOD - correct answer at random position
{
  "options": ["Tschüss", "Danke", "Hallo", "Bitte"],
  "correctAnswerIndex": 2  // Varies between questions
}
```

Across a lesson, distribute correct answers across positions 0, 1, 2, 3.

---

### Rule 7: Only ONE Correct Answer Per Question

**CRITICAL**: Every quiz/fill-in-blank must have EXACTLY ONE valid answer.

```json
// BAD - both "bin" and "heiße" work for "Ich ___ Max"
{
  "sentence": "Ich {0} Max.",
  "options": ["bin", "heiße", "Tschüss"],  // ❌ Two correct options!
}

// GOOD - only "bin" works, "heißt" is wrong conjugation
{
  "sentence": "Ich {0} Max.",
  "options": ["bin", "heißt", "Tschüss"],  // ✓ Only one correct
}
```

**Common traps:**
- "bin" vs "heiße" - both mean "I am" → use wrong conjugation "heißt" as distractor
- "du" vs "Sie" in same question → only one is contextually correct
- Synonyms that both work → pick one and use unrelated distractors

---

### Rule 8: No Meta-Answers

**NEVER use "both options", "all of the above", or "none of the above".**

These make the question unfair - if a learner picks the ACTUAL correct answer, they get marked wrong!

```json
// BAD - "هر دو گزینه اول" is a trap
{
  "question": "معنی «Ich heiße Lena» چیست؟",
  "options": ["من لنا هستم", "اسم من لناست", "سلام لنا", "هر دو گزینه اول"],
  "correctAnswerIndex": 3  // ❌ Actual correct answers (0,1) marked wrong!
}

// GOOD - clear distractors, one correct answer
{
  "question": "معنی «Ich heiße Lena» چیست؟",
  "options": ["سلام لنا", "اسم من لناست", "خداحافظ لنا", "ممنون لنا"],
  "correctAnswerIndex": 1  // ✓ Only one correct
}
```

**Forbidden patterns:**
- `هر دو گزینه` (both options)
- `همه گزینه‌ها` (all options)
- `هیچکدام` (none of the above)
- `all of the above`
- `none of the above`

---

### Rule 9: Fill-in-Blank Verb Consistency

**DO NOT mix conjugations from different verbs** in the same exercise.

```json
// BAD - mixes "sein" and "heißen" verbs (confusing!)
{
  "sentence": "Hallo! Ich {0} Anna. Wie {1} du?",
  "options": ["bin", "bist", "heißt", "heiße"],
  "correctAnswers": [0, 2]  // "bin" (sein) + "heißt" (heißen) = CONFUSING
}

// GOOD - consistent verb family
{
  "sentence": "Ich {0} Anna. Wie {1} du?",
  "options": ["heiße", "heißt", "heißen"],
  "correctAnswers": [0, 1]  // Both from "heißen" = CLEAR
}
```

**Valid exceptions:**
- Modal verb + infinitive: "Ihr **solltet** mehr Gemüse **essen**"
- Future tense: "Er **wird** morgen nach Berlin **fahren**"

---

### Rule 10: Game Step Minimums

| Game Type | Minimum Items |
|-----------|---------------|
| `speed-challenge` | 5 questions |
| `rapid-fire` | 5 questions |
| `memory-match` | 4 pairs (8 cards) |
| `matching` | 3 pairs |

---

### Rule 11: Rapid-Fire Balance

Balance `correctSide` roughly 50% "left" / 50% "right".

```json
// BAD - all answers on right
{ "correctSide": "right" },
{ "correctSide": "right" },
{ "correctSide": "right" }

// GOOD - balanced
{ "correctSide": "right" },
{ "correctSide": "left" },
{ "correctSide": "right" },
{ "correctSide": "left" }
```

Never more than 80% on one side.

---

### Rule 12: No TTS-Unfriendly Characters

**CRITICAL**: Do NOT use characters that TTS mispronounces in German text.

| Character | Name | TTS Reads As | Use Instead |
|-----------|------|--------------|-------------|
| `–` | en-dash | "Minus" | space or comma |
| `—` | em-dash | "Gedankenstrich" | space or period |
| `→` | arrow | "Pfeil" | write out direction |
| `×` | multiplication | "mal" | write "mal" |

```json
// BAD - TTS says "Wie geht's Minus Es geht"
"de": "Wie geht's? – Es geht."

// GOOD - natural pause from punctuation
"de": "Wie geht's? Es geht."
```

**Q&A Format**: For question-answer pairs, just use the question mark for pause:
- ✅ `"Wie geht's? Gut!"`
- ❌ `"Wie geht's? – Gut!"`

---

## COMMON MISTAKES

### Mistake 1: Wrong correctAnswerIndex

Index is 0-based, not 1-based!

```json
// WRONG - if "Hallo" is correct (3rd option)
"options": ["Tschüss", "Danke", "Hallo"],
"correctAnswerIndex": 3  // ❌ Index 3 doesn't exist!

// RIGHT
"correctAnswerIndex": 2  // ✅ "Hallo" is at index 2
```

---

### Mistake 2: Mismatched correctOrder array

`correctOrder` contains indices pointing to `words` array:

```json
// Words array: ["Anna", "bin", "Ich"]
// Indices:       0       1      2

// To make "Ich bin Anna", we need words[2], words[1], words[0]
"correctOrder": [2, 1, 0]  // ✅ Correct

// NOT the final position of each word
"correctOrder": [2, 1, 0]  // Means: position 0 = words[2], position 1 = words[1], etc.
```

---

### Mistake 3: Matching pairs ID mismatch

IDs in `correctPairs` must match IDs in `items` and `matches`:

```json
"items": [
  { "id": "i1", "text": "Hallo" },
  { "id": "i2", "text": "Tschüss" }
],
"matches": [
  { "id": "m1", "text": "سلام" },
  { "id": "m2", "text": "خداحافظ" }
],
"correctPairs": [
  ["i1", "m1"],  // ✅ i1 exists, m1 exists
  ["i2", "m2"]   // ✅ i2 exists, m2 exists
]
```

---

### Mistake 4: Empty rapid-fire questions

All fields required in rapid-fire questions:

```json
// WRONG - missing correctSide
{ "prompt": "Hallo", "left": "خداحافظ", "right": "سلام" }

// RIGHT
{ "prompt": "Hallo", "left": "خداحافظ", "right": "سلام", "correctSide": "right" }
```

---

### Mistake 5: Dialog without bilingual text

Every line needs both `de` and `fa`:

```json
// WRONG
"lines": [
  { "speaker": "Max", "text": "Hallo!" }
]

// RIGHT
"lines": [
  { "speaker": "Max", "text": { "de": "Hallo!", "fa": "سلام!" } }
]
```

---

## VALIDATION RULES (29 Total)

Run with: `node scripts/validate-lesson.js <file>`

| Category | Rules |
|----------|-------|
| **Schema** | has-required-fields, title-bilingual, steps-not-empty, steps-have-ids, steps-have-types, ends-with-completion |
| **New Word** | new-word-has-translations |
| **MCQ** | mcq-has-options, mcq-correct-index-valid, mcq-answer-distribution, mcq-no-meta-answers |
| **Fill-blank** | fill-blank-has-options, fill-blank-no-synonym-traps, fill-blank-correct-answers-valid |
| **Word Order** | word-order-scrambled |
| **Matching** | matching-has-pairs, matching-pairs-valid, matching-no-duplicate-meanings |
| **Dialog** | dialog-has-lines, dialog-lines-bilingual |
| **Games** | rapid-fire-questions-valid, rapid-fire-balance, memory-match-pairs-valid, vocab-check-words-valid, game-steps-present |
| **Translation** | translation-correct-answers-valid |
| **Completion** | completion-has-vocab |
| **Quality** | no-undefined-values, no-tts-unfriendly-chars |

---

## VALIDATION COMMANDS

### Validate a lesson (MANDATORY)
```bash
node scripts/validate-lesson.js content/de-fa/A1/module-01/A1-M01-L01.json
```

### Check JSON syntax
```bash
cat content/de-fa/A1/module-01/A1-M01-L01.json | jq
```

### Run TypeScript check
```bash
pnpm run check
```

### Test in browser
```bash
pnpm run dev
# Navigate to http://localhost:5173/learn/de-fa/A1/A1-M01-L01
```

### Generate audio
```bash
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --lesson=A1-M01-L01
```

---

## TROUBLESHOOTING

### Google TTS Abbreviation Expansion (FIXED)

**Problem**: Google TTS expands short words as abbreviations:
- "Max" → "maximal"
- "Jan" → "Januar"
- "Dr" → "Doktor"

**Solution**: The `generate-audio.js` script uses SSML with `<sub>` tags to protect these words.

**If you find a new word being expanded**:
1. Add it to `PROTECTED_WORDS` in `scripts/generate-audio.js`
2. Regenerate audio with `--force`

```javascript
const PROTECTED_WORDS = [
  'Max', 'max',    // Name, not "maximal"
  'Jan', 'jan',    // Name, not "Januar"
  'ja', 'Ja',      // "yes" - don't expand
  'ok', 'OK',      // Keep as-is
  // Add new words here
];
```

---

### Google TTS Pronunciation Issues (FIXED)

**Problem**: Google TTS mispronounces certain words:
- "Hallo" → sounds like "Aalo" (H dropped)
- "Hi" → may sound wrong

**Solution**: The `generate-audio.js` script uses SSML `<phoneme>` tags with IPA for exact pronunciation.

**If you find a word being mispronounced**:
1. Add it to `PRONUNCIATION_FIXES` in `scripts/generate-audio.js`
2. Use IPA notation (see: https://en.wikipedia.org/wiki/Help:IPA/Standard_German)
3. Regenerate audio with `--force`

```javascript
const PRONUNCIATION_FIXES = {
  'Hallo': 'haloː',    // Ensure H is pronounced
  'hallo': 'haloː',
  'Hi': 'haɪ',         // English-style "hi"
  'hi': 'haɪ',
  // Add new words here with IPA pronunciation
};
```

**Common IPA for German**:
- `h` = H sound (as in "Hallo")
- `aː` = long A (as in "Tag")
- `oː` = long O (as in "Hallo")
- `aɪ` = "ai" diphthong (as in English "hi")

---

### "Step type X not found"
- Check `type` field matches exactly (case-sensitive)
- Valid types: `new-word`, `grammar-tip`, `multiple-choice`, etc.

### Persian text displaying wrong direction
- Check BiDi rule: first word must be Persian
- Wrap in `<span dir="rtl">` if needed in edge cases

### Audio not playing
- Run audio generation script
- Check file exists in `apps/web/static/audio/{lessonId}/`
- Verify manifest.json was generated

### Game step not rendering
- Game types: `rapid-fire`, `memory-match`, `word-hunt`, `speed-challenge`, `vocab-check`
- Check all required fields are present
- Verify array has minimum items (e.g., pairs need 2-8)

### TypeScript errors after editing lesson
- Usually missing required field or wrong type
- Run `pnpm run check` for specific error location
- Common: forgot `fa` translation, wrong index type

---

## QUICK CHECKLIST

Before saving a lesson:

- [ ] All `de` text has corresponding `fa` translation
- [ ] Names are from OUR list (Eli, Tom, Lisa, Alex, etc.)
- [ ] BiDi rule followed for mixed text
- [ ] Game steps inserted every 5-7 steps
- [ ] `completion` step is last
- [ ] All indices are 0-based
- [ ] No TTS-unfriendly chars (–, —, →) in German text
- [ ] JSON validates (no syntax errors)
- [ ] Tested in browser
