# Babbel Crawler Debug Guide

> **For AI Agents**: This documents the MCP-based debugging strategy for fixing the Babbel content extractor.

---

## Overview

The Babbel crawler extracts German learning content by:
1. Navigating through lesson screens automatically
2. Detecting screen types (vocab, matching, word-sorting, etc.)
3. Solving exercises to advance
4. Extracting content to JSON

**The Problem**: Babbel is a React app that ignores programmatic clicks. Standard Puppeteer `.click()` and JavaScript `element.click()` don't work reliably.

---

## MCP Server Setup

We use `chrome-devtools-mcp` for live browser debugging.

### Installation

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"]
    }
  }
}
```

Restart Claude Code after adding.

### Available MCP Tools

| Tool | Purpose |
|------|---------|
| `mcp__chrome-devtools__list_pages` | See all browser tabs |
| `mcp__chrome-devtools__select_page` | Select a tab to work with |
| `mcp__chrome-devtools__take_snapshot` | Get DOM tree (text, a11y) |
| `mcp__chrome-devtools__take_screenshot` | Visual screenshot |
| `mcp__chrome-devtools__click` | Click element by UID (uses CDP) |
| `mcp__chrome-devtools__evaluate_script` | Run JS in page |
| `mcp__chrome-devtools__navigate_page` | Navigate/reload |

---

## "AI in the Middle" Testing Strategy

### Concept

Instead of running the crawler blindly, we use a two-phase approach:

1. **Run crawler** → it gets stuck → saves issue
2. **AI debugs** using MCP to inspect live browser
3. **Fix code** based on findings
4. **Repeat**

### Step-by-Step Process

#### Phase 1: Run Crawler

```bash
cd /Volumes/External_ssd_mohsen/WorkspaceExtern/german-learning-app-main/scripts/babbel-extractor

# Clear progress to start fresh
rm -f progress-a11.json

# Run crawler (visible browser for debugging)
node index.js --level=a1.1
```

When stuck, crawler saves to `issues/issue-{timestamp}/`:
- `screenshot.png` - what the screen looks like
- `page.html` - full DOM
- `issue.json` - metadata (screen type, URL, etc.)

#### Phase 2: AI Debug with MCP

With browser still open, AI can:

```
1. List pages:
   mcp__chrome-devtools__list_pages

2. Select the Babbel tab:
   mcp__chrome-devtools__select_page (pageIdx: 0)

3. Take snapshot to see DOM structure:
   mcp__chrome-devtools__take_snapshot

4. Take screenshot to see visual state:
   mcp__chrome-devtools__take_screenshot

5. Try clicking elements:
   mcp__chrome-devtools__click (uid: "element-uid")

6. Run JS to inspect state:
   mcp__chrome-devtools__evaluate_script
```

**Key Insight**: MCP clicks work because they use Chrome DevTools Protocol (CDP) directly, which produces "trusted" events that React accepts.

#### Phase 3: Fix Code

Based on MCP findings, update:
- `lib/detector.js` - screen type detection
- `lib/auto-solver.js` - exercise solving
- `lib/extractors/index.js` - content extraction

---

## Current Issues (Dec 29, 2025)

### 1. Click Events Not Working

**Problem**: Babbel's React app checks `event.isTrusted` and ignores synthetic clicks.

**What Doesn't Work**:
- `element.click()` (JavaScript)
- `page.click()` (Puppeteer)
- `page.mouse.click()` (Puppeteer)
- `dispatchEvent(new MouseEvent())` (JavaScript)

**What Works**:
- MCP clicks (uses CDP Input.dispatchMouseEvent)
- Keyboard shortcuts via `data-shortcut-key` attributes

**Current Approach**:
- Use `page.keyboard.press(key)` for simple ASCII shortcuts
- Fall back to `page.evaluate()` + `dispatchEvent` for special chars (doesn't work reliably)

### 2. Matching Exercise

**Status**: Partially working

**Issue**: Sometimes clicks same item twice

**Code Location**: `lib/auto-solver.js` → `solveMatching()`

**How It Works**:
1. Find active base item (`[data-appearance="ACTIVE"]`)
2. Get its `data-solution-id`
3. Find option with matching `data-solution-id`
4. Click the option
5. Wait for DOM update
6. Repeat

### 3. Word-Sorting Exercise

**Status**: Broken for special characters

**Issue**: Keyboard shortcuts work for `a-z` but fail for `ü`, `ö`, `ä`

**Code Location**: `lib/auto-solver.js` → `solveWordSorting()`

**HTML Structure**:
```html
<button data-selector="choice-item-üss" title="answer üss">
  <span data-shortcut-key="ü">ü</span>
  <span>üss</span>
