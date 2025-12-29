# Babbel Content Extractor

Automated extraction of German learning content from Babbel for integration into the German-Persian learning app.

## Status

| Item | Status |
|------|--------|
| Framework | ✅ Complete |
| Screen Types | ✅ 23 types documented |
| Detectors | ✅ All 23 types |
| Extractors | ✅ All 23 types |
| Auto-Solvers | ✅ Fixed & tested (Dec 29, 2025) |
| Lesson Discovery | ✅ Implemented |
| Progress Tracking | ✅ Implemented |
| Issue Capture | ✅ Implemented |
| A1.1 Extraction | ⏳ Ready to run (52 lessons) |

## Recent Fixes (Dec 29, 2025)

The auto-solvers were extensively debugged. Key issues fixed:

| Solver | Issue | Fix |
|--------|-------|-----|
| **vocab-intro** | Clicked audio button instead of advancing | Now clicks `[data-selector="navigation-forward"]` |
| **stuck detection** | Never triggered on first repeat | Now tracks `progressKey` (type + progress position) |
| **listening-fill** | Clicked answer but didn't advance | Clicks answer + forward nav |
| **mcq-translation** | Used wrong selectors | Matches `data-item-id` from prompt to correct tile |
| **grammar-tip** | Same as listening-fill | Clicks answer + forward nav |

### Key Pattern Discovered

All Babbel exercises follow this pattern:
1. Answer buttons have `data-correct="true"` or `data-selector="choice-item-X"`
2. MCQ tiles use `data-item-id` matching between prompt and correct answer
3. After answering, must click `[data-selector="navigation-forward"]` to advance

### Testing Progress

Crawler successfully advances through:
- vocab-intro → mcq-translation → listening-fill → grammar-tip → ...

More exercise types may need similar fixes as they're encountered.

## Quick Start

```bash
cd /Volumes/External_ssd_mohsen/WorkspaceExtern/german-learning-app-main/scripts/babbel-extractor
node index.js --level=a1.1
```

The crawler will:
1. Launch Chrome automatically (uses profile at `/tmp/babbel-chrome-profile`)
2. Check if logged into Babbel (wait if not)
3. Navigate to A1.1 course and start extracting

**First run:** You'll need to log into Babbel in the Chrome window that opens.

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

### Chrome launch failed
The crawler launches Chrome automatically using the system Chrome at `/Applications/Google Chrome.app`. If it fails, check that Chrome is installed.

### Not logged into Babbel
The crawler waits for you to log in. When Chrome opens, navigate to Babbel and log in. The crawler will continue automatically.

### Stuck on same screen
1. Check `issues/` folder for captured screenshot and DOM
2. Look at `issue.json` for the screen type and context
3. Fix the solver in `lib/auto-solver.js`
4. Re-run - it resumes from last completed lesson

### Lesson button click not working
The crawler uses JavaScript click via `page.evaluate()` and polls for URL change. If it times out, check if the page structure changed.

## Related Files

- Research: `docs/babbel-research/screen-types-summary.md`
- CLAUDE.md mentions this extractor in "Screen Flow Mapper" section (different extractor for Busuu)
