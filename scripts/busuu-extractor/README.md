# Busuu Content Extractor

Automates browser navigation through Busuu lessons to extract learning content.

## Setup

```bash
cd scripts/busuu-extractor
npm install
```

## Usage

```bash
# Extract A1 level
node extractor.js --level=a1

# Extract A2 level
node extractor.js --level=a2

# Extract B1 level
node extractor.js --level=b1
```

## How it works

1. **Browser opens** - A Chrome window will open
2. **You login** - Login to your Busuu account manually
3. **Press Enter** - When you see your course dashboard, press Enter in terminal
4. **Auto-extraction begins** - Script navigates through lessons automatically
5. **Content saved** - JSON files saved to `extracted-content/busuu/`

## Output Structure

```
extracted-content/
└── busuu/
    └── A1/
        ├── _lessons-index.json    # List of all lessons
        ├── _all-content.json      # Combined content
        ├── lesson-01.json         # Individual lesson
        ├── lesson-02.json
        └── ...
```

## Lesson JSON Structure

```json
{
  "url": "https://busuu.com/lesson/...",
  "title": "Hallo!",
  "steps": [
    {
      "step": 1,
      "pageContent": {
        "vocabulary": [...],
        "dialogues": [...],
        "sentences": [...]
      },
      "exerciseContent": {
        "type": "multiple-choice",
        "instruction": "...",
        "options": [...]
      }
    }
  ],
  "vocabulary": [...],
  "dialogues": [...],
  "audioUrls": [...]
}
```

## Troubleshooting

- **Script gets stuck**: Press Enter in terminal or Escape in browser
- **No lessons found**: Make sure you're logged in and see the course
- **Wrong content**: Busuu may update their UI - check selectors in script

## Notes

- Screenshots are saved to `screenshots/` folder for debugging
- Adjust delays in CONFIG if extraction is too fast/slow
- The script clicks through exercises - your Busuu progress will advance!
