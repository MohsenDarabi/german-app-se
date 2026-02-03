# Story Writing Guidelines for German Learning

## Core Principles

### 1. HUMOR IS REQUIRED

Every story must have at least ONE of:
- Unexpected plot twist (like Duolingo's "passport in hand" moment)
- Character doing something silly
- Misunderstanding that gets resolved
- Self-deprecating humor

### 2. RELATABLE SCENARIOS

Good story settings:
- ✅ Café ordering (spills coffee)
- ✅ Lost at train station
- ✅ Forgetting birthday
- ✅ Pet causes chaos
- ✅ First day at work/school

Avoid:
- ❌ Generic "meeting someone"
- ❌ Boring transactions
- ❌ No conflict/tension

### 3. CHARACTER PERSONALITIES

Each recurring character should have a trait:
- **Eli**: Forgetful, always running late
- **Tom**: Over-organized, plans everything
- **Lisa**: Adventurous, sometimes reckless
- **Alex**: Foodie, always hungry

### 4. STORY STRUCTURE (3-Act Mini)

1. **Setup** (1-2 segments): Establish situation
2. **Conflict** (2-3 segments): Something goes wrong
3. **Resolution** (1-2 segments): Funny/satisfying ending

### 5. LANGUAGE DIFFICULTY

| Level | Grammar Allowed | Story Length |
|-------|-----------------|--------------|
| A1 | Simple present, basic vocabulary | 4-6 dialog lines |
| A2 | Past tense allowed, more vocabulary | 6-8 lines |
| B1 | Complex sentences, idioms | 8-10 lines |
| B2 | All grammar, nuanced expressions | 10+ lines |

---

## Example: Good vs Bad

### ❌ BAD (Boring)
```json
{
  "type": "dialog",
  "lines": [
    {"speaker": "Tom", "text": {"de": "Hallo, ich bin Tom.", "fa": "سلام، من تام هستم."}},
    {"speaker": "Eli", "text": {"de": "Hallo Tom, ich bin Eli.", "fa": "سلام تام، من الی هستم."}},
    {"speaker": "Tom", "text": {"de": "Wie geht es dir?", "fa": "حالت چطوره؟"}},
    {"speaker": "Eli", "text": {"de": "Gut, danke.", "fa": "خوبم، ممنون."}}
  ]
}
```

### ✅ GOOD (Engaging)
```json
{
  "type": "dialog",
  "scene": {
    "location": "Café",
    "description": {"de": "Eli sitzt und wartet.", "fa": "الی نشسته و منتظر است."}
  },
  "narratives": [
    {"position": 2, "text": {"de": "Tom kommt rein. Er sieht müde aus.", "fa": "تام وارد می‌شود. خسته به نظر می‌رسد."}}
  ],
  "lines": [
    {"speaker": "Eli", "text": {"de": "Wo ist Tom? Er ist immer pünktlich...", "fa": "تام کجاست؟ همیشه سر وقت است..."}, "mood": "confused"},
    {"speaker": "Tom", "text": {"de": "Eli! Entschuldigung! Mein Wecker...", "fa": "الی! ببخشید! ساعت زنگ‌دارم..."}, "mood": "surprised"},
    {"speaker": "Eli", "text": {"de": "Dein Wecker?", "fa": "ساعت زنگ‌دارت؟"}, "mood": "confused"},
    {"speaker": "Tom", "text": {"de": "Ja... meine Katze hat ihn vom Tisch geworfen.", "fa": "آره... گربه‌ام از روی میز انداختش."}, "mood": "sad"},
    {"speaker": "Eli", "text": {"de": "Deine Katze?", "fa": "گربه‌ات؟"}, "mood": "surprised"},
    {"speaker": "Tom", "text": {"de": "Ja. Sie heißt \"Pünktlich\". Ironisch, oder?", "fa": "آره. اسمش «پونکتلیش» (سر وقت) است. طنزآمیز نیست؟"}, "mood": "happy"}
  ],
  "questions": [
    {
      "question": "چرا تام دیر آمد؟",
      "options": ["ترافیک بود", "گربه‌اش ساعت را انداخت", "خوابش برد"],
      "correctIndex": 1,
      "explanation": "گربه تام ساعت زنگ‌دار را از روی میز انداخت.",
      "relatedLineIndex": 3
    }
  ]
}
```

---

## Humor Patterns That Work

1. **Ironic names**: Cat named "Pünktlich" (punctual) causes lateness
2. **Role reversal**: Organized person is messy today
3. **Escalation**: Small problem becomes bigger
4. **Callback**: Reference earlier detail for punchline
5. **Physical comedy**: Someone trips, spills, etc.

---

## Story Step Schema

```typescript
{
  "type": "story",
  "title": { "de": "Die verlorene Katze", "fa": "گربه گمشده" },
  "characters": ["Eli", "Tom"],
  "setting": { "location": "Park", "imageId": "park-scene" },
  "duration": "short",  // short = 1-2 min, medium = 2-3 min
  "tone": "funny",      // funny, dramatic, casual, romantic
  "segments": [
    // Narration segment
    {
      "type": "narration",
      "text": { "de": "Es ist Samstag Morgen...", "fa": "صبح شنبه است..." },
      "imageId": "morning-park"
    },
    // Dialog segment
    {
      "type": "dialog",
      "speaker": "Eli",
      "text": { "de": "Hast du meine Katze gesehen?", "fa": "گربه‌ام را دیده‌ای؟" },
      "mood": "confused"
    },
    // Question segment (comprehension check)
    {
      "type": "question",
      "question": "چه اتفاقی افتاده؟",
      "options": ["گربه الی گم شده", "تام دیر آمده", "باران می‌آید"],
      "correctIndex": 0
    }
  ]
}
```

---

## Enhanced Dialog Features

### Scene Context
```json
{
  "scene": {
    "location": "Flughafen",
    "description": { "de": "Am Gate. Der Flug nach Berlin.", "fa": "در گیت. پرواز به برلین." },
    "imageId": "airport-gate"
  }
}
```

### Narratives Between Lines
```json
{
  "narratives": [
    { "position": 0, "text": { "de": "Anna kommt schnell.", "fa": "آنا سریع می‌آید." }},
    { "position": 3, "text": { "de": "Er schaut auf die Uhr.", "fa": "به ساعت نگاه می‌کند." }}
  ]
}
```

### Character Moods
Available moods: `neutral`, `happy`, `sad`, `angry`, `surprised`, `confused`, `excited`

```json
{
  "lines": [
    { "speaker": "Tom", "text": {...}, "mood": "happy" },
    { "speaker": "Eli", "text": {...}, "mood": "surprised" }
  ]
}
```

---

## Content Guidelines Summary

| Rule | Description |
|------|-------------|
| **Fun Required** | Every story must have at least one humor element |
| **Short Duration** | 2-3 minutes max to maintain interest |
| **Character Consistency** | Use established personalities |
| **3-Act Structure** | Setup → Conflict → Resolution |
| **Visual Cues** | Use moods, scenes, and narratives |
| **Comprehension Checks** | Include 1-3 questions per story |
