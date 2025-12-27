# ST-21: Grammar Tip

> Standalone grammar explanation with examples - valuable content to extract!

## Screenshots
- `ST-21/a-grammar-tip.png` - "Ich komme aus" with country article rules

## Screen Type Identifier
```
data-qa-ex="ex-tip"
```

## Visual Elements

```
┌─────────────────────────────────────────────────────────────────┐
│       ══════════════════════════════════════════░░░░░░    ✕    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      Here's a tip!                              │
│                                                                 │
│   We say "Ich komme aus" + country to tell people our           │
│   country of origin.                                            │
│   Some countries need a little word like "der" or "den"         │
│   before them.                                                  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Ich komme aus Deutschland. (I'm from Germany.)      🔊  │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │ Ich komme aus der Türkei. (I'm from Türkiye.)       🔊  │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │ Ich komme aus den USA. (I'm from the USA.)          🔊  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                          [ Continue ]           │
└─────────────────────────────────────────────────────────────────┘
```

## Content to Extract

```json
{
  "type": "grammar-tip",
  "title": "Here's a tip!",
  "explanation": "We say \"Ich komme aus\" + country to tell people our country of origin. Some countries need a little word like \"der\" or \"den\" before them.",
  "highlights": ["Ich komme aus", "der", "den"],
  "examples": [
    {
      "german": "Ich komme aus Deutschland.",
      "english": "I'm from Germany.",
      "highlights": ["aus"],
      "hasAudio": true
    },
    {
      "german": "Ich komme aus der Türkei.",
      "english": "I'm from Türkiye.",
      "highlights": ["aus", "der"],
      "hasAudio": true
    },
    {
      "german": "Ich komme aus den USA.",
      "english": "I'm from the USA.",
      "highlights": ["aus", "den"],
      "hasAudio": true
    }
  ]
}
```

## DOM Selectors

**Screen type identifier:** `data-qa-ex="ex-tip"`

| Element | Selector | Notes |
|---------|----------|-------|
| Screen type | `[data-qa-ex="ex-tip"]` | **KEY: Grammar tip** |
| Title | `[data-testid="ex-instruction"]` | "Here's a tip!" |
| Explanation | `[data-testid="tip-text"]` | Main grammar text |
| Highlights | `[data-testid="tip-text"] b` | Bold = key grammar points |
| Examples table | `table tbody tr` | Each row = one example |
| Example text | `table tbody tr td p` | German + (English) |
| Example highlights | `table tbody tr td p b` | Bold grammar points |
| Audio button | `[data-testid="ex-audio-icon-button"]` | Per-example audio |

**Actual DOM structure:**
```html
<div data-qa-ex="ex-tip">

  <!-- Title -->
  <div data-testid="ex-instruction">
    <p><span>Here's a tip!</span></p>
  </div>

  <!-- Explanation -->
  <p>
    <span data-testid="tip-text">
      We say "<b>Ich komme aus</b>" + country to tell people our country of origin.<br>
      Some countries need a little word like "<b>der</b>" or "<b>den</b>" before them.
    </span>
  </p>

  <!-- Examples table -->
  <table>
    <tbody>
      <tr>
        <td>
          <p>Ich komme <b>aus</b> Deutschland. (I'm from Germany.)</p>
          <button data-testid="ex-audio-icon-button">🔊</button>
        </td>
      </tr>
      <tr>
        <td>
          <p>Ich komme <b>aus</b> <b>der</b> Türkei. (I'm from Türkiye.)</p>
          <button data-testid="ex-audio-icon-button">🔊</button>
        </td>
      </tr>
      <tr>
        <td>
          <p>Ich komme <b>aus</b> <b>den</b> USA. (I'm from the USA.)</p>
          <button data-testid="ex-audio-icon-button">🔊</button>
        </td>
      </tr>
    </tbody>
  </table>

</div>
```

**Extraction:**
```javascript
// Detect grammar tip
const isTip = document.querySelector('[data-qa-ex="ex-tip"]');

// Get title
const title = document.querySelector('[data-testid="ex-instruction"]')?.textContent?.trim();
// → "Here's a tip!"

// Get explanation text
const tipText = document.querySelector('[data-testid="tip-text"]');
const explanation = tipText?.textContent?.trim();
// → "We say "Ich komme aus" + country..."

// Get highlighted terms in explanation
const explanationHighlights = Array.from(tipText?.querySelectorAll('b') || [])
  .map(b => b.textContent);
// → ["Ich komme aus", "der", "den"]

// Get examples
const examples = Array.from(document.querySelectorAll('table tbody tr')).map(row => {
  const p = row.querySelector('td p');
  const fullText = p?.textContent || '';

  // Parse "German text. (English text.)" format
  const match = fullText.match(/^(.+?)\s*\((.+?)\)$/);
  const german = match?.[1]?.trim() || fullText;
  const english = match?.[2]?.trim() || '';

  // Get highlights
  const highlights = Array.from(p?.querySelectorAll('b') || [])
    .map(b => b.textContent);

  // Check for audio
  const hasAudio = !!row.querySelector('[data-testid="ex-audio-icon-button"]');

  return { german, english, highlights, hasAudio };
});
// → [{german: "Ich komme aus Deutschland.", english: "I'm from Germany.", ...}, ...]
```

## Detection Strategy

```javascript
const isTip = document.querySelector('[data-qa-ex="ex-tip"]');
```

## User Action
- Read grammar explanation
- Listen to example sentences (audio buttons)
- Click Continue

## Valuable Content

This is **HIGH VALUE** content:
- Grammar rules explained clearly
- Key words highlighted (`<b>` tags)
- Example sentences with translations
- Audio for pronunciation

**For Persian learners:** We translate English to Persian and add Persian-specific grammar notes.

## Known Issues
None reported yet.
