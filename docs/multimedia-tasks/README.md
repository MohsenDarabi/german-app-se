# Multimedia Task Board

> **START HERE:** Open **[START-HERE.md](./START-HERE.md)** - it has everything you need in one file!

This folder contains structured task files for creating **images and videos** for the German learning app.

> **Note**: Audio (TTS) is handled separately by the project lead using Google Cloud TTS.
> Your tasks are **images and videos only**.

## How This Works

1. Each lesson has a `{lesson-id}.json` task file
2. Tasks describe exactly what image/video is needed
3. You create assets following the specifications
4. Save assets to the correct output path
5. Update task status when complete

## Folder Structure

```
docs/multimedia-tasks/
├── README.md                 # This file
├── asset-specs.md            # Detailed specifications
└── A1-M01-L01.json          # Task file per lesson

apps/web/static/
├── images/{lesson-id}/       # Output folder for images
└── videos/{lesson-id}/       # Output folder for videos
```

## Task File Format

Each task file contains:

```json
{
  "lessonId": "A1-1-M01-L01",
  "lessonTitle": "Greetings",
  "tasks": [
    {
      "id": "img-01",
      "type": "image",
      "stepId": "s1",
      "description": "What the image should show",
      "context": "How it's used in the lesson",
      "specs": { ... },
      "outputPath": "/images/A1-1-M01-L01/filename.jpg",
      "status": "pending",
      "notes": ""
    }
  ]
}
```

## Task Status

Update the `status` field as you work:

| Status | Meaning |
|--------|---------|
| `pending` | Not started |
| `in_progress` | Currently working on it |
| `review` | Done, needs review |
| `complete` | Approved and integrated |
| `blocked` | Need clarification |

## Workflow

### Daily Check
1. Open this folder
2. Look for task files with `pending` status
3. Pick a task and set to `in_progress`
4. Create the asset following specs
5. Save to the `outputPath`
6. Update status to `review`
7. Add any notes if needed

### If You Have Questions
Add your question to the `notes` field and set status to `blocked`:

```json
{
  "status": "blocked",
  "notes": "Should the people be young or old?"
}
```

## Quick Commands

### Find all pending tasks
```bash
grep -l '"status": "pending"' *.json
```

### Count tasks by status
```bash
grep -h '"status":' *.json | sort | uniq -c
```

## Contact

For questions about task requirements, add notes to the task file or reach out directly.
