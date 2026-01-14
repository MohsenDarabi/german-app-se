# Plan: Character Voice & Video System

> **Status:** Ready for implementation
> **Date:** 2026-01-09
> **Depends on:** R2 CDN Plan (can be implemented in parallel)
> **Purpose:** Unique voices for each character across TTS audio and AI-generated videos

---

## Impact Analysis: Existing Character Registry

### Summary

An existing character registry exists at `ai-workspace/curriculum/characters/character-registry.json`. This plan **extends** that registry rather than creating a new one.

### Direct Consumers (1 file)

| File | Usage | Impact of Changes |
|------|-------|-------------------|
| `scripts/validate-scope.js:12-20` | Loads registry to validate lesson character usage | **Low risk** - reads `characters.primary.names`, `secondary.names`, `persian.names` |

### Indirect References (character names hardcoded)

| Location | Pattern | Impact |
|----------|---------|--------|
| `packages/content-model/src/index.ts:205` | `speaker: z.string()` | No validation - any string allowed |
| `scripts/regenerate-asset-registry-full.js:295` | Hardcoded `['Eli', 'Tom', 'Lisa', 'Alex']` | Would need update if new characters added |
| `apps/web/src/lib/data/asset-registry.json` | 70+ entries with character speaker arrays | Data - regenerated from script |
| Lesson JSON files (content/de-fa/) | `"speaker": "Eli"` etc. | Data - no schema enforcement |

### Key Findings

1. **The registry is primarily a content creation guide** - used by validate-scope.js to check lessons during authoring
2. **No runtime app code imports it** - the app uses speaker names directly from lesson JSONs
3. **Adding new fields is safe** - existing consumers only read specific paths:
   - `characters.primary.names`
   - `characters.secondary.names`
   - `characters.persian.names`
   - `characters.primary.traits.*`

### Safe Extension Strategy

Adding `voice` and `video` config to the existing registry is **safe** because existing consumers only read specific nested paths. New sibling fields are ignored.

---

## Overview

Create a unified character system where each character (Eli, Tom, Lisa, Alex) has:

1. **Consistent visual identity** (already exists: reference images, prompts)
2. **Unique Google TTS voice** (different Chirp3-HD voice per character)
3. **AI video avatar** (lip-synced videos using uploaded TTS audio)
4. **Single source of truth** (character registry)

---

## Current State

| Component | Status | Details |
|-----------|--------|---------|
| Character Visuals | ✅ Ready | Reference images, prompts in `content/characters/` |
| Character Definitions | ✅ Ready | Personality, age, role in markdown files |
| TTS Audio | ⚠️ Single Voice | All characters use same voice (de-DE-Chirp3-HD-Aoede) |
| Google TTS Voices | ✅ Available | 4 distinct German voices in Chirp3-HD |
| AI Videos | ❌ Not Started | No avatar setup |
| Character Registry | ✅ Exists | `ai-workspace/curriculum/characters/character-registry.json` - extend with voice/video |

### Current Characters

