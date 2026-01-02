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
| Copy Anna/Tom from Babbel | Use Lena, Max, Felix, Sophie |
| Copy exact dialogs | Rewrite with same structure |
| Copy exact sentences | Create original examples |

**Name Replacement Table:**

| Source Name | Replace With |
|-------------|--------------|
| Anna (Babbel) | Lena, Sophie, Emma, Hannah |
| Tom (Babbel) | Max, Felix, Leon, Paul |
| Maria | Mia, Lea, Lisa, Laura |
| Peter | Jonas, Tim, Finn, Ben |

**Persian character names** (for learner role):
- Amir, Sara, Maryam, Ali, Neda, Reza

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

### Rule 4: Game Steps Every 5-7 Steps

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

## VALIDATION COMMANDS

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
- [ ] Names are from OUR list (Max, Lena, etc.)
- [ ] BiDi rule followed for mixed text
- [ ] Game steps inserted every 5-7 steps
- [ ] `completion` step is last
- [ ] All indices are 0-based
- [ ] JSON validates (no syntax errors)
- [ ] Tested in browser
