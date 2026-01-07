#!/usr/bin/env node
/**
 * Regenerate asset registry based on actual lesson content
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '../content/de-fa');
const REGISTRY_PATH = path.join(__dirname, '../apps/web/src/lib/data/asset-registry.json');
const STATIC_DIR = path.join(__dirname, '../apps/web/static');

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

// Generate asset ID from speakers
function generateAssetId(lessonId, stepId, speakers) {
  const speakerPart = speakers.map(s => s.toLowerCase()).join('-');
  return `img-${lessonId.toLowerCase()}-${stepId}-${speakerPart}`;
}

// Get category based on context
function getCategory(title, speakers) {
  if (title.includes('کافه') || title.includes('قهوه')) return 'scenes';
  if (title.includes('فروشگاه') || title.includes('خرید')) return 'scenes';
  if (title.includes('کلاس')) return 'scenes';
  if (speakers.includes('Kellner') || speakers.includes('Verkäufer')) return 'scenes';
  return 'dialogs';
}

const lessonFiles = findLessonFiles(CONTENT_DIR);
const newAssets = {};

// Keep existing completed asset
const oldRegistry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
if (oldRegistry.assets['img-greeting-wave']) {
  newAssets['img-greeting-wave'] = oldRegistry.assets['img-greeting-wave'];
}

console.log('Scanning lessons for dialogs...\n');

lessonFiles.forEach(file => {
  try {
    const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
    const lessonId = path.basename(file, '.json');
    const lessonTitle = lesson.title || {};

    lesson.steps?.forEach(step => {
      // Process dialogs
      if (step.type === 'dialog') {
        const speakers = [...new Set(step.lines?.map(l => l.speaker) || [])];
        const assetId = generateAssetId(lessonId, step.id, speakers);
        const category = getCategory(step.title || '', speakers);

        // Build description
        const speakerList = speakers.join(' & ');
        const dialogTitle = step.title || 'Dialog';
        const firstLine = step.lines?.[0]?.text?.de || '';

        newAssets[assetId] = {
          id: assetId,
          type: 'image',
          category: category,
          path: `/images/shared/${category}/${assetId}.jpg`,
          description: `${speakerList} - ${dialogTitle}. Scene: "${firstLine}"`,
          tags: [category, lessonId.split('-')[0], 'dialog'],
          specs: {
            dimensions: '800x600',
            format: 'jpg',
            style: 'friendly, modern German setting'
          },
          usedIn: [{
            lessonId: lessonId,
            stepId: step.id,
            context: dialogTitle
          }],
          speakers: speakers,
          status: 'pending',
          createdAt: new Date().toISOString().split('T')[0]
        };

        console.log(`  ✓ ${assetId}`);
        console.log(`    Speakers: ${speakerList}`);
      }

      // Process new-words with existing imageId
      if (step.imageId && step.imageId !== 'img-greeting-wave') {
        // Keep reference but asset might not exist yet
      }
    });
  } catch (e) {
    console.error(`Error processing ${file}: ${e.message}`);
  }
});

// Build new registry
const newRegistry = {
  version: '2.0',
  lastUpdated: new Date().toISOString().split('T')[0],
  generatedFrom: 'lesson content',
  assets: newAssets,
  categories: {}
};

// Build category index
Object.values(newAssets).forEach(asset => {
  const cat = asset.category;
  if (!newRegistry.categories[cat]) newRegistry.categories[cat] = [];
  newRegistry.categories[cat].push(asset.id);
});

// Write new registry
fs.writeFileSync(REGISTRY_PATH, JSON.stringify(newRegistry, null, 2));

console.log('\n═══════════════════════════════════════════════════════');
console.log('  REGISTRY REGENERATED');
console.log('═══════════════════════════════════════════════════════\n');
console.log(`  Total assets: ${Object.keys(newAssets).length}`);
console.log(`  Categories: ${Object.keys(newRegistry.categories).join(', ')}`);
console.log(`\n  Saved to: ${REGISTRY_PATH}\n`);