| Character | Age | Gender | Role | Visual Assets |
|-----------|-----|--------|------|---------------|
| **Eli** | 43 | Female | Professional teacher | fullbody, head variants |
| **Tom** | 35-37 | Male | Reliable companion | fullbody, head variants |
| **Lisa** | 18-20 | Female | Young casual companion | fullbody, head, hair variants |
| **Alex** | ? | ? | ? | fullbody, head variants |

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHARACTER ASSET SYSTEM                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ai-workspace/curriculum/characters/character-registry.json     │
│  (Single source of truth for all character config)              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐           │
│  │    ELI      │   │    TOM      │   │    LISA     │   ...     │
│  ├─────────────┤   ├─────────────┤   ├─────────────┤           │
│  │ Visual:     │   │ Visual:     │   │ Visual:     │           │
│  │ - fullbody  │   │ - fullbody  │   │ - fullbody  │           │
│  │ - head      │   │ - head      │   │ - head      │           │
│  ├─────────────┤   ├─────────────┤   ├─────────────┤           │
│  │ Voice:      │   │ Voice:      │   │ Voice:      │           │
│  │ - Aoede     │   │ - Charon    │   │ - Kore      │           │
│  │ (Google)    │   │ (Google)    │   │ (Google)    │           │
│  ├─────────────┤   ├─────────────┤   ├─────────────┤           │
│  │ Video:      │   │ Video:      │   │ Video:      │           │
│  │ - avatarId  │   │ - avatarId  │   │ - avatarId  │           │
│  │ - audioSync │   │ - audioSync │   │ - audioSync │           │
│  └─────────────┘   └─────────────┘   └─────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SIMPLIFIED PIPELINE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Google TTS (per-character voice)                              │
│            │                                                    │
│            ▼                                                    │
│   ┌─────────────────┐                                          │
│   │  Audio files    │──────────────┐                           │
│   │  (unique voice) │              │                           │
│   └─────────────────┘              ▼                           │
│            │              ┌─────────────────┐                  │
│            │              │  HeyGen         │                  │
│            │              │  (upload audio) │                  │
│            │              │  (avatar + lip  │                  │
│            │              │   sync)         │                  │
│            │              └─────────────────┘                  │
│            │                       │                           │
│            ▼                       ▼                           │
│   ┌─────────────────┐    ┌─────────────────┐                  │
│   │   TTS AUDIO     │    │   AI VIDEO      │                  │
│   │ eli-hallo.mp3   │    │ eli-dialog.mp4  │                  │
│   │ tom-hallo.mp3   │    │ tom-dialog.mp4  │                  │
│   └─────────────────┘    └─────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Voice Assignment

| Character | Google TTS Voice | Gender | Style |
|-----------|------------------|--------|-------|
| **Eli** | de-DE-Chirp3-HD-Aoede | Female | Warm, professional |
| **Tom** | de-DE-Chirp3-HD-Charon | Male | Calm, confident |
| **Lisa** | de-DE-Chirp3-HD-Kore | Female | Young, energetic |
| **Alex** | de-DE-Chirp3-HD-Fenrir | Male | Deep, varied |
| **Narrator** | de-DE-Chirp3-HD-Aoede | Female | Neutral, clear |

---

## Phase 1: Extend Existing Character Registry

### 1.1 Existing Registry Location

The character registry already exists at:
```
ai-workspace/curriculum/characters/character-registry.json
```

**Current structure (v2.1.0):**
```json
{
  "version": "2.1.0",
  "characters": {
    "primary": {
      "names": ["Eli", "Tom"],
      "traits": {
        "Eli": {
          "gender": "female",
          "age": "43",
          "role": "Professional German teacher...",
          "assetPath": "content/characters/eli/",
          "available": true
        },
        "Tom": { ... }
      }
    },
    "secondary": {
      "names": ["Lisa", "Alex"]
    },
    "persian": {
      "names": ["Maryam", "Neda", "Bahram"]
    }
  },
  "rules": { ... },
  "levelGuidelines": { ... }
}
```

### 1.2 Extended Registry Structure

**Extend** `ai-workspace/curriculum/characters/character-registry.json` with voice/video config:

