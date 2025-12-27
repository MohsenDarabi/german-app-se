# ST-17: Spelling (Letter Order)

> Exercise where user arranges scrambled letters to spell a word.

## Screenshots
- `ST-17/a-letter-order.png` - Spell "Hallo!" from scrambled letters

## When It Appears
- Tests spelling knowledge
- Audio provides pronunciation hint
- Image shows context

## Visual Elements

```
┌─────────────────────────────────────────┐
│       ════░░░░░░░░░░░░░░░░░░░░    ✕    │  ← Progress bar
├─────────────────────────────────────────┤
│                                         │
│       Put the letters in order.         │  ← Instruction
│                                         │
│    ┌───────────────────────────────┐    │
│    │     [Image: couple hugging]   │    │  ← Context image
│    │  ▶━━━━━━━━━━━━━━━━━━━ 1x     │    │  ← Audio player
│    └───────────────────────────────┘    │
│                                         │
│        _ _ _ _ _ !                      │  ← Blank slots
│                                         │
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐      │
│    │ o │ │ a │ │ l │ │ H │ │ l │      │  ← Scrambled letters
│    │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │      │
│    └───┘ └───┘ └───┘ └───┘ └───┘      │
│                                         │
└─────────────────────────────────────────┘
```

## Content to Extract

```json
{
  "type": "spelling",
  "instruction": "Put the letters in order.",
  "letters": [
    { "display": "o", "correctPosition": 4 },
    { "display": "a", "correctPosition": 1 },
    { "display": "l", "correctPosition": 3 },
    { "display": "H", "correctPosition": 0 },
    { "display": "l", "correctPosition": 2 }
  ],
  "correctWord": "Hallo",
  "punctuation": "!",
  "hasAudio": true,
  "hasImage": true
}
```

## Key Observations

1. **`data-qa-pass` = correct position** - Value indicates where letter belongs (0-indexed)
2. **Reconstructing word** - Sort by `data-qa-pass` to get correct spelling
3. **Audio hint** - User can hear pronunciation
4. **Case matters** - "H" is capitalized (German noun rules)

## DOM Selectors

**Screen type identifier:** `data-qa-ex="ex-spelling"`

| Element | Selector | Notes |
|---------|----------|-------|
| Screen type | `[data-qa-ex="ex-spelling"]` | **KEY: Spelling exercise** |
| Instruction | `[data-testid="ex-instruction"]` | "Put the letters in order." |
| Image | `[data-testid="asset-image"]` | Context image |
| Audio | `[data-testid="asset-audio"] source` | Pronunciation |
| Blank slots | `.spelling__word .ex-btn--dashed` | Target positions |
| Letter buttons | `[data-qa-choice][data-qa-pass]` | Draggable letters |
| Letter text | `.font-face-lt` | The actual letter |
| Position | `data-qa-pass` | Correct index (0-based) |

**Actual DOM structure:**
```html
<div data-qa-ex="ex-spelling">

  <!-- Instruction -->
  <div data-testid="ex-instruction">
    <p><span>Put the letters in order.</span></p>
  </div>

  <!-- Image + Audio -->
  <img data-testid="asset-image" src="..."/>
  <div data-testid="asset-audio">
    <audio><source src=".../hallo.mp3" type="audio/mp3"></audio>
  </div>

  <!-- Blank slots -->
  <div class="spelling__sentence">
    <span class="spelling__word">
      <div class="ex-btn--dashed"></div>  <!-- slot 0 -->
      <div class="ex-btn--dashed"></div>  <!-- slot 1 -->
      <div class="ex-btn--dashed"></div>  <!-- slot 2 -->
      <div class="ex-btn--dashed"></div>  <!-- slot 3 -->
      <div class="ex-btn--dashed"></div>  <!-- slot 4 -->
      <span class="font-face-lt">!</span>  <!-- punctuation -->
    </span>
  </div>

  <!-- Scrambled letters -->
  <div>
    <div data-qa-choice data-qa-pass="4" draggable="true">
      <span class="font-face-lt">o</span>
      <div data-testid="test-shortcut">1</div>
    </div>
    <div data-qa-choice data-qa-pass="1" draggable="true">
      <span class="font-face-lt">a</span>
    </div>
    <div data-qa-choice data-qa-pass="3" draggable="true">
      <span class="font-face-lt">l</span>
    </div>
    <div data-qa-choice data-qa-pass="0" draggable="true">
      <span class="font-face-lt">H</span>
    </div>
    <div data-qa-choice data-qa-pass="2" draggable="true">
      <span class="font-face-lt">l</span>
    </div>
  </div>

</div>
```

**Extraction:**
```javascript
// Detect screen type
const isSpelling = document.querySelector('[data-qa-ex="ex-spelling"]');

// Get all letters with positions
const letters = document.querySelectorAll('[data-qa-choice][data-qa-pass]');
const letterData = Array.from(letters).map(l => ({
  letter: l.querySelector('.font-face-lt')?.textContent,
  position: parseInt(l.getAttribute('data-qa-pass'))
}));

// Reconstruct correct word
const correctWord = letterData
  .sort((a, b) => a.position - b.position)
  .map(l => l.letter)
  .join('');
// → "Hallo"

// Get punctuation
const punctuation = document.querySelector('.spelling__word > .font-face-lt')?.textContent;
// → "!"
```

## Detection Strategy

```javascript
const isSpelling = document.querySelector('[data-qa-ex="ex-spelling"]');
```

1. `data-qa-ex="ex-spelling"` present
2. Instruction contains "letters in order"
3. Single-character options with `data-qa-pass`

## User Action
- Listen to audio for pronunciation hint
- Drag/click letters in correct order
- Complete the word

## Known Issues
None reported yet.
