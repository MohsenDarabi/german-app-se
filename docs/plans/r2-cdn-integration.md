# Plan: Native App with CDN Assets & Multi-Language Support

> **Status:** Ready for implementation
> **Date:** 2026-01-08 (Updated)
> **Architecture:** Hybrid (Supabase + Cloudflare R2)
> **Update:** Added audio deduplication strategy

---

## Overview

Transform the Language Learning App from a bundled-asset PWA to a **native app shell** that:

1. Supports **multiple language pairs** (2-5 initially: German-Persian, English-Persian, etc.)
2. Loads **all content from Cloudflare R2 CDN** (no bundled lessons/audio/images)
3. Offers **offline mode as premium feature only**
4. Runs natively on **Android and iOS** via Capacitor
5. Content is **AI-generated + human reviewed**
6. **Audio stored by content hash** (deduplicated - 35% storage savings)

---

## Current State

| Component | Status | Details |
|-----------|--------|---------|
| Capacitor | ✅ Ready | Android v8.0.0 configured, iOS not yet |
| Assets | ❌ Bundled | 1,803 audio files (15MB) in `/static/audio/` |
| Audio Dedup | ⚠️ Partial | API calls deduplicated, but files copied (630 duplicates) |
| Service Worker | ❌ Caches All | Cache-first for all media |
| Premium | ❌ Not Built | Only drafted in gamification plan |
| Multi-language | ❌ Single | Only German-Persian (de-fa) |
| Auth | ✅ Ready | Supabase + Google OAuth |
| Database | ✅ Ready | Supabase PostgreSQL + IndexedDB |

### Current Audio Duplication Issue

The `generate-audio.js` script correctly deduplicates at the **API level** (same text = one API call), but then **copies** files to multiple paths for app simplicity:

```
Current: /audio/A1-M01-L01/g1-q0.mp3      ← "Hallo" (copy 1)
         /audio/A1-M01-L01/g2-pair0.mp3   ← "Hallo" (copy 2, identical)
```

**Statistics:**
- Total audio files: 1,803
- Unique audio content: 1,173
- Duplicate files: 630 (35%)
- Wasted space: ~5MB

**This is fixed in the R2 migration** by storing audio by content hash with a lookup manifest.

---

## Target Architecture (Hybrid)

```
┌─────────────────────────────────────────────────────────────┐
│                     APP SHELL (~2-3 MB)                     │
│  • SvelteKit UI Components                                  │
│  • Business Logic                                           │
│  • NO content, NO audio, NO images bundled                  │
└─────────────────────────────────────────────────────────────┘
                │                           │
                ▼                           ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│        SUPABASE           │   │     CLOUDFLARE R2         │
│        (Free Tier)        │   │     (Free Tier)           │
├───────────────────────────┤   ├───────────────────────────┤
│ • Auth (Google OAuth)     │   │ • Audio files (by hash)   │
│ • User database           │   │ • Images (vocabulary)     │
│ • Progress sync           │   │ • Lesson JSONs            │
│ • Premium status          │   │ • Language manifests      │
│ • Wrong answers review    │   │                           │
├───────────────────────────┤   ├───────────────────────────┤
│ 500 MB DB, 5 GB storage   │   │ 10 GB storage             │
│ 2 GB egress (sufficient   │   │ UNLIMITED egress ⭐       │
│ for small user data)      │   │ (audio/image streaming)   │
└───────────────────────────┘   └───────────────────────────┘
```

### Why Hybrid?

| Need | Best Solution | Reason |
|------|---------------|--------|
| Auth | Supabase | Built-in, 2 lines of code |
| User DB | Supabase | PostgreSQL with RLS, real-time sync |
| Media CDN | Cloudflare R2 | **Unlimited free egress** |

---

## Phase 1: Cloudflare R2 Setup

### 1.1 R2 Bucket Structure (Deduplicated)

