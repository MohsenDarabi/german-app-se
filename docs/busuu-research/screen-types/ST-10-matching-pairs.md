# ST-10: Matching Pairs (Matchup)

> Exercise where user matches related items (questions with answers, words with translations).

## Screenshots
- `ST-10/a-matching-pairs.png` - Match conversation pairs

## When It Appears
- Tests understanding of conversation flow
- Can match questions↔answers, words↔translations
- Usually 2-4 pairs

## Visual Elements

```
┌─────────────────────────────────────────┐
│       ══════════════════════════░░ ✕   │  ← Progress bar
├─────────────────────────────────────────┤
│                                         │
│            Match the pairs.             │  ← Instruction
│                                         │
│   ┌──────────────┐  ┌──────────────┐   │
│   │Wie heißt du? │  │Ich heiße     │   │
│   │      1       │  │Laura.      3 │   │
│   └──────────────┘  └──────────────┘   │
│                                         │
│   ┌──────────────┐  ┌──────────────┐   │
│   │ Freut mich!  │  │Freut mich    │   │
│   │      2       │  │auch!       4 │   │
│   └──────────────┘  └──────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## Content to Extract

```json
{
  "type": "matching-pairs",
  "instruction": "Match the pairs.",
  "pairs": [
    {
      "id": 0,
      "question": "Wie heißt du?",
      "answer": "Ich heiße Laura."
    },
    {
      "id": 1,
      "question": "Freut mich!",
      "answer": "Freut mich auch!"
    }
  ]
}
```

## Key Observations

1. **Pairs identified by `data-qa-pass`** - Same value = matched pair
2. **Two types**: `data-qa-type="answer"` (questions) and `data-qa-type="asset"` (answers)
3. **Conversation matching** - Often question↔response pairs
4. **Numbered shortcuts** - 1,2 for questions, 3,4 for answers

## DOM Selectors

**Screen type identifier:** `data-qa-ex="ex-matchup"`

| Element | Selector | Notes |
|---------|----------|-------|
| Screen type | `[data-qa-ex="ex-matchup"]` | **KEY: Matching pairs** |
| Type confirm | `[data-qa-ex-type="matchup"]` | Additional identifier |
| Instruction | `[data-testid="ex-instruction"]` | "Match the pairs." |
| Questions | `[data-qa-type="answer"]` | Left side items |
| Answers | `[data-qa-type="asset"]` | Right side items |
| Pair ID | `data-qa-pass` | **Same value = matched pair** |

**Actual DOM structure:**
```html
<div data-qa-ex="ex-matchup">
  <div data-qa-ex-type="matchup">
    <div data-testid="ex-instruction">
      <p><span>Match the pairs.</span></p>
    </div>
  </div>

  <!-- Questions (left side) -->
  <div role="button" class="ex-matchup__item--flex"
       data-qa-pass="0" data-qa-type="answer">
    <span>Wie heißt du?</span>
    <div data-testid="test-shortcut">1</div>
  </div>
  <div role="button" class="ex-matchup__item--flex"
       data-qa-pass="1" data-qa-type="answer">
    <span>Freut mich!</span>
    <div data-testid="test-shortcut">2</div>
  </div>

  <!-- Answers (right side) -->
  <div role="button" class="ex-matchup__item--flex"
       data-qa-pass="0" data-qa-type="asset">
    <span>Ich heiße Laura.</span>
    <div data-testid="test-shortcut">3</div>
  </div>
  <div role="button" class="ex-matchup__item--flex"
       data-qa-pass="1" data-qa-type="asset">
    <span>Freut mich auch!</span>
    <div data-testid="test-shortcut">4</div>
  </div>
</div>
```

**Extraction:**
```javascript
// Detect screen type
const isMatchup = document.querySelector('[data-qa-ex="ex-matchup"]');

// Get all items
const questions = document.querySelectorAll('[data-qa-type="answer"]');
const answers = document.querySelectorAll('[data-qa-type="asset"]');

// Build pairs by matching data-qa-pass values
const pairs = Array.from(questions).map(q => {
  const pairId = q.getAttribute('data-qa-pass');
  const matchingAnswer = document.querySelector(
    `[data-qa-type="asset"][data-qa-pass="${pairId}"]`
  );
  return {
    id: parseInt(pairId),
    question: q.querySelector('span')?.textContent,
    answer: matchingAnswer?.querySelector('span')?.textContent
  };
});
// → [{id:0, question:"Wie heißt du?", answer:"Ich heiße Laura."},
//    {id:1, question:"Freut mich!", answer:"Freut mich auch!"}]
```

## Detection Strategy

```javascript
const isMatchup = document.querySelector('[data-qa-ex="ex-matchup"]');
```

1. `data-qa-ex="ex-matchup"` present
2. Items with `data-qa-type="answer"` AND `data-qa-type="asset"`
3. Instruction contains "Match"

## User Action
- Click/tap items to match them
- Lines drawn between matched pairs
- Can use keyboard shortcuts (1-4)

## Known Issues
None reported yet.