```json
{
  "version": "3.0.0",
  "characters": {
    "primary": {
      "names": ["Eli", "Tom"],
      "traits": {
        "Eli": {
          "gender": "female",
          "age": "43",
          "role": "Professional German teacher...",
          "assetPath": "content/characters/eli/",
          "available": true,

          "voice": {
            "provider": "google",
            "voiceName": "de-DE-Chirp3-HD-Aoede",
            "description": "Warm, professional female voice"
          },

          "video": {
            "status": "pending",
            "provider": "heygen",
            "avatarId": null,
            "avatarStatus": "not_created",
            "lipSyncMode": "audio_upload"
          }
        },

        "Tom": {
          "gender": "male",
          "age": "35-37",
          "role": "Reliable companion, dialog partner",
          "assetPath": "content/characters/tom/",
          "available": true,

          "voice": {
            "provider": "google",
            "voiceName": "de-DE-Chirp3-HD-Charon",
            "description": "Calm, confident male voice"
          },

          "video": {
            "status": "pending",
            "provider": "heygen",
            "avatarId": null,
            "lipSyncMode": "audio_upload"
          }
        }
      }
    },

    "secondary": {
      "names": ["Lisa", "Alex"],
      "traits": {
        "Lisa": {
          "gender": "female",
          "age": "18-20",
          "role": "Young casual companion",
          "assetPath": "content/characters/lisa/",
          "available": true,

          "voice": {
            "provider": "google",
            "voiceName": "de-DE-Chirp3-HD-Kore",
            "description": "Young, energetic female voice"
          },

          "video": {
            "status": "pending",
            "provider": "heygen",
            "avatarId": null,
            "lipSyncMode": "audio_upload"
          }
        },

        "Alex": {
          "gender": "male",
          "age": "25-30",
          "role": "Additional companion",
          "assetPath": "content/characters/alex/",
          "available": true,

          "voice": {
            "provider": "google",
            "voiceName": "de-DE-Chirp3-HD-Fenrir",
            "description": "Deep, varied male voice"
          },

          "video": {
            "status": "pending",
            "provider": "heygen",
            "avatarId": null,
            "lipSyncMode": "audio_upload"
          }
        }
      }
    },

    "system": {
      "narrator": {
        "role": "Voice for instructions, vocabulary, non-dialog content",
        "voice": {
          "provider": "google",
          "voiceName": "de-DE-Chirp3-HD-Aoede",
          "description": "Neutral, clear female voice"
        },
        "video": {
          "status": "not_applicable"
        }
      }
    }
  },

  "providers": {
    "voice": {
      "google": {
        "name": "Google Cloud TTS",
        "apiKeyEnv": "GOOGLE_APPLICATION_CREDENTIALS",
        "model": "Chirp3-HD",
        "germanVoices": [
          {"name": "de-DE-Chirp3-HD-Aoede", "gender": "female", "style": "warm"},
          {"name": "de-DE-Chirp3-HD-Charon", "gender": "male", "style": "calm"},
          {"name": "de-DE-Chirp3-HD-Kore", "gender": "female", "style": "young"},
          {"name": "de-DE-Chirp3-HD-Fenrir", "gender": "male", "style": "deep"}
        ]
      }
    },
    "video": {
      "heygen": {
        "name": "HeyGen",
        "website": "https://heygen.com",
        "apiKeyEnv": "HEYGEN_API_KEY",
        "features": ["avatar_creation", "lip_sync", "audio_upload"]
      },
      "synthesia": {
        "name": "Synthesia",
        "website": "https://synthesia.io",
        "apiKeyEnv": "SYNTHESIA_API_KEY",
        "features": ["avatar_creation", "lip_sync", "audio_upload"]
      }
    }
  },

  "defaults": {
    "voiceProvider": "google",
    "videoProvider": "heygen"
  },

  "rules": { ... },
  "levelGuidelines": { ... }
}
```

### 1.3 Migration Notes

**Breaking changes:** None - existing paths are preserved.

**Validation script update:** `scripts/validate-scope.js` will continue to work because it only reads:
- `characters.primary.names`
- `characters.secondary.names`
- `characters.persian.names`

**Asset registry script:** `scripts/regenerate-asset-registry-full.js:295` has hardcoded character names. Update to read from registry if adding new characters.

---

## Phase 2: Audio Generation Update (Multi-Voice)

### 2.1 Updated generate-audio.js

**Key changes to `scripts/generate-audio.js`:**

