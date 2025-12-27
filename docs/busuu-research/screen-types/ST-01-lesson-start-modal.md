# ST-01: Lesson Start Modal

> Modal popup that appears when clicking on a lesson from the timeline.

## Screenshots
- `ST-01/a-lesson-start-modal.png` - Completed lesson with Review/Restart options

## When It Appears
- Click on any lesson card from the timeline (ST-00)
- Shows different buttons based on lesson completion status

## Visual Elements

```
┌─────────────────────────────────────┐
│ 📖 VOCABULARY              1 MIN    │  ← Lesson type + duration
├─────────────────────────────────────┤
│ Hallo!                              │  ← Lesson title
│ Learn to say hello and bye          │  ← Description
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │      Review skills          │    │  ← White button (completed only)
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │      Restart lesson         │    │  ← Blue button
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## Button Variations

| Lesson Status | Buttons Shown |
|---------------|---------------|
| Completed | "Review skills" + "Restart lesson" |
| In Progress | "Continue lesson" (+ maybe "Restart") |
| Not Started | "Start lesson" |

## Content to Extract

```json
{
  "lessonType": "VOCABULARY",
  "estimatedMinutes": 1,
  "title": "Hallo!",
  "description": "Learn to say hello and bye",
  "status": "completed",
  "availableActions": ["review", "restart"]
}
```

## DOM Selectors (TO BE FILLED)

**Need from user:**
- Modal container selector
- Lesson type badge selector
- Button selectors

```html
<!-- Placeholder - need actual DOM inspection -->
```

## Detection Strategy

**Identify this screen by:**
1. Modal overlay visible
2. Contains lesson type badge (VOCABULARY, GRAMMAR, etc.)
3. Has action buttons (Start/Continue/Restart/Review)

## User Action
- Click "Restart lesson" to start from beginning
- Click "Review skills" for quick review mode
- Click outside modal to close

## Known Issues
None reported - current extractor handles this modal correctly.