</button>
```

**Potential Fixes**:
1. Use CDP `Input.dispatchMouseEvent` directly (like MCP does)
2. Find another keyboard method for special chars
3. Use CDP `Input.dispatchKeyEvent` with proper key codes

---

## Key Files

| File | Purpose |
|------|---------|
| `scripts/babbel-extractor/index.js` | Main entry, lesson loop |
| `scripts/babbel-extractor/lib/detector.js` | Screen type detection |
| `scripts/babbel-extractor/lib/auto-solver.js` | Exercise solving |
| `scripts/babbel-extractor/lib/extractors/index.js` | Content extraction |
| `scripts/babbel-extractor/issues/` | Captured stuck screens |
| `scripts/babbel-extractor/progress-a11.json` | Completed lessons |

---

## DOM Patterns

### Common Selectors

| Element | Selector |
|---------|----------|
| Forward nav button | `[data-selector="navigation-forward"]` |
| Answer buttons | `button[title^="answer"]` |
| Correct answer | `[data-correct="true"]` |
| Choice items | `[data-selector^="choice-item"]` |
| Matching base | `[data-item-type="base"]` |
| Matching option | `[data-item-type="option"]` |
| Active item | `[data-appearance="ACTIVE"]` |
| Keyboard shortcut | `[data-shortcut-key]` |

### Word-Sorting Structure

```html
<div data-position="0">
  <div data-choice="hal">hal</div>
</div>
<div data-position="1">
  <div data-choice="lo">lo</div>
</div>
<!-- Answer buttons at bottom -->
<button data-selector="choice-item-hal" title="answer hal">
  <span data-shortcut-key="h">h</span>
  <span>hal</span>
</button>
```

### Matching Structure

```html
<!-- Left side (base) -->
<div data-item-type="base" data-appearance="ACTIVE">
  <div data-solution-id="abc123">hallo</div>
</div>

<!-- Right side (options) -->
<div data-item-type="option">
  <div data-solution-id="abc123">hello</div>
</div>
```

---

## Debugging Commands

```bash
# Watch crawler output
node index.js --level=a1.1 2>&1 | tee crawler.log

# Check latest issue
ls -la issues/ | tail -5

# View issue metadata
cat issues/issue-*/issue.json | jq

# Clear and restart
rm -f progress-a11.json && node index.js --level=a1.1
```

---

## Next Steps to Fix

1. **Implement CDP click**: Use Puppeteer's CDP session to dispatch trusted mouse events
2. **Test on matching**: Verify matching completes all pairs
3. **Test on word-sorting**: Verify special character buttons work
4. **Full level extraction**: Run through all 52 A1.1 lessons

### CDP Click Implementation (TODO)

```javascript
// Get CDP session
const client = await page.target().createCDPSession();

// Get element position
const box = await element.boundingBox();
const x = box.x + box.width / 2;
const y = box.y + box.height / 2;

// Dispatch trusted click
await client.send('Input.dispatchMouseEvent', {
  type: 'mousePressed',
  x, y,
  button: 'left',
  clickCount: 1
});
await client.send('Input.dispatchMouseEvent', {
  type: 'mouseReleased',
  x, y,
  button: 'left',
  clickCount: 1
});
```

---

## Related Documentation

- `scripts/babbel-extractor/README.md` - Quick start guide
- `docs/babbel-research/screen-types-summary.md` - All 23 screen types
- `CLAUDE.md` - Project overview (see "Screen Flow Mapper" section)
