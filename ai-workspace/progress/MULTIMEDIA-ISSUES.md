# Multimedia Asset Issues Report

> Generated: 2026-01-07
> Status: Issues documented, fixes pending

---

## Summary

After thorough review of all lessons (A1 M01-M06), the following issues were found in the asset registry generation:

| Issue Type | Count | Severity |
|------------|-------|----------|
| Duplicate asset (explicit imageId) | 1 | Low |
| Wrong category (substring match) | 10+ | Medium |
| Inconsistent country categorization | 1 | Low |

---

## Issue 1: Duplicate Asset for Explicit imageId

**Location:** A1-M01-L01, step s1

**Problem:** Step s1 has explicit `imageId: "img-greeting-wave"` (completed), but the registry generator also created `img-a1-m01-l01-s1-hallo` (pending).

**Impact:** Designer might create duplicate image.

**Fix:** Modify `regenerate-asset-registry-full.js` to skip new-word steps that already have explicit `imageId`.

---

## Issue 2: "heißen" Words Categorized as "weather"

**Affected assets:**
- `img-a1-m01-l05-s1-heißen` → "heißen" [weather] ❌
- `img-a1-m01-l05-s2-wie-heißt-du` → "Wie heißt du?" [weather] ❌
- `img-a1-m01-l05-s3-ich-heiße` → "Ich heiße..." [weather] ❌

**Root cause:** "heiß" (hot) is in weather keywords, and "heißen" (to be called) contains "heiß" as substring.

**Correct category:** Should be "introductions"

**Fix:** Add "heißen", "heißt", "heiße" to introductions keywords BEFORE weather, or use word boundary matching.

---

## Issue 3: "macht" Words Categorized as "numbers"

**Affected assets:**
- `img-a1-m02-l02-s5-er-macht` → "er macht" [numbers] ❌
- `img-a1-m02-l02-s5b-sie-macht` → "sie macht" [numbers] ❌
- `img-a1-m02-l03-s5-ihr-macht` → "ihr macht" [numbers] ❌

**Root cause:** "acht" (eight) is in numbers keywords, and "macht" contains "acht" as substring.

**Correct category:** Should be "expressions" (verb conjugations)

**Fix:** Use word boundary matching or exact word matching instead of substring contains.

---

## Issue 4: "Viertel" Categorized as "numbers"

**Affected asset:**
- `img-a1-m06-l04-sX-viertel` → "Viertel" [numbers] ❌

**Root cause:** "vier" (four) is in numbers keywords, and "Viertel" (quarter) contains "vier".

**Correct category:** Should be "daily-life" (time-related)

**Fix:** Add "Viertel" explicitly to daily-life keywords.

---

## Issue 5: Articles Categorized as "actions"

**Affected assets:**
- `img-a1-m04-l04-s3-den` → "den" [actions] ❌
- `img-a1-m04-l04-s4-einen` → "einen" [actions] ❌

**Root cause:** These contain "en" suffix which might match action verbs ending in "en".

**Correct category:** These are accusative articles - could be "grammar" or "objects" (as generic words that need simple illustration)

**Fix:** Add articles to a dedicated category or treat as uncategorized (simple illustration).

---

## Issue 6: Inconsistent Country Categorization

**Affected assets:**
- `img-a1-m01-l03-s3-deutschland` → "Deutschland" [places] ✓
- `img-a1-m01-l03-s4-iran` → "der Iran" [introductions] ❌

**Root cause:** "Deutschland" matches "Land" in places keywords, but "Iran" doesn't match places (only matches introductions explicitly).

**Correct behavior:** All countries should be in the same category (either places or introductions).

**Fix:** Add "Iran" to places keywords, or remove countries from both and use a dedicated "countries" category.

---

## Recommended Fixes

### Priority 1: Category Matching Logic
Change from substring matching to word boundary matching:

```javascript
// BEFORE (problematic):
if (wordLower.includes(keyword.toLowerCase())) {
  return category;
}

// AFTER (safer):
const regex = new RegExp(`\\b${keyword}\\b`, 'i');
if (regex.test(word)) {
  return category;
}
```

### Priority 2: Skip Explicit imageIds
```javascript
// In processNewWordStep():
if (step.imageId) {
  // Skip - asset already defined in lesson
  return null;
}
```

### Priority 3: Fix Specific Keywords
- Add "heißen", "heißt", "heiße" to introductions (high priority)
- Add "Viertel" to daily-life
- Add "Iran" to places
- Remove or handle articles separately

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

**Current state:**
- 338 total assets
- ~10-15 miscategorized (3-4%)
- 1 duplicate

**User impact:** None (categories only affect designer workflow, not lesson functionality)

**Designer impact:** Low - wrong character might be suggested for ~10 images

**Recommendation:** Fix in next iteration, not urgent.
