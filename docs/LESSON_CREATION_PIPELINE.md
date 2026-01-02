# Lesson Creation Pipeline

> **Owner:** AI Agent (Claude)
> **Human Role:** Review & create multimedia assets

---

## Pipeline Steps (AI Agent Executes ALL)

### Step 1: Source Content Analysis
```bash
# Check available Babbel content
ls scripts/babbel-extractor/output/{Level}/unit-*/

# Check available Busuu content
ls scripts/screen-flow-mapper/output/{Level}/chapter-*/
```

### Step 2: Create Lesson JSON
- Merge vocabulary from Babbel + Busuu sources
- Add Persian translations for ALL German text
- Add grammar tips specific to Persian speakers
- Insert games every 5-7 steps (rapid-fire, memory-match, vocab-check)
- End with completion step

**Output:** `content/de-fa/{Level}/module-{NN}/{LessonId}.json`

### Step 3: Validate Lesson (MANDATORY)
```bash
node scripts/validate-lesson.js content/de-fa/{Level}/module-{NN}/{LessonId}.json
```

**Must pass all 21 rules before proceeding:**
- Schema: required fields, IDs, types, completion
- Content: translations, options, answer distribution, pairs
- Quality: no undefined values, scrambled word-order

### Step 4: Fix Validation Errors
If validation fails:
1. Read error messages
2. Fix the lesson JSON
3. Re-run validation
4. Repeat until all 21 rules pass

### Step 5: Generate Multimedia Tasks
Create task file for colleague:
```
docs/multimedia-tasks/{Level}/{LessonId}-tasks.json
```

**Includes:**
- Image tasks for new-word steps
- Video tasks for dialog steps
- Detailed descriptions, context, specs
- Priority levels (high/medium/low)

### Step 6: Generate Audio
```bash
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --level={Level}
```

### Step 7: Update modules.ts
Add lesson entry to `apps/web/src/lib/data/modules.ts`:
```typescript
{
  id: "A1-M01-L01",
  title: "سلام و خداحافظی (Hallo und Tschüss)",
  description: "یاد بگیرید چطور سلام و خداحافظی کنید.",
  path: "/learn/de-fa/A1/A1-M01-L01"
}
```

### Step 8: Test in Browser
```bash
# Dev server should be running
open http://localhost:5173/learn/de-fa/{Level}/{LessonId}
```

Verify:
- [ ] Lesson loads without errors
- [ ] All step types render correctly
- [ ] Audio plays
- [ ] Games work (rapid-fire, memory-match, matching, etc.)

### Step 9: Commit
```bash
git add content/de-fa/{Level}/ docs/multimedia-tasks/{Level}/ apps/web/src/lib/data/modules.ts
git commit -m "feat: add lesson {LessonId} - {Title}"
```

---

## Validation Rules (21 Total)

| Category | Rules |
|----------|-------|
| **Schema** | has-required-fields, title-bilingual, steps-not-empty, steps-have-ids, steps-have-types, ends-with-completion |
| **New Word** | new-word-has-translations |
| **MCQ** | mcq-has-options, mcq-correct-index-valid, mcq-answer-distribution |
| **Fill-blank** | fill-blank-has-options |
| **Word Order** | word-order-scrambled |
| **Matching** | matching-has-pairs, matching-pairs-valid |
| **Dialog** | dialog-has-lines, dialog-lines-bilingual |
| **Games** | rapid-fire-questions-valid, memory-match-pairs-valid, vocab-check-words-valid |
| **Completion** | completion-has-vocab |
| **Quality** | no-undefined-values |

---

## Step Types Reference

### Core Learning Steps
| Type | Description |
|------|-------------|
| `new-word` | Vocabulary introduction |
| `grammar-tip` | Persian-specific grammar explanation |
| `multiple-choice` | Select correct answer |
| `fill-in-blank` | Complete sentence |
| `word-order` | Arrange words (must be scrambled) |
| `true-false` | Verify statement |
| `translation` | Translate sentence |
| `dialog` | Conversation with speakers |
| `spelling` | Spell a word letter by letter |
| `comprehension` | Read passage + answer questions |
| `matching` | Match German to Persian pairs |

### Game Steps (Insert every 5-7 steps)
| Type | When to Use |
|------|-------------|
| `rapid-fire` | After vocab introduction |
| `memory-match` | After matching exercises |
| `vocab-check` | Self-assessment before completion |
| `word-hunt` | Find words in grid (optional) |
| `speed-challenge` | End of module review |

### Meta Steps
| Type | Description |
|------|-------------|
| `completion` | End of lesson summary (REQUIRED as last step) |

---

## Common Mistakes to Avoid

1. **MCQ answers all at index 0** - Randomize correctAnswerIndex
2. **Word-order not scrambled** - words array must NOT be in correct order
3. **Missing Persian translations** - ALL German text needs fa translation
4. **Matching pairs with wrong IDs** - correctPairs must reference valid item/match IDs
5. **No games** - Insert games every 5-7 steps
6. **No completion step** - Must end with completion type
7. **Empty arrays** - options, items, matches, pairs must have content

---

## File Locations

| Content | Path |
|---------|------|
| Lesson JSON | `content/de-fa/{Level}/module-{NN}/{LessonId}.json` |
| Multimedia Tasks | `docs/multimedia-tasks/{Level}/{LessonId}-tasks.json` |
| Audio Files | `apps/web/static/audio/{LessonId}/` |
| Module Registry | `apps/web/src/lib/data/modules.ts` |
| Validation Script | `scripts/validate-lesson.js` |
| Audio Script | `scripts/generate-audio.js` |

---

## Lesson ID Format

```
{Level}-M{Module}-L{Lesson}

Examples:
- A1-M01-L01  (A1, Module 1, Lesson 1)
- A2-M03-L05  (A2, Module 3, Lesson 5)
- B1-M02-L03  (B1, Module 2, Lesson 3)
```