```javascript
const characterRegistry = require('../ai-workspace/curriculum/characters/character-registry.json');

// ============================================
// CHARACTER VOICE MAPPING (Google TTS)
// ============================================

// Map character names to their assigned Google TTS voices
const CHARACTER_VOICES = {
  'eli': 'de-DE-Chirp3-HD-Aoede',      // Warm female
  'tom': 'de-DE-Chirp3-HD-Charon',     // Calm male
  'lisa': 'de-DE-Chirp3-HD-Kore',      // Young female
  'alex': 'de-DE-Chirp3-HD-Fenrir',    // Deep male
  'narrator': 'de-DE-Chirp3-HD-Aoede'  // Default
};

function getCharacterFromStep(step, stepId) {
  // Dialog lines have explicit speaker
  if (step.type === 'dialog' && step.lines) {
    const lineIndex = parseInt(stepId.split('line')[1]);
    const speaker = step.lines[lineIndex]?.speaker;
    return speaker?.toLowerCase() || 'narrator';
  }

  // Some steps may have explicit character
  if (step.character) {
    return step.character.toLowerCase();
  }

  // Default to narrator for vocabulary, grammar tips, etc.
  return 'narrator';
}

function getVoiceName(characterId) {
  return CHARACTER_VOICES[characterId] || CHARACTER_VOICES['narrator'];
}

// ============================================
// UPDATED HASH FUNCTION (includes character)
// ============================================

function getTextHash(text, characterId = 'narrator') {
  // Include character in hash so same text with different speakers = different files
  return crypto.createHash('md5')
    .update(`${characterId}:${text.trim()}`)
    .digest('hex');
}

// ============================================
// GOOGLE TTS SYNTHESIS (per character)
// ============================================

async function synthesizeSpeech(text, characterId, outputPath) {
  const voiceName = getVoiceName(characterId);

  const request = {
    input: { text: text },
    voice: {
      languageCode: 'de-DE',
      name: voiceName
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.95,
      pitch: 0
    }
  };

  const [response] = await ttsClient.synthesizeSpeech(request);
  fs.writeFileSync(outputPath, response.audioContent, 'binary');

  return { path: outputPath, voiceName };
}

// ============================================
// UPDATED TEXT EXTRACTION (with character)
// ============================================

function extractAudioItems(lesson) {
  const items = [];
  const lessonId = lesson.id;

  for (const step of lesson.steps) {
    const stepId = step.id;

    switch (step.type) {
      case 'dialog':
        if (step.lines) {
          step.lines.forEach((line, idx) => {
            if (line.text?.de) {
              const character = line.speaker?.toLowerCase() || 'narrator';
              items.push({
                id: `${stepId}-line${idx}`,
                text: line.text.de.trim(),
                character: character,  // Track character for voice selection
                type: 'dialog',
                lessonId,
              });
            }
          });
        }
        break;

      case 'new-word':
        if (step.word?.de) {
          items.push({
            id: `${stepId}-word`,
            text: step.word.de.trim(),
            character: step.character || 'narrator',
            type: 'word',
            lessonId,
          });
        }
        break;

      // ... other cases with character tracking
    }
  }

  return items;
}

// ============================================
// UPDATED DEDUPLICATION (by text + character)
// ============================================

// Build deduplication map: (text + character) -> [items]
// Same text with different characters = different audio files
const textCharToItems = new Map();
for (const item of allItems) {
  const key = `${item.character}:${item.text}`;
  if (!textCharToItems.has(key)) {
    textCharToItems.set(key, []);
  }
  textCharToItems.get(key).push(item);
}
```

### 2.2 Updated Manifest Structure

```json
{
  "generatedTexts": {
    "eli:c4c12e1c6ac43bef955129360e9459bc": {
      "text": "Hallo! Ich bin Anna.",
      "character": "eli",
      "hash": "eli-c4c12e1c6ac43bef955129360e9459bc",
      "filePath": "/audio/A1-M01-L01/s14-line0.mp3",
      "voiceName": "de-DE-Chirp3-HD-Aoede"
    },
    "tom:bcb2b9f372d7fd357ff0e5f10523d036": {
      "text": "Hallo Anna!",
      "character": "tom",
      "hash": "tom-bcb2b9f372d7fd357ff0e5f10523d036",
      "filePath": "/audio/A1-M01-L01/s14-line1.mp3",
      "voiceName": "de-DE-Chirp3-HD-Charon"
    }
  },
  "fileMapping": {
    "A1-M01-L01": {
      "s14-line0": {
        "hash": "eli-c4c12e1c6ac43bef955129360e9459bc",
        "character": "eli"
      },
      "s14-line1": {
        "hash": "tom-bcb2b9f372d7fd357ff0e5f10523d036",
        "character": "tom"
      }
    }
  }
}
```

---

## Phase 3: Video Generation (Audio Upload)

### 3.1 HeyGen Avatar Setup

**Script:** `scripts/setup-heygen-avatars.js`

