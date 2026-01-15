#!/usr/bin/env node
/**
 * Sync Lesson Assets Across Language Pairs
 *
 * This script ensures that language-neutral assets (like imageId) are consistent
 * across all language versions of the same lesson.
 *
 * Images are shared across languages (language-neutral), while audio is language-specific.
 *
 * Usage:
 *   node scripts/sync-lesson-assets.js                    # Check all lessons
 *   node scripts/sync-lesson-assets.js --fix              # Fix missing assets
 *   node scripts/sync-lesson-assets.js --lesson=A1-M01-L01 # Check specific lesson
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONTENT_DIR = path.join(__dirname, '..', 'content');
const LANGUAGE_PAIRS = ['de-fa', 'en-fa']; // Add more as needed

// Fields that should be synced across language pairs (language-neutral)
const SHARED_FIELDS = ['imageId', 'image', 'videoId', 'video'];

// Parse arguments
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const lessonArg = args.find(a => a.startsWith('--lesson='));
const targetLesson = lessonArg ? lessonArg.split('=')[1] : null;

console.log('🔄 Lesson Asset Sync Tool');
console.log('═══════════════════════════════════════════════════════');
console.log(`Mode: ${shouldFix ? '🔧 FIX' : '👁️  CHECK'}`);
if (targetLesson) console.log(`Target: ${targetLesson}`);
console.log('');

/**
 * Find all lesson files for a given lesson ID across all language pairs
 */
function findLessonVersions(lessonId) {
  const versions = {};

  for (const langPair of LANGUAGE_PAIRS) {
    const langDir = path.join(CONTENT_DIR, langPair);
    if (!fs.existsSync(langDir)) continue;

    // Search recursively for the lesson file
    const lessonPath = findLessonFile(langDir, lessonId);
    if (lessonPath) {
      versions[langPair] = lessonPath;
    }
  }

  return versions;
}

/**
 * Recursively find a lesson file by ID
 */
function findLessonFile(dir, lessonId) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      const result = findLessonFile(fullPath, lessonId);
      if (result) return result;
    } else if (item.name === `${lessonId}.json`) {
      return fullPath;
    }
  }

  return null;
}

/**
 * Get all unique lesson IDs across all language pairs
 */
function getAllLessonIds() {
  const lessonIds = new Set();

  for (const langPair of LANGUAGE_PAIRS) {
    const langDir = path.join(CONTENT_DIR, langPair);
    if (!fs.existsSync(langDir)) continue;

    collectLessonIds(langDir, lessonIds);
  }

  return [...lessonIds].sort();
}

/**
 * Recursively collect lesson IDs from a directory
 */
function collectLessonIds(dir, lessonIds) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      collectLessonIds(fullPath, lessonIds);
    } else if (item.name.endsWith('.json') && item.name.match(/^A[12]-M\d+-L\d+\.json$/)) {
      lessonIds.add(item.name.replace('.json', ''));
    }
  }
}

/**
 * Extract shared assets from a step
 */
function extractSharedAssets(step) {
  const assets = {};
  for (const field of SHARED_FIELDS) {
    if (step[field]) {
      assets[field] = step[field];
    }
  }
  return assets;
}

/**
 * Compare and sync lessons across language pairs
 */
function syncLesson(lessonId) {
  const versions = findLessonVersions(lessonId);
  const langPairs = Object.keys(versions);

  if (langPairs.length < 2) {
    // Lesson only exists in one language, nothing to sync
    return { lessonId, status: 'single', issues: [] };
  }

  const issues = [];
  const lessons = {};

  // Load all versions
  for (const langPair of langPairs) {
    const content = fs.readFileSync(versions[langPair], 'utf-8');
    lessons[langPair] = JSON.parse(content);
  }

  // Build a map of step assets from all versions
  // Key: stepId, Value: { field: value } (merged from all languages)
  const masterAssets = {};

  for (const langPair of langPairs) {
    const lesson = lessons[langPair];
    for (const step of lesson.steps || []) {
      const stepAssets = extractSharedAssets(step);
      if (Object.keys(stepAssets).length > 0) {
        if (!masterAssets[step.id]) {
          masterAssets[step.id] = {};
        }
        // Merge assets (first one wins for conflicts)
        for (const [field, value] of Object.entries(stepAssets)) {
          if (!masterAssets[step.id][field]) {
            masterAssets[step.id][field] = { value, source: langPair };
          }
        }
      }
    }
  }

  // Check each version for missing assets
  for (const langPair of langPairs) {
    const lesson = lessons[langPair];
    let modified = false;

    for (const step of lesson.steps || []) {
      const masterStepAssets = masterAssets[step.id];
      if (!masterStepAssets) continue;

      for (const [field, { value, source }] of Object.entries(masterStepAssets)) {
        if (!step[field]) {
          issues.push({
            langPair,
            stepId: step.id,
            field,
            missing: true,
            shouldBe: value,
            source
          });

          if (shouldFix) {
            step[field] = value;
            modified = true;
          }
        }
      }
    }

    if (modified) {
      fs.writeFileSync(versions[langPair], JSON.stringify(lesson, null, 2) + '\n');
      console.log(`✅ Fixed: ${langPair}/${lessonId}`);
    }
  }

  return { lessonId, status: issues.length > 0 ? 'issues' : 'ok', issues };
}

// Main execution
const lessonIds = targetLesson ? [targetLesson] : getAllLessonIds();
let totalIssues = 0;
let totalFixed = 0;

for (const lessonId of lessonIds) {
  const result = syncLesson(lessonId);

  if (result.status === 'issues') {
    console.log(`\n📋 ${lessonId}:`);
    for (const issue of result.issues) {
      console.log(`   ⚠️  ${issue.langPair}: Step ${issue.stepId} missing ${issue.field}`);
      console.log(`      → Should be: "${issue.shouldBe}" (from ${issue.source})`);
      totalIssues++;
      if (shouldFix) totalFixed++;
    }
  }
}

console.log('\n═══════════════════════════════════════════════════════');
if (totalIssues === 0) {
  console.log('✅ All lessons are in sync!');
} else if (shouldFix) {
  console.log(`🔧 Fixed ${totalFixed} issues across all lessons`);
} else {
  console.log(`⚠️  Found ${totalIssues} issues. Run with --fix to resolve.`);
}
