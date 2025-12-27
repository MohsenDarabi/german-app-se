# ST-04: Answer Feedback with Tip

> Feedback screen shown after user submits a correct answer, includes vocabulary tip/explanation.

## Screenshots
- `ST-04/a-correct-answer-tip.png` - Correct "Hallo" with usage tip

## When It Appears
- Immediately after selecting correct answer in exercise (ST-03)
- Shows celebration + educational tip
- **CRITICAL**: This is where valuable grammar/usage tips appear!

## Visual Elements

```
┌─────────────────────────────────────────┐
│ 📥 ↓    ════════════════░░░░░░    ✕    │  ← Progress bar + close
├─────────────────────────────────────────┤
│                                         │
│        Complete the sentence.           │  ← Original instruction
│                                         │
│    ┌───────────────────────────────┐    │
│    │      [Man by river]           │    │  ← Video (same)
│    │  ▶━━━━━━━━━━━━━━━━━━━━━ 1s   │    │
│    └───────────────────────────────┘    │
│                                         │
│          ┌────────┐                     │
│          │ Hallo  │ !                   │  ← Answer filled in (GREEN)
│          └────────┘                     │
│                                         │
│        ┌─────┐    ┌─────┐              │
│        │ Hey │    │     │              │  ← Options (greyed out)
│        └─────┘    └─────┘              │
│                                         │
├─────────────────────────────────────────┤
│ 🎉 You did it                           │  ← Success message
│                                         │
│ 🔊 Hallo!                               │  ← Word with audio button
│    Hello!                               │  ← Translation
│                                         │
│ "Hallo" is the most common greeting     │  ← USAGE TIP (important!)
│ in German. It can be used in almost     │
│ any situation.                          │
│                                         │
│                        [ Continue ]     │  ← Next button
└─────────────────────────────────────────┘
```

## Content to Extract

```json
{
  "type": "answer-feedback",
  "result": "correct",
  "celebration": "You did it",
  "word": {
    "de": "Hallo!",
    "en": "Hello!",
    "hasAudio": true
  },
  "tip": {
    "text": "\"Hallo\" is the most common greeting in German. It can be used in almost any situation.",
    "type": "usage"
  }
}
```

## Key Observations

1. **TIPS ARE HERE** - This is where grammar/usage explanations appear
2. **Audio available** - Speaker icon to hear pronunciation again
3. **Bilingual reinforcement** - Shows word + translation again
4. **Celebratory feedback** - "You did it" with icon
5. **Answer stays visible** - Green highlighted answer in context

## Tip Types (to discover)

Different tips may appear:
- Usage tips (when to use a word)
- Grammar tips (gender, case, etc.)
- Cultural notes (formal vs informal)
- Pronunciation hints

## DOM Selectors

**Stable selectors using `data-testid`:**

| Element | Selector | Notes |
|---------|----------|-------|
| Audio button | `[data-testid="feedback-audio-button"]` | Contains play button |
| Audio icon | `[data-testid="ex-audio-icon-button"]` | Clickable button |
| Word (DE) | `[data-testid="feedback-text"]` (first) | "Hallo!" |
| Translation (EN) | `[data-testid="feedback-text"]` (second) | "Hello!" |
| Tip container | `[data-testid="feedback-footer"]` | Parent of tip text |
| Tip text | `[data-testid="feedback-footer"] footer` | The actual tip |

**Note:** `data-testid="feedback-text"` appears 3 times:
1. German word
2. English translation
3. Footer tip text

```html
<div class="sc-fAyhPT iPdrwX">
  <ul class="sc-bIaGFe iYszsV">
    <li>
      <div class="sc-fUCuFg ebnFTh">
        <!-- Audio + Word row -->
        <div direction="row" class="sc-bdvvtL hkzXnQ">
          <div data-testid="feedback-audio-button">
            <button data-testid="ex-audio-icon-button">
              <!-- SVG speaker icon -->
            </button>
          </div>
          <p>
            <span data-testid="feedback-text">Hallo!</span>  <!-- DE word -->
          </p>
        </div>
        <!-- Translation -->
        <p>
          <span data-testid="feedback-text">Hello!</span>  <!-- EN translation -->
        </p>
      </div>
    </li>
  </ul>

  <!-- TIP SECTION - THIS IS THE IMPORTANT PART -->
  <div data-testid="feedback-footer">
    <footer data-testid="feedback-text">
      "<b>Hallo</b>" is the most common greeting in German.
      It can be used in almost any situation.
    </footer>
  </div>
</div>
```

**Extraction strategy:**
```javascript
// Get feedback panel
const feedbackFooter = document.querySelector('[data-testid="feedback-footer"]');
if (feedbackFooter) {
  const tipText = feedbackFooter.querySelector('footer')?.textContent;
  // tipText = '"Hallo" is the most common greeting in German...'
}

// Get word and translation
const feedbackTexts = document.querySelectorAll('[data-testid="feedback-text"]');
// feedbackTexts[0] = "Hallo!" (German)
// feedbackTexts[1] = "Hello!" (English)
// feedbackTexts[2] = tip text (in footer)
```

## Detection Strategy

**Identify this screen by:**
1. "You did it" or similar success message
2. Bottom panel with tip text
3. Audio icon next to word
4. "Continue" button in feedback panel

## User Action
- Read the tip (important learning content!)
- Optionally click audio to hear pronunciation
- Click "Continue" to proceed

## EXTRACTOR ISSUE

**Current problem**: The existing extractor (Approach A) doesn't reliably capture these tips because:
- They appear in a modal/overlay after answer submission
- Need to wait for animation/transition
- Different DOM structure than main exercise

**Solution for Approach B**:
```javascript
// Wait for feedback panel to appear
await page.waitForSelector('[data-testid="feedback-footer"]', { timeout: 5000 });

// Extract tip
const tip = await page.$eval(
  '[data-testid="feedback-footer"] footer',
  el => el.textContent
);
```

**Key insight**: The `data-testid="feedback-footer"` selector is stable and reliable!

## Known Issues
This is exactly what user reported as problematic in current extractor. Now we have the selectors to fix it.
