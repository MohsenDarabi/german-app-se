# Multimedia Tasks for German Learning App

> Guide for creating images for the German learning app. **51 tasks** across **31 lessons**.

---

## Quick Start

1. Check `TASK-SUMMARY.md` for the full checklist
2. Open the JSON file for detailed specs (e.g., `A1-M01-L01.json`)
3. Create the image following the specs
4. Save to the output path
5. Update status in JSON file to `"completed"`

---

## Commands

```bash
# Check progress
node scripts/check-multimedia-tasks.js

# List next 10 pending tasks
node scripts/check-multimedia-tasks.js -p 10

# Validate all task files
node scripts/validate-multimedia-tasks.js

# Regenerate TASK-SUMMARY.md
node scripts/generate-task-summary.js
```

---

## Current Status

| Module | Topic | Tasks | High Priority |
|--------|-------|-------|---------------|
| Module 1 | Basics (Hallo, Zahlen) | 19 | 11 |
| Module 2 | Verben (sein, haben) | 5 | 5 |
| Module 3 | Verneinung (nicht, kein) | 6 | 4 |
| Module 4 | Artikel (der, die, das) | 4 | 4 |
| Module 5 | Fragen (W-Fragen) | 9 | 8 |
| Module 6 | Zeit (Uhrzeit, Tage) | 8 | 8 |
| **Total** | | **51** | **40** |

---

## File Structure

```
ai-workspace/progress/multimedia-tasks/
├── START-HERE.md          # This guide
├── TASK-SUMMARY.md        # Auto-generated checklist
├── A1-M01-L01.json        # Task specs for each lesson
├── A1-M01-L02.json
├── ...
└── A1-M06-L04.json

apps/web/static/images/shared/
├── greetings/             # Hello, goodbye, waves
├── expressions/           # Emotions, reactions
├── scenes/                # Dialog scenes
├── places/                # Countries, cities
├── daily-life/            # Activities
└── ...
```

---

## Image Specs

| Property | Requirement |
|----------|-------------|
| **Dimensions** | 800 x 600 pixels |
| **Format** | JPG (photos), PNG (transparency) |
| **File size** | < 200 KB |
| **Style** | Modern, friendly, diverse |

---

## Characters

Use these 4 characters consistently:

| Name | Age | Role | Description |
|------|-----|------|-------------|
| **Eli** | 43 | Teacher | German teacher, calm, supportive |
| **Tom** | 35-37 | Instructor | Language guide, reliable |
| **Lisa** | 18-20 | Student | Young, playful, energetic |
| **Alex** | 21-22 | Student | Adaptable, curious |

**Service roles** (no consistent visuals needed): Kellner, Verkäufer, Arzt

---

## Priority Levels

- 🔴 **High** - Dialog scenes (most visible to users)
- 🟡 **Medium** - Vocabulary illustrations
- 🟢 **Low** - Optional enhancements

**Focus on 🔴 High priority first!**

---

## How to Mark Complete

1. Open the task JSON file (e.g., `A1-M01-L01.json`)
2. Find the task by `id`
3. Change:
   ```json
   "status": "pending"
   ```
   to:
   ```json
   "status": "completed",
   "completedAt": "2026-01-07"
   ```

---

## Style Guidelines

### DO ✅
- Modern, contemporary German settings
- Diverse characters (age, ethnicity)
- Clear, well-lit scenes
- Friendly, approachable expressions
- Realistic proportions

### DON'T ❌
- Outdated or stereotypical imagery
- Overly busy backgrounds
- Dark or unclear lighting
- Exaggerated expressions
- Text overlays on images

---

## Output Paths

Save images to `apps/web/static/images/shared/{category}/`:

| Category | Content |
|----------|---------|
| `greetings/` | Hello, goodbye, waves |
| `expressions/` | Thank you, emotions, reactions |
| `scenes/` | Dialog scenes, cafe, street |
| `places/` | Countries, cities, landmarks |
| `daily-life/` | Everyday activities |
| `actions/` | Speaking, learning, working |
| `grammar/` | Visual grammar explanations |

---

## Task JSON Structure

Each task file contains:

```json
{
  "lessonId": "A1-M01-L01",
  "lessonTitle": { "de": "Hallo!", "fa": "سلام!" },
  "tasks": [
    {
      "id": "img-s14",
      "type": "image",
      "stepId": "s14",
      "stepType": "dialog",
      "priority": "high",
      "description": "Eli & Tom - Dialog scene",
      "context": "Dialog with 5 lines: \"Hallo!\"",
      "specs": {
        "format": "jpg",
        "dimensions": "800x600",
        "style": "friendly, modern German setting",
        "subjects": "Eli, Tom"
      },
      "outputPath": "images/shared/scenes/a1-m01-l01-s14-eli-tom.jpg",
      "status": "pending"
    }
  ]
}
```

---

## Questions?

- Check `TASK-SUMMARY.md` for the full checklist
- Check individual JSON files for detailed specs
- Run `node scripts/check-multimedia-tasks.js` for progress
