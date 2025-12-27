# ST-03: Fill Gap Drag-Drop (with Video)

> Exercise screen where user drags/clicks the correct word to fill a gap in a sentence.

## Screenshots
- `ST-03/a-multiple-choice-video.png` - "Complete the sentence" with Hi/Hallo options

## When It Appears
- After vocabulary introduction (ST-02)
- Tests comprehension of newly learned word
- Video provides context for the answer
- Options are draggable OR clickable

## Visual Elements

```
┌─────────────────────────────────────────┐
│       ════════════░░░░░░░░░░░░    ✕    │  ← Progress bar + close
├─────────────────────────────────────────┤
│                                         │
│        Complete the sentence.           │  ← Instruction header
│                                         │
│    ┌───────────────────────────────┐    │
│    │                               │    │
│    │      [Man by river]           │    │  ← Video player (same location)
│    │                               │    │
│    │  ▶━━━━━━━━━━━━━━━━━━━━━ 1s   │    │
│    └───────────────────────────────┘    │
│                                         │
│            ___________!                 │  ← Sentence with blank
│            ············                 │  ← Dotted underline
│                                         │
│        ┌─────┐    ┌───────┐            │
│        │ Hey │    │ Hallo │            │  ← Multiple choice options
│        │  1  │    │   2   │            │  ← Numbered shortcuts
│        └─────┘    └───────┘            │
│                                         │
└─────────────────────────────────────────┘
```

## Content to Extract

```json
{
  "type": "multiple-choice-video",
  "instruction": "Complete the sentence.",
  "sentence": {
    "template": "_____!",
    "blankPosition": 0
  },
  "options": [
    { "id": 1, "text": "Hey", "isCorrect": false },
    { "id": 2, "text": "Hallo", "isCorrect": true }
  ],
  "video": {
    "duration": "1s",
    "description": "Man by river saying Hallo",
    "providesContext": true
  },
  "correctAnswer": "Hallo"
}
```

## Key Observations

1. **Video as context** - Same river location, different speaker (man vs woman)
2. **Numbered options** - Options show keyboard shortcuts (1, 2) for quick selection
3. **Simple binary choice** - Only 2 options for this early exercise
4. **Sentence completion** - Blank shown as underline with punctuation visible
5. **No favorites button** - Unlike ST-02, exercises don't have bookmark option

## Exercise Pattern

This follows the **introduce → test** pattern:
- ST-02: Shows "Hallo!" with woman (introduction)
- ST-03: Tests if user learned it (man says same thing)

## DOM Selectors

**Screen type identifier:** `data-qa-ex="ex-fillgap-dragdrop"`

| Element | Selector | Notes |
|---------|----------|-------|
| Screen type | `[data-qa-ex="ex-fillgap-dragdrop"]` | **KEY: Fill-gap exercise** |
| Instruction | `[data-testid="ex-instruction"]` | "Complete the sentence." |
| Video | `[data-testid="asset-simple-video"]` | Same as ST-02 |
| Sentence container | `.fillgap-dragdrop__sentences` | Contains gaps + text |
| Gap/blank | `.fillgap-dragdrop__btn` | The empty slot |
| Punctuation | `.fillgap-dragdrop__text` | Text around gaps ("!") |
| Options wrapper | `.fillgap-dragdrop__options_wrapper` | Contains all choices |
| Option buttons | `.fillgap-dragdrop__options [data-qa-pass]` | `data-qa-pass="1"`, `"2"`, etc. |
| Option text | `.fillgap-dragdrop__options .font-face-lt` | Actual word |
| Check button | `[data-testid="check_button"]` | "Continue" |

```html
<div data-qa-ex="ex-fillgap-dragdrop">  <!-- KEY IDENTIFIER -->

  <!-- Instruction -->
  <div data-testid="ex-instruction">
    <p><span>Complete the sentence.</span></p>
  </div>

  <!-- Video (same structure as ST-02) -->
  <div data-testid="asset-simple-video">
    <video src="..."></video>
  </div>

  <!-- Sentence with gap -->
  <p class="fillgap-dragdrop__sentences">
    <span>
      <span class="fillgap-dragdrop__btn">
        <!-- Empty gap - dashed button -->
        <span class="ex-btn ex-btn--dashed">...</span>
      </span>
    </span>
    <span>
      <span class="fillgap-dragdrop__text">
        <span class="font-face-lt">!</span>  <!-- Punctuation -->
      </span>
    </span>
  </p>

  <!-- Draggable options -->
  <div class="fillgap-dragdrop__options_wrapper">
    <span class="fillgap-dragdrop__options">
      <span class="ex-btn" data-qa-pass="1" draggable="true"
            aria-label="Drag item: Hi">
        <span class="font-face-lt">Hi</span>
      </span>
      <div data-testid="test-shortcut">1</div>  <!-- Keyboard shortcut -->
    </span>
    <span class="fillgap-dragdrop__options">
      <span class="ex-btn" data-qa-pass="2" draggable="true"
            aria-label="Drag item: Hallo">
        <span class="font-face-lt">Hallo</span>
      </span>
      <div data-testid="test-shortcut">2</div>
    </span>
  </div>

</div>
```

**Extraction strategy:**
```javascript
// Detect screen type
const isFillGap = document.querySelector('[data-qa-ex="ex-fillgap-dragdrop"]');

// Get instruction
const instruction = document.querySelector('[data-testid="ex-instruction"]')?.textContent;
// "Complete the sentence."

// Get options with their IDs
const options = Array.from(document.querySelectorAll('.fillgap-dragdrop__options [data-qa-pass]'));
const optionsData = options.map(opt => ({
  id: opt.getAttribute('data-qa-pass'),
  text: opt.querySelector('.font-face-lt')?.textContent,
  ariaLabel: opt.getAttribute('aria-label')
}));
// [{id: "1", text: "Hi"}, {id: "2", text: "Hallo"}]

// Get sentence parts (punctuation around gaps)
const sentenceParts = document.querySelectorAll('.fillgap-dragdrop__text .font-face-lt');
```

## Detection Strategy

**Identify this screen by:**
```javascript
const isFillGapExercise = document.querySelector('[data-qa-ex="ex-fillgap-dragdrop"]');
```

1. `data-qa-ex="ex-fillgap-dragdrop"` present
2. `data-testid="ex-instruction"` = "Complete the sentence."
3. `.fillgap-dragdrop__options [data-qa-pass]` elements exist
4. Options have `draggable="true"` attribute

## User Action
- Watch video for context
- Click correct option OR press number key (1 or 2)
- System validates answer

## Known Issues
None reported yet.