```javascript
#!/usr/bin/env node
/**
 * Create AI avatars in HeyGen for each character
 *
 * Uses reference images from content/characters/{name}/
 * No voice linking needed - we upload audio separately
 */

const fs = require('fs');
const path = require('path');

const CHARACTERS_DIR = path.join(__dirname, '../content/characters');
const REGISTRY_PATH = path.join(__dirname, '../ai-workspace/curriculum/characters/character-registry.json');

async function createAvatar(characterId) {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  const character = registry.characters[characterId];

  // Get reference image
  const variants = character.visual.variants;
  const primaryVariant = variants.fullbody || variants['fullbody-hair-open'] || Object.values(variants)[0];
  const imagePath = path.join(CHARACTERS_DIR, primaryVariant.image);

  console.log(`Creating HeyGen avatar for ${character.name}...`);
  console.log(`  Reference image: ${imagePath}`);

  // Create photo avatar in HeyGen (no voice linking)
  const form = new FormData();
  form.append('name', character.name);
  form.append('image', fs.createReadStream(imagePath));

  const response = await fetch('https://api.heygen.com/v1/avatar.create', {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.HEYGEN_API_KEY
    },
    body: form
  });

  const result = await response.json();

  // Update registry
  registry.characters[characterId].video.avatarId = result.avatar_id;
  registry.characters[characterId].video.avatarStatus = 'active';
  registry.characters[characterId].video.createdAt = new Date().toISOString();

  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));

  console.log(`  Avatar ID: ${result.avatar_id}`);
  return result.avatar_id;
}
```

### 3.2 Video Generation Script (Audio Upload)

**Script:** `scripts/generate-video.js`

```javascript
#!/usr/bin/env node
/**
 * Generate character videos using HeyGen with audio upload
 *
 * Pipeline:
 * 1. Generate audio with Google TTS (character-specific voice)
 * 2. Upload audio to HeyGen
 * 3. Generate lip-synced video with avatar
 *
 * Usage:
 *   node scripts/generate-video.js --lesson=A1-M01-L01 --step=s14
 *   node scripts/generate-video.js --character=eli --audio=path/to/audio.mp3
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '../ai-workspace/curriculum/characters/character-registry.json');
const AUDIO_DIR = path.join(__dirname, '../apps/web/static/audio');
const OUTPUT_DIR = path.join(__dirname, '../apps/web/static/videos');

async function generateVideoWithAudio({ characterId, audioPath, outputName }) {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  const character = registry.characters[characterId];

  if (!character.video?.avatarId) {
    throw new Error(`No avatar configured for ${characterId}`);
  }

  console.log(`Generating video for ${character.name}...`);
  console.log(`  Audio: ${audioPath}`);

  // Step 1: Upload audio file to HeyGen
  const audioForm = new FormData();
  audioForm.append('file', fs.createReadStream(audioPath));

  const uploadResponse = await fetch('https://api.heygen.com/v1/audio.upload', {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.HEYGEN_API_KEY
    },
    body: audioForm
  });

  const uploadResult = await uploadResponse.json();
  const audioAssetId = uploadResult.audio_asset_id;
  console.log(`  Audio uploaded: ${audioAssetId}`);

  // Step 2: Generate video with uploaded audio
  const response = await fetch('https://api.heygen.com/v1/video.generate', {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.HEYGEN_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      video_inputs: [{
        character: {
          type: 'avatar',
          avatar_id: character.video.avatarId,
          avatar_style: 'normal'
        },
        voice: {
          type: 'audio',
          audio_asset_id: audioAssetId  // Use uploaded audio!
        },
        background: {
          type: 'color',
          value: '#f0f0f0'
        }
      }],
      dimension: {
        width: 1280,
        height: 720
      }
    })
  });

  const result = await response.json();
  console.log(`  Video ID: ${result.video_id}`);

  // Step 3: Poll for completion
  let videoUrl = null;
  while (!videoUrl) {
    await new Promise(r => setTimeout(r, 5000));

    const status = await fetch(`https://api.heygen.com/v1/video.status?video_id=${result.video_id}`, {
      headers: { 'X-Api-Key': process.env.HEYGEN_API_KEY }
    }).then(r => r.json());

    if (status.status === 'completed') {
      videoUrl = status.video_url;
    } else if (status.status === 'failed') {
      throw new Error(`Video generation failed: ${status.error}`);
    }

    console.log(`  Status: ${status.status}...`);
  }

  // Step 4: Download video
  const videoResponse = await fetch(videoUrl);
  const videoBuffer = await videoResponse.arrayBuffer();

  const outputPath = path.join(OUTPUT_DIR, `${outputName}.mp4`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(videoBuffer));

  console.log(`  Saved: ${outputPath}`);
  return outputPath;
}