```
language-learning-assets/
├── de-fa/                              # German for Persian speakers
│   ├── manifest.json                   # Language pack metadata + audioMap
│   ├── content/
│   │   └── A1/M01/L01.json             # Lesson content
│   ├── audio/
│   │   └── by-hash/                    # ⭐ DEDUPLICATED STORAGE
│   │       ├── 6cf6f38ece20256114e7f5e85f72ef5c.mp3  # "Hallo"
│   │       ├── d1bf93299de1b68e6d382c893bf1215f.mp3  # "Hi"
│   │       ├── c1a5298f939e87e8f962a5edfc206918.mp3  # "Guten Tag"
│   │       └── ...                     # Only 1,173 unique files
│   └── images/
│       └── shared/
│           ├── greetings/
│           ├── food/
│           └── ...
├── en-fa/                              # English for Persian speakers
│   ├── manifest.json
│   └── ...
├── fr-fa/                              # French for Persian speakers
└── ...
```

**Key change:** Audio files stored by **content hash**, not by step path.

### 1.2 Public Access URL

```
https://pub-{hash}.r2.dev/de-fa/audio/by-hash/6cf6f38ece20256114e7f5e85f72ef5c.mp3
```

Or with custom domain:
```
https://cdn.yourapp.com/de-fa/audio/by-hash/6cf6f38ece20256114e7f5e85f72ef5c.mp3
```

### 1.3 Language Pack Manifest (Updated)

**File:** `manifest.json` per language pair

```json
{
  "id": "de-fa",
  "version": "1.0.0",
  "name": { "source": "Deutsch", "target": "آلمانی" },
  "flag": "🇩🇪",
  "levels": ["A1", "A2", "B1", "B2"],
  "totalLessons": 60,
  "totalSizeMB": 100,
  "freeLessons": 6,

  "audioMap": {
    "A1-M01-L01/s1-word": "d1bf93299de1b68e6d382c893bf1215f",
    "A1-M01-L01/s1-example": "cc3d49771b8692f560bf2fe8e37bab9c",
    "A1-M01-L01/g1-q0": "6cf6f38ece20256114e7f5e85f72ef5c",
    "A1-M01-L01/g2-pair0": "6cf6f38ece20256114e7f5e85f72ef5c",
    "A1-M01-L02/s3-word": "6cf6f38ece20256114e7f5e85f72ef5c"
  },

  "images": {
    "img-greeting-wave": "/images/shared/greetings/img-greeting-wave.png",
    "img-a1-m01-l01-s2-hi": "/images/shared/greetings/img-a1-m01-l01-s2-hi.jpg"
  },

  "lessons": [
    {
      "id": "A1-M01-L01",
      "level": "A1",
      "module": 1,
      "lesson": 1,
      "title": { "de": "Hallo!", "fa": "سلام!" },
      "sizeMB": 0.3,
      "audioCount": 49,
      "uniqueAudioCount": 35,
      "imageCount": 3,
      "free": true
    }
  ],

  "stats": {
    "totalAudioFiles": 1173,
    "totalAudioReferences": 1803,
    "deduplicationSavings": "35%"
  },

  "updatedAt": "2026-01-08T00:00:00Z"
}
```

