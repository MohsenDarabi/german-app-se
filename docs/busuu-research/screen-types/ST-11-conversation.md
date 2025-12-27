# ST-11: Conversation (Community Exercise)

> **PASS-THROUGH** - Community speaking/writing exercise. Document but don't extract.

## Screenshots
- `ST-11/a-conversation-community.png` - "Wie heißt du?" community prompt

## Screen Type Identifier
```
data-qa-ex="ex-conversation"
```

## Visual Elements

```
┌─────────────────────────────────────────────────────────────────┐
│       ══════════════════════════════════════════════░░    ✕    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Complete a Community exercise and get feedback from           │
│                     fluent speakers.                            │
│                                                                 │
│    ┌───────────────────────────────────────────────────────┐    │
│    │                                                       │    │
│    │           [Image: person with headphones]             │    │
│    │                                                       │    │
│    │         Wie heißt du? (What's your name?)            │    │
│    │                   Show hint                           │    │
│    └───────────────────────────────────────────────────────┘    │
│                                                                 │
│         How would you like to complete this exercise?           │
│                                                                 │
│           ┌──────────────┐    ┌──────────────┐                 │
│           │  🎤 Speak    │    │  ✏️ Write    │                 │
│           └──────────────┘    └──────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Why Pass-Through

1. **Community feature** - Requires real human feedback, not applicable to our app
2. **No correct answer** - Open-ended speaking/writing, no extraction needed
3. **Social learning** - Busuu-specific feature we don't replicate

## What to Do

**Crawler action:** Detect and skip. Log that it was seen.

```javascript
// Detection
const isConversation = document.querySelector('[data-qa-ex="ex-conversation"]');

if (isConversation) {
  console.log('Skipping community exercise (pass-through)');
  // Click continue/skip button to proceed
}
```

## Content Observed (for reference)

| Element | Content |
|---------|---------|
| Prompt | "Wie heißt du? (What's your name?)" |
| Hint available | Yes ("Show hint" link) |
| Options | Speak or Write |
| Image | Context photo |

## User Action
- User speaks or writes an answer
- Community members provide feedback
- Not part of automated learning flow

## Known Issues
None - intentionally skipped.
