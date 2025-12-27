# ST-00: Timeline/Dashboard

> The main navigation page showing all chapters and lessons for a level.

## Screenshots
- `ST-00/a-timeline-b2.png` - B2 level timeline with completed lessons

## URL Pattern
```
https://www.busuu.com/dashboard/timeline/{level}
```
Where `{level}` = `a1`, `a2`, `b1`, `b2`

## What This Screen Shows

- **Header**: Busuu logo, Learn/Review/Community/Courses tabs, user profile
- **Title**: "Complete German"
- **Level Selector**: Dropdown showing current level + progress % (e.g., "Upper Intermediate B2 · 50%")
- **Chapters**: Collapsible sections with:
  - Chapter title (e.g., "Chapter 1: Home sweet home")
  - Progress bar (green)
  - Lesson cards in vertical timeline

## Lesson Card Structure

Each lesson card shows:
- **Icon**: Circular image (topic illustration)
- **Completion indicator**: Green checkmark if completed
- **Title**: Lesson name (e.g., "Talking about alternative houses")
- **Description**: Subtitle text (e.g., "Find out about the growing tiny house trend")
- **Tags**: Special labels like "SPEAKING PRACTICE" (orange badge)

## User Action
- Click on a lesson card to start/continue that lesson
- Scroll to see more chapters/lessons
- Use level selector to switch levels

## Content to Extract

For the mapper, extract:
```json
{
  "level": "B2",
  "levelProgress": 50,
  "chapters": [
    {
      "index": 0,
      "title": "Chapter 1: Home sweet home",
      "lessons": [
        {
          "index": 0,
          "title": "Talking about alternative houses",
          "description": "Find out about the growing tiny house trend",
          "isCompleted": true,
          "isSpeakingPractice": false,
          "isLocked": false
        }
      ]
    }
  ]
}
```

## DOM Selectors (TO BE FILLED)

**Need from user:**
- Selector for lesson cards
- Selector for chapter containers
- Data attributes for completion status
- Data attributes for lesson ID

```html
<!-- Placeholder - need actual DOM inspection -->
```

## Detection Strategy

**Identify this screen by:**
1. URL contains `/dashboard/timeline/`
2. Presence of chapter containers with lesson cards
3. Level selector dropdown visible

## Current Extractor Behavior (Approach A)

From `scripts/busuu-extractor/extractor.js`:
- Uses `getLessons()` function (lines 944-1016)
- Scrolls page 30 times to load all lessons
- Selector: `[data-testid="lesson_card"]`
- Extracts: title, description, lock status, chapter

## Known Issues

- None reported for timeline page
- This is navigation only, not content extraction
