# Move Lesson Content to R2 CDN

## GitHub Issue #7: fixes APK size + content sync

---

## Problem Statement

| Issue | Impact |
|-------|--------|
| All content bundled in APK | APK size ~50MB+, slow app store updates |
| Dual directories (`/content/` + `/static/content/`) | Sync issues, developer confusion |
| No content versioning | Can't update lessons without app update |
| Audio/Images on CDN, but lessons local | Inconsistent architecture |

---

## Goal

**Lightweight shell APK (~5MB)** with cloud-delivered content:
- Lesson JSON loaded from R2 CDN
- First-use download with offline caching
- Content updates without app store submission
- Single source of truth for content

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        APK Bundle                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ App Code (2MB)  │  │ Static Assets   │  │ Content     │ │
│  │ SvelteKit build │  │ fonts, icons    │  │ JSON lessons│ │
│  │                 │  │ (1MB)           │  │ (50MB+)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare R2 CDN                       │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ Audio (by hash) │  │ Images          │  ← Currently used│
│  │ dedup ~32%      │  │ shared assets   │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Shell APK (~5MB)                         │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ App Code (2MB)  │  │ Static Assets   │                  │
│  │ SvelteKit build │  │ fonts, icons    │                  │
│  │ + content svc   │  │ (1MB)           │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
         │
         ▼ First launch / on-demand
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare R2 CDN                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐          │
│  │ Audio    │  │ Images   │  │ Content (NEW)    │          │
│  │ (by hash)│  │ (shared) │  │ - lessons/*.json │          │
│  └──────────┘  └──────────┘  │ - modules.json   │          │
│                              │ - index.json     │          │
│                              └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Content Index & Upload

**Create:** `scripts/upload-content-to-r2.js`

Upload lesson JSON files to R2 with content index:

```
R2 Structure:
de-fa/
├── manifest.json          ← existing (audio + images)
├── content/
│   ├── index.json         ← NEW: list of all lessons
│   ├── A1/
│   │   ├── modules.json   ← module metadata
│   │   └── lessons/
│   │       ├── A1-M01-L01.json
│   │       ├── A1-M01-L02.json
│   │       └── ...
│   └── A2/
│       └── ...
en-fa/
└── content/
    └── ...
```

**Content Index Structure:**
```json
{
  "version": "2.0.0",
  "languagePair": "de-fa",
  "levels": {
    "A1": {
      "modules": 6,
      "lessons": 36,
      "totalMinutes": 360
    }
  },
  "lessons": [
    { "id": "A1-M01-L01", "level": "A1", "module": 1, "size": 4521 }
  ],
  "updatedAt": "2026-01-15T..."
}
```

---

### Phase 2: Content Service

**Create:** `apps/web/src/lib/services/contentService.ts`

```typescript
// Similar to assetService but for lesson JSON
interface ContentManifest {
  version: string;
  languagePair: string;
  lessons: LessonMeta[];
  updatedAt: string;
}

export async function init(languagePair: string): Promise<void>
export async function loadLesson(lessonId: string): Promise<Lesson>
export async function getModules(level: string): Promise<ModuleStub[]>
export async function preloadLevel(level: string): Promise<void>
export function isContentCached(lessonId: string): Promise<boolean>
```

**Features:**
- Fetches from CDN with fallback to local (for dev/testing)
- Version checking for content updates
- IndexedDB storage for offline lessons
- Progress tracking for downloads

---

### Phase 3: Lesson Loader Update

**Modify:** `apps/web/src/routes/(lesson)/learn/[pair]/[level]/[lessonId]/+page.ts`

```typescript
// Before: Direct static file fetch
const url = `/content/${pair}/${level}/${moduleFolder}/${lessonId}.json`;
const response = await fetch(url);

// After: Content service with CDN + offline support
import { loadLesson } from '$lib/services/contentService';
const lesson = await loadLesson(lessonId);
```

---

### Phase 4: Service Worker Enhancement

**Modify:** `apps/web/src/service-worker.ts`

Add content caching strategy:

```typescript
const CONTENT_CACHE = 'lesson-content-v1';

// Cache-first for lesson JSON from CDN
if (isCdnRequest && url.pathname.includes('/content/')) {
  event.respondWith(contentCacheFirst(request));
}

// Background content update check
async function checkContentUpdates(languagePair: string) {
  const manifest = await fetch(`${CDN_BASE}/${languagePair}/content/index.json`);
  // Compare versions, trigger update notification
}
```

---

### Phase 5: Smart Caching Strategy

**Caching Rules:**

| User Type | Current Lesson | Next Lesson | Other Lessons |
|-----------|---------------|-------------|---------------|
| Free | Auto-cache | Pre-cache* | Locked |
| Premium | Auto-cache | Pre-cache* | Download button |

*Pre-cache: Triggered when user reaches step `n-1` (one before completion)

**Auto-Caching Flow:**
```
User opens lesson A1-M01-L01
         ↓
    Cache current lesson JSON + audio
         ↓
User reaches step 10 of 11 (near completion)
         ↓
    Pre-cache next lesson A1-M01-L02
         ↓
User completes lesson → next lesson already cached
```

**Modify:** `apps/web/src/routes/(lesson)/learn/[pair]/[level]/[lessonId]/+page.svelte`

```typescript
// Pre-cache next lesson when approaching completion
$: if (currentStep >= totalSteps - 1) {
  contentService.preloadNextLesson(lessonId);
}
```

---

### Phase 6: Premium Download Feature

**Create:** `apps/web/src/lib/components/download/DownloadButton.svelte`

Premium-only download button with standard cloud-download icon:

```svelte
<!-- Standard download icon: cloud with down arrow (lucide-svelte) -->
<button class="download-btn" on:click={handleDownload} disabled={!$isPremium}>
  <CloudDownload size={20} />
</button>
```

**UI Mockup - Lesson List:**
```
┌─────────────────────────────────────────┐
│  Module 1: Greetings                    │
│  ─────────────────────────────────────  │
│  ✓ L01: Hello (cached)        [✓]      │
│  ○ L02: Goodbye               [⬇]      │ ← Premium: download icon
│  🔒 L03: Numbers              [🔒]      │ ← Free: locked
│  🔒 L04: Colors               [🔒]      │
└─────────────────────────────────────────┘

Legend:
  [✓] = Downloaded/Cached
  [⬇] = Download available (premium only)
  [🔒] = Locked (need premium or complete previous)
```

**Create:** `apps/web/src/lib/components/download/LessonDownloadManager.svelte`

Premium download manager (accessible from settings/profile):

```
┌─────────────────────────────────────────┐
│  دانلود دروس                            │
│  ═══════════════════════════════        │
│                                         │
│  ☑ A1 Module 1 (6 lessons, 4MB)        │
│  ☑ A1 Module 2 (6 lessons, 5MB)        │
│  ☐ A1 Module 3 (6 lessons, 4MB)        │
│                                         │
│  انتخاب شده: 12 درس (~9MB)              │
│                                         │
│           [دانلود انتخاب شده‌ها]          │
└─────────────────────────────────────────┘
```

**Content Service Additions:**

```typescript
// contentService.ts

export async function preloadNextLesson(currentLessonId: string): Promise<void> {
  const nextId = getNextLessonId(currentLessonId);
  if (nextId && !await isContentCached(nextId)) {
    await loadLesson(nextId); // Caches JSON
    await assetService.preloadLesson(nextId); // Caches audio
  }
}

export async function downloadLesson(lessonId: string): Promise<void> {
  if (!isPremium()) throw new Error('Premium required');
  await loadLesson(lessonId);
  await assetService.preloadLesson(lessonId);
}

export async function downloadModule(moduleId: string): Promise<void> {
  if (!isPremium()) throw new Error('Premium required');
  const lessons = getModuleLessons(moduleId);
  for (const lesson of lessons) {
    await downloadLesson(lesson.id);
  }
}
```

---

### Phase 7: Manifest Update

**Modify:** `scripts/upload-to-r2.js`

Add content upload to existing script:

```javascript
// Existing: audio + images
// Add: lesson JSON files + content index

async function uploadContent(client, bucket, languagePair) {
  const contentDir = `content/${languagePair}`;
  const lessons = scanLessons(contentDir);

  for (const lesson of lessons) {
    await uploadJSON(client, bucket,
      `${languagePair}/content/${lesson.level}/lessons/${lesson.id}.json`,
      lesson.data
    );
  }

  // Upload content index
  await uploadJSON(client, bucket,
    `${languagePair}/content/index.json`,
    buildContentIndex(lessons)
  );
}
```

---

### Phase 8: Remove Static Content

**After CDN migration is stable:**

1. Remove `/apps/web/static/content/` directory
2. Remove `/content/` to `/static/content/` sync scripts
3. Update Capacitor config to exclude content from bundle
4. Update `.gitignore` to ignore content in static

---

## Files Summary

| File | Action | Phase |
|------|--------|-------|
| `scripts/upload-content-to-r2.js` | **Create** | 1 |
| `src/lib/services/contentService.ts` | **Create** | 2 |
| `src/routes/(lesson)/learn/[pair]/[level]/[lessonId]/+page.ts` | **Modify** | 3 |
| `src/routes/(lesson)/learn/[pair]/[level]/[lessonId]/+page.svelte` | **Modify** | 5 |
| `src/service-worker.ts` | **Modify** | 4 |
| `src/lib/components/download/DownloadButton.svelte` | **Create** | 6 |
| `src/lib/components/download/LessonDownloadManager.svelte` | **Create** | 6 |
| `scripts/upload-to-r2.js` | **Modify** | 7 |
| `apps/web/static/content/` | **Remove** | 8 |
| `scripts/sync-content-to-static.js` | **Remove** | 8 |

---

## Rollout Strategy

| Phase | Description | Risk |
|-------|-------------|------|
| 1-2 | Upload content + content service | None |
| 3-4 | CDN loading + service worker | Low |
| 5-6 | Smart caching + premium download | Low |
| 7 | Update upload scripts | None |
| 8 | Remove bundled content | Medium |

**Feature flag:** `PUBLIC_CONTENT_CDN_ENABLED=true/false`

---

## Verification Plan

1. **Upload verification:**
   ```bash
   node scripts/upload-content-to-r2.js --dry-run
   # Check R2 dashboard for uploaded files
   ```

2. **Content loading:**
   - Clear browser cache
   - Navigate to lesson
   - Check Network tab: lesson.json from CDN
   - Check Application > Cache Storage: lesson cached

3. **Offline test:**
   - Load a lesson (populates cache)
   - Enable airplane mode
   - Navigate to same lesson → loads from cache

4. **APK size (Phase 7):**
   - Build APK without content
   - Verify size < 10MB
   - Install on device, verify lessons load from CDN

5. **Update propagation:**
   - Update lesson on R2
   - Bump content index version
   - Verify app shows "update available" prompt

---

## Cost Estimate (Cloudflare R2)

| Metric | Estimate |
|--------|----------|
| Storage | ~50MB content × 2 languages = 100MB |
| Class A ops (write) | ~100/month (content updates) |
| Class B ops (read) | ~10,000/month (lesson loads) |
| Egress | Free (R2 has free egress) |
| **Monthly cost** | ~$0.05-0.10 |

---

## Dependencies

- Existing R2 bucket: `language-learning-assets`
- R2 credentials in `.env.local`
- Public URL: `https://pub-a0290b06f1ea45d5b65ac647cc69df34.r2.dev`
- Audio/image upload already working

---

## Notes

- Keep `/content/` directory as source of truth for content creation
- CI/CD should upload to R2 on content changes
- Consider content versioning for A/B testing lessons
- IndexedDB quota: ~50MB per origin (sufficient for all lessons)
