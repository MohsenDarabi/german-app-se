# "Fesselnde" Learning Content Design Plan (DRAFT)

**Status:** DRAFT - Work in Progress
**Goal:** Design captivating, gamified learning content that keeps users engaged
**Date:** 2025-12-31
**Business Model:** Hybrid (Ad-Supported Freemium + Subscription)

---

## Table of Contents

1. [Current State](#current-state)
2. [Design Philosophy](#design-philosophy)
3. [Business Model](#business-model)
4. [New Step Types](#new-step-types)
5. [Gamification Layer](#gamification-layer)
6. [Implementation Priority](#implementation-priority)
7. [Technical Notes](#technical-notes)
8. [Open Questions](#open-questions)

---

## Current State

### Existing Step Types in App (10 types)

| Type | Description |
|------|-------------|
| `new-word` | Vocabulary introduction |
| `multiple-choice` | Quiz with options |
| `fill-in-blank` | Complete sentence with blanks |
| `word-order` | Arrange scrambled words |
| `true-false` | Statement verification |
| `translation` | Translate with blanks |
| `dialog` | Conversation display |
| `grammar-tip` | Educational content |
| `matching` | Pair matching |
| `completion` | Lesson summary |

### Exercise Types from Busuu (14 types)

Reference: `scripts/screen-flow-mapper/output/`

- Flashcard, Fill-gap, Phrase-builder, MCQ, Matching
- True/False, Typing, Spelling, Word Completion
- Highlighter, Grammar Tip, Video Comprehension
- Feedback overlays, Conversation (community)

### Unique Types from Babbel (17 additional)

Reference: `scripts/babbel-crawler/` (if available)

- **Pronunciation:** listen-repeat, pronunciation-quiz, pronunciation-rule
- **Formality:** formal vs informal choice (Sie/Du)
- **Narrative:** story-intro, dialogue with turns
- **Response:** response-matching, response-choice
- **Audio:** listening-fill, listening-choose-said
- **Spelling:** letter-dictation, word-sorting

---

## Design Philosophy

### The "Fesselnd" (Captivating) Principles

1. **Immediate Feedback** - Every action gets instant response
2. **Variable Rewards** - Surprise elements keep users curious
3. **Progress Visibility** - Always show how far they've come
4. **Social Connection** - Competition and cooperation (Phase 2+)
5. **Narrative Context** - Story-driven learning (Phase 2+)
6. **Personalization** - Adapt to Persian speakers' needs
7. **Fun Mechanics** - Game-like interactions

---

## Business Model

### Model Type: Hybrid (Ad-Supported Freemium + Subscription)

Based on market research (Duolingo, Babbel, mobile games), a hybrid model outperforms single-model approaches by ~30% in ARPU.

### Content Access Tiers

```
┌─────────────────────────────────────────────────────────────────┐
│                    TIERED ACCESS MODEL                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🆓 AD-FREE         │  📺 WITH ADS        │  🔒 PREMIUM         │
│  (Trial)            │  (Monetized free)   │  (Subscription)     │
│                     │                     │                     │
│  First N lessons    │  Next N lessons     │  Remaining lessons  │
│  Zero friction      │  Rewarded + banner  │  Full access        │
│                     │                     │                     │
└─────────────────────────────────────────────────────────────────┘
```

### Content Distribution by Level

| Level | Total | 🆓 Ad-Free | 📺 With Ads | 🔒 Premium | Free % |
|-------|-------|-----------|-------------|------------|--------|
| **A1** | 18 | 3 | 3 | 12 | 33% |
| **A2** | 12 | 2 | 2 | 8 | 33% |
| **B1** | ~15 | 1 | 1 | ~13 | 13% |
| **B2** | ~15 | 1 | 1 | ~13 | 13% |

**Total free content:** 14 lessons (7 ad-free + 7 with ads)

### Visual Representation

```
A1  [🆓][🆓][🆓][📺][📺][📺][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒]
     \_________/\__________/\________________________________________/
       3 free    3 with ads              12 premium

A2  [🆓][🆓][📺][📺][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒]
     \____/\____/\________________________________/
     2 free 2 ads           8 premium

B1  [🆓][📺][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒]
      ↑   ↑  \______________________________________________/
    free ad                  13 premium

B2  [🆓][📺][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒][🔒]
      ↑   ↑  \______________________________________________/
    free ad                  13 premium
```

### Pricing

| Plan | Price | Savings | Features |
|------|-------|---------|----------|
| **Monthly** | €4.99/mo | - | Full access, ad-free, all premium features |
| **Annual** | €49.99/yr | ~17% (~2 months free) | Same + best value |

### Premium Features

| Feature | Free | Premium |
|---------|------|---------|
| A1 lessons 1-6 | ✅ | ✅ |
| A2-B2 preview lessons | ✅ | ✅ |
| All remaining lessons | ❌ | ✅ |
| Ad-free experience | ❌ | ✅ |
| Offline mode | ❌ | ✅ |
| Streak freeze (2/month) | ❌ | ✅ |
| Spaced repetition review | ❌ | ✅ |
| Pronunciation feedback | ❌ | ✅ |
| Priority support | ❌ | ✅ |

### Ad Strategy

| Ad Type | Placement | User Experience |
|---------|-----------|-----------------|
| **Rewarded video** | "Watch ad for hint" | User chooses, gets value |
| **Interstitial** | Between lessons | Natural break point |
| **Banner** | Bottom of screen | Non-intrusive |

**Key principle:** Ads should nudge toward subscription, not frustrate users away.

### Revenue Model Projection (Example)

| Metric | Value |
|--------|-------|
| Monthly Active Users | 10,000 |
| Free users (92%) | 9,200 |
| Ad revenue (~€0.30/user/mo) | €2,760 |
| Premium subscribers (8%) | 800 |
| Subscription revenue | €3,992 |
| **Total monthly revenue** | **~€6,750** |

### Why This Model?

1. **Generous free tier** - More than Babbel (1 lesson), builds trust
2. **Ads monetize non-payers** - 90%+ of users never pay, still generate revenue
3. **Content lock creates urgency** - Users invested in A1 want to continue
4. **Competitive pricing** - €4.99 undercuts Duolingo (€8.99) and Babbel (€12.99)
5. **Persian niche** - No real competitor for German→Persian

### Future Considerations (Phase 2+)

- Family plan (€7.99/mo for up to 4 users)
- Lifetime purchase option (€149.99 one-time)
- In-app purchases (hint packs, streak freezes for free users)
- B2B/institutional licensing

---

## New Step Types

### Category A: Gamified Exercises (High Engagement)

#### 1. `speed-challenge`
Timed vocabulary sprint - answer as many as possible in 60 seconds

- Countdown timer visible
- Quick-fire MCQ or type-answer
- Combo multiplier for consecutive correct answers
- "Personal best" tracking
- Sound effects for correct/wrong

**Why engaging:** Competition with yourself, adrenaline rush

#### 2. `word-hunt`
Find hidden German words in a letter grid (word search)

- Grid of letters (6x6 or 8x8)
- List of German words to find
- Words can be horizontal, vertical, diagonal
- Timer optional
- Hint system (reveal first letter)

**Why engaging:** Puzzle satisfaction, visual scanning fun

#### 3. `memory-match`
Classic memory game with German-Persian pairs

- Grid of face-down cards
- Flip two cards at a time
- Match German word with Persian translation
- Track number of attempts
- Optional timer for challenge mode

**Why engaging:** Classic game mechanic everyone knows

#### 4. `word-chain`
Build a chain where each word starts with the last letter of previous

- Given starting word: "Hund"
- User types word starting with "d": "danke"
- Chain continues: "danke" → "e..." → "essen"
- Vocabulary suggestions if stuck
- Longest chain = high score

**Why engaging:** Creative thinking, vocabulary exploration

#### 5. `rapid-fire`
Swipe-based quick decisions (Tinder-style)

- Card shows German word + 2 options
- Swipe left for option A, right for option B
- Very fast pace (2-3 seconds per card)
- Streak counter with fire animation
- Wrong answer breaks streak

**Why engaging:** Addictive swipe mechanic, streak motivation

---

### Category B: Pronunciation & Audio

#### 6. `listen-and-choose`
Hear audio, select what was said

- Play German audio clip
- Show 3-4 text options
- Select the matching text
- Optional: show Persian translation after
- Replay button available

**Why engaging:** Active listening, trains ear for German sounds

#### 7. `pronunciation-challenge`
Practice German sounds (using Web Speech API - FREE)

- Show German word/phrase
- Play native pronunciation
- User records their attempt
- Speech recognition scores similarity
- Feedback on specific sounds (ü, ö, ä, ch, sch)

**Technical Note:** Uses browser's Web Speech API (free, no backend needed)

**Why engaging:** Speaking practice, instant feedback

#### 8. `sound-sort`
Categorize words by sound patterns

- Words appear one by one
- Drag to buckets: "long vowel" vs "short vowel"
- Or: "ch like Bach" vs "ch like ich"
- Audio plays for each word
- Teaches German phonetics explicitly

**Why engaging:** Pattern recognition, auditory learning

---

### Category C: Cultural & Contextual (Persian-Specific)

#### 9. `formality-choice`
Choose Sie (formal) or Du (informal) for situations

- Scenario description in Persian
- "You meet your friend's grandmother"
- Choose: "Wie geht es Ihnen?" vs "Wie geht's?"
- Explains why (cultural context)
- Critical for Persian speakers (similar to شما/تو)

**Why engaging:** Real-world relevance, cultural learning

#### 10. `culture-tip`
Interactive cultural comparison cards

- German cultural fact
- Comparison with Persian/Iranian culture
- Mini-quiz: "True or False?"
- Example: "Germans are direct. In Iran, ta'arof is common."
- Visual illustrations

**Why engaging:** Cultural curiosity, relatable comparisons

#### 11. `scenario-choice`
Choose appropriate response in German situation

- Story setup: "You're at a German bakery..."
- Multiple German responses to choose from
- Evaluates appropriateness, not just grammar
- Teaches pragmatics (politeness, directness)

**Why engaging:** Immersive roleplay, practical skills

---

### Category D: Advanced Grammar Games

#### 12. `case-detective`
Identify the correct case (Nominativ/Akkusativ/Dativ)

- Sentence with highlighted noun phrase
- Choose: Nominativ / Akkusativ / Dativ / Genitiv
- Explanation shows why
- Visual case table reference
- Progressive difficulty

**Why engaging:** Gamifies hardest German concept for Persians

#### 13. `article-attack`
Fast-paced article selection game

- Nouns fly across screen
- Tap correct article: der / die / das
- Score points for speed + accuracy
- Lives system (3 mistakes = game over)
- Leaderboard (future)

**Why engaging:** Arcade-style action, drilling articles

#### 14. `verb-conjugator`
Conjugation wheel spinner

- Show infinitive: "sprechen"
- Spin wheel lands on: "ihr"
- User types: "sprecht"
- Instant feedback
- Covers regular and irregular verbs

**Why engaging:** Unpredictable element, verb mastery

---

### Category E: Story & Narrative (Phase 2+)

#### 15. `story-episode`
Episodic story with language learning integrated

- Continuing story about characters in Germany
- Persian narration with German dialogue
- User makes choices that affect story
- Vocabulary from story added to review
- Cliffhangers encourage return

**Why engaging:** Narrative investment, curiosity about what's next

#### 16. `chat-simulator`
Simulated WhatsApp-style conversation

- German "friend" sends messages
- User selects from response options
- Conversation branches based on choices
- Teaches informal written German
- Emojis and casual language

**Why engaging:** Realistic, relatable format

---

### Category F: Review & Retention

#### 17. `vocab-check`
In-lesson vocabulary self-assessment with difficulty rating

- Shows words from the current lesson
- Difficulty rating after each (Easy/Medium/Hard)
- Mastery score calculation
- Visual progress through flashcards
- Tip to practice hard words more

**Why engaging:** Self-assessment, visible mastery score

#### 18. `mistake-replay`
Practice words you got wrong

- Collects errors from all exercises
- Presents them in focused review
- Different exercise formats for variety
- "Clear your mistakes" goal
- Celebration when all cleared

**Why engaging:** Targeted improvement, completion satisfaction

---

## Gamification Layer

### Points & XP System
- Every correct answer = base XP
- Streaks multiply XP
- Daily bonus for first lesson
- Level up with thresholds (A1.1 → A1.2 → etc.)

### Streak System
- Daily streak counter
- Streak freeze (premium feature)
- Weekly streak milestone rewards
- Visual flame animation

### Achievements/Badges
- First lesson completed
- 7-day streak
- 100 words learned
- Perfect score on lesson
- Night owl (study after 10pm)
- Early bird (study before 7am)

### Leaderboards (Phase 2+)
- Weekly top learners
- Friends leaderboard
- Country leaderboard (Iran, Afghanistan, etc.)

---

## Implementation Priority

### Phase 1: Quick Wins (1-2 days each)

| Priority | Type | Effort | Notes |
|----------|------|--------|-------|
| 1 | `speed-challenge` | 1-2 days | Uses existing MCQ, adds timer |
| 2 | `listen-and-choose` | 1-2 days | Simple audio + MCQ |
| 3 | `formality-choice` | 1 day | Binary choice with context |
| 4 | `memory-match` | 2 days | Classic mechanic |

### Phase 2: Medium Effort (3-5 days each)

| Priority | Type | Effort | Notes |
|----------|------|--------|-------|
| 5 | `word-hunt` | 3-4 days | Word search grid |
| 6 | `rapid-fire` | 3 days | Swipe interface |
| 7 | `chat-simulator` | 4-5 days | Conversation tree |
| 8 | `vocab-check` | 2 days | Flashcard self-assessment |

### Phase 3: Advanced (1 week+ each)

| Priority | Type | Effort | Notes |
|----------|------|--------|-------|
| 9 | `pronunciation-challenge` | 3-4 days | Web Speech API (FREE) |
| 10 | `story-episode` | Content-heavy | Needs story writing |
| 11 | `article-attack` | 1 week | Animation/game engine |
| 12 | `case-detective` | 1 week | Complex grammar logic |

---

## Technical Notes

### Files to Modify (App)

```
packages/content-model/src/index.ts     # Add new step schemas
apps/web/src/lib/components/lesson/
  ├── steps/                            # New step components
  └── StepRenderer.svelte               # Register new types
apps/web/src/lib/stores/                # XP, streaks, achievements
apps/web/src/lib/db.ts                  # IndexedDB tables
content/de-fa/                          # Add new step types to lessons
```

### Speech Recognition (Pronunciation)

**Option: Web Speech API (Browser Built-in)**
- Cost: FREE
- Accuracy: Medium (varies by browser)
- Implementation: Simple, 1-2 days
- Works offline, no backend needed

```javascript
const recognition = new webkitSpeechRecognition();
recognition.lang = 'de-DE';
recognition.onresult = (event) => {
  const spoken = event.results[0][0].transcript;
  const confidence = event.results[0][0].confidence;
  // Compare with expected word
};
```

**Future Premium Option:** Google Cloud Speech-to-Text ($0.006/15 sec)

---

## Open Questions

### Answered ✅

1. ~~**Business Model:**~~ → Hybrid (Ad-supported freemium + subscription)
2. ~~**Pricing:**~~ → €4.99/mo or €49.99/year
3. ~~**Free tier structure:**~~ → Tiered by level (A1: 3+3, A2: 2+2, B1/B2: 1+1)
4. ~~**Premium features:**~~ → Ad-free, offline, streak freeze, pronunciation, spaced review

### Still Open 🔄

1. **Pronunciation tech:** Web Speech API (free, simple) vs Whisper Backend (free, complex, accurate)?
   - Decision: Start with Web Speech API, upgrade to Whisper later (see todo)
2. **Leaderboards:** Defer to Phase 2+ (requires backend)?
3. **Story content:** Defer to Phase 2+ (content-heavy)?
4. **Ad network:** Which ad provider? (AdMob, Facebook Audience Network, etc.)

---

## Related Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Busuu Content Analysis | `docs/busuu-content-analysis.md` | CEFR coverage analysis |
| Busuu Extracted Data | `scripts/screen-flow-mapper/output/` | Raw extracted content |
| Babbel Crawler | `scripts/babbel-crawler/` | Babbel content extraction |
| Content Model | `packages/content-model/` | Zod schemas |
| App Components | `apps/web/src/lib/components/lesson/` | UI implementation |

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-31 | Added Business Model section (hybrid freemium + subscription) |
| 2025-12-31 | Defined pricing: €4.99/mo, €49.99/year |
| 2025-12-31 | Defined free tier structure (A1: 3+3, A2: 2+2, B1/B2: 1+1) |
| 2025-12-31 | Updated Open Questions (4 answered, 4 remaining) |
| 2025-12-31 | Implemented `speed-challenge` step type |
| 2025-12-31 | Implemented `listen-and-choose` step type with auto-play |
| 2025-12-31 | Implemented `formality-choice` step type for Sie/Du learning |
| 2025-12-31 | Implemented `memory-match` step type (card flip game) |
| 2025-12-30 | Initial draft created |

---

## Implementation Notes

### Test Lessons & URLs

| Step Type | Test Lesson ID | URL (dev) |
|-----------|---------------|-----------|
| `speed-challenge` | `A1-M01-L-TEST-SPEED` | `http://localhost:5173/learn/de-fa/A1/A1-M01-L-TEST-SPEED` |
| `listen-and-choose` | `A1-M01-L-TEST-LISTEN` | `http://localhost:5173/learn/de-fa/A1/A1-M01-L-TEST-LISTEN` |
| `formality-choice` | `A1-M01-L-TEST-FORMALITY` | `http://localhost:5173/learn/de-fa/A1/A1-M01-L-TEST-FORMALITY` |
| `memory-match` | `A1-M01-L-TEST-MEMORY` | `http://localhost:5173/learn/de-fa/A1/A1-M01-L-TEST-MEMORY` |

**Note:** Port may vary (5173, 5174, etc.) depending on available ports.

### Lesson File Naming Convention

Lesson files MUST be named to match their `id` field:
- File: `content/de-fa/A1/module-01/A1-M01-L-TEST-SPEED.json`
- JSON: `{ "id": "A1-M01-L-TEST-SPEED", ... }`

The lesson loader (`+page.server.ts`) searches for `{lessonId}.json` in `module-*` directories.

### Key Fixes & Gotchas

#### 1. Dual Content Model Issue
There are TWO copies of the content model schema:
- `packages/content-model/src/index.ts` (shared package)
- `apps/web/src/lib/content-model/index.ts` (actually used by web app!)

**Fix:** Always update BOTH files when adding new step types.

#### 2. Svelte Reactive Auto-Play
Auto-playing audio on step change requires careful handling:
- Use `currentStepId` tracking to prevent duplicate initialization
- Clear pending timers with `clearTimeout` before setting new ones
- Verify step hasn't changed before playing: `if (currentStepId === stepId)`
- Use `onDestroy` to cleanup timers and stop audio

Example pattern (ListenAndChooseStep.svelte):
```javascript
let currentStepId = '';
let autoPlayTimer: ReturnType<typeof setTimeout> | null = null;

function initStep(stepId: string) {
  if (currentStepId === stepId) return; // Prevent duplicate
  currentStepId = stepId;

  if (autoPlayTimer) clearTimeout(autoPlayTimer);

  if (step.autoPlay && mounted) {
    autoPlayTimer = setTimeout(() => {
      if (!isAnswered && currentStepId === stepId) {
        playAudio();
      }
    }, 600);
  }
}
```

#### 3. Audio Utility
`playGerman(text, lessonId)` falls back to browser TTS if no `audioId` provided.
For pre-generated audio, use: `playGerman(text, lessonId, audioId)`

#### 4. Memory Games Don't Use Review System
Memory-match step type does NOT dispatch wrong answers to the review system because:
- Review format (Q: question, A: user answer vs correct answer) doesn't fit memory games
- Memory games track "attempts" and "matched pairs" which don't map to Q&A review
- Users must complete all pairs to continue; timeout requires retry

Implementation: `MemoryMatchStep.svelte` only dispatches on `completeGame()`, never on timeout or partial progress.

#### 5. Formality-Choice Review Integration
For Sie/Du exercises, store the actual German text in review (not "formal"/"informal"):
- `userAnswer`: The German phrase the user selected
- `correctAnswer`: The correct German phrase
- `question`: The scenario context (e.g., "شما در یک مصاحبه کاری هستید...")

### Files Modified (Phase 1)

| File | Changes |
|------|---------|
| `apps/web/src/lib/content-model/index.ts` | Added SpeedChallengeStepSchema, ListenAndChooseStepSchema, FormalityChoiceStepSchema, MemoryMatchStepSchema |
| `apps/web/src/lib/components/lesson/StepRenderer.svelte` | Registered new step types |
| `apps/web/src/lib/components/lesson/steps/SpeedChallengeStep.svelte` | New component |
| `apps/web/src/lib/components/lesson/steps/ListenAndChooseStep.svelte` | New component |
| `apps/web/src/lib/components/lesson/steps/FormalityChoiceStep.svelte` | New component (Sie/Du choice) |
| `apps/web/src/lib/components/lesson/steps/MemoryMatchStep.svelte` | New component (card flip game) |
| `apps/web/src/lib/components/lesson/steps/CompletionStep.svelte` | New component |
| `apps/web/src/routes/learn/[pair]/[level]/[lessonId]/+page.svelte` | Added formality-choice to getQuestionText() |
