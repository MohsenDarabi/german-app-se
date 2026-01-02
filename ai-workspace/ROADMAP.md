# Feature Roadmap

> Planned features and step types to implement

---

## Step Types Status

### Implemented

| Type | Description | Status |
|------|-------------|--------|
| `new-word` | Vocabulary introduction | Done |
| `multiple-choice` | Quiz with options | Done |
| `fill-in-blank` | Complete sentence | Done |
| `word-order` | Arrange scrambled words | Done |
| `true-false` | Statement verification | Done |
| `translation` | Translate with blanks | Done |
| `dialog` | Conversation display | Done |
| `grammar-tip` | Educational content | Done |
| `matching` | Pair matching | Done |
| `completion` | Lesson summary | Done |
| `speed-challenge` | Timed vocabulary sprint | Done |
| `listen-and-choose` | Audio + MCQ | Done |
| `formality-choice` | Sie/Du scenarios | Done |
| `memory-match` | Card flip game | Done |

### To Implement (Phase 2)

| Type | Description | Effort | Priority |
|------|-------------|--------|----------|
| `rapid-fire` | Swipe-based quick decisions | 3 days | High |
| `word-hunt` | Word search grid game | 3-4 days | High |
| `vocab-check` | In-lesson self-assessment | 2 days | Medium |
| `spelling` | Type the word letter by letter | 2 days | Medium |
| `comprehension` | Reading passage + questions | 3 days | Medium |

### To Implement (Phase 3)

| Type | Description | Effort | Notes |
|------|-------------|--------|-------|
| `pronunciation-challenge` | Speech recognition | 3-4 days | DEFERRED - Use Groq (free) or Azure (premium) |
| `story-episode` | Episodic narrative content | 1 week+ | Content-heavy |
| `chat-simulator` | WhatsApp-style conversation | 4-5 days | Conversation tree |
| `article-attack` | Arcade-style article game (der/die/das) | 1 week | Animation needed |
| `case-detective` | Identify Nominativ/Akkusativ/Dativ | 1 week | Complex grammar logic |
| `verb-conjugator` | Conjugation wheel spinner | 3-4 days | - |
| `sound-sort` | Categorize words by sound patterns | 3 days | Audio-heavy |
| `culture-tip` | Interactive cultural comparison cards | 2 days | - |
| `scenario-choice` | Choose appropriate response in situation | 3 days | - |

### Phase 4 (Future)

| Feature | Description |
|---------|-------------|
| AI Chatbot Assistant | Context-aware helper on lesson pages |
| Leaderboards | Weekly top learners |
| Badges/Achievements | Gamification rewards |
| Community Corrections | Native speaker feedback |

---

## App Features TODO

### High Priority

- [ ] **Practice Hub** (`/practice` route)
  - Practice Your Mistakes feature
  - Random drill mode
  - Cards due count display
  - Originally: LAN-13 from PROJECT_PLAN.md

- [ ] **Fix Language Switcher**
  - FA/DE/EN buttons exist but not functional
  - Originally: LAN-14

### Medium Priority

- [ ] **Offline Mode** (Premium feature)
- [ ] **Streak Freeze** (Premium feature)
- [ ] **Push Notifications**

### Low Priority (Phase 4+)

- [ ] **Speaking Practice** with recording
- [ ] **Drag-and-drop** sentence ordering
- [ ] **Community Features**

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

- `docs/plans/DRAFT-fesselnde-content-design.md` - Full business plan
- `docs/TODO-AUTH-BYPASS.md` - Auth bypass tracking
