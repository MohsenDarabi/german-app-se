# Multimedia Tasks Workflow

> How to create task files for your colleague who makes images/videos

---

## Overview

After creating a lesson, generate a task file listing all images and videos needed. Your colleague will create these assets.

**Reference**: See `references/rules-and-tips.md` for content quality rules.

---

## When to Create Tasks

Create multimedia tasks for these step types:

| Step Type | Needs Image? | Needs Video? | Notes |
|-----------|--------------|--------------|-------|
| `dialog` | ✅ Yes | Optional | Scene for conversation |
| `new-word` | ✅ Optional | No | For concrete nouns only |
| `grammar-tip` | Optional | No | Only for complex diagrams |
| `comprehension` | ✅ Yes | Optional | Context for passage |

**Skip these** (text-only, no multimedia needed):
- `multiple-choice`
- `fill-in-blank`
- `word-order`
- `true-false`
- `translation`
- `spelling`
- `matching`
- Game steps (`rapid-fire`, `memory-match`, `vocab-check`, etc.)
- `completion`

---

## Task File Structure

### Location
```
ai-workspace/progress/multimedia-tasks/{LessonID}.json
```

### Format
```json
{
  "lessonId": "A1-M01-L01",
  "lessonTitle": {
    "de": "Hallo! Ich bin...",
    "fa": "سلام! من هستم..."
  },
  "createdAt": "2026-01-02",
  "tasks": [
    {
      "id": "img-01",
      "type": "image",
      "stepId": "s19",
      "stepType": "dialog",
      "description": "Detailed description of what to create...",
      "context": "How this is used in the lesson",
      "specs": {
        "dimensions": "800x600",
        "format": "jpg"
      },
      "outputPath": "apps/web/static/images/shared/{category}/{filename}.jpg",
      "status": "pending"
    }
  ],
  "summary": {
    "totalTasks": 5,
    "images": 4,
    "videos": 1
  }
}
```

---

## Writing Good Descriptions

### For Images

Include:
- **Who**: People in the scene (age, appearance, clothing)
- **What**: Action happening
- **Where**: Setting/environment
- **Mood**: Atmosphere (formal, casual, friendly)

Example:
```
"Two business professionals (man in suit, 40s, and woman in
professional attire, 30s) shaking hands in a modern office lobby.
Formal atmosphere, both smiling politely. Glass walls and
reception desk visible in background."
```

### For Videos

Include:
- **Scene**: Setting description
- **Dialog**: Exact words to be spoken (German)
- **Actions**: Body language, gestures
- **Duration**: 15-20 seconds typical

Example:
```
"Office meeting room. Herr Schmidt enters and greets Frau Ahmadi.
Dialog: 'Guten Tag! Mein Name ist Schmidt.' - 'Guten Tag, Herr
Schmidt. Ich heiße Ahmadi.' Handshake, professional distance.
Duration: 15-20 seconds."
```

---

## Output Paths

### Images
```
images/shared/{category}/{descriptive-name}.jpg
```

**Full path**: `apps/web/static/images/shared/{category}/{filename}`

**Image Categories** (standardized):
| Category | Use For |
|----------|---------|
| `greetings/` | Hello, goodbye, waving |
| `introductions/` | Handshakes, first meetings |
| `expressions/` | Thank you, please, emotions |
| `scenes/` | Cafe, office, street, public places |
| `people/` | Individual portraits |
| `family/` | Family members, relationships |
| `food/` | Food, drinks, restaurants |
| `places/` | Buildings, locations |
| `transport/` | Cars, trains, buses, stations |
| `professions/` | Jobs, workplaces |
| `daily-life/` | Everyday activities |
| `weather/` | Weather conditions |
| `hobbies/` | Sports, leisure activities |
| `furniture/` | Home items, rooms |

### Videos
```
videos/shared/{category}/{descriptive-name}.mp4
```

**Full path**: `apps/web/static/videos/shared/{category}/{filename}`

**Video Categories**:
| Category | Use For |
|----------|---------|
| `pronunciation/` | Word pronunciation demos |
| `conversations/` | Dialog videos |
| `culture/` | Cultural context clips |
| `grammar/` | Grammar explanation visuals |

---

## Reusability

**Think reusable!** Same image can be used in multiple lessons.

Before creating a new task, check:
1. Does a similar asset already exist?
2. Can this asset be used in future lessons?

Use generic names when possible:
```
GOOD: office-handshake-formal.jpg (reusable)
BAD:  a1-m01-l01-step19.jpg (lesson-specific)
```

---

## Update Progress

After creating task file:

1. Add to `progress/multimedia-pending.json`:
```json
{
  "pendingTasks": [
    {
      "lessonId": "A1-M01-L01",
      "taskFile": "multimedia-tasks/A1-M01-L01.json",
      "images": 5,
      "videos": 2,
      "createdAt": "2026-01-02"
    }
  ]
}
```

2. Update `STATUS.md` multimedia section

---

## Colleague Workflow

Your colleague will:
1. Check `progress/multimedia-pending.json` for new tasks
2. Open the task JSON file
3. Create each asset following the description
4. Save to the specified `outputPath`
5. Update task `status` from `"pending"` to `"completed"`
6. Notify when batch is done

---

## Checklist

- [ ] Task file created for lesson
- [ ] All dialog steps have image + video tasks
- [ ] Grammar tips have diagram tasks
- [ ] Descriptions are detailed and clear
- [ ] Output paths use correct categories
- [ ] Considered reusability
- [ ] Added to `multimedia-pending.json`
- [ ] Updated `STATUS.md`
