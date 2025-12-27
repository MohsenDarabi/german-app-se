# ST-14: True or False

> Exercise where user evaluates if a statement about a word/phrase is correct.

## Screenshots
- `ST-14/a-true-false.png` - "Freut mich" means: Nice to meet you.

## When It Appears
- Tests comprehension of vocabulary meanings
- Usually shows a German phrase + proposed English meaning
- User decides if translation is correct

## Visual Elements

```
┌─────────────────────────────────────────┐
│       ══════════════════════░░    ✕    │  ← Progress bar
├─────────────────────────────────────────┤
│                                         │
│           True or false?                │  ← Instruction
│                                         │
│    ┌─────────────────────────────┐      │
│    │  ▶━━━━━━━━━━━━━━━━━━━ 1x   │      │  ← Audio player
│    ├─────────────────────────────┤      │
│    │         Freut mich!         │      │  ← German phrase
│    └─────────────────────────────┘      │
│                                         │
│  "Freut mich" means: Nice to meet you.  │  ← Statement to evaluate
│                                         │
│      ┌─────────┐    ┌─────────┐        │
│      │  True   │    │  False  │        │  ← Options
│      │    1    │    │    2    │        │  ← Keyboard shortcuts
│      └─────────┘    └─────────┘        │
│                                         │
└─────────────────────────────────────────┘
```

## Content to Extract

```json
{
  "type": "true-false",
  "instruction": "True or false?",
  "phrase": {
    "de": "Freut mich!",
    "hasAudio": true
  },
  "statement": "\"Freut mich\" means: Nice to meet you.",
  "correctAnswer": true,
  "options": [
    { "id": 1, "text": "True" },
    { "id": 2, "text": "False" }
  ]
}
```

## Key Observations

1. **Audio included** - User can hear the phrase
2. **Statement format** - "X" means: Y (testing translation knowledge)
3. **Binary choice** - Always True (1) or False (2)
4. **Bold key word** - The German phrase is bold in the statement

## DOM Selectors

**Screen type identifier:** `data-qa-ex="ex-true-false"`

| Element | Selector | Notes |
|---------|----------|-------|
| Screen type | `[data-qa-ex="ex-true-false"]` | **KEY: True/False exercise** |
| Instruction | `[data-testid="ex-instruction"]` | "True or false?" |
| True button | `[data-qa-choice="true"]` | `data-qa-pass="true"` if correct |
| False button | `[data-qa-choice="false"]` | `data-qa-pass="true"` if correct |
| Correct answer | `[data-qa-pass="true"]` | Whichever button has this |

```html
<button class="ex-btn ex-btn--default"
        data-qa-choice="true"
        data-qa-pass="true"
        data-qa-exercise-true="true">
  <div data-testid="test-shortcut">1</div>
  True
</button>
```

**Extraction:**
```javascript
// Get correct answer
const correctBtn = document.querySelector('[data-qa-pass="true"]');
const correctAnswer = correctBtn?.getAttribute('data-qa-choice');  // "true" or "false"
```

## Detection Strategy

```javascript
const isTrueFalse = document.querySelector('[data-qa-ex="ex-true-false"]');
```

1. `data-qa-ex="ex-true-false"` present
2. `data-testid="ex-instruction"` = "True or false?"
3. Two options: True and False

## User Action
- Listen to audio (optional)
- Read the statement
- Click True or False (or press 1/2)

## Known Issues
None reported yet.
