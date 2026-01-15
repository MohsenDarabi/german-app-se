# Product Backlog

> Quick capture of ideas, improvements, and technical debt. Important items get converted to [GitHub Issues](https://github.com/MohsenDarabi/german-app-se/issues).

---

## How to Use

1. **Add ideas here** - Quick notes, no need for full detail
2. **Prioritize** - Move important items up, add 🔥 for urgent
3. **Convert to Issue** - When ready to work on something, create a GitHub Issue
4. **Link Issue** - Add `→ #123` to reference the created issue

---

## High Priority 🔥

### Data Safety & Backup
- [ ] **Database backup/recovery plan** → [#6](https://github.com/MohsenDarabi/german-app-se/issues/6)
  - Prevent user data loss during schema migrations
  - IndexedDB backup before risky operations
  - Supabase data recovery mechanism
  - Consider versioned exports for user data

---

## Features & Enhancements

### Multi-Language Support
- [ ] Add French (fr-fa) language pair
- [ ] Add Spanish (es-fa) language pair
- [ ] RTL language support for Arabic learners

### Content & Lessons
- [ ] More English lessons (currently only 1)
- [ ] Lesson difficulty indicators
- [ ] Estimated time per lesson

### Gamification
- [ ] Daily challenges
- [ ] Achievement badges
- [ ] Leaderboards (optional/social)

### Offline & Performance
- [ ] Better offline lesson caching
- [ ] Preload next lesson audio
- [ ] Reduce initial bundle size

---

## Technical Debt

- [ ] Unify `content/` and `apps/web/static/content/` (symlink or build step)
- [ ] Add E2E tests for critical user flows
- [ ] Add database migration tests
- [ ] Improve error handling in sync engine

---

## Ideas / Maybe Later

- [ ] Voice recording for pronunciation practice
- [ ] Spaced repetition algorithm improvements
- [ ] Social features (study groups)
- [ ] Native mobile app (Capacitor improvements)

---

## Completed ✅

_Move items here when done_

- [x] Multi-language support (de-fa, en-fa) - Jan 2026
- [x] Audio generation for multiple languages - Jan 2026
- [x] Asset sync across language pairs - Jan 2026
