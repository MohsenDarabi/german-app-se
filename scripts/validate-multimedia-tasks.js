#!/usr/bin/env node
/**
 * Asset Registry Validator
 *
 * Validates the asset registry structure and checks for common issues.
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '../apps/web/src/lib/data/asset-registry.json');
const STATIC_DIR = path.join(__dirname, '../apps/web/static');

let errors = [];
let warnings = [];

console.log('\n📋 Validating asset registry...\n');

try {
  const content = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));

  // Validate top-level structure
  if (!content.version) warnings.push('missing version field');
  if (!content.assets || typeof content.assets !== 'object') {
    errors.push('missing or invalid assets object');
  }

  const assets = content.assets || {};
  const assetIds = Object.keys(assets);
  let valid = 0;
  let images = 0;
  let videos = 0;

  console.log(`  Found ${assetIds.length} assets in registry\n`);

  assetIds.forEach(id => {
    const asset = assets[id];
    let assetErrors = [];

    // Required fields
    if (!asset.id) assetErrors.push('missing id');
    if (asset.id && asset.id !== id) assetErrors.push(`id mismatch: key="${id}" but id="${asset.id}"`);
    if (!asset.type) assetErrors.push('missing type');
    if (!asset.path) assetErrors.push('missing path');
    if (!asset.category) assetErrors.push('missing category');
    if (!asset.status) assetErrors.push('missing status');

    // Type validation
    if (asset.type && !['image', 'video'].includes(asset.type)) {
      assetErrors.push(`invalid type: ${asset.type}`);
    }

    // Status validation
    if (asset.status && !['pending', 'completed', 'blocked'].includes(asset.status)) {
      assetErrors.push(`invalid status: ${asset.status}`);
    }

    // Path format validation
    if (asset.path) {
      if (!asset.path.startsWith('/images/') && !asset.path.startsWith('/videos/')) {
        assetErrors.push(`invalid path format: ${asset.path}`);
      }

      // Check if file exists when marked as completed
      const fullPath = path.join(STATIC_DIR, asset.path);
      if (asset.status === 'completed' && !fs.existsSync(fullPath)) {
        assetErrors.push(`marked completed but file missing: ${asset.path}`);
      }
    }

    // Count types
    if (asset.type === 'image') images++;
    if (asset.type === 'video') videos++;

    if (assetErrors.length > 0) {
      errors.push({ id, errors: assetErrors });
    } else {
      valid++;
    }
  });

  // Check for orphaned files (files without registry entry)
  const imageCategories = ['greetings', 'expressions', 'scenes', 'places', 'daily-life', 'actions',
                           'grammar', 'people', 'transport', 'food', 'weather', 'furniture',
                           'misc', 'professions', 'family', 'directions'];

  const registeredPaths = new Set(Object.values(assets).map(a => a.path));

  imageCategories.forEach(cat => {
    const catDir = path.join(STATIC_DIR, 'images/shared', cat);
    if (fs.existsSync(catDir)) {
      const files = fs.readdirSync(catDir).filter(f => !f.startsWith('.'));
      files.forEach(file => {
        const relativePath = `/images/shared/${cat}/${file}`;
        if (!registeredPaths.has(relativePath)) {
          warnings.push(`orphaned file (not in registry): ${relativePath}`);
        }
      });
    }
  });

  console.log('═'.repeat(50));
  console.log(`\n  Assets:     ${valid}/${assetIds.length} valid`);
  console.log(`  ├── Images: ${images}`);
  console.log(`  └── Videos: ${videos}\n`);

  if (warnings.length > 0) {
    console.log(`⚠️  Warnings: ${warnings.length}\n`);
    warnings.forEach(w => console.log(`  • ${w}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.log(`❌ Errors: ${errors.length}\n`);
    errors.forEach(({ id, errors: errs }) => {
      console.log(`  ${id}:`);
      errs.forEach(e => console.log(`    • ${e}`));
    });
    process.exit(1);
  } else {
    console.log('✅ Asset registry is valid!\n');
  }

} catch (e) {
  console.error(`❌ Failed to read registry: ${e.message}`);
  process.exit(1);
}
