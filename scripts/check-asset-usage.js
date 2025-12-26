#!/usr/bin/env node

/**
 * Asset Usage Checker
 *
 * Shows which lessons use each asset, finds orphaned assets,
 * and validates asset files exist.
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_FILE = path.join(__dirname, 'media-data/asset-registry.json');
const STATIC_DIR = path.join(__dirname, '../apps/web/static');

function loadRegistry() {
  return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
}

function showProgress() {
  const registry = loadRegistry();
  const assets = Object.values(registry.assets);

  const stats = {
    total: assets.length,
    images: assets.filter(a => a.type === 'image').length,
    videos: assets.filter(a => a.type === 'video').length,
    pending: assets.filter(a => a.status === 'pending').length,
    complete: assets.filter(a => a.status === 'complete').length,
    inProgress: assets.filter(a => a.status === 'in_progress').length,
    blocked: assets.filter(a => a.status === 'blocked').length
  };

  const progress = ((stats.complete / stats.total) * 100).toFixed(1);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('       MULTIMEDIA ASSETS - PROGRESS REPORT');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`  Total Assets:   ${stats.total}`);
  console.log(`  ├── Images:     ${stats.images}`);
  console.log(`  └── Videos:     ${stats.videos}\n`);

  console.log(`  Progress:       ${stats.complete}/${stats.total} (${progress}%)`);
  console.log(`  ├── Complete:   ${stats.complete}`);
  console.log(`  ├── In Progress:${stats.inProgress}`);
  console.log(`  ├── Pending:    ${stats.pending}`);
  console.log(`  └── Blocked:    ${stats.blocked}\n`);

  // Progress bar
  const barWidth = 40;
  const filled = Math.round((stats.complete / stats.total) * barWidth);
  const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
  console.log(`  [${bar}] ${progress}%\n`);

  // Category breakdown
  console.log('───────────────────────────────────────────────────────');
  console.log('  CATEGORY BREAKDOWN\n');

  for (const [category, assetIds] of Object.entries(registry.categories)) {
    const categoryAssets = assetIds.map(id => registry.assets[id]);
    const complete = categoryAssets.filter(a => a.status === 'complete').length;
    const total = categoryAssets.length;
    const pct = ((complete / total) * 100).toFixed(0);
    const status = complete === total ? '✅' : complete > 0 ? '🔄' : '⏳';
    console.log(`  ${status} ${category.padEnd(15)} ${complete}/${total} (${pct}%)`);
  }

  console.log('\n═══════════════════════════════════════════════════════\n');
}

function findReusableAssets() {
  const registry = loadRegistry();
  const reusable = [];

  for (const asset of Object.values(registry.assets)) {
    const uniqueLessons = new Set(asset.usedIn.map(u => u.lessonId));
    if (uniqueLessons.size > 1) {
      reusable.push({
        id: asset.id,
        type: asset.type,
        lessonCount: uniqueLessons.size,
        lessons: [...uniqueLessons]
      });
    }
  }

  if (reusable.length === 0) {
    console.log('\n  No reusable assets found (all assets used in single lesson).\n');
    return;
  }

  console.log('\n⭐ REUSABLE ASSETS (used in multiple lessons):\n');
  reusable.sort((a, b) => b.lessonCount - a.lessonCount);

  for (const asset of reusable) {
    const icon = asset.type === 'image' ? '🖼️' : '🎬';
    console.log(`  ${icon} ${asset.id}`);
    console.log(`     Used in ${asset.lessonCount} lessons: ${asset.lessons.join(', ')}\n`);
  }
}

function listByCategory(category) {
  const registry = loadRegistry();

  if (!registry.categories[category]) {
    console.log(`\n  Category "${category}" not found.`);
    console.log(`  Available: ${Object.keys(registry.categories).join(', ')}\n`);
    return;
  }

  const assetIds = registry.categories[category];
  console.log(`\n📁 Category: ${category} (${assetIds.length} assets)\n`);

  for (const id of assetIds) {
    const asset = registry.assets[id];
    const icon = asset.type === 'image' ? '🖼️' : '🎬';
    const status = asset.status === 'complete' ? '✅' : asset.status === 'pending' ? '⏳' : '🔄';
    console.log(`  ${status} ${icon} ${id}`);
    console.log(`     ${asset.description.substring(0, 60)}...`);
    console.log(`     Path: ${asset.path}\n`);
  }
}

function validateAssets() {
  const registry = loadRegistry();
  const missing = [];
  const found = [];

  for (const asset of Object.values(registry.assets)) {
    if (asset.status === 'complete') {
      const fullPath = path.join(STATIC_DIR, asset.path);
      if (fs.existsSync(fullPath)) {
        found.push(asset.id);
      } else {
        missing.push(asset);
      }
    }
  }

  console.log('\n🔍 ASSET VALIDATION\n');

  if (missing.length === 0 && found.length === 0) {
    console.log('  No completed assets to validate yet.\n');
    return;
  }

  console.log(`  ✅ Found: ${found.length} assets exist on disk`);
  console.log(`  ❌ Missing: ${missing.length} assets marked complete but file not found\n`);

  if (missing.length > 0) {
    console.log('  Missing files:');
    for (const asset of missing) {
      console.log(`    - ${asset.id}: ${asset.path}`);
    }
    console.log('');
  }
}

function findOrphans() {
  const registry = loadRegistry();
  const orphans = [];

  for (const asset of Object.values(registry.assets)) {
    if (asset.usedIn.length === 0) {
      orphans.push(asset);
    }
  }

  if (orphans.length === 0) {
    console.log('\n  ✅ No orphaned assets found.\n');
    return;
  }

  console.log(`\n⚠️  ORPHANED ASSETS (not used in any lesson): ${orphans.length}\n`);
  for (const asset of orphans) {
    console.log(`  - ${asset.id}: ${asset.description.substring(0, 50)}...`);
  }
  console.log('');
}

function searchAssets(query) {
  const registry = loadRegistry();
  const results = [];
  const lowerQuery = query.toLowerCase();

  for (const asset of Object.values(registry.assets)) {
    const matches =
      asset.id.toLowerCase().includes(lowerQuery) ||
      asset.description.toLowerCase().includes(lowerQuery) ||
      asset.tags.some(t => t.toLowerCase().includes(lowerQuery));

    if (matches) {
      results.push(asset);
    }
  }

  if (results.length === 0) {
    console.log(`\n  No assets found matching "${query}".\n`);
    return;
  }

  console.log(`\n🔎 Search results for "${query}": ${results.length} assets\n`);

  for (const asset of results) {
    const icon = asset.type === 'image' ? '🖼️' : '🎬';
    const status = asset.status === 'complete' ? '✅' : '⏳';
    console.log(`  ${status} ${icon} ${asset.id}`);
    console.log(`     ${asset.description.substring(0, 60)}...`);
    console.log(`     Category: ${asset.category} | Tags: ${asset.tags.join(', ')}\n`);
  }
}

// CLI
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Asset Usage Checker

Usage:
  node scripts/check-asset-usage.js              Show progress overview
  node scripts/check-asset-usage.js --reusable   Show reusable assets
  node scripts/check-asset-usage.js --category=X List assets in category
  node scripts/check-asset-usage.js --validate   Check if asset files exist
  node scripts/check-asset-usage.js --orphans    Find assets not used in lessons
  node scripts/check-asset-usage.js --search=X   Search assets by keyword
  node scripts/check-asset-usage.js -h           Show this help
`);
} else if (args.includes('--reusable')) {
  findReusableAssets();
} else if (args.find(a => a.startsWith('--category='))) {
  const category = args.find(a => a.startsWith('--category=')).split('=')[1];
  listByCategory(category);
} else if (args.includes('--validate')) {
  validateAssets();
} else if (args.includes('--orphans')) {
  findOrphans();
} else if (args.find(a => a.startsWith('--search='))) {
  const query = args.find(a => a.startsWith('--search=')).split('=')[1];
  searchAssets(query);
} else {
  showProgress();
}
