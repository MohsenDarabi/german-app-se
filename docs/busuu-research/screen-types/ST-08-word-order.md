# ST-08: Word Order (Phrase Builder)

> Exercise where user arranges scrambled words into the correct sentence order.

## Screenshots
- `ST-08/a-word-order.png` - "Put the words in order" with Ich/Heidi/heiße

## When It Appears
- Tests sentence structure understanding
- Often appears after vocabulary introduction
- Combines multiple words into grammatically correct sentence

## Visual Elements

```
┌─────────────────────────────────────────┐
│       ════════░░░░░░░░░░░░░░░░    ✕    │  ← Progress bar
├─────────────────────────────────────────┤
│                                         │
│        Put the words in order.          │  ← Instruction
│                                         │
│    ┌─────────────────────────────┐      │
│    │  ▶━━━━━━━━━━━━━━━━━━━ 1x   │      │  ← Audio player
│    └─────────────────────────────┘      │
│                                         │
│    ┌─────────────────────────────┐      │
│    │                             │      │  ← Target area (drop zone)
│    │                             │      │
│    └─────────────────────────────┘      │
│                                         │
│      ┌─────┐  ┌───────┐  ┌───────┐     │
│      │ Ich │  │Heidi. │  │ heiße │     │  ← Scrambled words
│      │  1  │  │   2   │  │   3   │     │  ← Keyboard shortcuts
│      └─────┘  └───────┘  └───────┘     │
│                                         │
└─────────────────────────────────────────┘
```

## Content to Extract

```json
{
  "type": "word-order",
  "instruction": "Put the words in order.",
  "audio": {
    "hasAudio": true,
    "playsCorrectSentence": true
  },
  "words": [
    { "id": 1, "text": "Ich" },
    { "id": 2, "text": "Heidi." },
    { "id": 3, "text": "heiße" }
  ],
  "correctOrder": [1, 3, 2],
  "correctSentence": "Ich heiße Heidi."
}
```

## Key Observations

1. **Audio clue** - User can play audio to hear correct sentence
2. **Numbered shortcuts** - Press 1, 2, 3 to select words quickly
3. **Drag or click** - Words can be dragged or clicked to arrange
4. **Punctuation attached** - "Heidi." includes the period

## DOM Selectors

**Screen type identifier:** `data-qa-ex="ex-phrase-builder"`

| Element | Selector | Notes |
|---------|----------|-------|
| Screen type | `[data-qa-ex="ex-phrase-builder"]` | **KEY: Word order exercise** |
| Instruction | `[data-testid="ex-instruction"]` | "Put the words in order." |
| Audio player | (to be determined) | Plays correct sentence |
| Target area | (to be determined) | Where words are dropped |
| Word options | (to be determined) | Scrambled word buttons |

```html
<div data-qa-ex="ex-phrase-builder">
  <!-- Instruction -->
  <div data-testid="ex-instruction">
    <p><span>Put the words in order.</span></p>
  </div>

  <!-- Audio player -->
  <!-- ... -->

  <!-- Target drop zone -->
  <!-- ... -->

  <!-- Scrambled words -->
  <!-- Words with keyboard shortcuts 1, 2, 3 -->
</div>
```

**Word buttons (same as fill-gap!):**
```html
<span class="fillgap-dragdrop__options">
  <span class="ex-btn ex-btn--default"
        role="button"
        aria-label="Drag item: Ich"
        data-qa-pass="0"
        draggable="true">
    <span class="font-face-lt">Ich</span>
  </span>
  <div data-testid="test-shortcut">1</div>  <!-- Keyboard shortcut -->
</span>
```

**Extraction:**
```javascript
const words = document.querySelectorAll('.fillgap-dragdrop__options [data-qa-pass]');
const wordData = Array.from(words).map(w => ({
  index: w.getAttribute('data-qa-pass'),
  text: w.querySelector('.font-face-lt')?.textContent,
  label: w.getAttribute('aria-label')
}));
// [{index: "0", text: "Ich", label: "Drag item: Ich"}, ...]
```

## Detection Strategy

```javascript
const isWordOrder = document.querySelector('[data-qa-ex="ex-phrase-builder"]');
```

1. `data-qa-ex="ex-phrase-builder"` present
2. `data-testid="ex-instruction"` = "Put the words in order."
3. Multiple word buttons with number shortcuts

## User Action
- Listen to audio for hint
- Click/drag words in correct order
- System validates when all words placed

## Known Issues
None reported yet.
