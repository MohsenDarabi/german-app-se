# Babbel Content Extraction - Agent Instructions

> **For Claude Agent**: Read this entire file before starting. You have full autonomy to complete this task.

---

## Mission

Extract all German learning content from Babbel (babbel.com) for integration into a Persian-German learning app. You will:
1. Research and document all exercise/screen types
2. Build an automated extractor
3. Save structured JSON content

---

## Your Tools - MCP Chrome DevTools

You have access to Chrome browser automation via MCP. These tools are already configured.

### Available MCP Commands:
```
mcp__chrome-devtools__take_screenshot     - Capture current page
mcp__chrome-devtools__get_page_content    - Get full DOM/HTML
mcp__chrome-devtools__execute_javascript  - Run JS in browser
mcp__chrome-devtools__click_element       - Click by selector
mcp__chrome-devtools__navigate            - Go to URL
mcp__chrome-devtools__get_console_logs    - Read console output
```

### Setup (One-time):
```bash
# Launch Chrome with remote debugging (run this FIRST in any terminal):
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

# Then manually log into Babbel in that Chrome window
```

---

## Workflow

### Phase 1: Research (Use MCP heavily)

1. **Navigate to a Babbel lesson** using your MCP tools
2. **Take screenshots** of each exercise type you encounter
3. **Capture DOM source** for each screen type
4. **Document patterns** - look for:
   - `data-*` attributes that identify exercise types
   - CSS classes that indicate screen states
   - JSON data embedded in the page
   - Network requests with lesson content

Save research to: `docs/babbel-research/`

### Phase 2: Document Screen Types

Create files like:
```
docs/babbel-research/
├── screen-types/
│   ├── 01-vocabulary-card.md
│   ├── 02-multiple-choice.md
│   ├── 03-fill-blank.md
│   └── ...
└── dom-selectors.md
```

Each screen type doc should include:
- Screenshot description
- Key DOM selectors
- Data extraction strategy
- Example extracted content

### Phase 3: Build Extractor

Create: `scripts/babbel-extractor/`

Structure:
```
scripts/babbel-extractor/
├── package.json
├── index.js              # Main entry
├── lib/
│   ├── detector.js       # Screen type detection
│   ├── navigator.js      # Page navigation
│   ├── auto-solver.js    # Exercise completion
│   └── extractors/       # Per-type extractors
│       ├── index.js
│       ├── vocabulary.js
│       ├── mcq.js
│       └── ...
└── output/               # Extracted content
```

### Phase 4: Extract Content

Run extraction for each level:
- A1, A2, B1, B2 (if available)

Output to: `extracted-content/babbel/{level}/`

---

## Reference: Busuu Extractor

We already built a similar system for Busuu. You can reference (but don't copy blindly - Babbel is different):

- Research docs: `docs/busuu-research/screen-types/`
- Extractor code: `scripts/screen-flow-mapper/`
- Output format: `scripts/screen-flow-mapper/output/A1/`

The Busuu extractor handles 12 exercise types:
- flashcard, fillgap, phrase-builder, mcq, true-false
- spelling, matchup, typing, highlighter, comprehension
- conversation, tip/feedback

Babbel likely has different types - discover them yourself.

---

## Key Principles

1. **Screenshot first, code later** - Always capture visual + DOM before writing extractors
2. **One type at a time** - Fully understand each exercise type before moving to next
3. **Save intermediate work** - Document as you go, don't lose research
4. **Auto-solve exercises** - You'll need to complete exercises to progress through lessons
5. **Handle edge cases** - Locked content, premium features, speaking exercises (skip)

---

## Output Format

Each lesson should produce JSON like:
```json
{
  "level": "A1",
  "unit": { "number": 1, "title": "..." },
  "lesson": { "number": 1, "title": "..." },
  "screens": [
    {
      "index": 0,
      "type": "vocabulary",
      "content": { ... }
    }
  ],
  "extractedAt": "ISO timestamp"
}
```

---

## Starting Commands

```bash
# 1. First, in ANY terminal, start Chrome with debugging:
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

# 2. Log into Babbel manually in that Chrome window

# 3. Start new Claude session in VS Code terminal:
claude

# 4. Tell Claude to read this file:
"Read docs/tasks/BABBEL_EXTRACTION_AGENT.md and start the Babbel extraction project"
```

---

## Progress Tracking

Create a progress file: `scripts/babbel-extractor/progress-{level}.json`

Track:
- Completed lessons
- Screen counts
- Any errors/skipped content

---

## Questions?

The Busuu extraction is running in parallel (different terminal). Don't interfere with:
- `scripts/screen-flow-mapper/` (Busuu - in use)
- `extracted-content/busuu/` (Busuu output)

Your workspace is completely separate:
- `scripts/babbel-extractor/` (your code)
- `extracted-content/babbel/` (your output)
- `docs/babbel-research/` (your research)

Good luck! Work autonomously and save your progress frequently.
