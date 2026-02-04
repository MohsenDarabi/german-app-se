# Developer Debugging Guide

> Troubleshooting application issues, caching problems, and common development gotchas.

**For content creation issues**, see: `ai-workspace/references/rules-and-tips.md`

---

## Table of Contents

1. [Content Loading Flow](#content-loading-flow)
2. [Clearing All Caches](#clearing-all-caches)
3. [Schema Validation Errors](#schema-validation-errors)
4. [Dev Mode vs Production](#dev-mode-vs-production)
5. [CDN Issues](#cdn-issues)
6. [Browser DevTools Tips](#browser-devtools-tips)
7. [Common Error Messages](#common-error-messages)

---

## Content Loading Flow

Understanding how content loads is crucial for debugging.

### Dev Mode (`pnpm run dev`)

```
1. Try LOCAL content first (skip caches)
   └── /content/{lang}/{level}/{module}/{lessonId}.json

2. If local not found → Check in-memory cache
   └── lessonCache Map

3. If not in memory → Check IndexedDB cache
   └── ContentCache database → lessons store

4. If not cached → Fetch from CDN
   └── https://pub-xxx.r2.dev/{lang}/content/{level}/lessons/{lessonId}.json

5. If CDN fails → Try local fallback again
```

### Production Mode

```
1. Check in-memory cache (lessonCache)
2. Check IndexedDB cache (ContentCache)
3. Fetch from CDN
4. Fallback to local /content/ folder
```

### Key Difference

In **dev mode**, local content is checked FIRST to allow testing changes without uploading to CDN.

---

## Clearing All Caches

When content changes aren't appearing, clear ALL caches:

### Option 1: Browser DevTools (Manual)

1. Open DevTools → Application tab
2. Clear these:
   - **IndexedDB**: Delete `ContentCache` and `DeutschLernDB`
   - **Local Storage**: Clear all
   - **Session Storage**: Clear all
   - **Cache Storage**: Delete all caches (service worker)

### Option 2: Console Script (Quick)

Paste in browser console:

```javascript
// Clear everything
(async () => {
  // IndexedDB
  const dbs = await indexedDB.databases();
  for (const db of dbs) {
    if (db.name) indexedDB.deleteDatabase(db.name);
  }

  // Storage
  localStorage.clear();
  sessionStorage.clear();

  // Service Worker caches
  if ('caches' in window) {
    const names = await caches.keys();
    for (const name of names) await caches.delete(name);
  }

  console.log('All caches cleared. Reload the page.');
})();
```

### Option 3: Hard Refresh

- **Mac**: `Cmd + Shift + R`
- **Windows**: `Ctrl + Shift + R`

Note: Hard refresh only clears HTTP cache, not IndexedDB or service worker caches.

### After Clearing Caches

1. You'll be logged out (auth tokens cleared)
2. Re-login required
3. Onboarding may appear again (user preferences cleared)
4. Content will fetch fresh from source

---

## Schema Validation Errors

### How to Identify

Schema errors appear in console when loading lessons:

```
ContentService: Error loading /content/.../lesson.json: [
  {
    "received": "grammar",
    "code": "invalid_enum_value",
    "options": ["wrong-article", "wrong-conjugation", ...],
    "path": ["steps", 21, "feedbackTip", "errorCategory"],
    "message": "Invalid enum value..."
  }
]
```

### Common Schema Issues

#### 1. Invalid `errorCategory`

**Valid values only:**
```
wrong-article | wrong-conjugation | wrong-case | word-order |
spelling | vocabulary | comprehension | plural-form |
negation | gender-agreement
```

**NOT valid:** `grammar`, `syntax`, `pronunciation`, etc.

#### 2. Invalid `questionMode` in dialogs

**Valid values:** `mid-dialog` | `post-dialog` | `both`

#### 3. Invalid step `type`

**Valid types:**
```
intro | new-word | grammar-tip | grammar-popup | multiple-choice |
fill-in-blank | word-order | matching | dialog | translation |
spelling | dictation | true-false | rapid-fire | memory-match |
vocab-check | story | syllable-spelling | completion
```

### Checking the Schema

The schema is defined in: `packages/content-model/src/index.ts`

```bash
# View all step types
grep -A 20 "StepType" packages/content-model/src/index.ts

# View errorCategory enum
grep -A 15 "ErrorCategory" packages/content-model/src/index.ts
```

### Validating Before Testing

Always validate lessons before testing in browser:

```bash
node scripts/validate-lesson.js content/de-fa/A1/module-01/A1-M01-L01.json
```

Note: The validator catches many issues but NOT all schema enum violations. If validation passes but browser fails, check the console for schema errors.

---

## Dev Mode vs Production

### How to Know Which Mode

Check console for:
```
ContentService: Loaded A1-M01-L01 from LOCAL (dev mode)
```

vs

```
ContentService: Loaded A1-M01-L01 from CDN
```

### Content Symlink (Dev Only)

For local content to work in dev mode, a symlink must exist:

```bash
# Check if symlink exists
ls -la apps/web/static/content

# Should show:
# content -> /path/to/german-learning-app-main/content

# Create if missing:
ln -sfn "$(pwd)/content" apps/web/static/content
```

**Important:** This symlink is gitignored and only works locally. Production always uses CDN.

### Forcing CDN in Dev Mode

To test CDN behavior locally, temporarily comment out the dev check in `contentService.ts`:

```typescript
// if (dev) {  // Comment this out
//   ...
// }
```

---

## CDN Issues

### Content Not Updating After Upload

1. **Wait for CDN propagation** (usually instant for R2, but can take a few seconds)

2. **Verify CDN has new content:**
   ```bash
   curl -s "https://pub-a0290b06f1ea45d5b65ac647cc69df34.r2.dev/de-fa/content/A1/lessons/A1-M01-L01.json" | jq '.steps | length'
   ```

3. **Clear browser caches** (see above)

4. **Check service worker isn't caching old version:**
   - DevTools → Application → Service Workers → Unregister

### Upload Commands

```bash
# Upload content (dry run first)
node scripts/upload-content-to-r2.js --dry-run --lang=de-fa

# Upload content (actual)
node scripts/upload-content-to-r2.js --force --lang=de-fa

# Upload audio
node scripts/upload-audio-to-r2.js --lang=de-fa
```

### Verify CDN Content

```bash
# Check specific lesson
curl -s "https://pub-a0290b06f1ea45d5b65ac647cc69df34.r2.dev/de-fa/content/A1/lessons/A1-M01-L01.json" | jq '.id, .title'

# Check content index
curl -s "https://pub-a0290b06f1ea45d5b65ac647cc69df34.r2.dev/de-fa/content/index.json" | jq '.stats'

# Check manifest
curl -s "https://pub-a0290b06f1ea45d5b65ac647cc69df34.r2.dev/de-fa/manifest.json" | jq 'keys'
```

---

## Browser DevTools Tips

### Check Content Source

In Console, look for:
```
ContentService: Loaded {lessonId} from LOCAL (dev mode)
ContentService: Loaded {lessonId} from CDN
ContentService: Local not found for {lessonId}, trying caches/CDN...
```

### Check Network Requests

1. DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Look for:
   - `/content/de-fa/A1/module-XX/` = local content
   - `pub-xxx.r2.dev` = CDN content

### HTTP 304 Issues

If you see `304 Not Modified` for local content and changes aren't loading:

- This is the browser HTTP cache returning cached version
- The app uses `cache: 'no-store'` in dev mode to prevent this
- If still happening, do a hard refresh or clear browser cache

### Check IndexedDB Content

1. DevTools → Application → IndexedDB
2. Expand `ContentCache` → `lessons`
3. You can see cached lesson data and delete specific entries

### Check What Lesson Data the App Has

Paste in console while on a lesson page:

```javascript
// Check if lesson has expected data
fetch('/content/de-fa/A1/module-03/A1-M03-L04.json')
  .then(r => r.json())
  .then(data => {
    const dialog = data.steps.find(s => s.type === 'dialog');
    console.log({
      totalSteps: data.steps.length,
      hasDialog: !!dialog,
      dialogQuestions: dialog?.questions?.length || 0,
      questionMode: dialog?.questionMode
    });
  });
```

---

## Common Error Messages

### "Lesson not found: A1-M01-L01"

**Causes:**
1. Lesson JSON doesn't exist in any location
2. All fetch attempts failed (local, cache, CDN)

**Fix:**
1. Check file exists: `ls content/de-fa/A1/module-01/A1-M01-L01.json`
2. Check CDN: `curl -I "https://pub-xxx.r2.dev/de-fa/content/A1/lessons/A1-M01-L01.json"`
3. Check symlink exists in `apps/web/static/content`

### "Invalid enum value" in Console

**Cause:** Lesson JSON has a field value not in the allowed enum.

**Fix:**
1. Read the error message for the `path` (e.g., `["steps", 21, "feedbackTip", "errorCategory"]`)
2. Check the `received` value vs `options`
3. Fix the JSON to use a valid value
4. Re-validate: `node scripts/validate-lesson.js <file>`

### Content Shows Old Version

**Causes:**
1. In-memory cache (`lessonCache`)
2. IndexedDB cache (`ContentCache`)
3. Service worker cache
4. Browser HTTP cache (304 responses)

**Fix:**
1. Clear all caches (see section above)
2. Restart dev server: `pnpm run dev`
3. Hard refresh the page

### Audio Not Playing

**Causes:**
1. Audio files not generated
2. Audio not uploaded to CDN
3. Manifest doesn't have the audio hash

**Debug:**
```bash
# Check if audio exists locally
ls apps/web/static/audio/A1-M01-L01/

# Check manifest for audio mapping
cat scripts/audio-data/manifest-de-fa.json | jq '.fileMapping["A1-M01-L01/s1-word"]'

# Check CDN manifest
curl -s "https://pub-xxx.r2.dev/de-fa/manifest.json" | jq '.audioMap["A1-M01-L01/s1-word"]'
```

**Fix:**
```bash
# Generate audio
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --lesson=A1-M01-L01

# Upload to CDN
node scripts/upload-audio-to-r2.js --lang=de-fa
```

### Dialog Questions Not Showing

**Causes:**
1. `questions` array missing or empty
2. `questionMode` not set or invalid
3. Old cached content without questions

**Debug:**
1. Check lesson JSON has `questions` array in dialog step
2. Check `questionMode` is `"post-dialog"` or `"mid-dialog"` or `"both"`
3. Clear caches and reload
4. Check console for schema validation errors

---

## Quick Reference

### Essential Commands

```bash
# Validate lesson
node scripts/validate-lesson.js content/de-fa/A1/module-01/A1-M01-L01.json

# Start dev server
pnpm run dev

# Generate audio
GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
  node scripts/generate-audio.js --lesson=A1-M01-L01

# Upload content to CDN
node scripts/upload-content-to-r2.js --force --lang=de-fa

# Check CDN content
curl -s "https://pub-a0290b06f1ea45d5b65ac647cc69df34.r2.dev/de-fa/content/A1/lessons/A1-M01-L01.json" | jq '.id'
```

### Files to Know

| File | Purpose |
|------|---------|
| `apps/web/src/lib/services/contentService.ts` | Content loading logic |
| `apps/web/src/lib/services/assetService.ts` | Audio/asset loading |
| `packages/content-model/src/index.ts` | Zod schemas (valid values) |
| `scripts/validate-lesson.js` | Lesson validator |
| `scripts/upload-content-to-r2.js` | CDN upload script |

### Caches to Clear

| Cache | Location | When to Clear |
|-------|----------|---------------|
| In-memory | `lessonCache` in contentService | Restart dev server |
| IndexedDB | `ContentCache`, `DeutschLernDB` | DevTools → Application |
| Service Worker | Cache Storage | DevTools → Application |
| Browser HTTP | Network cache | Hard refresh (Cmd+Shift+R) |

---

---

## Recent Issues & Fixes

### Issue: Dialog Questions Not Appearing (Feb 2026)

**Symptom:** Dialog step showed conversation but no "📝 سوالات" (Questions) button, even though the lesson JSON had `questions` array.

**Root Causes (multiple):**

1. **Invalid `errorCategory` value in lesson JSON**

   The lesson had `feedbackTip.errorCategory: "grammar"` but "grammar" is NOT a valid enum value. This caused `LessonSchema.parse()` to throw, which was silently caught, causing the local content to be skipped.

   ```json
   // WRONG
   "feedbackTip": {
     "errorCategory": "grammar"  // NOT VALID!
   }

   // CORRECT
   "feedbackTip": {
     "errorCategory": "word-order"  // Valid enum value
   }
   ```

2. **HTTP 304 responses in dev mode**

   Browser HTTP cache was returning `304 Not Modified` for local content. JavaScript `fetch()` treats 304 as `response.ok === false` (only 200-299 are "ok"), so the code thought the file didn't exist.

   **Fix:** Added `cache: 'no-store'` to fetch options in dev mode.

3. **Cache check order in dev mode**

   The code was checking IndexedDB cache BEFORE trying local content, so stale cached data was returned instead of fresh local files.

   **Fix:** Reordered to check local content FIRST in dev mode.

**How to Debug Similar Issues:**

1. Check browser console for schema validation errors:
   ```
   ContentService: Error loading /content/.../lesson.json: [...]
   ```

2. Check Network tab - look for 304 responses on local content

3. Verify content source in console:
   ```
   ContentService: Loaded {lessonId} from LOCAL (dev mode)  // Good
   ContentService: Local not found for {lessonId}...        // Problem
   ```

4. Clear ALL caches and test again (see "Clearing All Caches" section)

**Files Modified:**
- `apps/web/src/lib/services/contentService.ts` - Dev mode improvements
- `content/de-fa/A1/module-03/A1-M03-L04.json` - Fixed errorCategory values

---

### Issue: Content Changes Not Reflecting in Browser

**Symptom:** Made changes to lesson JSON, but browser still shows old content.

**Possible Causes:**

| Cause | How to Check | Fix |
|-------|--------------|-----|
| In-memory cache | N/A (invisible) | Restart dev server |
| IndexedDB cache | DevTools → Application → IndexedDB | Delete `ContentCache` |
| Service worker | DevTools → Application → Cache Storage | Clear caches |
| HTTP cache | Network tab shows 304 | Hard refresh (Cmd+Shift+R) |
| CDN has old version | `curl` the CDN URL | Re-upload with `--force` |
| Schema validation failing | Console errors | Fix JSON, re-validate |

**Quick Fix Script (paste in console):**

```javascript
(async () => {
  // Clear IndexedDB
  const dbs = await indexedDB.databases();
  for (const db of dbs) if (db.name) indexedDB.deleteDatabase(db.name);

  // Clear storage
  localStorage.clear();
  sessionStorage.clear();

  // Clear service worker caches
  if ('caches' in window) {
    for (const name of await caches.keys()) await caches.delete(name);
  }

  alert('Caches cleared! Page will reload.');
  location.reload();
})();
```

---

### Issue: Lesson 404 Despite File Existing (Feb 2026)

**Symptom:** Clicking a lesson in the app shows `{"message": "Lesson not found: A1-M02-L02"}` even though the JSON file exists and `validate-lesson.js` passes.

**Root Cause:** `validate-lesson.js` does NOT catch all Zod schema errors!

The lesson validator checks content rules (30 rules) but doesn't validate against the full Zod schema in `packages/content-model/src/index.ts`. When `LessonSchema.parse()` fails in `contentService.ts`, the error is caught and the lesson appears "not found".

**Common Schema Errors (not caught by validate-lesson.js):**

| Error Type | Wrong | Correct |
|------------|-------|---------|
| **Vocabulary format** | `"word": "Hallo"` | `"de": "Hallo"` |
| **Vocabulary format** | `"translation": "سلام"` | `"fa": "سلام"` |
| **errorCategory** | `"verb-conjugation"` | `"wrong-conjugation"` |
| **errorCategory** | `"stem-change"` | `"wrong-conjugation"` |
| **errorCategory** | `"grammar"` | Use specific: `"word-order"`, etc. |
| **POS value** | `"pos": "article"` | `"pos": "particle"` |
| **Conjugation key** | `"er/sie/es": "kommt"` | `"er_sie_es": "kommt"` |
| **Conjugation field** | `"conjugation": {...}` | `"praesens": {...}` |
| **Missing verb field** | (no infinitiv) | `"infinitiv": "kommen"` |

**How to Debug:**

1. Run Zod validation directly (catches what validate-lesson.js misses):
   ```bash
   node --experimental-strip-types -e "
   import { LessonSchema } from './packages/content-model/src/index.ts';
   import fs from 'fs';
   const json = JSON.parse(fs.readFileSync('content/de-fa/A1/module-02/A1-M02-L02.json', 'utf8'));
   try { LessonSchema.parse(json); console.log('✅ OK'); }
   catch (e) { console.log('❌ Errors:', JSON.stringify(e.errors, null, 2)); }
   "
   ```

2. Check browser console for the actual error:
   ```
   ContentService: Error loading /content/.../lesson.json: [{"code":"invalid_enum_value"...}]
   ```

**Valid errorCategory values (ONLY these 10):**
```
wrong-article | wrong-conjugation | wrong-case | word-order |
spelling | vocabulary | comprehension | plural-form |
negation | gender-agreement
```

**Valid POS values (ONLY these 10):**
```
noun | verb | adjective | adverb | preposition |
pronoun | conjunction | interjection | phrase | particle
```

**Files Fixed:** Module-02 (L01-L05), Module-04 (L02)

---

### Issue: CI Typecheck Fails with $env Module Errors (Feb 2026)

**Symptom:** GitHub Actions CI fails with errors like:
```
Error: Module '"$env/static/public"' has no exported member 'PUBLIC_R2_URL'.
Error: Cannot find module '$env/static/public' or its corresponding type declarations.
```

**Root Cause:** SvelteKit generates `$env` module types during `svelte-kit sync` based on environment variables present at sync time. In CI, the env vars weren't available when sync ran.

**Two issues combined:**

1. **tsconfig.json needed .svelte-kit types included**

   When extending `.svelte-kit/tsconfig.json`, if you override the `include` array, you lose the base config's includes. Must explicitly add:
   ```json
   "include": [
     ".svelte-kit/ambient.d.ts",
     ".svelte-kit/non-ambient.d.ts",
     ".svelte-kit/types/**/$types.d.ts",
     "src/**/*.ts",
     "src/**/*.svelte"
   ]
   ```

2. **CI workflow env vars only on build step**

   The env vars (`PUBLIC_R2_URL`, `PUBLIC_SUPABASE_URL`, etc.) were only set for the `build` step, not available during `svelte-kit sync`.

   **Fix:** Move env vars to workflow level (applies to all steps):
   ```yaml
   env:
     PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
     PUBLIC_SUPABASE_ANON_KEY: placeholder-anon-key
     PUBLIC_R2_URL: https://placeholder.r2.dev
   jobs:
     build:
       # env vars available to all steps
   ```

**Files Modified:**
- `apps/web/tsconfig.json` - Added .svelte-kit files to include
- `.github/workflows/ci.yml` - Moved env vars to workflow level
- `apps/web/package.json` - Added `svelte-kit sync` to build script

---

### Issue: Vercel 404 on SPA Routes (Feb 2026)

**Symptom:** Deployed app shows Vercel's `404: NOT_FOUND` error when accessing routes like `/learn/de-fa/A1/A1-M03-L04`, even though the app works locally.

**Root Cause:** Using `adapter-static` with `framework: null` in Vercel requires explicit rewrites for SPA client-side routing. Without rewrites, Vercel looks for a static file at that exact path and returns 404.

**Fix:** Add SPA fallback rewrite to `vercel.json`:
```json
{
  "framework": null,
  "outputDirectory": "apps/web/build",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This tells Vercel to serve `index.html` for any route that doesn't match a static file, allowing the SvelteKit client-side router to handle the route.

**Note:** The app-level "Lesson not found" error (vs Vercel's 404) is a different issue - that means the SPA loaded but the lesson content isn't on the CDN.

**Files Modified:**
- `vercel.json` - Added rewrites for SPA fallback

---

### Issue: CDN Serving Old Content After Upload (Feb 2026)

**Symptom:** Uploaded fixed content to R2, but app still shows schema errors for that lesson. Other lessons work fine.

**Root Cause:** R2 uses `Cache-Control: max-age=3600` (1 hour). Edge servers may serve stale content.

**Fix:** Re-upload with no-cache headers:
```javascript
// One-off fix for specific file
const command = new PutObjectCommand({
  Bucket: process.env.R2_BUCKET_NAME,
  Key: 'de-fa/content/A1/lessons/A1-M02-L01.json',
  Body: content,
  ContentType: 'application/json',
  CacheControl: 'no-cache, no-store, must-revalidate',
});
```

Or wait 1 hour for cache to expire.

---

## Contributing

Found a new debugging scenario? Add it here:

1. Describe the symptom (what you saw)
2. Explain the cause (why it happened)
3. Document the fix (how to resolve)
4. Add any relevant commands or code snippets
