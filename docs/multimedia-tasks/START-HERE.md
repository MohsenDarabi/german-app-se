# Multimedia Tasks Guide

> Guide for creating images and videos for the German learning app.

---

## Quick Start

```bash
# Check your current tasks
node scripts/generate-multimedia-tasks.js --status

# Your task files are in:
ai-workspace/progress/multimedia-tasks/
```

---

## Your Workflow

### 1. Check Status
```bash
node scripts/generate-multimedia-tasks.js --status
```

Output shows tasks by status:
- `pending` - Not started yet
- `in_progress` - You're working on it
- `completed` - Done!
- `obsolete` - Content changed, needs review

### 2. Open Your Task File

```
ai-workspace/progress/multimedia-tasks/A1-M01-L01.json
```

Each task looks like:
```json
{
  "id": "img-s14",
  "type": "image",
  "stepId": "s14",
  "priority": "high",
  "description": "Lisa & Theo - Dialog scene",
  "context": "Dialog with 5 lines: \"Hallo Theo!\"",
  "specs": {
    "format": "jpg",
    "dimensions": "800x600",
    "style": "friendly, modern German setting",
    "subjects": "Lisa, Theo"
  },
  "category": "greetings",
  "outputPath": "images/shared/greetings/lisa-theo-hello.jpg",
  "status": "pending"
}
```

### 3. Update Status While Working

Edit the task file:
```json
"status": "in_progress"
```

### 4. Create the Image

- Follow the `specs` (format, dimensions, style)
- Save to `outputPath` (relative to `apps/web/static/`)
- Full path: `apps/web/static/images/shared/{category}/{filename}.jpg`

### 5. Mark Complete

```json
"status": "completed",
"completedAt": "2026-01-06"
```

---

## Task Statuses

| Status | Meaning | Action |
|--------|---------|--------|
| `pending` | New task, not started | Start when ready |
| `in_progress` | You're working on it | Continue |
| `completed` | Done, image exists | Nothing needed |
| `obsolete` | Content changed after completion | Review & possibly redo |
| `removed` | Step was deleted from lesson | Can ignore |

---

## When Content Changes

If the development team changes lesson content:

```bash
# They will run:
node scripts/generate-multimedia-tasks.js --all --update
```

This will:
- Keep your `completed` tasks as-is (if unchanged)
- Mark changed tasks as `obsolete` (you review)
- Add new tasks as `pending`
- Mark removed tasks as `removed`

**You'll see notes like:**
```json
"notes": "[Source changed 2026-01-06]"
```

---

## Image Specs

| Property | Requirement |
|----------|-------------|
| **Format** | JPG (photos), PNG (with transparency) |
| **Dimensions** | 800x600 pixels |
| **File size** | < 200KB (optimize for web) |
| **Style** | Modern, friendly, diverse characters |
| **Setting** | Contemporary German/European context |

---

## Category Folders

Save images to `apps/web/static/images/shared/{category}/`:

```
images/shared/
├── greetings/       # Hello, goodbye, waves
├── introductions/   # Handshakes, first meetings
├── expressions/     # Thank you, please, emotions
├── scenes/          # Cafe, office, street scenes
├── people/          # Individual portraits
├── places/          # Countries, cities, locations
├── daily-life/      # Everyday activities
└── ...
```

---

## Primary Characters

Use these characters consistently:

| Character | Role | Description |
|-----------|------|-------------|
| **Lisa** | German native | Young German woman, friendly |
| **Theo** | Persian learner | Young Persian man learning German |

Secondary characters if needed: Max, Lena, Felix, Sophie

---

## Style Guidelines

### DO
- Modern, contemporary settings
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

## Priority Levels

| Priority | Meaning |
|----------|---------|
| `high` | Dialog scenes - most visible |
| `medium` | Vocabulary illustrations |
| `low` | Optional enhancements |

Focus on `high` priority first!

---

## Commands Reference

```bash
# Check all task status
node scripts/generate-multimedia-tasks.js --status

# Generate tasks for one lesson (first time)
node scripts/generate-multimedia-tasks.js --lesson=A1-M01-L01

# Update tasks after content changes
node scripts/generate-multimedia-tasks.js --lesson=A1-M01-L01 --update

# Process all lessons
node scripts/generate-multimedia-tasks.js --all

# Update all after content changes
node scripts/generate-multimedia-tasks.js --all --update
```

---

## Questions?

Check the task JSON for detailed specs, or contact the development team.