async function generateDialogVideo(lessonId, stepId) {
  // Load lesson
  const lessonPath = findLessonFile(lessonId);
  const lesson = JSON.parse(fs.readFileSync(lessonPath, 'utf8'));
  const step = lesson.steps.find(s => s.id === stepId);

  if (step.type !== 'dialog') {
    throw new Error('Step is not a dialog');
  }

  // Generate video for each line using existing TTS audio
  for (let i = 0; i < step.lines.length; i++) {
    const line = step.lines[i];
    const characterId = line.speaker?.toLowerCase() || 'narrator';
    const audioPath = path.join(AUDIO_DIR, lessonId, `${stepId}-line${i}.mp3`);

    if (!fs.existsSync(audioPath)) {
      console.log(`  Skipping line ${i} - audio not found: ${audioPath}`);
      continue;
    }

    await generateVideoWithAudio({
      characterId,
      audioPath,
      outputName: `${lessonId}/${stepId}-line${i}`
    });
  }
}
```

### 3.3 Video Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     VIDEO GENERATION PIPELINE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. AUDIO GENERATION (already done)                             │
│     ┌─────────────────┐                                         │
│     │ Google TTS      │                                         │
│     │ (Eli = Aoede)   │ ──► eli-hallo.mp3                       │
│     │ (Tom = Charon)  │ ──► tom-hallo.mp3                       │
│     └─────────────────┘                                         │
│                                                                  │
│  2. AUDIO UPLOAD                                                 │
│     ┌─────────────────┐                                         │
│     │ HeyGen API      │                                         │
│     │ audio.upload    │ ──► audio_asset_id                      │
│     └─────────────────┘                                         │
│                                                                  │
│  3. VIDEO GENERATION                                             │
│     ┌─────────────────┐                                         │
│     │ HeyGen API      │                                         │
│     │ video.generate  │                                         │
│     │ - avatar_id     │                                         │
│     │ - audio_asset   │ ──► eli-dialog.mp4 (lip-synced!)        │
│     └─────────────────┘                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Key benefit:** The same Google TTS audio is used for:
- In-app audio playback
- Video lip-sync generation

This ensures voice consistency across all media.

---

## Phase 4: R2 Integration

### 4.1 Updated R2 Manifest

```json
{
  "id": "de-fa",
  "version": "2.0",

  "characters": {
    "eli": {
      "voiceName": "de-DE-Chirp3-HD-Aoede",
      "avatarId": "eli_avatar_xyz789"
    },
    "tom": {
      "voiceName": "de-DE-Chirp3-HD-Charon",
      "avatarId": "tom_avatar_uvw012"
    },
    "lisa": {
      "voiceName": "de-DE-Chirp3-HD-Kore",
      "avatarId": "lisa_avatar_rst345"
    },
    "alex": {
      "voiceName": "de-DE-Chirp3-HD-Fenrir",
      "avatarId": "alex_avatar_abc123"
    }
  },

  "audioMap": {
    "A1-M01-L01/s14-line0": {
      "hash": "eli-abc123def456",
      "character": "eli"
    },
    "A1-M01-L01/s14-line1": {
      "hash": "tom-789xyz012uvw",
      "character": "tom"
    }
  },

  "videoMap": {
    "A1-M01-L01/s14-dialog": {
      "videoId": "vid-full-dialog-001",
      "characters": ["eli", "tom"],
      "duration": 15.5,
      "path": "/videos/A1-M01-L01/s14-dialog.mp4"
    }
  }
}
```

### 4.2 R2 Storage Structure

```
language-learning-assets/
├── de-fa/
│   ├── manifest.json
│   ├── content/...
│   │
│   ├── audio/
│   │   └── by-hash/
│   │       ├── eli-abc123def456.mp3      # Eli saying "Hallo"
│   │       ├── tom-abc123def456.mp3      # Tom saying "Hallo" (different!)
│   │       ├── lisa-abc123def456.mp3     # Lisa saying "Hallo" (different!)
│   │       └── narrator-xyz789.mp3       # Narrator voice
│   │
│   ├── videos/
│   │   └── A1-M01-L01/
│   │       ├── s14-dialog.mp4            # Full dialog video
│   │       ├── s14-line0.mp4             # Individual line video
│   │       └── ...
│   │
│   └── images/...
```

---

## Phase 5: App Integration

### 5.1 Updated Asset Service

```typescript
class AssetService {
  private manifest: Manifest;

