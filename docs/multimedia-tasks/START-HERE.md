# Multimedia Tasks Guide

> Guide for creating images and videos for the German learning app.

---

## Quick Start

1. Open task file: `ai-workspace/progress/multimedia-tasks/A1-M01-L01.json`
2. Create images per specs
3. Save to: `apps/web/static/images/shared/{category}/`
4. Update task status to `"completed"`

---

## Base Paths

```
Images: apps/web/static/images/shared/
Videos: apps/web/static/videos/shared/
```

---

## Image Specs

| Property | Requirement |
|----------|-------------|
| **Format** | JPG (photos), PNG (illustrations with transparency) |
| **Dimensions** | 800x600 pixels |
| **File size** | < 200KB (optimize for web) |
| **Style** | Modern, friendly, diverse characters |
| **Setting** | Contemporary German/European context |

---

## Category Folders

Create if missing:

```
images/shared/
├── greetings/       # Hello, goodbye, waves
├── introductions/   # Handshakes, first meetings
├── expressions/     # Thank you, please, emotions
├── scenes/          # Cafe, office, street scenes
├── people/          # Individual portraits
├── family/          # Family members
├── food/            # Food and drinks
├── places/          # Locations, buildings
├── transport/       # Cars, trains, buses
├── professions/     # Jobs and occupations
├── daily-life/      # Everyday activities
└── weather/         # Weather conditions
```

---

## Task File Format

Each task in the JSON has:

```json
{
  "id": "img-001",
  "type": "image",
  "stepId": "s1",
  "stepType": "new-word",
  "description": "Two people waving hello to each other",
  "context": "Vocabulary introduction for 'Hallo'",
  "specs": {
    "format": "jpg",
    "dimensions": "800x600",
    "style": "friendly, warm"
  },
  "outputPath": "images/shared/greetings/hello-wave.jpg",
  "status": "pending"
}
```

---

## Workflow

### 1. Check Task

```json
"description": "Two people waving hello to each other on a street"
"context": "Vocabulary introduction for 'Hallo' (Hello)"
"style": "friendly, warm, modern German setting"
```

### 2. Create Image

- Match the description
- Follow the style guide
- Use diverse, modern characters
- Ensure clear subject focus

### 3. Save File

```
apps/web/static/images/shared/greetings/hello-wave.jpg
```

### 4. Update Status

Change in task JSON:
```json
"status": "completed"
```

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

## Current Tasks

### A1-M01-L01 (5 images)

| ID | Description | Output |
|----|-------------|--------|
| img-001 | Two people waving hello | `greetings/hello-wave.jpg` |
| img-002 | Person waving goodbye | `greetings/goodbye-wave.jpg` |
| img-003 | Person expressing gratitude | `expressions/thank-you.jpg` |
| img-004 | Two people shaking hands | `introductions/handshake-meeting.jpg` |
| img-005 | Lena & Max meeting at cafe | `scenes/cafe-meeting.jpg` |

---

## Questions?

Contact the development team or check the task JSON for detailed specs.
