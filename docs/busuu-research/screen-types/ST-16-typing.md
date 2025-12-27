# ST-16: Typing Exercise

> Exercise where user types the missing word(s) instead of selecting from options.

## Screenshots
- `ST-16/a-typing-exercise.png` - Type "Freut" to complete "Freut mich!"

## When It Appears
- Tests active recall (no options to choose from)
- More challenging than multiple choice
- Often for common phrases

## Visual Elements

```
┌─────────────────────────────────────────┐
│       ══════════════════════░░    ✕    │  ← Progress bar
├─────────────────────────────────────────┤
│                                         │
│        Complete the sentence.           │  ← Instruction
│                                         │
│    ┌───────────────────────────────┐    │
│    │   [Image: woman on video call]│    │
│    │  ▶━━━━━━━━━━━━━━━━━━━ 1x     │    │  ← Audio
│    └───────────────────────────────┘    │
│                                         │
│  Hallo! Ich heiße Miriam. [Type here] mich! │
│                                         │
│         Extra German letters            │
│    ↑  ä  é  i  ö  ü  ß                 │  ← Special chars
│                                         │
│                          [ Check ]      │  ← Submit button
└─────────────────────────────────────────┘
```

## Content to Extract

```json
{
  "type": "typing",
  "instruction": "Complete the sentence.",
  "sentence": {
    "before": "Hallo! Ich heiße Miriam. ",
    "blank": "[input]",
    "after": " mich!"
  },
  "correctAnswer": "Freut",
  "hasAudio": true,
  "hasImage": true,
  "extraLetters": ["ä", "é", "i", "ö", "ü", "ß"]
}
```

## Key Observations

1. **`data-qa-pass` = correct answer!** - Input field contains expected text
2. **No pre-defined options** - User must type freely
3. **Extra letters keyboard** - German special characters provided
4. **Manual submit** - "Check" button instead of auto-validation
5. **Case may matter** - "Freut" starts capitalized

## DOM Selectors

**Screen type identifier:** `data-qa-ex="ex-typing"` ✓

| Element | Selector | Notes |
|---------|----------|-------|
| Screen type | `[data-qa-ex="ex-typing"]` | **KEY: Typing exercise** |
| Instruction | `[data-testid="ex-instruction"]` | "Complete the sentence." |
| Sentence wrapper | `.ex-typing__wrapper` | Contains text + input |
| Text input | `.ex-typing__input` | Where user types |
| **Correct answer** | `[data-qa-pass]` on input | **"Freut"** |
| Extra letters label | `[data-testid="extra-letters-label"]` | "Extra German letters" |
| Extra letter buttons | `.sc-jvvksu` | ä, é, ö, ü, ß buttons |
| **Check button** | `[data-testid="check_button"]` | "Check" instead of "Continue"! |

**Actual DOM structure:**
```html
<div data-qa-ex="ex-typing">

  <!-- Image + Audio -->
  <img data-testid="asset-image" src="..."/>
  <div data-testid="asset-audio">
    <audio><source src=".../audio.mp3"></audio>
  </div>

  <!-- Sentence with input -->
  <div class="ex-typing__wrapper">
    Hallo! Ich heiße Miriam.
    <form class="ex-typing__answer-elastic">
      <input class="ex-typing__input"
             type="text"
             data-qa-pass="Freut"      <!-- CORRECT ANSWER! -->
             placeholder="Type here"
             value="">
    </form>
    mich!
  </div>

  <!-- Extra German letters -->
  <div>
    <p data-testid="extra-letters-label">Extra German letters</p>
    <button>ä</button>
    <button>é</button>
    <button>i</button>
    <button>ö</button>
    <button>ü</button>
    <button>ß</button>
  </div>

</div>
```

**Extraction:**
```javascript
// Detect typing exercise
const isTyping = document.querySelector('[data-qa-ex="ex-typing"]');  // confirm

// Get correct answer directly from input!
const input = document.querySelector('.ex-typing__input');
const correctAnswer = input?.getAttribute('data-qa-pass');
// → "Freut"

// Get sentence parts
const wrapper = document.querySelector('.ex-typing__wrapper');
const fullText = wrapper?.textContent;  // "Hallo! Ich heiße Miriam.  mich!"

// Get extra letters
const extraLetters = Array.from(
  document.querySelectorAll('[data-testid="extra-letters-label"] ~ div button span')
).map(s => s.textContent);
// → ["ä", "é", "i", "ö", "ü", "ß"]
```

## Detection Strategy

```javascript
// Check for typing input
const isTyping = document.querySelector('.ex-typing__input');
// OR
const isTyping = document.querySelector('[data-qa-ex="ex-typing"]');
```

1. `.ex-typing__input` present (text field)
2. No `.fillgap-dragdrop__options` (no drag options)
3. `[data-testid="extra-letters-label"]` present

## User Action
- Listen to audio for pronunciation
- Type the missing word
- Use extra letters if needed (ä, ö, ü, ß)
- Click "Check" to submit

## Known Issues
None reported yet.
