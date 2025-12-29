# Babbel Content Extractor

Automated extraction of German learning content from Babbel for integration into the German-Persian learning app.

## Status

| Item | Status |
|------|--------|
| Framework | ✅ Complete |
| Screen Types | ✅ 23 types documented |
| Detectors | ✅ All 23 types |
| Extractors | ✅ All 23 types |
| Auto-Solvers | ✅ All 23 types |
| Lesson Discovery | ✅ Implemented |
| Progress Tracking | ✅ Implemented |
| Issue Capture | ✅ Implemented |
| A1.1 Extraction | ⏳ Ready to run |

## Quick Start

### 1. Start Chrome with Remote Debugging

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

### 2. Log into Babbel

Open `https://my.babbel.com` in that Chrome and log in with your Babbel account.

### 3. Run the Extractor

```bash
cd /Volumes/External_ssd_mohsen/WorkspaceExtern/german-learning-app-main/scripts/babbel-extractor
node index.js --level=a1.1
```

## Usage

```bash
# Extract all lessons for a level
node index.js --level=a1.1

# Extract a single lesson by URL
node index.js --lesson "https://my.babbel.com/en/lesson-player/DEU/..."
```

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    EXTRACTION FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Connect to Chrome (port 9222)                           │
│  2. Navigate to course overview                             │
│  3. Discover all lessons in level                           │
│  4. For each lesson:                                        │
│     a. Click "Start now" or "Repeat" button                 │
│     b. For each screen:                                     │
│        - Detect screen type                                 │
│        - Extract content                                    │
│        - Solve exercise (auto-advance)                      │
│        - Save progress checkpoint                           │
│     c. Save lesson JSON to output/                          │
│     d. Mark lesson complete in progress file                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## On Unknown/Stuck Screens

When the crawler encounters an unknown screen type or gets stuck:

1. **Saves issue** to `issues/issue-{timestamp}/`:
   - `screenshot.png` - Full page screenshot
   - `page.html` - Complete DOM
   - `issue.json` - Context (URL, screen index, lesson info)

2. **Exits** with error message

3. **You fix** the detector/extractor/solver code

4. **Re-run** the same command - it resumes from the last completed lesson

## Directory Structure

```
babbel-extractor/
├── index.js              # Main entry point
├── lib/
│   ├── detector.js       # Screen type detection (23 types)
│   ├── auto-solver.js    # Exercise auto-solving (23 types)
│   └── extractors/
│       └── index.js      # Content extraction (23 types)
├── output/               # Extracted lesson JSON files
│   └── A11/
│       ├── unit-01/
│       │   ├── lesson-01.json
│       │   └── lesson-02.json
│       └── unit-02/
│           └── ...
├── issues/               # Captured issues for debugging
│   └── issue-{timestamp}/
│       ├── screenshot.png
│       ├── page.html
│       └── issue.json
├── progress-a11.json     # Extraction progress tracker
└── README.md             # This file
```

## Screen Types (23 Total)

| Category | Types |
|----------|-------|
| **Vocabulary** | vocab-intro |
| **Translation** | mcq-translation |
| **Listening** | listening-fill, listening-choose-said |
| **Grammar** | grammar-tip |
| **Matching** | matching, response-matching |
| **Building** | word-sorting, sentence-order, spelling |
| **Dialogue** | dialogue, response-choice |
| **Pronunciation** | pronunciation-fill, listen-repeat, pronunciation-rule, pronunciation-quiz |
| **Meta/Navigation** | lesson-end, pronunciation-end, feedback-popup-tip, recap-intro, recap-end, formality-choice, story-intro |

See `docs/babbel-research/screen-types-summary.md` for detailed documentation with screenshots.

## Level Path IDs

| Level | Path ID | Status |
|-------|---------|--------|
| A1.1 | `2c17d37bf4b8cb436d6cba815b3cb085` | ✅ Ready |
| A1.2 | TBD | ⏳ Need to discover |
| A2.1 | TBD | ⏳ Need to discover |
| A2.2 | TBD | ⏳ Need to discover |
| B1 | TBD | ⏳ Need to discover |
| B2 | TBD | ⏳ Need to discover |

## Resuming After Interruption

The extractor saves progress after each completed lesson. To resume:

```bash
# Just run the same command again
node index.js --level=a1.1

# Check current progress
cat progress-a11.json | jq '.completedLessons | length'
```

## Troubleshooting

### Chrome connection failed
```
✗ Could not connect to Chrome on port 9222
```
Start Chrome with: `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222`

### Not logged into Babbel
Navigate to `https://my.babbel.com` in Chrome and log in.

### Stuck on same screen
Check `issues/` folder for captured screenshot and DOM, then fix the solver.

## Related Files

- Research: `docs/babbel-research/screen-types-summary.md`
- CLAUDE.md mentions this extractor in "Screen Flow Mapper" section (different extractor for Busuu)
