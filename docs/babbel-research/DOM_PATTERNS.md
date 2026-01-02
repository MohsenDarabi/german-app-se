# Babbel DOM Patterns for Auto-Solving

> Documented from issue analysis on Dec 29, 2025

## Key Discovery: `data-correct` Attribute

The most reliable way to find the correct answer in Babbel exercises is using the `data-correct="true"` attribute on buttons.

### Example: "Listen and choose the correct answer" (Dialog-choose)

**Issue File**: `issues/issue-1767022665879/`

**Screenshot**: Shows two answer options:
- Option 1: "Ciao" (incorrect)
- Option 2: "Hallo" (correct)

**HTML Structure**:
```html
<!-- Incorrect answer button -->
<button data-position="0"
        data-choice="Ciao"
        data-selector="choice-item-1"
        data-correct="false"           <!-- INCORRECT -->
        title="answer Ciao">
  <span data-shortcut-key="1">1</span>
  <span>Ciao</span>
</button>

<!-- Correct answer button -->
<button data-position="1"
        data-choice="Hallo"
        data-selector="choice-item-2"
        data-correct="true"            <!-- CORRECT -->
        title="answer Hallo">
  <span data-shortcut-key="2">2</span>
  <span>Hallo</span>
</button>
```

### Key Attributes

| Attribute | Purpose |
|-----------|---------|
| `data-correct="true"` | Marks the correct answer button |
| `data-choice="Hallo"` | The answer text (cleaner than extracting from DOM) |
| `data-shortcut-key="2"` | Keyboard shortcut |
| `title="answer Hallo"` | Alternative selector |
| `data-solution="Hallo"` | On parent element, shows expected answer |

### Solver Strategy

1. **Primary**: Find `button[data-correct="true"]:not([disabled])`
2. **Fallback**: Match `data-solution` with `data-choice` attribute
3. **Last resort**: Match solution text with button text

### Code Implementation

```javascript
// Method 1: Direct correct answer selector (most reliable)
const correctBtn = await page.$('button[data-correct="true"]:not([disabled])');
if (correctBtn) {
  // CDP click...
}

// Method 2: Match data-solution with data-choice
const solution = await page.evaluate(() => {
  const el = document.querySelector('[data-solution]');
  return el?.getAttribute('data-solution');
});
const buttons = await page.$$('button[title^="answer"]:not([disabled])');
for (const btn of buttons) {
  const choice = await btn.evaluate(el => el.getAttribute('data-choice'));
  if (choice === solution) {
    // CDP click...
  }
}
```

---

## Exercise Types Using `data-correct`

| Type | Selector | Has `data-correct`? |
|------|----------|---------------------|
| dialogue (dialog-choose) | `[data-selector="dialog-choose"]` | Yes |
| listening-choose-said | `[data-selector="vocabulary-choose"]` | Yes |
| mcq-translation | Various | Yes |
| vocab-card | `[data-trainer-type="card"]` | Yes |

---

## Speech Exercise Skip Button

**Selector**: `[data-selector="skip-button"]` or `button[title="Next"]`

**HTML**:
```html
<button data-selector="skip-button"
        title="Next"
        aria-label="Next">
  <!-- arrow icon -->
</button>
```

**Note**: Skip button may not be immediately available. Wait 800ms before looking for it.
