# Deutschlern‑PWA (Free‑First, Busuu‑inspiriert, kein Klon)

> Erst‑Commit: **nur Struktur + TODO‑Platzhalter**. Keine Business‑Logik.

Siehe `docs/ADR-0001.md` und `docs/` für Details. Repo verwaltet via pnpm + Turborepo.

---

## Audio Generation (TTS)

The app uses Google Cloud Text-to-Speech with **Chirp3-HD** voices for highest quality German pronunciation.

### Setup (One-time)

1. **Create a Google Cloud Service Account:**
   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
   - Create a service account with **Owner** or **Cloud Text-to-Speech User** role
   - Create a JSON key and download it

2. **Place the key file:**
   ```bash
   mkdir -p scripts/keys
   mv ~/Downloads/your-key-file.json scripts/keys/gcp-tts-service-account.json
   ```
   > Note: `scripts/keys/` is already in `.gitignore` - never commit credentials!

### Generate Audio

```bash
# Generate audio for a specific level
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --level=A1

# Generate for A2
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --level=A2

# Generate all levels (no filter)
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js
```

### Script Options

| Option | Description |
|--------|-------------|
| `--level=A1` | Filter to specific level (A1, A2, B1, etc.) |
| `--dry-run` | Preview without making API calls |
| `--status` | Show usage statistics only |
| `--force` | Regenerate all audio (ignore manifest) |

### Features

- **Chirp3-HD voice**: `de-DE-Chirp3-HD-Aoede` (female, highest quality)
- **Deduplication**: Same text generates once, copies to all locations
- **Usage tracking**: Tracks monthly characters in `scripts/audio-data/usage.json`
- **Manifest**: Tracks generated audio in `scripts/audio-data/manifest.json`
- **Free tier**: 1M characters/month, script stops at 90% to avoid charges

### Check Usage

```bash
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --status
```

---
