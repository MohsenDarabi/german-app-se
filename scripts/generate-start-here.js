#!/usr/bin/env node

/**
 * Generate START-HERE.md from Asset Registry
 *
 * Creates an asset-centric task list organized by category,
 * showing which assets are reusable across lessons.
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_FILE = path.join(__dirname, 'media-data/asset-registry.json');
const OUTPUT_FILE = path.join(__dirname, '../docs/multimedia-tasks/START-HERE.md');

function generateStartHere() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));

  const lines = [];

  // Header
  lines.push('# Multimedia Assets for German Learning App');
  lines.push('');
  lines.push('> **Organized by concept** - Same image can be used in multiple lessons!');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## How to Use (3 Simple Steps)');
  lines.push('');
  lines.push('1. **Find an asset** - Browse by category below');
  lines.push('2. **Create it** - Follow the description and specs');
  lines.push('3. **Save & Mark done** - Save to the path shown, change `[ ]` to `[x]`');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Quick Stats');
  lines.push('');

  const assets = Object.values(registry.assets);
  const images = assets.filter(a => a.type === 'image');
  const videos = assets.filter(a => a.type === 'video');
  const pending = assets.filter(a => a.status === 'pending');
  const complete = assets.filter(a => a.status === 'complete');

  lines.push(`| Total | Images | Videos | Pending | Complete |`);
  lines.push(`|-------|--------|--------|---------|----------|`);
  lines.push(`| ${assets.length} | ${images.length} | ${videos.length} | ${pending.length} | ${complete.length} |`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Category display names
  const categoryNames = {
    'transport': 'Transport (Verkehrsmittel)',
    'food': 'Food & Restaurant (Essen)',
    'places': 'Places in City (Orte)',
    'greetings': 'Greetings (Begrüßungen)',
    'people': 'People & Descriptions (Menschen)',
    'weather': 'Weather & Feelings (Wetter & Gefühle)',
    'daily-life': 'Daily Life (Alltag)',
    'family': 'Family (Familie)',
    'professions': 'Professions (Berufe)',
    'hobbies': 'Hobbies (Hobbys)',
    'furniture': 'Furniture & Rooms (Möbel)',
    'bathroom': 'Bathroom & Hygiene (Badezimmer)',
    'directions': 'Directions (Richtungen)',
    'emotions': 'Emotions (Gefühle)',
    'grammar': 'Grammar Diagrams (Grammatik)',
    'misc': 'Other (Sonstiges)'
  };

  // Sort categories by asset count (descending)
  const sortedCategories = Object.entries(registry.categories)
    .sort((a, b) => b[1].length - a[1].length);

  for (const [category, assetIds] of sortedCategories) {
    const displayName = categoryNames[category] || category;
    const categoryAssets = assetIds.map(id => registry.assets[id]);
    const categoryImages = categoryAssets.filter(a => a.type === 'image');
    const categoryVideos = categoryAssets.filter(a => a.type === 'video');

    lines.push(`## ${displayName}`);
    lines.push('');

    if (categoryImages.length > 0 && categoryVideos.length > 0) {
      lines.push(`**${categoryImages.length} images, ${categoryVideos.length} videos**`);
    } else if (categoryImages.length > 0) {
      lines.push(`**${categoryImages.length} images**`);
    } else {
      lines.push(`**${categoryVideos.length} videos**`);
    }
    lines.push('');

    for (const asset of categoryAssets) {
      const icon = asset.type === 'image' ? '🖼️' : '🎬';
      const checkbox = asset.status === 'complete' ? '[x]' : '[ ]';
      const reusable = asset.usedIn.length > 1 ? ' ⭐' : '';

      lines.push(`### ${icon} ${asset.id}${reusable}`);
      lines.push('');
      lines.push(`- ${checkbox} **${truncate(asset.description, 100)}**`);

      // Show which lessons use this asset
      const lessons = asset.usedIn.map(u => u.lessonId.replace('A1-1-', 'A1.1-').replace('A1-2-', 'A1.2-'));
      const uniqueLessons = [...new Set(lessons)];
      lines.push(`- Used in: ${uniqueLessons.join(', ')}`);

      // Show save path
      lines.push(`- Save to: \`apps/web/static${asset.path}\``);

      // Show specs
      if (asset.type === 'image') {
        lines.push(`- Specs: ${asset.specs.dimensions || '800x600'} ${asset.specs.format || 'jpg'}`);
      } else {
        lines.push(`- Specs: ${asset.specs.duration || '15-30s'} ${asset.specs.format || 'mp4'} ${asset.specs.resolution || '1080p'}`);
      }
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  // Footer
  lines.push('## Notes');
  lines.push('');
  lines.push('- ⭐ = **Reusable asset** - used in multiple lessons, create only once!');
  lines.push('- Assets organized by **what they show**, not which lesson uses them');
  lines.push('- Full details in `scripts/media-data/asset-registry.json`');
  lines.push('');
  lines.push('## Folder Structure');
  lines.push('');
  lines.push('```');
  lines.push('apps/web/static/');
  lines.push('├── images/shared/');
  lines.push('│   ├── transport/      # U-Bahn, Bus, S-Bahn, etc.');
  lines.push('│   ├── food/           # Restaurant, Frühstück, etc.');
  lines.push('│   ├── places/         # Bahnhof, Apotheke, etc.');
  lines.push('│   ├── people/         # Portraits, descriptions');
  lines.push('│   ├── weather/        # Sun, rain, seasons');
  lines.push('│   ├── grammar/        # Educational diagrams');
  lines.push('│   └── ...             # Other categories');
  lines.push('└── videos/shared/');
  lines.push('    └── dialogs/        # Dialog videos');
  lines.push('```');
  lines.push('');

  fs.writeFileSync(OUTPUT_FILE, lines.join('\n'));

  console.log(`\n✅ Generated ${OUTPUT_FILE}`);
  console.log(`   ${assets.length} assets organized into ${sortedCategories.length} categories\n`);
}

function truncate(str, len) {
  if (str.length <= len) return str;
  return str.substring(0, len - 3) + '...';
}

generateStartHere();
