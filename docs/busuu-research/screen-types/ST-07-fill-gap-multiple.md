# ST-07: Fill Gap Multiple Blanks

> Same as ST-03 but with multiple blanks to fill in a single sentence.

## Screenshots
- `ST-07/a-multiple-blanks.png` - Two blanks: "_____ heiße Christiane. Wie heißt _____?"

## When It Appears
- Tests multiple vocabulary items in context
- More challenging than single blank
- **THIS IS WHERE CURRENT EXTRACTOR FAILS**

## Visual Elements

```
┌─────────────────────────────────────────┐
│       ══════════════░░░░░░░░░░    ✕    │  ← Progress bar
├─────────────────────────────────────────┤
│                                         │
│        Complete the sentence.           │  ← Instruction
│                                         │
│    ┌─────────────────────────────┐      │
│    │  ▶━━━━━━━━━━━━━━━━━━━ 1x   │      │  ← Audio player
│    └─────────────────────────────┘      │
│                                         │
│    _____ heiße Christiane. Wie heißt    │  ← Blank 1
│                                         │
│                  _____ ?                │  ← Blank 2
│                                         │
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌──────┐    │
│   │ Ich │ │ du  │ │ dir │ │ Mich │    │  ← Options
│   │  1  │ │  2  │ │  3  │ │  4   │    │
│   └─────┘ └─────┘ └─────┘ └──────┘    │
│                                         │
└─────────────────────────────────────────┘
```

## Content to Extract

```json
{
  "type": "fill-gap-multiple",
  "instruction": "Complete the sentence.",
  "sentence": {
    "parts": [
      { "type": "blank", "index": 0 },
      { "type": "text", "content": " heiße Christiane. Wie heißt " },
      { "type": "blank", "index": 1 },
      { "type": "text", "content": "?" }
    ],
    "blanksCount": 2
  },
  "options": [
    { "text": "Ich", "position": 1, "forBlank": 0 },
    { "text": "du", "position": 2, "forBlank": 1 },
    { "text": "dir", "position": 4, "isDistractor": true },
    { "text": "Mich", "position": 3, "isDistractor": true }
  ],
  "correctSentence": "Ich heiße Christiane. Wie heißt du?"
}
```

## Key Observations

1. **Same `data-qa-ex`** - Uses `ex-fillgap-dragdrop` like single blank
2. **Sentence alternates** - `fillgap-dragdrop__btn` (blank) and `fillgap-dragdrop__text` (text)
3. **Multiple blanks** - Count `.fillgap-dragdrop__btn` to get number of gaps
4. **`data-qa-pass` mapping** - Lower values (1, 2) seem to be correct answers for blanks

## DOM Selectors

**Screen type identifier:** `data-qa-ex="ex-fillgap-dragdrop"` (same as single)

**Sentence structure:**
```html
<p class="fillgap-dragdrop__sentences">
  <!-- BLANK 1 -->
  <span>
    <span class="fillgap-dragdrop__btn">
      <span class="ex-btn ex-btn--dashed">...</span>
    </span>
  </span>

  <!-- TEXT: " heiße Christiane. Wie heißt " -->
  <span>
    <span class="fillgap-dragdrop__text">
      <span class="font-face-lt"> heiße Christiane. Wie heißt </span>
    </span>
  </span>

  <!-- BLANK 2 -->
  <span>
    <span class="fillgap-dragdrop__btn">
      <span class="ex-btn ex-btn--dashed">...</span>
    </span>
  </span>

  <!-- TEXT: "?" -->
  <span>
    <span class="fillgap-dragdrop__text">
      <span class="font-face-lt">?</span>
    </span>
  </span>
</p>
```

**Options:**
```html
<div class="fillgap-dragdrop__options_wrapper">
  <span class="fillgap-dragdrop__options">
    <span data-qa-pass="1" aria-label="Drag item: Ich">
      <span class="font-face-lt">Ich</span>
    </span>
  </span>
  <span class="fillgap-dragdrop__options">
    <span data-qa-pass="2" aria-label="Drag item: du">
      <span class="font-face-lt">du</span>
    </span>
  </span>
  <span class="fillgap-dragdrop__options">
    <span data-qa-pass="4" aria-label="Drag item: dir">
      <span class="font-face-lt">dir</span>
    </span>
  </span>
  <span class="fillgap-dragdrop__options">
    <span data-qa-pass="3" aria-label="Drag item: Mich">
      <span class="font-face-lt">Mich</span>
    </span>
  </span>
</div>
```

## Extraction Strategy

```javascript
// Detect fill-gap exercise
const isFillGap = document.querySelector('[data-qa-ex="ex-fillgap-dragdrop"]');

// Count blanks
const blanks = document.querySelectorAll('.fillgap-dragdrop__btn');
const blanksCount = blanks.length;  // → 2

// Get sentence parts in order
const sentenceEl = document.querySelector('.fillgap-dragdrop__sentences');
const parts = [];
sentenceEl.querySelectorAll(':scope > span').forEach(span => {
  if (span.querySelector('.fillgap-dragdrop__btn')) {
    parts.push({ type: 'blank', index: parts.filter(p => p.type === 'blank').length });
  } else if (span.querySelector('.fillgap-dragdrop__text')) {
    const text = span.querySelector('.font-face-lt')?.textContent;
    parts.push({ type: 'text', content: text });
  }
});
// → [{type:'blank',index:0}, {type:'text',content:' heiße Christiane...'},
//    {type:'blank',index:1}, {type:'text',content:'?'}]

// Get all options
const options = document.querySelectorAll('.fillgap-dragdrop__options [data-qa-pass]');
const optionsData = Array.from(options).map(opt => ({
  text: opt.querySelector('.font-face-lt')?.textContent,
  position: parseInt(opt.getAttribute('data-qa-pass'))
}));

// Sort by position to get correct answers first (positions 1, 2 = blanks 0, 1)
const sortedOptions = optionsData.sort((a, b) => a.position - b.position);
// Positions 1 and 2 are likely correct for blanks 0 and 1
```

## Detection Strategy

```javascript
// Same as single, but check blank count
const isFillGap = document.querySelector('[data-qa-ex="ex-fillgap-dragdrop"]');
const blanksCount = document.querySelectorAll('.fillgap-dragdrop__btn').length;
const isMultiple = blanksCount > 1;
```

## EXTRACTOR ISSUE

**Why current extractor fails:**
1. Only looks for first `.fillgap-dragdrop__btn`
2. Doesn't iterate all blanks
3. Doesn't map options to specific blanks

**Fix needed:**
- Count ALL `.fillgap-dragdrop__btn` elements
- Extract sentence structure preserving blank positions
- Map `data-qa-pass` values to blank indices

## User Action
- Listen to audio for context
- Drag/click words to fill each blank in order
- All blanks must be filled to submit

## Known Issues
**CRITICAL**: Current extractor only captures first blank!
