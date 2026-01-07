# Multimedia Assets - Quick Start

> Guide for creating images/videos. See `TASK-SUMMARY.md` for pending tasks.

---

## Quick Start

1. Generate task list: `node scripts/generate-task-summary.js`
2. Open `TASK-SUMMARY.md` for pending tasks
3. For each task:
   - If it has a **Character ref**, open that file for the base prompt
   - Append the **Action** description
   - Generate image
   - Save to the **Path** shown
4. Sync status: `node scripts/check-multimedia-tasks.js -s`

---

## Commands

```bash
# Show progress overview
node scripts/check-multimedia-tasks.js

# List next 10 pending assets
node scripts/check-multimedia-tasks.js -p 10

# Auto-sync status (marks existing files as completed)
node scripts/check-multimedia-tasks.js -s

# Regenerate TASK-SUMMARY.md
node scripts/generate-task-summary.js

# Validate asset registry
node scripts/validate-multimedia-tasks.js
```

---

## Character References

Character prompts are in `content/characters/`:

| Character | Description | Prompt File |
|-----------|-------------|-------------|
| **Eli** | 43yo teacher, calm, professional | `content/characters/eli/eli-fullbody.md` |
| **Tom** | 35yo instructor, reliable | `content/characters/tom/tom-base.md` |
| **Lisa** | 18yo student, playful, energetic | `content/characters/lisa/lisa-base.md` |
| **Alex** | 21yo student, curious | `content/characters/alex/alex-base.md` |

### Using Character Refs

1. Open the character markdown file
2. Copy the visual prompt
3. Append the action from the task (e.g., "demonstrating 'lernen' action")
4. Generate image

---

## Asset Categories

| Category | Has Character? | Notes |
|----------|----------------|-------|
| `greetings` | Yes (Eli) | Greeting gestures |
| `expressions` | Yes (head shot) | Facial expressions |
| `actions` | Yes (Eli/Tom) | Verb demonstrations |
| `places` | No | Simple illustration |
| `food` | No | Simple illustration |
| `transport` | No | Simple illustration |
| `dialogs` | Yes (multiple) | Conversation scenes |

---

## File Structure

```
ai-workspace/progress/multimedia-tasks/
├── START-HERE.md           # This guide
└── TASK-SUMMARY.md         # Auto-generated pending tasks

apps/web/src/lib/data/
└── asset-registry.json     # Central registry (source of truth)

content/characters/
├── eli/                    # Eli visual prompts
├── tom/                    # Tom visual prompts
├── lisa/                   # Lisa visual prompts
└── alex/                   # Alex visual prompts

apps/web/static/images/shared/
├── greetings/
├── expressions/
├── actions/
├── places/
└── ...
```

---

## Image Specs

| Type | Dimensions | Format |
|------|------------|--------|
| Vocabulary | 400x300 | JPG |
| Dialog/Scene | 800x600 | JPG |

---

## How to Mark Complete

**Automatic (recommended):**
```bash
node scripts/check-multimedia-tasks.js -s
```

This scans for existing files and marks them completed in the registry.

---

*See `TASK-SUMMARY.md` for the full pending task list.*
