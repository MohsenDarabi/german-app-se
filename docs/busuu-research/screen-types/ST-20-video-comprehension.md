# ST-20: Video Comprehension (Dialog)

> Video dialog with transcript - user watches conversation and reads along.

## Screenshots
- `ST-20/a-video-dialog.png` - Tristan & Christiane conversation

## Screen Type Identifier
```
data-qa-ex="ex-comprehension"
```

## Visual Elements

```
┌─────────────────────────────────────────────────────────────────┐
│       ══░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    ✕    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Watch the video.                             │
│                                                                 │
│    ┌───────────────────────────────────────────────────────┐    │
│    │                                                       │    │
│    │              [VIDEO: Two people talking]              │    │
│    │                                                       │    │
│    │  ▶━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 00:08       │    │
│    └───────────────────────────────────────────────────────┘    │
│                                                                 │
│    Tristan: Hallo Christiane. Wie geht's?                       │
│    Tristan: Hello Christiane. How's it going?                   │
│                                                                 │
│    Christiane: Hi Tristan. Mir geht's super. Wie geht's dir?    │
│    Christiane: Hi Tristan. It's going great. How are you?       │
│                                                                 │
│    Tristan: Nicht so gut.                                       │
│    Tristan: Not so good.                                        │
│                                                                 │
│                                          [ Continue ]           │
└─────────────────────────────────────────────────────────────────┘
```

## Content to Extract

```json
{
  "type": "video-comprehension",
  "instruction": "Watch the video.",
  "video": {
    "mp4": "https://cdn.busuu.com/.../video_small.mp4",
    "webm": "https://cdn.busuu.com/.../video_small.webm",
    "poster": "https://cdn.busuu.com/.../poster.jpg"
  },
  "dialog": [
    {
      "speaker": "Tristan",
      "german": "Hallo Christiane. Wie geht's?",
      "english": "Hello Christiane. How's it going?"
    },
    {
      "speaker": "Christiane",
      "german": "Hi Tristan. Mir geht's super. Wie geht's dir?",
      "english": "Hi Tristan. It's going great. How are you?"
    },
    {
      "speaker": "Tristan",
      "german": "Nicht so gut.",
      "english": "Not so good."
    }
  ]
}
```

## DOM Selectors

**Screen type identifier:** `data-qa-ex="ex-comprehension"`

| Element | Selector | Notes |
|---------|----------|-------|
| Screen type | `[data-qa-ex="ex-comprehension"]` | **KEY: Comprehension** |
| Instruction | `[data-testid="ex-instruction"]` | "Watch the video." |
| Video wrapper | `[data-testid="asset-video"]` | Contains video player |
| Video source MP4 | `[data-testid="asset-video"] source[type="video/mp4"]` | MP4 URL |
| Video source WebM | `[data-testid="asset-video"] source[type="video/mp4"]` | WebM URL (type is wrong in DOM) |
| Video poster | `video[data-poster]` | Thumbnail image |
| Dialog text | `[data-testid="asset-text"]` | Full transcript |
| German lines | `[data-testid="asset-text"] b` | Bold = German |
| English lines | `[data-testid="asset-text"] i` | Italic = English |

**Actual DOM structure:**
```html
<div data-qa-ex="ex-comprehension">

  <!-- Instruction -->
  <div data-testid="ex-instruction">
    <p><span>Watch the video.</span></p>
  </div>

  <!-- Video -->
  <div data-testid="asset-video">
    <video autoplay data-poster="https://cdn.busuu.com/.../poster.jpg" playsinline>
      <source src="https://cdn.busuu.com/.../video_small.mp4" type="video/mp4">
      <source src="https://cdn.busuu.com/.../video_small.webm" type="video/mp4">
    </video>
  </div>

  <!-- Dialog Transcript -->
  <div data-testid="asset-text">
    <p>
      <span>
        <b>Tristan: Hallo Christiane. Wie geht's?</b><br>
        <i>Tristan: Hello Christiane. How's it going?</i><br><br>

        <b>Christiane: Hi Tristan. Mir geht's super. Wie geht's dir?</b><br>
        <i>Christiane: Hi Tristan. It's going great. How are you?</i><br><br>

        <b>Tristan: Nicht so gut.</b><br>
        <i>Tristan: Not so good.</i>
      </span>
    </p>
  </div>

</div>
```

**Extraction:**
```javascript
// Detect comprehension exercise
const isComprehension = document.querySelector('[data-qa-ex="ex-comprehension"]');

// Get instruction
const instruction = document.querySelector('[data-testid="ex-instruction"]')?.textContent?.trim();
// → "Watch the video."

// Get video sources
const video = document.querySelector('[data-testid="asset-video"] video');
const poster = video?.getAttribute('data-poster');
const sources = Array.from(video?.querySelectorAll('source') || []).map(s => ({
  src: s.src,
  type: s.type
}));

// Get dialog lines
const germanLines = document.querySelectorAll('[data-testid="asset-text"] b');
const englishLines = document.querySelectorAll('[data-testid="asset-text"] i');

const dialog = Array.from(germanLines).map((b, i) => {
  const germanText = b.textContent;
  const englishText = englishLines[i]?.textContent || '';

  // Parse speaker from "Speaker: text" format
  const [speaker, ...textParts] = germanText.split(': ');
  const german = textParts.join(': ');
  const [, ...engParts] = englishText.split(': ');
  const english = engParts.join(': ');

  return { speaker, german, english };
});
// → [{speaker: "Tristan", german: "Hallo Christiane...", english: "Hello Christiane..."},
//    {speaker: "Christiane", german: "Hi Tristan...", english: "Hi Tristan..."},
//    {speaker: "Tristan", german: "Nicht so gut.", english: "Not so good."}]
```

## Detection Strategy

```javascript
const isComprehension = document.querySelector('[data-qa-ex="ex-comprehension"]');
```

## User Action
- Watch the video
- Read along with transcript
- Click Continue

## Valuable Content
- **Dialog exchanges** - Real conversation patterns
- **German + English** - Bilingual transcript (we replace English with Persian)
- **Speaker names** - Character context

## Known Issues
None reported yet.
