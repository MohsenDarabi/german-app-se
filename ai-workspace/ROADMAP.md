# Feature Roadmap

> App features and content creation status

---

## Understanding the Two Layers

```
┌─────────────────────────────────────────────────────────────┐
│  APP CODE (already built)                                   │
│                                                             │
│  apps/web/src/lib/content-model/index.ts  ← Zod schemas     │
│  apps/web/src/lib/components/lesson/steps/*.svelte ← UI     │
│                                                             │
│  The "engine" that RENDERS step types                       │
└─────────────────────────────────────────────────────────────┘
                            ↑
                            │ reads JSON
                            │
┌─────────────────────────────────────────────────────────────┐
│  CONTENT (ai-workspace creates this)                        │
│                                                             │
│  content/de-fa/{level}/module-{nn}/{lessonId}.json         │
│                                                             │
│  Lesson DATA that uses those step types                     │
└─────────────────────────────────────────────────────────────┘
```

**ai-workspace = Content creation workflows**
**App code = Already has 20 step types ready to use**

---

## Step Types (All 20 Implemented in App)

The app code already supports these step types. Content creators just need to write JSON using them.

### Core Learning Steps

| Type | Description | Component |
|------|-------------|-----------|
| `new-word` | Vocabulary introduction with audio | `NewWordStep.svelte` |
| `grammar-tip` | Educational explanations | `GrammarTipStep.svelte` |
| `dialog` | Conversation display | `DialogStep.svelte` |
| `completion` | Lesson summary with vocab review | `CompletionStep.svelte` |

### Exercise Steps

| Type | Description | Component |
|------|-------------|-----------|
| `multiple-choice` | Quiz with 2-4 options | `WordQuizStep.svelte` |
| `fill-in-blank` | Complete sentence with blanks | `FillInBlankStep.svelte` |
| `word-order` | Arrange scrambled words | `WordOrderStep.svelte` |
| `true-false` | Statement verification | `TrueFalseStep.svelte` |
| `translation` | Translate with options | `TranslationStep.svelte` |
| `matching` | Pair matching (German ↔ Persian) | `MatchingStep.svelte` |
| `spelling` | Type word letter by letter | `SpellingStep.svelte` |
| `comprehension` | Reading passage + questions | `ComprehensionStep.svelte` |
| `listen-and-choose` | Audio + MCQ | `ListenAndChooseStep.svelte` |
| `formality-choice` | Sie/Du scenarios | `FormalityChoiceStep.svelte` |

### Game Steps

| Type | Description | Component |
|------|-------------|-----------|
| `speed-challenge` | Timed vocabulary sprint (60s) | `SpeedChallengeStep.svelte` |
| `rapid-fire` | Swipe left/right quick decisions | `RapidFireStep.svelte` |
| `memory-match` | Card flip matching game | `MemoryMatchStep.svelte` |
| `word-hunt` | Word search grid | `WordHuntStep.svelte` |
| `vocab-check` | Self-assessment with difficulty rating | `VocabCheckStep.svelte` |

### Special Steps

| Type | Description | Component | Status |
|------|-------------|-----------|--------|
| `chat-simulator` | WhatsApp-style conversation | `ChatSimulatorStep.svelte` | Disabled (future AI feature) |

---

## Content Creation Status

### What Exists

| Level | Lessons | Audio | Status |
|-------|---------|-------|--------|
| A1 | 1 (A1-M01-L01) | Generated | Needs more lessons |
| A2 | 0 | - | Not started |
| B1 | 0 | - | Not started |
| B2 | 0 | - | Not started |

### Content TODO

- [ ] Create A1 lessons using content fusion workflow
- [ ] Generate audio after each lesson
- [ ] Create multimedia tasks for colleague

See `ai-workspace/workflows/content-fusion.md` for the full workflow.

---

## App Features TODO

These require **new code** in the app, not just content.

### High Priority

- [ ] **Practice Hub** (`/practice` route)
  - Practice Your Mistakes feature
  - Random drill mode
  - Cards due count display

- [ ] **Fix Language Switcher**
  - FA/DE/EN buttons exist but not functional

### Medium Priority

- [ ] **Offline Mode** (Premium feature)
- [ ] **Streak Freeze** (Premium feature)
- [ ] **Push Notifications**

### Future App Features (Phase 3+)

| Feature | Description | Effort |
|---------|-------------|--------|
| `pronunciation-challenge` | Speech recognition scoring | Needs API (Groq/Azure) |
| `article-attack` | Arcade-style der/die/das game | Animation work |
| `case-detective` | Identify Nominativ/Akkusativ/Dativ | Grammar logic |
| `verb-conjugator` | Conjugation wheel spinner | UI work |
| AI Chatbot Assistant | Context-aware helper on lessons | API integration |
| Leaderboards | Weekly top learners | Backend work |
| Badges/Achievements | Gamification rewards | Backend work |

---

## Business Model Reference

From `docs/plans/DRAFT-fesselnde-content-design.md`:

| Plan | Price |
|------|-------|
| Monthly | €4.99/mo |
| Annual | €49.99/yr (~17% savings) |

### Free Tier Structure

| Level | Ad-Free | With Ads | Premium |
|-------|---------|----------|---------|
| A1 | 3 | 3 | 12 |
| A2 | 2 | 2 | 8 |
| B1 | 1 | 1 | ~13 |
| B2 | 1 | 1 | ~13 |

---

## Technical Debt

- [ ] Auth bypass (see `docs/TODO-AUTH-BYPASS.md`)
- [ ] Android APK launcher icon not visible
- [ ] Sync conflicts (last-write-wins may cause data loss)

---

## Related Documents

- `ai-workspace/workflows/content-fusion.md` - Lesson creation workflow
- `ai-workspace/references/step-types.md` - Step type JSON schemas
- `ai-workspace/references/rules-and-tips.md` - Content rules
- `docs/plans/DRAFT-fesselnde-content-design.md` - Full business plan
- `docs/TODO-AUTH-BYPASS.md` - Auth bypass tracking
