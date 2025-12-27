# ST-02: Video Vocabulary Introduction

> Screen introducing new vocabulary with a short video clip of a native speaker.

## Screenshots
- `ST-02/a-video-vocab-hallo.png` - "Hallo!" introduction with woman waving
- `ST-02/b-video-vocab-hi.png` - "Hi!" introduction with man in pink shirt

## When It Appears
- First screen type when introducing NEW vocabulary
- Header says "Look, something new!"
- Appears at the start of vocabulary lessons

## Visual Elements

```
┌─────────────────────────────────────────┐
│ 📥 ↓    ════════░░░░░░░░░░░░░░    ✕    │  ← Progress bar + close
├─────────────────────────────────────────┤
│                                         │
│         Look, something new!            │  ← Header (new vocab indicator)
│                                         │
│    ┌───────────────────────────────┐    │
│    │                           🔖  │    │  ← Add to favorites button
│    │      [Woman by river]         │    │
│    │                               │    │
│    │  ▶━━━━━━━━━━━━━━━━━━━━━ 1s   │    │  ← Play button + duration
│    └───────────────────────────────┘    │
│                                         │
│              Hallo!                     │  ← German word
│              Hello!                     │  ← English translation
│                                         │
├─────────────────────────────────────────┤
│ ♿                        [ Continue ]   │  ← Action button
└─────────────────────────────────────────┘
```

## Content to Extract

```json
{
  "type": "video-vocabulary",
  "isNewVocab": true,
  "word": {
    "de": "Hallo!",
    "en": "Hello!"
  },
  "video": {
    "duration": "1s",
    "description": "Woman by river waving and saying Hallo",
    "hasPlayButton": true
  },
  "header": "Look, something new!",
  "canAddToFavorites": true
}
```

## Key Observations

1. **Video is SHORT** - Only 1 second, basically a greeting gesture
2. **Context via video** - Visual context (woman, outdoor setting) helps memorization
3. **Bilingual** - German + English translation shown together
4. **"New" indicator** - Explicitly tells user this is new vocabulary
5. **Favorites button** - Bookmark icon (top-right of card) to save vocabulary for later review

## DOM Selectors

**Screen type identifier:** `data-qa-ex="ex-flashcard"`

| Element | Selector | Notes |
|---------|----------|-------|
| Screen type | `[data-qa-ex="ex-flashcard"]` | **KEY: Identifies this as vocab intro** |
| Instruction | `[data-testid="ex-instruction"]` | Contains "Look, something new!" |
| Video container | `[data-testid="asset-simple-video"]` | Video player wrapper |
| Video source | `video source[type="video/mp4"]` | Direct video URL |
| Word + Translation | `[data-testid="asset-text"]` | Contains both spans |
| Favorites | `[data-testid="ex-favourite"]` | `data-qa-ex-favourite-active` = true/false |
| Continue button | `[data-testid="check_button"]` | "Continue" text |
| Feedback footer | `[data-testid="feedback-footer"]` | Empty on intro screens |

```html
<div data-qa-ex="ex-flashcard">  <!-- KEY IDENTIFIER -->

  <!-- Instruction header -->
  <div data-testid="ex-instruction">
    <p><span>Look, something new!</span></p>
  </div>

  <!-- Video player -->
  <div data-testid="asset-simple-video">
    <video autoplay data-poster="https://cdn.busuu.com/...poster.jpg">
      <source src="https://cdn.busuu.com/.../video.mp4" type="video/mp4">
    </video>
  </div>

  <!-- Word and Translation -->
  <div data-testid="asset-text">
    <div>
      <p><span>Hi!</span></p>      <!-- German word -->
    </div>
    <p><span>Hi!</span></p>        <!-- English translation -->
  </div>

  <!-- Favorites button -->
  <div data-testid="ex-favourite" data-qa-ex-favourite-active="false">
    <button data-testid="test-tooltip-button">
      <!-- bookmark icon -->
    </button>
  </div>

</div>

<!-- Bottom bar -->
<div data-testid="feedback-footer"></div>  <!-- Empty on intro -->
<button data-testid="check_button">Continue</button>
```

**Extraction strategy:**
```javascript
// Detect screen type
const isFlashcard = document.querySelector('[data-qa-ex="ex-flashcard"]');
const instruction = document.querySelector('[data-testid="ex-instruction"]')?.textContent;
const isNewVocab = instruction?.includes('Look, something new');

// Extract content
const assetText = document.querySelector('[data-testid="asset-text"]');
const spans = assetText?.querySelectorAll('span');
const wordDE = spans?.[0]?.textContent;  // "Hi!"
const wordEN = spans?.[1]?.textContent;  // "Hi!"

// Get video URL
const videoSrc = document.querySelector('[data-testid="asset-simple-video"] source')?.src;
// "https://cdn.busuu.com/media-resources/video/mp4/fb464cc9-8a5b-4548-9bac-a42fae718f42_small.mp4"
```

## Detection Strategy

**Identify this screen by:**
```javascript
// Primary check
const isVocabIntro =
  document.querySelector('[data-qa-ex="ex-flashcard"]') &&
  document.querySelector('[data-testid="ex-instruction"]')?.textContent?.includes('Look, something new');
```

1. `data-qa-ex="ex-flashcard"` present
2. `data-testid="ex-instruction"` contains "Look, something new!"
3. `data-testid="asset-simple-video"` has video element
4. `data-testid="feedback-footer"` is empty (no tip yet)

## User Action
- Watch the video (auto-plays or click play)
- Read the word and translation
- Click "Continue" to proceed

## Multimedia Notes

For our app, we need:
- Short video clips showing native speakers
- Or alternatively, audio + image combination
- Context images matching the video scene

## Known Issues
None reported yet - this is documentation phase.
