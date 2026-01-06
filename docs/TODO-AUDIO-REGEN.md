# Audio Regeneration - POSTPONED

**Date:** 2026-01-06
**Status:** WAITING - Content still changing

## What needs to be done

After the Lisa → Eli character rename, the following audio files need regeneration:

- All lessons in A1 Module 1 (L01-L10)
- All lessons in A1 Module 2 (L01-L04)

Affected sentences include:
- "Hallo Lisa!" → "Hallo Eli!"
- "Tschüss Lisa!" → "Tschüss Eli!"
- Dialog lines with Lisa as speaker
- etc.

## When to regenerate

Wait until content structure is finalized. The learning content is still changing.

## Command to regenerate

```bash
# Regenerate all A1 audio when ready:
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --level=A1
```

## Estimated character usage

~5,000-10,000 characters (within free tier)
