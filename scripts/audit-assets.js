#!/usr/bin/env node
/**
 * Audit asset registry against actual lesson content
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '../content/de-fa');
const REGISTRY_PATH = path.join(__dirname, '../apps/web/src/lib/data/asset-registry.json');

// Load registry
const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
const registryAssets = new Set(Object.keys(registry.assets));

// Find all lesson files
function findLessonFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  fs.readdirSync(dir).forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...findLessonFiles(fullPath));
    } else if (item.endsWith('.json') && !item.startsWith('.')) {
      files.push(fullPath);
    }
  });
  return files;
}

const lessonFiles = findLessonFiles(CONTENT_DIR);

console.log('═══════════════════════════════════════════════════════');
console.log('       ASSET REGISTRY AUDIT REPORT');
console.log('═══════════════════════════════════════════════════════\n');

console.log(`Lessons scanned: ${lessonFiles.length}`);
console.log(`Assets in registry: ${registryAssets.size}\n`);

// Track what's actually used
const usedImageIds = new Set();
const dialogsNeedingImages = [];

lessonFiles.forEach(file => {
  try {
    const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
    const lessonId = path.basename(file, '.json');

    lesson.steps?.forEach(step => {
      // Track imageId references
      if (step.imageId) {
        usedImageIds.add(step.imageId);
      }

      // Track dialogs that need images
      if (step.type === 'dialog') {
        const speakers = [...new Set(step.lines?.map(l => l.speaker) || [])];
        dialogsNeedingImages.push({
          lessonId,
          stepId: step.id,
          title: step.title || 'untitled',
          speakers: speakers.join(', '),
          hasImage: !!step.imageId
        });
      }
    });
  } catch (e) {
    // Skip invalid files
  }
});

console.log('───────────────────────────────────────────────────────');
console.log('  IMAGEIDS USED IN LESSONS\n');

if (usedImageIds.size === 0) {
  console.log('  (none found)\n');
} else {
  usedImageIds.forEach(id => {
    const inRegistry = registryAssets.has(id);
    const status = inRegistry ? '✅' : '❌ NOT IN REGISTRY';
    console.log(`  ${status} ${id}`);
  });
}

console.log('\n───────────────────────────────────────────────────────');
console.log('  DIALOGS NEEDING IMAGES\n');

dialogsNeedingImages.forEach(d => {
  const icon = d.hasImage ? '✅' : '⏳';
  console.log(`  ${icon} ${d.lessonId} / ${d.stepId}: ${d.title}`);
  console.log(`     Speakers: ${d.speakers}`);
});

console.log(`\n  Total dialogs: ${dialogsNeedingImages.length}`);
console.log(`  With images: ${dialogsNeedingImages.filter(d => d.hasImage).length}`);
console.log(`  Need images: ${dialogsNeedingImages.filter(d => !d.hasImage).length}`);

console.log('\n───────────────────────────────────────────────────────');
console.log('  ORPHANED ASSETS (in registry but not used)\n');

const orphaned = [...registryAssets].filter(id => !usedImageIds.has(id));
console.log(`  Count: ${orphaned.length} of ${registryAssets.size}\n`);

if (orphaned.length > 0 && orphaned.length <= 20) {
  orphaned.forEach(id => console.log(`  • ${id}`));
} else if (orphaned.length > 20) {
  orphaned.slice(0, 10).forEach(id => console.log(`  • ${id}`));
  console.log(`  ... and ${orphaned.length - 10} more`);
}

console.log('\n═══════════════════════════════════════════════════════\n');

// Summary
console.log('SUMMARY:');
console.log(`  • ${usedImageIds.size} imageIds referenced in lessons`);
console.log(`  • ${dialogsNeedingImages.length} dialogs need images`);
console.log(`  • ${orphaned.length} orphaned assets in registry`);
console.log(`  • Registry is ${((orphaned.length / registryAssets.size) * 100).toFixed(0)}% unused\n`);
