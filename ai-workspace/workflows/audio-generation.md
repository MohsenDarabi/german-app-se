# Audio Generation Workflow

> How to generate TTS audio for lessons using Google Cloud TTS

---

## Overview

German text in lessons needs audio for:
- Vocabulary words
- Example sentences
- Dialog lines
- Exercise content

Uses Google Cloud TTS with Chirp3-HD voice for high-quality German pronunciation.

---

## Prerequisites

1. **Google Cloud credentials** must exist:
   ```
   scripts/keys/gcp-tts-service-account.json
   ```

2. **Lesson JSON** must be valid and complete

---

## Generate Audio

### For a single lesson
```bash
cd /Volumes/External_ssd_mohsen/WorkspaceExtern/german-learning-app-main

GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --lesson=A1-M01-L01
```

### For an entire level
```bash
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --level=A1
```

### Force regeneration (skip cache)
```bash
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --lesson=A1-M01-L01 --force
```

---

## Output Location

Audio files are saved to:
```
apps/web/static/audio/{LessonID}/
```

Example:
```
apps/web/static/audio/A1-M01-L01/
├── s1-word.mp3
├── s1-example.mp3
├── s2-word.mp3
├── s19-line0.mp3
├── s19-line1.mp3
└── ...
```

---

## What Gets Audio

| Step Type | Audio Generated For |
|-----------|---------------------|
| `new-word` | `word.de`, `example.text.de` |
| `dialog` | Each `line.text.de` |
| `grammar-tip` | Each example sentence |
| `fill-in-blank` | `sentence` |
| `word-order` | `correctSentence.de` |
| `translation` | `correctTranslation.de` |
| `true-false` | `statement` |
| `multiple-choice` | `question` (if German) |

---

## Deduplication

The script automatically deduplicates:
- Same German text in multiple steps = one audio file
- Shared audio stored in `apps/web/static/audio/shared/`

---

## Verify Audio

After generation:

1. **Check files exist**:
   ```bash
   ls -la apps/web/static/audio/A1-M01-L01/
   ```

2. **Test in browser**:
   - Start dev server: `pnpm run dev`
   - Navigate to lesson
   - Click audio buttons on each step

3. **Check for errors** in terminal output

---

## Troubleshooting

### "Could not load credentials"
- Ensure `scripts/keys/gcp-tts-service-account.json` exists
- Check file permissions

### "Quota exceeded"
- Google Cloud TTS has daily limits
- Wait or use different project

### Missing audio for a step
- Check if German text is empty in lesson JSON
- Verify step type is supported

---

## Update Progress

After generating audio:

1. Update `ai-workspace/STATUS.md`:
   ```markdown
   | A1-M01-L01 | 45 | Generated |
   ```

2. Update `progress/audio-generated.json`:
   ```json
   {
     "generated": [
       {
         "lessonId": "A1-M01-L01",
         "files": 45,
         "generatedAt": "2026-01-02"
       }
     ]
   }
   ```

---

## Checklist

- [ ] Lesson JSON is complete and valid
- [ ] Credentials file exists
- [ ] Audio generation command ran successfully
- [ ] Audio files created in correct directory
- [ ] Tested audio playback in browser
- [ ] Updated STATUS.md
- [ ] Updated progress/audio-generated.json
