# ST-18: Word Completion

> Exercise where user fills in missing letters to complete a word (not all letters, just some gaps).

## Screenshots
- `ST-18/a-word-completion.png` - Complete "I__" to spell "Ich" (meaning "I")

## When It Appears
- Tests spelling of specific parts of a word
- Simpler than full spelling (ST-17) - some letters already given
- Often tests common letter combinations

## Visual Elements

```
┌─────────────────────────────────────────────────────────────────┐
│       ══════════════════════════════════░░░░░░░░░░░░░░    ✕    │  ← Progress bar
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│             Complete the word meaning 'I'.                      │  ← Instruction
│                                                                 │
│    ┌───────────────────────────────────────────────────────┐    │
│    │           [Image: man with phone]                     │    │  ← Context image
│    │         ▶━━━━━━━━━━━━━━━━━━━━━━━━━━ 1x              │    │  ← Audio player
│    └───────────────────────────────────────────────────────┘    │
│                                                                 │
│              I _ _  bin Huan.                                   │  ← Partial word with blanks
│                                                                 │
│              ┌───┐  ┌───┐                                       │
│              │ h │  │ c │                                       │  ← Letter options
│              │ 1 │  │ 2 │                                       │
│              └───┘  └───┘                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Content to Extract

```json
{
  "type": "word-completion",
  "instruction": "Complete the word meaning 'I'.",
  "partialWord": {
    "given": "I",
    "blanks": 2,
    "context": " bin Huan."
  },
  "letters": [
    { "display": "h", "correctPosition": 2 },
    { "display": "c", "correctPosition": 1 }
  ],
  "correctWord": "Ich",
  "meaning": "I",
  "hasAudio": true,
  "hasImage": true
}
```

## Key Observations

1. **Similar to ST-17 Spelling** - But only partial letters missing
2. **`data-qa-pass` likely = position** - Same pattern as spelling
3. **Meaning given in instruction** - "'I'" helps learner understand
4. **Word in context** - Shows sentence usage "I__ bin Huan."

## DOM Selectors

**Screen type identifier:** `data-qa-ex="ex-spelling"` (CONFIRMED - same as ST-17!)

| Element | Selector | Notes |
|---------|----------|-------|
| Screen type | `[data-qa-ex="ex-spelling"]` | **Same as full spelling** |
| Instruction | `[data-testid="ex-instruction"]` | "Complete the word meaning 'I'." |
| Image | `[data-testid="asset-image"]` | Context image |
| Audio | `[data-testid="asset-audio"] source` | Pronunciation |
| Given letters | `.spelling__word > .font-face-lt` | Pre-filled letters ("I") |
| Blank slots | `.spelling__word .ex-btn--dashed` | Target positions |
| Letter buttons | `[data-qa-choice][data-qa-pass]` | Draggable letters |
| Position | `data-qa-pass` | Correct index (0-based) |

**Actual DOM structure:**
```html
<div data-qa-ex="ex-spelling">

  <!-- Instruction -->
  <div data-testid="ex-instruction">
    <p><span>Complete the word meaning "I".</span></p>
  </div>

  <!-- Image + Audio -->
  <img data-testid="asset-image" src="..."/>
  <div data-testid="asset-audio">
    <audio autoplay playsinline>
      <source src="https://cdn.busuu.com/.../audio.mp3" type="audio/mp3">
    </audio>
  </div>

  <!-- Sentence with partial word -->
  <div class="spelling__sentence">
    <!-- Word 1: "Ich" with blanks -->
    <span class="spelling__word">
      <span class="font-face-lt">I</span>                    <!-- given letter -->
      <div class="ex-btn ex-btn--dashed"></div>              <!-- slot 0: for 'c' -->
      <div class="ex-btn ex-btn--dashed"></div>              <!-- slot 1: for 'h' -->
    </span>
    <!-- Word 2: "bin" -->
    <span class="spelling__word">
      <span class="font-face-lt">bin</span>
    </span>
    <!-- Word 3: "Huan." -->
    <span class="spelling__word">
      <span class="font-face-lt">Huan.</span>
    </span>
  </div>

  <!-- Letter options -->
  <div>
    <div data-qa-choice data-qa-pass="1" draggable="true">   <!-- position 1 = 'h' -->
      <span class="font-face-lt">h</span>
      <div data-testid="test-shortcut">1</div>
    </div>
    <div data-qa-choice data-qa-pass="0" draggable="true">   <!-- position 0 = 'c' -->
      <span class="font-face-lt">c</span>
      <div data-testid="test-shortcut">2</div>
    </div>
  </div>

</div>
```

**Extraction:**
```javascript
// Detect spelling exercise
const isSpelling = document.querySelector('[data-qa-ex="ex-spelling"]');

// Check if it's word completion (has given letters + blanks)
const spellingWords = document.querySelectorAll('.spelling__sentence .spelling__word');
const firstWord = spellingWords[0];
const givenLetters = firstWord?.querySelectorAll(':scope > .font-face-lt');
const blanks = firstWord?.querySelectorAll(':scope > .ex-btn--dashed');
const isWordCompletion = givenLetters?.length > 0 && blanks?.length > 0;

// Get given letter(s)
const givenText = Array.from(givenLetters || []).map(el => el.textContent).join('');
// → "I"

// Get context words (rest of sentence)
const contextWords = Array.from(spellingWords).slice(1).map(
  w => w.querySelector('.font-face-lt')?.textContent
);
// → ["bin", "Huan."]

// Get missing letters with positions
const letters = document.querySelectorAll('[data-qa-choice][data-qa-pass]');
const letterData = Array.from(letters).map(l => ({
  letter: l.querySelector('.font-face-lt')?.textContent,
  position: parseInt(l.getAttribute('data-qa-pass'))
}));
// → [{letter: "h", position: 1}, {letter: "c", position: 0}]

// Reconstruct correct word
const sortedLetters = [...letterData].sort((a, b) => a.position - b.position);
const missingPart = sortedLetters.map(l => l.letter).join('');
const correctWord = givenText + missingPart;
// → "I" + "ch" = "Ich"
```

## Detection Strategy

```javascript
// Check for spelling exercise
const isSpelling = document.querySelector('[data-qa-ex="ex-spelling"]');

// Differentiate: Word Completion has some letters already shown
const givenLetters = document.querySelectorAll('.spelling__word > .font-face-lt');
const blanks = document.querySelectorAll('.spelling__word .ex-btn--dashed');

if (givenLetters.length > 0 && blanks.length > 0) {
  // This is word completion (partial spelling)
} else if (blanks.length > 0 && givenLetters.length === 0) {
  // This is full spelling (ST-17)
}
```

## Difference from ST-17 (Spelling)

| Aspect | ST-17 Spelling | ST-18 Word Completion |
|--------|----------------|----------------------|
| Letters given | None | Some (e.g., "I") |
| Blanks | All letters | Only missing letters |
| Example | "_ _ _ _ _" → "Hallo" | "I _ _" → "Ich" |
| Difficulty | Harder | Easier |

## User Action
- Listen to audio for pronunciation
- Look at given letters for hints
- Drag/click missing letters in correct order
- Complete the word

## Known Issues
None - DOM confirmed. Uses same `data-qa-ex="ex-spelling"` as ST-17, differentiated by presence of given letters.
