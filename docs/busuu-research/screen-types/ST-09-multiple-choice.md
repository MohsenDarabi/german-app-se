# ST-09: Multiple Choice Question (MCQ)

> Exercise where user selects the correct answer from multiple options (typically translations).

## Screenshots
- `ST-09/a-multiple-choice.png` - "Wie heißt du?" means... (3 options)

## When It Appears
- Tests comprehension of phrases/sentences
- Often asks for correct translation
- Can have 2-4 options

## Visual Elements

```
┌─────────────────────────────────────────┐
│       ════════░░░░░░░░░░░░░░░░    ✕    │  ← Progress bar
├─────────────────────────────────────────┤
│                                         │
│       "Wie heißt du?" means...          │  ← Question/Instruction
│                                         │
│    ┌───────────────────────────────┐    │
│    │      [Video: two guys]        │    │  ← Video (optional)
│    │  ▶━━━━━━━━━━━━━━━━━━━ 1x     │    │
│    └───────────────────────────────┘    │
│                                         │
│    ┌───────────────────────────────┐    │
│    │       How are you?          1 │    │  ← Option 1
│    └───────────────────────────────┘    │
│    ┌───────────────────────────────┐    │
│    │    Where are you from?      2 │    │  ← Option 2
│    └───────────────────────────────┘    │
│    ┌───────────────────────────────┐    │
│    │     What's your name?       3 │    │  ← Option 3 (correct)
│    └───────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

## Content to Extract

```json
{
  "type": "multiple-choice",
  "question": "\"Wie heißt du?\" means...",
  "hasVideo": true,
  "options": [
    { "id": 1, "text": "How are you?", "isCorrect": false },
    { "id": 2, "text": "Where are you from?", "isCorrect": false },
    { "id": 3, "text": "What's your name?", "isCorrect": true }
  ],
  "correctAnswer": 3
}
```

## Key Observations

1. **Translation focus** - Usually tests meaning comprehension
2. **Multiple options** - Can have 3+ choices (unlike True/False)
3. **Video context** - May include video for context
4. **Numbered shortcuts** - Press 1, 2, 3 to select

## DOM Selectors

**Screen type identifier:** `data-qa-ex="ex-mcq"`

| Element | Selector | Notes |
|---------|----------|-------|
| Screen type | `[data-qa-ex="ex-mcq"]` | **KEY: Multiple Choice Question** |
| Instruction | `[data-testid="ex-instruction"]` | The question text |
| Options | `[data-qa-pass]` | Each answer button |
| Correct answer | `[data-qa-pass="true"]` | The correct option |

**Actual DOM structure:**
```html
<div data-qa-ex="ex-mcq">

  <!-- Instruction -->
  <div data-testid="ex-instruction">
    <p><span>"Wie heißt du?" means...</span></p>
  </div>

  <!-- Image (can be image OR video) -->
  <img data-testid="asset-image"
       src="https://cdn.busuu.com/.../image.jpg" />

  <!-- Audio player -->
  <div data-testid="asset-audio">
    <audio>
      <source src="https://cdn.busuu.com/.../wie_heit_du.mp3" type="audio/mp3">
    </audio>
  </div>

  <!-- Options - ALL have data-qa-choice, only CORRECT has data-qa-pass -->
  <div class="ex-mcq__options">
    <button class="ex-btn" data-qa-choice="true">
      <span class="font-face-lt">How are you?</span>
    </button>
    <button class="ex-btn" data-qa-choice="true">
      <span class="font-face-lt">Where are you from?</span>
    </button>
    <button class="ex-btn" data-qa-choice="true" data-qa-pass="true">  <!-- CORRECT -->
      <span class="font-face-lt">What's your name?</span>
    </button>
  </div>

</div>
```

**Key insight:**
- ALL options have `data-qa-choice="true"`
- ONLY the correct answer has `data-qa-pass="true"`

**Extraction:**
```javascript
// Detect screen type
const isMCQ = document.querySelector('[data-qa-ex="ex-mcq"]');

// Get question
const question = document.querySelector('[data-testid="ex-instruction"]')?.textContent;
// → "\"Wie heißt du?\" means..."

// Get all options
const options = document.querySelectorAll('.ex-mcq__options button[data-qa-choice]');
const optionsData = Array.from(options).map((opt, i) => ({
  id: i + 1,
  text: opt.querySelector('.font-face-lt')?.textContent,
  isCorrect: opt.hasAttribute('data-qa-pass')
}));
// → [{id:1, text:"How are you?", isCorrect:false},
//    {id:2, text:"Where are you from?", isCorrect:false},
//    {id:3, text:"What's your name?", isCorrect:true}]

// Get correct answer directly
const correctOption = document.querySelector('[data-qa-pass="true"] .font-face-lt');
// → "What's your name?"
```

## Detection Strategy

```javascript
const isMCQ = document.querySelector('[data-qa-ex="ex-mcq"]');
```

1. `data-qa-ex="ex-mcq"` present
2. Multiple option buttons (more than 2)
3. Question ends with "means..." or similar

## User Action
- Watch video (if present) for context
- Read the question
- Click correct option (or press number key)

## Known Issues
None reported yet.
