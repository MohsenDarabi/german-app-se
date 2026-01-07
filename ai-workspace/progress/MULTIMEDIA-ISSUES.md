# Multimedia Asset Issues Report

> Generated: 2026-01-07
> Status: Issues documented, fixes pending

---

## Summary

After thorough review of all lessons (A1 M01-M06), the following issues were found in the asset registry generation:

| Issue Type | Count | Severity | Status |
|------------|-------|----------|--------|
| Duplicate asset (explicit imageId) | 1 | Low | ✅ FIXED |
| Wrong category (substring match) | 10+ | Medium | ✅ FIXED |
| Inconsistent country categorization | 1 | Low | ✅ FIXED |
| **Dialog images not displayed in UI** | 40 | **High** | ⚠️ PENDING |

---

## Issue 1: Duplicate Asset for Explicit imageId

**Location:** A1-M01-L01, step s1

**Problem:** Step s1 has explicit `imageId: "img-greeting-wave"` (completed), but the registry generator also created `img-a1-m01-l01-s1-hallo` (pending).

**Impact:** Designer might create duplicate image.

**Fix:** Modify `regenerate-asset-registry-full.js` to skip new-word steps that already have explicit `imageId`.

---

## Issue 2: "heißen" Words Categorized as "weather" ✅ FIXED

**Affected assets:**
- `img-a1-m01-l05-s1-heißen` → "heißen" [introductions] ✅
- `img-a1-m01-l05-s2-wie-heißt-du` → "Wie heißt du?" [introductions] ✅
- `img-a1-m01-l05-s3-ich-heiße` → "Ich heiße..." [introductions] ✅

**Root cause:** "heiß" (hot) is in weather keywords, and "heißen" (to be called) contains "heiß" as substring.

**Fix applied:** Added explicit WORD_OVERRIDES in `regenerate-asset-registry-full.js` + word boundary matching.

---

## Issue 3: "macht" Words Categorized as "numbers" ✅ FIXED

**Affected assets:**
- `img-a1-m02-l02-s5-er-macht` → "er macht" [actions] ✅
- `img-a1-m02-l02-s5b-sie-macht` → "sie macht" [actions] ✅
- `img-a1-m02-l03-s5-ihr-macht` → "ihr macht" [actions] ✅

**Root cause:** "acht" (eight) is in numbers keywords, and "macht" contains "acht" as substring.

**Fix applied:** Added explicit WORD_OVERRIDES + word boundary matching.

---

## Issue 4: "Viertel" Categorized as "numbers" ✅ FIXED

**Affected asset:**
- `img-a1-m06-l01-s6-viertel` → "Viertel" [daily-life] ✅

**Root cause:** "vier" (four) is in numbers keywords, and "Viertel" (quarter) contains "vier".

**Fix applied:** Added explicit WORD_OVERRIDES for "viertel" → daily-life.

---

## Issue 5: Articles Categorized as "actions" ✅ FIXED

**Affected assets:**
- `img-a1-m04-l04-s3-den` → "den" [grammar] ✅
- `img-a1-m04-l04-s4-einen` → "einen" [grammar] ✅

**Root cause:** These contain "en" suffix which matched the fallback rule for action verbs.

**Fix applied:** Added explicit WORD_OVERRIDES for articles (der, die, das, ein, eine, den, einen) → new "grammar" category.

---

## Issue 6: Inconsistent Country Categorization ✅ FIXED

**Affected assets:**
- `img-a1-m01-l03-s3-deutschland` → "Deutschland" [places] ✅
- `img-a1-m01-l03-s4-iran` → "der Iran" [places] ✅

**Root cause:** "Deutschland" matches "Land" in places keywords, but "Iran" didn't match.

**Fix applied:** Added "der iran" and "iran" to WORD_OVERRIDES → places.

---

## Issue 7: Dialog Scene Images Not Displayed in UI ⚠️ HIGH PRIORITY

**Severity:** HIGH - Asset/UI mismatch

**Problem:** The asset registry generates scene images for all dialog steps (40 assets), but the `DialogStep.svelte` component has NO image support at all.

**Example:**
- Asset registry has: `img-a1-m01-l01-s14-eli-tom` (Eli and Tom conversing)
- DialogStep component displays: Only text bubbles, no scene image

**Current DialogStep component:**
```svelte
// apps/web/src/lib/components/lesson/steps/DialogStep.svelte
// - Shows speaker names
// - Shows German/Persian text in chat bubbles
// - Shows audio buttons
// - NO image element, NO placeholder
```

**Asset registry creates for dialogs:**
```json
{
  "id": "img-a1-m01-l01-s14-eli-tom",
  "type": "image",
  "category": "dialogs",
  "path": "/images/shared/dialogs/img-a1-m01-l01-s14-eli-tom.jpg",
  "speakers": ["Eli", "Tom"],
  "characterRefs": ["content/characters/eli/eli-fullbody.md", "content/characters/tom/tom-fullbody.md"],
  "action": "Eli and Tom conversing: \"Hallo Tom!...\""
}
```

**Options:**
1. **Update DialogStep component** to show scene images (like NewWordStep does)
2. **Remove dialog assets from registry** if scene images aren't needed
3. **Keep as-is** for future feature (dialog scene images)

**Affected assets:** ~40 dialog scene images

**Recommendation:** Decide on design direction before designer creates 40 dialog scene images that may never be displayed.

---

## Fixes Applied

### ✅ Priority 1: Category Matching Logic (DONE)
Changed from substring matching to word boundary matching + explicit WORD_OVERRIDES:

```javascript
// WORD_OVERRIDES handles specific problem words
const WORD_OVERRIDES = {
  'heißen': 'introductions',
  'macht': 'actions',
  'viertel': 'daily-life',
  'den': 'grammar',
  'der iran': 'places',
  // ... etc
};

// Word boundary matching for keywords
const regex = new RegExp(`(^|\\s|-)${escapedKeyword}($|\\s|[.,!?-])`, 'i');
```

### ✅ Priority 2: Skip Explicit imageIds (DONE)
```javascript
// In processNewWordStep():
if (step.imageId) continue;  // Skip - asset already defined
```

### ✅ Priority 3: Fix Specific Keywords (DONE)
- heißen/heißt/heiße → introductions
- macht/er macht/sie macht → actions
- Viertel → daily-life
- Iran → places
- Articles → new "grammar" category

---

## Verification Commands

```bash
# Check all weather-categorized words
jq -r '.assets | to_entries[] | select(.value.category == "weather") | "\(.value.word.de)"' apps/web/src/lib/data/asset-registry.json

# Check all numbers-categorized words
jq -r '.assets | to_entries[] | select(.value.category == "numbers") | "\(.value.word.de)"' apps/web/src/lib/data/asset-registry.json

# Find duplicate asset IDs
jq -r '.assets | keys[]' apps/web/src/lib/data/asset-registry.json | sort | uniq -d
```

---

## Impact Assessment

**Current state (after fixes):**
- 337 total assets
- ✅ All categorization issues fixed
- ⚠️ ~40 dialog scene images that won't be displayed (Issue 7)

**User impact:** None (categories only affect designer workflow, not lesson functionality)

**Designer impact:**
- ✅ Categories now accurate - correct characters suggested
- **HIGH** - 40 dialog scene images would be wasted effort if created

**Recommendation:**
1. ✅ Duplicate fix - DONE
2. ✅ Category fixes - DONE (Issues 2-6)
3. ⚠️ Dialog image decision - URGENT (before designer starts work)