  // Audio URL with character-specific hash
  getAudioUrl(lessonId: string, audioId: string): string {
    const entry = this.manifest.audioMap[`${lessonId}/${audioId}`];
    if (!entry) return '';

    return `${this.cdnBase}/de-fa/audio/by-hash/${entry.hash}.mp3`;
  }

  // Video URL
  getVideoUrl(lessonId: string, videoId: string): string {
    const entry = this.manifest.videoMap[`${lessonId}/${videoId}`];
    if (!entry) return '';

    return `${this.cdnBase}/de-fa${entry.path}`;
  }

  // Get character info
  getCharacter(characterId: string): CharacterInfo {
    return this.manifest.characters[characterId];
  }
}
```

---

## Implementation Timeline

### Week 1: Character Registry & Audio Update
- [ ] Extend existing character-registry.json with voice/video config
- [ ] Update generate-audio.js to use per-character Google TTS voices
- [ ] Update hash function to include character ID
- [ ] Test multi-voice audio generation

### Week 2: Regenerate Audio
- [ ] Regenerate all lesson audio with character-specific voices
- [ ] Update manifest with voice info
- [ ] Test in app - verify different characters sound different

### Week 3: HeyGen Setup
- [ ] Set up HeyGen account
- [ ] Create avatar for Eli (from reference image)
- [ ] Create avatar for Tom
- [ ] Create avatar for Lisa
- [ ] Create avatar for Alex
- [ ] Test avatar quality

### Week 4: Video Generation
- [ ] Create generate-video.js with audio upload
- [ ] Generate sample dialog videos
- [ ] Test lip-sync quality
- [ ] Verify voice matches TTS audio

### Week 5: R2 Integration & Testing
- [ ] Update R2 upload script for videos
- [ ] Update asset service
- [ ] Update app components
- [ ] Full testing

---

## Cost Estimate (Monthly)

| Service | Plan | Cost | Usage |
|---------|------|------|-------|
| Google TTS | Free tier | $0 | All audio (4M chars/mo free) |
| HeyGen | Creator | $24/mo | 15 min video |
| Cloudflare R2 | Free tier | $0 | Storage + CDN |
| **Total** | | **~$24/mo** | |

---

## Files Summary

| Action | File |
|--------|------|
| **MODIFY** | `ai-workspace/curriculum/characters/character-registry.json` (extend with voice/video) |
| **CREATE** | `scripts/setup-heygen-avatars.js` |
| **CREATE** | `scripts/generate-video.js` (with audio upload) |
| **MODIFY** | `scripts/generate-audio.js` (multi-voice support via Google TTS) |
| **MODIFY** | `scripts/regenerate-asset-registry-full.js` (read characters from registry) |
| **MODIFY** | `scripts/upload-to-r2.js` (add video upload) |
| **MODIFY** | `apps/web/src/lib/services/assetService.ts` |

---

## Success Criteria

1. ✅ Each character has unique, recognizable voice (different Google TTS voice)
2. ✅ Voice is consistent across TTS audio and video (same audio file used)
3. ✅ Dialog lines play with correct character voice
4. ✅ Videos show character with lip-synced speech
5. ✅ Same audio used for app playback and video generation
6. ✅ Character registry is single source of truth
7. ✅ Audio still deduplicated (per character + text combination)
8. ✅ No additional monthly cost for voice generation (Google TTS free tier)
