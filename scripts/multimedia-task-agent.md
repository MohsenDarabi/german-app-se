# Multimedia Task Agent

> **Purpose:** Generate task files for colleague to create images and videos for lessons.

---

## Input

A completed lesson JSON from the Content Fusion Agent.

---

## Output

A multimedia task JSON file with image and video requests.

```json
{
  "lessonId": "A1-M01-L01",
  "lessonTitle": "Hallo und Tschüss",
  "generatedAt": "2026-01-02T12:00:00Z",
  "tasks": [
    // Image and video tasks
  ],
  "summary": {
    "totalImages": 5,
    "totalVideos": 1,
    "categories": ["greetings", "people"]
  }
}
```

---

## Task Types

### Image Task
```json
{
  "id": "img-001",
  "type": "image",
  "stepId": "s1",
  "stepType": "new-word",
  "germanText": "Hallo",
  "description": "Two friends greeting each other with a wave, casual setting, friendly smiles",
  "context": "Used for teaching the word 'Hallo' (hello) - informal greeting",
  "style": "Illustration or photo, warm and friendly",
  "specs": {
    "format": "jpg",
    "dimensions": "800x600",
    "aspectRatio": "4:3"
  },
  "outputPath": "images/shared/greetings/hallo.jpg",
  "reusable": true,
  "priority": "high"
}
```

### Video Task
```json
{
  "id": "vid-001",
  "type": "video",
  "stepId": "s16",
  "stepType": "dialog",
  "description": "Short video of two people meeting and greeting in a cafe",
  "context": "Dialog scene: Anna and Max meeting for the first time",
  "script": [
    { "speaker": "Anna", "text": "Hallo!" },
    { "speaker": "Max", "text": "Hi! Ich bin Max." }
  ],
  "specs": {
    "format": "mp4",
    "duration": "15-20 seconds",
    "dimensions": "1280x720"
  },
  "outputPath": "videos/shared/dialogs/cafe-meeting.mp4",
  "reusable": true,
  "priority": "medium"
}
```

---

## Categories for Shared Assets

Organize assets in `apps/web/static/images/shared/{category}/`:

| Category | Use For |
|----------|---------|
| `greetings/` | Hello, goodbye, thank you |
| `people/` | Portraits, groups, professions |
| `places/` | Cities, buildings, locations |
| `food/` | Food items, restaurants |
| `family/` | Family members, relationships |
| `work/` | Office, jobs, professions |
| `travel/` | Transport, hotels, airports |
| `shopping/` | Stores, products, prices |
| `numbers/` | Number illustrations |
| `culture/` | German cultural elements |

---

## Step Types Needing Visuals

### Always Need Image
- `new-word` - Illustrate the vocabulary word
- `dialog` - Scene illustration or character portraits

### Sometimes Need Image
- `grammar-tip` - If explaining concrete concept
- `comprehension` - Scene for the reading passage

### Need Video (Optional)
- `dialog` - If showing a conversation
- `new-word` - For pronunciation demonstration

---

## Guidelines for Descriptions

### Good Description
```
"Two young professionals shaking hands in a modern office lobby. 
One person is welcoming the other. Bright, professional setting.
Both wearing business casual clothing. Friendly expressions."
```

### Bad Description
```
"People saying hello"
```

### Include in Description
1. **Who** - Number of people, ages, appearance
2. **What** - Action being performed
3. **Where** - Setting/location
4. **Mood** - Emotional tone
5. **Style** - Photo vs illustration, color palette

---

## Reusability Rules

Mark `reusable: true` if asset can be used across multiple lessons:
- Generic greetings (Hallo, Tschüss)
- Common nouns (der Mann, die Frau)
- Places (cafe, office, street)

Mark `reusable: false` for lesson-specific content:
- Specific dialog scenes
- Unique cultural references

---

## Priority Levels

| Priority | Meaning |
|----------|---------|
| `high` | Required for lesson to work properly |
| `medium` | Enhances learning but not critical |
| `low` | Nice to have, can be added later |

---

## Example Task File

```json
{
  "lessonId": "A1-M01-L01",
  "lessonTitle": "Hallo und Tschüss",
  "generatedAt": "2026-01-02T12:00:00Z",
  "tasks": [
    {
      "id": "img-001",
      "type": "image",
      "stepId": "s1",
      "stepType": "new-word",
      "germanText": "Hallo",
      "description": "Two friends waving hello to each other on a sunny street. Casual clothing, friendly smiles, urban German setting with typical architecture in background.",
      "context": "Vocabulary card for 'Hallo' - the most common German greeting",
      "style": "Warm illustration or friendly photo, bright colors",
      "specs": {
        "format": "jpg",
        "dimensions": "800x600"
      },
      "outputPath": "images/shared/greetings/hallo.jpg",
      "reusable": true,
      "priority": "high"
    },
    {
      "id": "img-002",
      "type": "image",
      "stepId": "s3",
      "stepType": "new-word",
      "germanText": "Tschüss",
      "description": "Person waving goodbye at a train station platform. Other person visible in train window. Emotional but positive farewell scene.",
      "context": "Vocabulary card for 'Tschüss' - informal goodbye",
      "style": "Illustration, warm colors, slight motion blur for departing train",
      "specs": {
        "format": "jpg",
        "dimensions": "800x600"
      },
      "outputPath": "images/shared/greetings/tschuess.jpg",
      "reusable": true,
      "priority": "high"
    },
    {
      "id": "vid-001",
      "type": "video",
      "stepId": "s16",
      "stepType": "dialog",
      "description": "Two people meeting at a cafe entrance. Brief greeting exchange, then entering together.",
      "context": "Dialog: Anna and Max meeting for coffee",
      "script": [
        { "speaker": "Anna", "text": "Hallo!" },
        { "speaker": "Max", "text": "Hi! Ich bin Max. Und du?" },
        { "speaker": "Anna", "text": "Ich bin Anna. Freut mich!" }
      ],
      "specs": {
        "format": "mp4",
        "duration": "15-20 seconds",
        "dimensions": "1280x720"
      },
      "outputPath": "videos/shared/dialogs/cafe-greeting-a1m01.mp4",
      "reusable": false,
      "priority": "medium"
    }
  ],
  "summary": {
    "totalImages": 2,
    "totalVideos": 1,
    "categories": ["greetings", "dialogs"]
  }
}
```

---

## Prompt Template

```
Generate multimedia tasks for this lesson:

{lesson_json}

Create task file with:
1. Image for each new-word step (prioritize unique vocabulary)
2. Scene image for dialog steps
3. Video for main dialog (if 3+ lines)
4. Use shared categories where possible
5. Mark reusable assets appropriately
6. Include detailed descriptions for colleague
```

---

## Output Location

Save task files to:
```
docs/multimedia-tasks/{level}/{lessonId}-tasks.json
```

Example:
```
docs/multimedia-tasks/A1/A1-M01-L01-tasks.json
```
