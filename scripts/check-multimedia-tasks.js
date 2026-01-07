#!/usr/bin/env node

/**
 * Multimedia Task Progress Checker
 *
 * Shows progress on image/video tasks from the asset registry.
 * Run from project root: node scripts/check-multimedia-tasks.js
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '../apps/web/src/lib/data/asset-registry.json');
const IMAGES_DIR = path.join(__dirname, '../apps/web/static/images/shared');

function loadRegistry() {
  const content = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  return content.assets;
}

function checkFileExists(assetPath) {
  if (!assetPath) return false;
  const fullPath = path.join(__dirname, '../apps/web/static', assetPath);
  return fs.existsSync(fullPath);
}

function getStats(assets) {
  const assetList = Object.values(assets);
  let stats = { images: 0, videos: 0, pending: 0, completed: 0, blocked: 0, filesExist: 0 };

  assetList.forEach(asset => {
    if (asset.type === 'image') stats.images++;
    if (asset.type === 'video') stats.videos++;
    if (asset.status === 'pending') stats.pending++;
    if (asset.status === 'completed') stats.completed++;
    if (asset.status === 'blocked') stats.blocked++;
    if (checkFileExists(asset.path)) stats.filesExist++;
  });

  return stats;
}

function showProgress() {
  const assets = loadRegistry();
  const stats = getStats(assets);
  const totalTasks = stats.images + stats.videos;
  const progress = ((stats.completed / totalTasks) * 100).toFixed(1);
  const fileProgress = ((stats.filesExist / totalTasks) * 100).toFixed(1);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('       MULTIMEDIA ASSETS - PROGRESS REPORT');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`  Total Assets:   ${totalTasks}`);
  console.log(`  ├── Images:     ${stats.images}`);
  console.log(`  └── Videos:     ${stats.videos}\n`);

  console.log(`  Status:`);
  console.log(`  ├── Completed:  ${stats.completed}/${totalTasks} (${progress}%)`);
  console.log(`  ├── Pending:    ${stats.pending}`);
  console.log(`  └── Blocked:    ${stats.blocked}\n`);

  console.log(`  Files on disk:  ${stats.filesExist}/${totalTasks} (${fileProgress}%)\n`);

  // Progress bar (based on files that exist)
  const barWidth = 40;
  const filled = Math.round((stats.filesExist / totalTasks) * barWidth);
  const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
  console.log(`  [${bar}] ${fileProgress}%\n`);

  // Per-category breakdown
  console.log('───────────────────────────────────────────────────────');
  console.log('  CATEGORY BREAKDOWN\n');

  const categories = {};
  Object.values(assets).forEach(asset => {
    const cat = asset.category || 'uncategorized';
    if (!categories[cat]) categories[cat] = { total: 0, completed: 0, filesExist: 0 };
    categories[cat].total++;
    if (asset.status === 'completed') categories[cat].completed++;
    if (checkFileExists(asset.path)) categories[cat].filesExist++;
  });

  Object.entries(categories).sort((a, b) => b[1].total - a[1].total).forEach(([cat, data]) => {
    const pct = ((data.filesExist / data.total) * 100).toFixed(0);
    const status = data.filesExist === data.total ? '✅' : data.filesExist > 0 ? '🔄' : '⏳';
    console.log(`  ${status} ${cat}: ${data.filesExist}/${data.total} (${pct}%)`);
  });

  console.log('\n═══════════════════════════════════════════════════════\n');

  // Show mismatched status (files exist but status is pending)
  const mismatched = Object.values(assets).filter(a =>
    checkFileExists(a.path) && a.status !== 'completed'
  );
  if (mismatched.length > 0) {
    console.log('⚠️  STATUS MISMATCH (files exist but not marked completed):\n');
    mismatched.forEach(asset => {
      console.log(`  • ${asset.id}`);
      console.log(`    Path: ${asset.path}`);
    });
    console.log('');
  }
}

function listPending(limit = 10) {
  const assets = loadRegistry();
  const pending = Object.values(assets)
    .filter(a => a.status === 'pending' && !checkFileExists(a.path))
    .slice(0, limit);

  console.log('\n📋 NEXT PENDING ASSETS:\n');

  pending.forEach(asset => {
    const icon = asset.type === 'image' ? '🖼️' : '🎬';
    console.log(`${icon}  ${asset.id}`);
    console.log(`   ${(asset.description || '').substring(0, 70)}...`);
    console.log(`   Path: ${asset.path}`);
    console.log(`   Category: ${asset.category}\n`);
  });

  const totalPending = Object.values(assets).filter(a =>
    a.status === 'pending' && !checkFileExists(a.path)
  ).length;

  console.log(`Showing ${pending.length} of ${totalPending} pending assets.\n`);
}

function syncStatus() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  let updated = 0;

  Object.entries(registry.assets).forEach(([id, asset]) => {
    const exists = checkFileExists(asset.path);
    if (exists && asset.status !== 'completed') {
      registry.assets[id].status = 'completed';
      registry.assets[id].completedAt = new Date().toISOString().split('T')[0];
      updated++;
      console.log(`✅ Marked completed: ${id}`);
    }
  });

  if (updated > 0) {
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
    console.log(`\nUpdated ${updated} asset(s) in registry.`);
  } else {
    console.log('\nNo status updates needed.');
  }
}

// CLI
const args = process.argv.slice(2);

if (args.includes('--pending') || args.includes('-p')) {
  const idx = args.indexOf('--pending') !== -1 ? args.indexOf('--pending') : args.indexOf('-p');
  const limit = parseInt(args[idx + 1]) || 10;
  listPending(limit);
} else if (args.includes('--sync') || args.includes('-s')) {
  syncStatus();
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Multimedia Asset Progress Checker

Usage:
  node scripts/check-multimedia-tasks.js          Show progress overview
  node scripts/check-multimedia-tasks.js -p [N]   List next N pending assets
  node scripts/check-multimedia-tasks.js -s       Sync status (mark existing files as completed)
  node scripts/check-multimedia-tasks.js -h       Show this help

Source:
  apps/web/src/lib/data/asset-registry.json       Central asset registry
`);
} else {
  showProgress();
}
