#!/usr/bin/env node
/**
 * Sync Content to Static Folder
 *
 * Copies all lesson content from /content to /apps/web/static/content
 * Run this after editing content files to update the dev server.
 *
 * Usage:
 *   node scripts/sync-content-to-static.js
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const STATIC_CONTENT_DIR = path.join(__dirname, '..', 'apps', 'web', 'static', 'content');

console.log('📁 Syncing content to static folder...');
console.log(`   From: ${CONTENT_DIR}`);
console.log(`   To:   ${STATIC_CONTENT_DIR}`);
console.log('');

let filesCopied = 0;
let dirsCreated = 0;

function syncDirectory(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
    dirsCreated++;
  }

  const items = fs.readdirSync(src, { withFileTypes: true });

  for (const item of items) {
    const srcPath = path.join(src, item.name);
    const destPath = path.join(dest, item.name);

    if (item.isDirectory()) {
      syncDirectory(srcPath, destPath);
    } else if (item.name.endsWith('.json')) {
      fs.copyFileSync(srcPath, destPath);
      filesCopied++;
    }
  }
}

// Sync each language pair
const langPairs = fs.readdirSync(CONTENT_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

for (const langPair of langPairs) {
  console.log(`   Syncing ${langPair}...`);
  syncDirectory(
    path.join(CONTENT_DIR, langPair),
    path.join(STATIC_CONTENT_DIR, langPair)
  );
}

console.log('');
console.log(`✅ Done! Copied ${filesCopied} files, created ${dirsCreated} directories.`);
