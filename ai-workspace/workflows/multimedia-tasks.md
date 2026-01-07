# Multimedia Asset Workflow

> How to create and manage multimedia assets for the German Learning App

---

## Overview

All multimedia assets are tracked in a single **asset registry**:
```
apps/web/src/lib/data/asset-registry.json
```

Assets are auto-generated from lesson content. Designers create the actual images/videos.

---

## Source of Truth

| File | Purpose |
|------|---------|
| `apps/web/src/lib/data/asset-registry.json` | Central asset registry |
| `ai-workspace/progress/multimedia-tasks/TASK-SUMMARY.md` | Designer-friendly task list |
| `content/characters/{name}/` | Character visual prompts |

---

## For Designers: Creating Assets

### Quick Start

1. Generate the task list:
   ```bash
   node scripts/generate-task-summary.js
   ```

2. Open `ai-workspace/progress/multimedia-tasks/TASK-SUMMARY.md`

3. Pick any pending task. Example:
   ```
   #### img-a1-m01-l04-s4-lernen
   - Word: lernen (یاد گرفتن)
   - Character ref: content/characters/eli/eli-fullbody.md
   - Action: demonstrating "lernen" action
   - Save to: apps/web/static/images/shared/actions/...
   ```

4. **If it has a Character ref:**
   - Open the character markdown file (e.g., `content/characters/eli/eli-fullbody.md`)
   - Copy the character prompt
   - Append the Action description

5. **If no character** (simple illustration):
   - Create a simple, clean illustration of the word/concept

6. Generate the image with your AI tool

7. Save to the path shown

8. Sync status:
   ```bash
   node scripts/check-multimedia-tasks.js -s
   ```

---

## Character References

Visual prompts for consistent character images:

| Character | Role | Base Prompt File |
|-----------|------|------------------|
| **Eli** | 43yo teacher, calm, professional | `content/characters/eli/eli-fullbody.md` |
| **Tom** | 35yo instructor, reliable | `content/characters/tom/tom-base.md` |
| **Lisa** | 18yo student, playful, energetic | `content/characters/lisa/lisa-base.md` |
| **Alex** | 21yo student, curious | `content/characters/alex/alex-base.md` |

### Character Variants

- `{name}-head.md` - Head/portrait shots
- `{name}-fullbody.md` - Full body poses
- Lisa has hairstyle variants: `lisa-head-hair-open.md`, `lisa-head-ponytail.md`

---

## Asset Categories

Assets are auto-categorized by vocabulary type:

| Category | Needs Character? | Example |
|----------|------------------|---------|
| `greetings` | Yes (Eli) | Waving, greeting gesture |
| `expressions` | Yes (head shot) | Facial expressions |
| `actions` | Yes (Eli/Tom) | Demonstrating verbs |
| `introductions` | Yes (Eli) | Introduction scenes |
| `places` | No | Simple illustration |
| `food` | No | Simple illustration |
| `transport` | No | Simple illustration |
| `furniture` | No | Simple illustration |
| `weather` | No | Simple illustration |
| `numbers` | No | Simple illustration |
| `family` | No | Simple illustration |
| `dialogs` | Yes (multiple) | Conversation scenes |
| `scenes` | Yes (context) | Service interactions |

---

## Commands Reference

```bash
# Check progress overview
node scripts/check-multimedia-tasks.js

# List next N pending tasks
node scripts/check-multimedia-tasks.js -p 10

# Auto-sync status (marks existing files as completed)
node scripts/check-multimedia-tasks.js -s

# Validate registry structure
node scripts/validate-multimedia-tasks.js

# Regenerate asset registry from lessons
node scripts/regenerate-asset-registry-full.js

# Regenerate task summary
node scripts/generate-task-summary.js
```

---

## For Content Creators: How Assets Are Generated

When lessons are created, the registry is auto-generated:

1. Lesson JSON is created in `content/de-fa/{level}/module-{N}/`
2. Run: `node scripts/regenerate-asset-registry-full.js`
3. Script scans all `new-word` and `dialog` steps
4. Assets are added to the registry with:
   - Category (based on vocabulary keywords)
   - Character assignment (based on category)
   - Action description (based on word/context)
5. Run: `node scripts/generate-task-summary.js` to update task list

---

## Image Specifications

| Type | Dimensions | Format | Style |
|------|------------|--------|-------|
| Vocabulary (with character) | 400x300 | JPG | Character illustration |
| Vocabulary (simple) | 400x300 | JPG | Clean, simple illustration |
| Dialog/Scene | 800x600 | JPG | Modern German setting |

---

## Output Paths

Images are saved to:
```
apps/web/static/images/shared/{category}/{asset-id}.jpg
```

Videos (when needed):
```
apps/web/static/videos/shared/{category}/{asset-id}.mp4
```

---

## Checklist for Designers

- [ ] Generated latest TASK-SUMMARY.md
- [ ] Picked a pending task
- [ ] Opened character reference (if applicable)
- [ ] Combined character prompt + action
- [ ] Generated image
- [ ] Saved to correct path
- [ ] Ran sync command to update status
