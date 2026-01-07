# Multimedia Assets for German Learning App

> Guide for creating images/videos. **206 assets** (190 images, 16 videos).

---

## Quick Start

1. Check `TASK-SUMMARY.md` for the full checklist with checkboxes
2. Or run `node scripts/check-multimedia-tasks.js -p 10` to see next pending assets
3. Check the asset registry for detailed specs
4. Create the asset following the specs
5. Save to the output path with semantic naming (e.g., `img-greeting-wave.png`)
6. Run `node scripts/check-multimedia-tasks.js -s` to auto-mark as completed

---

## Commands

```bash
# Check progress
node scripts/check-multimedia-tasks.js

# List next 10 pending assets
node scripts/check-multimedia-tasks.js -p 10

# Auto-sync status (marks existing files as completed)
node scripts/check-multimedia-tasks.js -s

# Validate asset registry
node scripts/validate-multimedia-tasks.js

# Regenerate TASK-SUMMARY.md checklist
node scripts/generate-task-summary.js
```

---

## File Structure

```
ai-workspace/progress/multimedia-tasks/
├── START-HERE.md           # This guide
└── TASK-SUMMARY.md         # Auto-generated checklist (run generate-task-summary.js)

apps/web/src/lib/data/
└── asset-registry.json     # Central registry (source of truth)

apps/web/static/images/shared/
├── greetings/              # Hello, goodbye, waves
├── expressions/            # Emotions, reactions
├── scenes/                 # Dialog scenes
├── places/                 # Countries, cities
├── people/                 # Character portraits
├── grammar/                # Visual grammar
├── food/                   # Food items
├── weather/                # Weather scenes
├── transport/              # Travel, vehicles
├── furniture/              # Objects, furniture
└── ...
```

---

## Naming Convention

Use **semantic names** that describe the content, not the word:

| Good | Bad |
|------|-----|
| `img-greeting-wave.png` | `hallo.jpg` |
| `img-sad-person.jpg` | `schlecht.jpg` |
| `img-coffee-cafe-scene.jpg` | `a1-m01-l01-s14.jpg` |

**Why?** Semantic names allow reuse across multiple lessons and words.

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

## Asset Registry Structure

The source of truth is `apps/web/src/lib/data/asset-registry.json`:

```json
{
  "assets": {
    "img-greeting-wave": {
      "id": "img-greeting-wave",
      "type": "image",
      "category": "greetings",
      "path": "/images/shared/greetings/img-greeting-wave.png",
      "description": "Friendly greeting image",
      "tags": ["greetings", "A1", "new-word"],
      "specs": {
        "dimensions": "800x600",
        "format": "png",
        "style": "friendly, welcoming"
      },
      "usedIn": [
        { "lessonId": "A1-1-M01-L01", "stepId": "s1", "context": "Vocabulary: Greeting" }
      ],
      "status": "completed",
      "completedAt": "2026-01-06"
    }
  }
}
```

---

## How to Mark Complete

**Option 1: Auto-sync** (recommended)
```bash
# Automatically marks all existing files as completed
node scripts/check-multimedia-tasks.js -s
```

**Option 2: Manual**
1. Open `apps/web/src/lib/data/asset-registry.json`
2. Find the asset by `id`
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

### DO
- Modern, contemporary German settings
- Diverse characters (age, ethnicity)
- Clear, well-lit scenes
- Friendly, approachable expressions
- Realistic proportions

### DON'T
- Outdated or stereotypical imagery
- Overly busy backgrounds
- Dark or unclear lighting
- Exaggerated expressions
- Text overlays on images

---

## Category Reference

| Category | Content | Count |
|----------|---------|-------|
| `grammar/` | Visual grammar explanations | 53 |
| `people/` | Character portraits, interactions | 47 |
| `transport/` | Travel, vehicles, commuting | 40 |
| `misc/` | Miscellaneous items | 14 |
| `food/` | Food, drinks, dining | 14 |
| `places/` | Countries, cities, landmarks | 13 |
| `weather/` | Weather scenes, seasons | 9 |
| `furniture/` | Objects, home items | 7 |
| `greetings/` | Hello, goodbye, waves | 4 |
| `daily-life/` | Everyday activities | 2 |

---

## Questions?

- Run `node scripts/check-multimedia-tasks.js -h` for help
- Check asset registry for detailed specs per asset
- Validate with `node scripts/validate-multimedia-tasks.js`
