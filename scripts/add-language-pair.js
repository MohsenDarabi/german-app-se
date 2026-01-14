#!/usr/bin/env node
/**
 * Add languagePair and source/target metadata to lesson JSON files
 *
 * Usage:
 *   node scripts/add-language-pair.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '../content/de-fa');
const DRY_RUN = process.argv.includes('--dry-run');

// Language pair metadata
const LANGUAGE_METADATA = {
  languagePair: 'de-fa',
  source: { code: 'de', name: 'Deutsch' },
  target: { code: 'fa', name: 'فارسی' }
};

function findLessonFiles(dir) {
  const files = [];

  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (item.endsWith('.json') && item.match(/^A[12]-M\d+-L\d+\.json$/)) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

function updateLessonFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lesson = JSON.parse(content);

  // Check if already has languagePair
  if (lesson.languagePair) {
    console.log(`  ⏭️  ${path.basename(filePath)} - already has languagePair`);
    return false;
  }

  // Add metadata after 'id' field
  const updatedLesson = {
    id: lesson.id,
    ...LANGUAGE_METADATA,
    ...lesson
  };
  delete updatedLesson.id; // Remove duplicate
  updatedLesson.id = lesson.id; // Re-add at start

  // Reorder to have id first, then language metadata
  const orderedLesson = {
    id: lesson.id,
    languagePair: LANGUAGE_METADATA.languagePair,
    source: LANGUAGE_METADATA.source,
    target: LANGUAGE_METADATA.target,
  };

  // Copy remaining fields
  for (const [key, value] of Object.entries(lesson)) {
    if (key !== 'id') {
      orderedLesson[key] = value;
    }
  }

  if (DRY_RUN) {
    console.log(`  📝 ${path.basename(filePath)} - would update`);
  } else {
    fs.writeFileSync(filePath, JSON.stringify(orderedLesson, null, 2) + '\n');
    console.log(`  ✅ ${path.basename(filePath)} - updated`);
  }

  return true;
}

async function main() {
  console.log('🌍 Adding language pair metadata to lesson files\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN - no files will be modified\n');
  }

  const lessonFiles = findLessonFiles(CONTENT_DIR);
  console.log(`Found ${lessonFiles.length} lesson files\n`);

  let updated = 0;
  let skipped = 0;

  for (const file of lessonFiles) {
    const wasUpdated = updateLessonFile(file);
    if (wasUpdated) updated++;
    else skipped++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);

  if (DRY_RUN && updated > 0) {
    console.log(`\n💡 Run without --dry-run to apply changes`);
  }
}

main().catch(console.error);