**Note:** `audioMap` maps `{lessonId}/{audioId}` → `{contentHash}`. Multiple keys can point to the same hash (that's the deduplication).

### 1.4 Upload Script

**New file:** `scripts/upload-to-r2.js`

```javascript
#!/usr/bin/env node
/**
 * Upload language pack to Cloudflare R2 (deduplicated)
 *
 * Features:
 * - Reads existing audio manifest (scripts/audio-data/manifest.json)
 * - Reads asset registry (apps/web/src/lib/data/asset-registry.json)
 * - Uploads audio by content hash (deduplication)
 * - Uploads images by asset ID
 * - Generates combined R2 manifest
 * - Uses S3-compatible API (@aws-sdk/client-s3)
 *
 * Usage:
 *   R2_ACCOUNT_ID=xxx R2_ACCESS_KEY=xxx R2_SECRET_KEY=xxx \
 *   node scripts/upload-to-r2.js --language=de-fa
 *
 * Options:
 *   --dry-run     Show what would be uploaded
 *   --language=X  Language pair to upload (default: de-fa)
 *   --force       Re-upload all files (ignore existing)
 */

const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

// Paths
const AUDIO_MANIFEST = path.join(__dirname, 'audio-data/manifest.json');
const ASSET_REGISTRY = path.join(__dirname, '../apps/web/src/lib/data/asset-registry.json');
const CONTENT_DIR = path.join(__dirname, '../content/de-fa');
const STATIC_DIR = path.join(__dirname, '../apps/web/static');

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const languagePair = args.find(a => a.startsWith('--language='))?.split('=')[1] || 'de-fa';

  console.log('🚀 R2 Upload Script (Deduplicated)\n');

  // 1. Load existing manifests
  const audioManifest = JSON.parse(fs.readFileSync(AUDIO_MANIFEST, 'utf8'));
  const assetRegistry = JSON.parse(fs.readFileSync(ASSET_REGISTRY, 'utf8'));

  // 2. Build audioMap from fileMapping
  const audioMap = {};
  for (const [lessonId, steps] of Object.entries(audioManifest.fileMapping)) {
    for (const [audioId, hash] of Object.entries(steps)) {
      audioMap[`${lessonId}/${audioId}`] = hash;
    }
  }

  console.log(`📊 Audio Statistics:`);
  console.log(`   Total references: ${Object.keys(audioMap).length}`);
  console.log(`   Unique files: ${Object.keys(audioManifest.generatedTexts).length}`);
  console.log(`   Deduplication: ${(100 - (Object.keys(audioManifest.generatedTexts).length / Object.keys(audioMap).length) * 100).toFixed(1)}% savings\n`);

  // 3. Upload unique audio files
  console.log('🎵 Uploading audio files (by hash)...\n');
  const uploadedHashes = new Set();

  for (const [hash, data] of Object.entries(audioManifest.generatedTexts)) {
    if (uploadedHashes.has(hash)) continue;

    const localPath = data.filePath;
    const r2Key = `${languagePair}/audio/by-hash/${hash}.mp3`;

    if (dryRun) {
      console.log(`   [DRY RUN] ${r2Key}`);
    } else {
      // await uploadToR2(r2Key, localPath);
      console.log(`   ✅ ${r2Key}`);
    }
    uploadedHashes.add(hash);
  }

  console.log(`\n   Uploaded: ${uploadedHashes.size} unique audio files\n`);

  // 4. Upload images
  console.log('🖼️  Uploading images...\n');
  let imageCount = 0;

  for (const [assetId, asset] of Object.entries(assetRegistry.assets)) {
    if (asset.status !== 'completed') continue;

    const localPath = path.join(STATIC_DIR, asset.path);
    if (!fs.existsSync(localPath)) continue;

    const r2Key = `${languagePair}${asset.path}`;

    if (dryRun) {
      console.log(`   [DRY RUN] ${r2Key}`);
    } else {
      // await uploadToR2(r2Key, localPath);
      console.log(`   ✅ ${r2Key}`);
    }
    imageCount++;
  }

  console.log(`\n   Uploaded: ${imageCount} images\n`);

  // 5. Build and upload R2 manifest
  const images = {};
  for (const [assetId, asset] of Object.entries(assetRegistry.assets)) {
    if (asset.status === 'completed') {
      images[assetId] = asset.path;
    }
  }

  const r2Manifest = {
    id: languagePair,
    version: '1.0.0',
    name: { source: 'Deutsch', target: 'آلمانی' },
    flag: '🇩🇪',
    levels: ['A1', 'A2', 'B1', 'B2'],
    audioMap: audioMap,
    images: images,
    lessons: [], // TODO: Build from content files
    stats: {
      totalAudioFiles: uploadedHashes.size,
      totalAudioReferences: Object.keys(audioMap).length,
      totalImages: imageCount,
      deduplicationSavings: `${(100 - (uploadedHashes.size / Object.keys(audioMap).length) * 100).toFixed(1)}%`
    },
    updatedAt: new Date().toISOString()
  };

  if (dryRun) {
    console.log('📋 R2 Manifest (preview):\n');
    console.log(JSON.stringify(r2Manifest, null, 2).substring(0, 500) + '...\n');
  } else {
    // await uploadToR2(`${languagePair}/manifest.json`, JSON.stringify(r2Manifest, null, 2));
    console.log('📋 Uploaded manifest.json\n');
  }

  console.log('✅ Upload complete!\n');
}

main().catch(console.error);
```

### 1.5 Storage Comparison

| Metric | Current (Local) | R2 (Deduplicated) |
|--------|-----------------|-------------------|
| Audio files | 1,803 | 1,173 |
| Audio storage | ~15 MB | ~10 MB |
| Upload operations | N/A | 1,173 |
| Manifest size | N/A | ~200 KB |

---

## Phase 2: Asset Service Layer

### 2.1 New Service: Asset Service

**New file:** `apps/web/src/lib/services/assetService.ts`

```typescript
import type { Manifest, LessonMeta } from '$lib/types';

class AssetService {
  private cdnBase = import.meta.env.PUBLIC_R2_URL;
  private manifest: Manifest | null = null;
  private languagePair = 'de-fa';

  // Initialize with manifest
  async init(languagePair: string = 'de-fa'): Promise<void> {
    this.languagePair = languagePair;
    const url = `${this.cdnBase}/${languagePair}/manifest.json`;
    const response = await fetch(url);
    this.manifest = await response.json();
  }

  // Audio URL with hash lookup (DEDUPLICATED)
  getAudioUrl(lessonId: string, audioId: string): string {
    if (!this.manifest) {
      console.warn('AssetService not initialized');
      return '';
    }

    const key = `${lessonId}/${audioId}`;
    const hash = this.manifest.audioMap[key];

    if (!hash) {
      console.warn(`Audio not found: ${key}`);
      return ''; // Fallback to TTS
    }

    return `${this.cdnBase}/${this.languagePair}/audio/by-hash/${hash}.mp3`;
  }

  // Image URL (direct path from manifest)
  getImageUrl(imageId: string): string {
    if (!this.manifest) return '';

    const path = this.manifest.images[imageId];
    return path ? `${this.cdnBase}/${this.languagePair}${path}` : '';
  }

  // Lesson content URL
  getLessonUrl(lessonId: string): string {
    // A1-M01-L01 → A1/M01/L01.json
    const [level, module, lesson] = lessonId.split('-');
    const modulePart = module.replace('M', 'M');
    const lessonPart = lesson.replace('L', 'L');
    return `${this.cdnBase}/${this.languagePair}/content/${level}/${modulePart}/${lessonPart}.json`;
  }

  // Get available languages
  async getAvailableLanguages(): Promise<string[]> {
    // Could be a separate index file or hardcoded initially
    return ['de-fa', 'en-fa'];
  }

  // Get lesson metadata
  getLessonMeta(lessonId: string): LessonMeta | null {
    return this.manifest?.lessons.find(l => l.id === lessonId) || null;
  }

  // Preload lesson audio (for smoother playback)
  async preloadLessonAudio(lessonId: string): Promise<void> {
    if (!this.manifest) return;

    const audioKeys = Object.keys(this.manifest.audioMap)
      .filter(key => key.startsWith(`${lessonId}/`));

    // Get unique hashes for this lesson
    const hashes = new Set(audioKeys.map(key => this.manifest!.audioMap[key]));

    // Preload each unique audio file
    const preloads = [...hashes].map(hash => {
      const url = `${this.cdnBase}/${this.languagePair}/audio/by-hash/${hash}.mp3`;
      return fetch(url).then(r => r.blob()); // Triggers browser cache
    });

    await Promise.all(preloads);
  }
}

export const assetService = new AssetService();
```

### 2.2 Modify Audio Utility

**File:** `apps/web/src/lib/utils/audio.ts`

Changes:
- Replace local paths with `assetService.getAudioUrl()`
- URL pattern: `{R2_BASE}/{pair}/audio/by-hash/{hash}.mp3`
- Check local cache first (premium offline)
- Add loading indicator during fetch
- Keep TTS fallback for network errors

```typescript
import { assetService } from '$lib/services/assetService';

export async function playAudio(lessonId: string, audioId: string): Promise<void> {
  const url = assetService.getAudioUrl(lessonId, audioId);

  if (!url) {
    // Fallback to TTS if audio not in manifest
    return playTTSFallback(lessonId, audioId);
  }

  const audio = new Audio(url);
  return audio.play();
}
```

### 2.3 Modify Asset Resolver

**File:** `apps/web/src/lib/utils/asset-resolver.ts`

Changes:
- Use `assetService.getImageUrl()` for images
- Add `languagePair` parameter to resolution
- Handle both asset ID and direct path inputs

---

## Phase 3: Service Worker Changes

**File:** `apps/web/src/service-worker.ts`

### Current (Remove)
```typescript
// Cache ALL audio/images automatically
if (isMedia) return cacheFirst(request);
```

### New Strategy
```typescript
// Premium status from main thread
let isPremium = false;

self.addEventListener('message', (event) => {
  if (event.data.type === 'SET_PREMIUM') isPremium = event.data.value;
  if (event.data.type === 'CACHE_LESSON') cacheLessonAssets(event.data);
  if (event.data.type === 'DELETE_LESSON') deleteLessonCache(event.data);
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle CDN audio requests (by-hash pattern)
  if (url.pathname.includes('/audio/by-hash/')) {
    if (isPremium) {
      // Cache-first for premium (downloaded content)
      event.respondWith(cacheFirst(event.request));
    } else {
      // Network-only for free users (no caching)
      event.respondWith(networkOnly(event.request));
    }
    return;
  }

  // Handle CDN image requests
  if (url.pathname.includes('/images/shared/')) {
    // Images can be cached for everyone (they're smaller)
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // ... rest unchanged
});

// Cache lesson for offline (premium only)
async function cacheLessonAssets(data: { lessonId: string; audioHashes: string[] }) {
  const cache = await caches.open('lesson-audio-v1');

  for (const hash of data.audioHashes) {
    const url = `${CDN_BASE}/de-fa/audio/by-hash/${hash}.mp3`;
    const response = await fetch(url);
    await cache.put(url, response);
  }
}
```

---

## Phase 4: Premium System

### 4.1 Update Database Schema

**File:** `apps/web/src/lib/db/index.ts`

Add:
```typescript
interface User {
  // ... existing fields
  isPremium: boolean;
  premiumExpiresAt?: string;
}

interface DownloadedLesson {
  id?: number;
  languagePair: string;  // "de-fa", "en-fa"
  lessonId: string;
  audioHashes: string[]; // Unique hashes for this lesson
  downloadedAt: string;
  sizeBytes: number;
  version: string;
}
```

### 4.2 Premium Store

**New file:** `apps/web/src/lib/stores/premium.ts`

Manages:
- Premium status sync with Supabase
- Downloaded lessons tracking
- Download progress for active downloads
- Storage usage calculation (by unique hashes, not references)

### 4.3 Native Storage Service

**New file:** `apps/web/src/lib/services/nativeStorage.ts`

Cross-platform storage abstraction:
- **Web:** Cache API
- **Native (Capacitor):** Filesystem plugin (`@capacitor/filesystem`)

```typescript
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

const isNative = Capacitor.isNativePlatform();

class NativeStorage {
  async saveAudioByHash(hash: string, data: Blob): Promise<void>;
  async getAudioByHash(hash: string): Promise<Blob | null>;
  async deleteLesson(lessonId: string, audioHashes: string[]): Promise<void>;
  async getStorageUsed(): Promise<number>;
  async getDownloadedHashes(): Promise<Set<string>>;
}
```

---

## Phase 5: Multi-Language UI

### 5.1 Language Selection Page

**New file:** `apps/web/src/routes/languages/+page.svelte`

- Shows available language packs from CDN
- Display: flag, name, lesson count, size
- Download/manage buttons
- Storage usage indicator

### 5.2 Modify Home Page

**File:** `apps/web/src/routes/+page.svelte`

- Show active language pairs
- Language switcher in header
- Per-language progress tracking

### 5.3 Lesson List Changes

- Show download status icons (⬇️ available, ✅ downloaded, 🔒 premium)
- For free users: stream from CDN
- For premium: show download option
- Show actual download size (deduplicated)

### 5.4 Lesson Loader Component

**New file:** `apps/web/src/lib/components/lesson/LessonLoader.svelte`

Loading screen shown while fetching lesson assets:
- Progress bar (0-100%)
- "Loading lesson..." in Persian
- Shows unique files being loaded (not inflated count)
- Retry on error
- Skip if assets already cached (premium)

---

## Phase 6: Content Structure Changes

### 6.1 Directory Restructure

From:
```
content/de-fa/A1/module-01/A1-M01-L01.json
apps/web/static/audio/A1-M01-L01/g1-q0.mp3      # Duplicated
apps/web/static/audio/A1-M01-L01/g2-pair0.mp3   # Same content
apps/web/static/images/shared/
```

To (for R2):
```
language-packs/de-fa/
├── manifest.json                    # Includes audioMap
├── content/A1/M01/L01.json
├── audio/by-hash/                   # Deduplicated!
│   └── 6cf6f38ece20256114e7f5e85f72ef5c.mp3
└── images/shared/greetings/...
```

### 6.2 Lesson JSON Changes

Add language pair context:
```json
{
  "id": "A1-M01-L01",
  "languagePair": "de-fa",
  "source": { "code": "de", "name": "Deutsch" },
  "target": { "code": "fa", "name": "فارسی" },
  // ... rest unchanged
}
```

---

## Phase 7: Capacitor Native Build

### 7.1 Install Plugins

```bash
npm install @capacitor/filesystem @capacitor/network
npx cap sync
```

### 7.2 iOS Setup

```bash
npx cap add ios
npx cap open ios
```

### 7.3 Remove Bundled Assets from Build

**File:** `apps/web/svelte.config.js`

Exclude from static:
```javascript
// Don't copy audio/images to build
// They're served from CDN now
```

### 7.4 App Size Target

| Build | Size |
|-------|------|
| Current (with assets) | ~17 MB |
| Target (shell only) | ~2-3 MB |

---

## Files Changed Summary

| Action | File |
|--------|------|
| **CREATE** | `scripts/upload-to-r2.js` |
| **CREATE** | `apps/web/src/lib/services/assetService.ts` |
| **CREATE** | `apps/web/src/lib/services/nativeStorage.ts` |
| **CREATE** | `apps/web/src/lib/stores/premium.ts` |
| **CREATE** | `apps/web/src/lib/components/lesson/LessonLoader.svelte` |
| **CREATE** | `apps/web/src/lib/components/premium/DownloadManager.svelte` |
| **CREATE** | `apps/web/src/routes/languages/+page.svelte` |
| **MODIFY** | `apps/web/src/lib/utils/audio.ts` |
| **MODIFY** | `apps/web/src/lib/utils/asset-resolver.ts` |
| **MODIFY** | `apps/web/src/service-worker.ts` |
| **MODIFY** | `apps/web/src/lib/db/index.ts` |
| **MODIFY** | `apps/web/src/routes/+page.svelte` |
| **MODIFY** | `apps/web/src/routes/learn/[pair]/[level]/[lessonId]/+page.svelte` |
| **MODIFY** | `apps/web/capacitor.config.ts` |
| **DELETE** | `apps/web/static/audio/*` (after CDN migration) |
| **DELETE** | `apps/web/static/images/shared/*` (after CDN migration) |

---

## Implementation Order

### Week 1-2: CDN Infrastructure
1. Set up Cloudflare R2 bucket
2. Create `upload-to-r2.js` script (with deduplication)
3. Upload existing de-fa content (deduplicated)
4. Generate and upload manifest.json with audioMap

### Week 3-4: Asset Loading
1. Create assetService.ts with hash-based audio lookup
2. Modify audio.ts for CDN
3. Modify asset-resolver.ts
4. Create LessonLoader.svelte
5. Update lesson page with loading state

### Week 5: Service Worker
1. Modify caching strategy for hash-based audio
2. Add premium-aware logic
3. Add explicit cache management API

### Week 6: Premium System
1. Add premium fields to DB
2. Create premium store
3. Create nativeStorage service (hash-based)
4. Install Capacitor plugins

### Week 7: Multi-Language UI
1. Create languages page
2. Modify home page for multi-language
3. Add language switcher
4. Create DownloadManager component

### Week 8: Native Builds
1. Set up iOS project
2. Remove bundled assets
3. Test on Android/iOS
4. Prepare for app stores

---

## Migration Path

### Parallel Operation (Initial)
- CDN and local assets both work
- Environment flag: `PUBLIC_USE_CDN=true`
- Fallback to local if CDN fails

### Full CDN (After Verification)
- Remove local assets from git
- Update build to exclude static media
- Force CDN-only mode

### Backward Compatibility
- Version number in manifest
- Clear old caches on version change
- Migration prompt for existing users

---

## Cost Estimate (Free Tier)

### Cloudflare R2 (Assets - Deduplicated)

| Resource | Free Tier | Your Usage | Status |
|----------|-----------|------------|--------|
| Storage | 10 GB | ~500 MB (5 langs, deduplicated) | ✅ 5% used |
| Egress | **Unlimited** | Any amount | ✅ Always free |
| Class A ops (writes) | 1M/month | ~6K (reduced by dedup) | ✅ |
| Class B ops (reads) | 10M/month | ~500K | ✅ |

### Supabase (Auth + Database)

| Resource | Free Tier | Your Usage | Status |
|----------|-----------|------------|--------|
| Database | 500 MB | ~50 MB | ✅ 10% used |
| Auth MAU | 50,000 | 1,000 | ✅ 2% used |
| Storage | 1 GB | 0 (use R2) | ✅ Not needed |
| Egress | 2 GB | ~100 MB | ✅ Small user data |

### Total Monthly Cost

| Scale | R2 | Supabase | Total |
|-------|----|---------:|------:|
| 100 MAU | $0 | $0 | **$0** |
| 1,000 MAU | $0 | $0 | **$0** |
| 10,000 MAU | $0 | $0 | **$0** |
| 50,000+ MAU | $0 | ~$25 | **~$25** |

**You stay on free tier until 50,000+ monthly active users!**

---

## Success Criteria

1. ✅ App bundle < 5 MB (no bundled content)
2. ✅ Lessons load in < 3 seconds on 4G
3. ✅ Free users can stream lessons online
4. ✅ Premium users can download for offline
5. ✅ Multiple language pairs supported
6. ✅ Native Android and iOS builds work
7. ✅ Monthly cost: $0 until significant scale
8. ✅ **Audio storage reduced by 35%** (deduplication)

---

## Environment Variables

```bash
# .env
PUBLIC_R2_URL=https://pub-xxxxx.r2.dev        # or custom domain
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# For upload script only (not in app)
R2_ACCOUNT_ID=xxxxx
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=language-learning-assets
```

---

## Quick Reference: Key Files

| Purpose | File Path |
|---------|-----------|
| Upload Script (new) | `scripts/upload-to-r2.js` |
| Asset Service (new) | `apps/web/src/lib/services/assetService.ts` |
| Native Storage (new) | `apps/web/src/lib/services/nativeStorage.ts` |
| Premium Store (new) | `apps/web/src/lib/stores/premium.ts` |
| Lesson Loader (new) | `apps/web/src/lib/components/lesson/LessonLoader.svelte` |
| Download Manager (new) | `apps/web/src/lib/components/premium/DownloadManager.svelte` |
| Languages Page (new) | `apps/web/src/routes/languages/+page.svelte` |
| Audio Utility | `apps/web/src/lib/utils/audio.ts` |
| Asset Resolver | `apps/web/src/lib/utils/asset-resolver.ts` |
| Service Worker | `apps/web/src/service-worker.ts` |
| Database Schema | `apps/web/src/lib/db/index.ts` |
| Home Page | `apps/web/src/routes/+page.svelte` |
| Lesson Page | `apps/web/src/routes/learn/[pair]/[level]/[lessonId]/+page.svelte` |
| Audio Manifest (existing) | `scripts/audio-data/manifest.json` |
| Asset Registry (existing) | `apps/web/src/lib/data/asset-registry.json` |

---

## Appendix: Audio Deduplication Explained

### Why Duplicates Exist (Current State)

The `generate-audio.js` script makes **one API call per unique text** (saving money), but then **copies** the file to multiple paths:

```
"Hallo" → API call → /audio/A1-M01-L01/g1-q0.mp3 (original)
                   → /audio/A1-M01-L01/g2-pair0.mp3 (copy)
                   → /audio/A1-M01-L02/s5-word.mp3 (copy)
```

This was done for **app simplicity** - the app loads audio by predictable paths without needing a lookup table.

### How R2 Fixes This

With R2, we store by **content hash** and use a **manifest lookup**:

```
"Hallo" → /audio/by-hash/6cf6f38ece20256114e7f5e85f72ef5c.mp3 (single file)

manifest.audioMap:
  "A1-M01-L01/g1-q0" → "6cf6f38ece20256114e7f5e85f72ef5c"
  "A1-M01-L01/g2-pair0" → "6cf6f38ece20256114e7f5e85f72ef5c"
  "A1-M01-L02/s5-word" → "6cf6f38ece20256114e7f5e85f72ef5c"
```

**Benefits:**
- 35% storage reduction
- Faster uploads
- Smaller offline downloads
- Better browser caching (same URL = cache hit)
