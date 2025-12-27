# ST-19: Review Dashboard

> **PASS-THROUGH** - Review/spaced repetition dashboard. Skip in crawler.

## Screenshots
- `ST-19/a-review-dashboard.png` - Review page with Checkpoint and chapters

## URL Pattern
```
https://www.busuu.com/dashboard/review
```

## Visual Elements

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  🧩 Checkpoint                                          │   │
│   │     Put your skills to the test                    ✓    │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  ✏️ [RECOMMENDED]                                       │   │
│   │     Review what you've learned                          │   │
│   │     Try our Vocabulary Review, powered by spaced        │   │
│   │     repetition, to check your progress & remember more. │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Chapter 2: Small Talk  ✓                               │   │
│   │  ████████████████████████████████████████████████ 100%  │   │
│   │                                                         │   │
│   │  👤 Asking how someone is                               │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Why Pass-Through

1. **Navigation page** - Not an exercise, just a dashboard
2. **Spaced repetition** - Busuu's review feature we don't replicate
3. **No new content** - Reviews previously learned material

## What to Do

**Crawler action:** Skip this URL entirely. Stay on lesson flow.

```javascript
// Detection by URL
const isReviewDashboard = window.location.pathname.includes('/dashboard/review');

if (isReviewDashboard) {
  console.log('Skipping review dashboard (pass-through)');
  // Navigate back to main lesson flow
}
```

## Content Observed (for reference)

| Section | Content |
|---------|---------|
| Checkpoint | Skills test |
| Review | Vocabulary spaced repetition |
| Chapters | Progress by chapter (e.g., "Small Talk 100%") |

## Known Issues
None - intentionally skipped.
