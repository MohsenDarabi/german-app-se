#!/usr/bin/env node
/**
 * Upload language pack to Cloudflare R2 (deduplicated)
 *
 * This script uploads AUDIO and IMAGES to R2 CDN.
 * For lesson JSON content, use: scripts/upload-content-to-r2.js
 *
 * Features:
 * - Reads existing audio manifest (scripts/audio-data/manifest.json)
 * - Reads asset registry (apps/web/src/lib/data/asset-registry.json)
 * - Uploads audio by content hash (deduplication)
 * - Uploads images by asset path
 * - Generates combined R2 manifest
 * - Uses S3-compatible API (@aws-sdk/client-s3)
 *
 * Usage:
 *   node scripts/upload-to-r2.js --dry-run          # Preview what would upload
 *   node scripts/upload-to-r2.js                    # Actually upload
 *   node scripts/upload-to-r2.js --force            # Re-upload all (ignore existing)
 *
 * Full content upload (audio + images + lesson JSON):
 *   node scripts/upload-to-r2.js && node scripts/upload-content-to-r2.js
 *
 * Environment variables (from .env.local):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { S3Client, PutObjectCommand, HeadObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// Configuration
const LANGUAGE_PAIR = 'de-fa';
const AUDIO_MANIFEST_PATH = path.join(__dirname, 'audio-data/manifest.json');
const ASSET_REGISTRY_PATH = path.join(__dirname, '../apps/web/src/lib/data/asset-registry.json');
const STATIC_DIR = path.join(__dirname, '../apps/web/static');

// R2 client setup
function createR2Client() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error('❌ Missing R2 credentials in .env.local');
    console.error('   Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY');
    process.exit(1);
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

// Check if object exists in R2
async function objectExists(client, bucket, key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw err;
  }
}

// Upload file to R2
async function uploadFile(client, bucket, key, filePath, contentType) {
  const fileContent = fs.readFileSync(filePath);
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
  }));
}

// Upload JSON to R2
async function uploadJSON(client, bucket, key, data) {
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(data, null, 2),
    ContentType: 'application/json',
  }));
}

// Get content type from file extension
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.mp3': 'audio/mpeg',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.json': 'application/json',
  };
  return types[ext] || 'application/octet-stream';
}

// Fix path discrepancy: manifest has "A1-1-M01-L01" but actual dir is "A1-M01-L01"
function fixAudioPath(originalPath) {
  // Replace patterns like /A1-1-M01- with /A1-M01-
  return originalPath.replace(/\/A(\d+)-\d+-M/g, '/A$1-M');
}

// Compute MD5 hash of file contents
function computeFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

// Scan audio directory and build hash→file mapping
function scanAudioDirectory(audioDir) {
  const files = {};
  const hashToFile = {};

  if (!fs.existsSync(audioDir)) {
    console.log(`   ⚠️  Audio directory not found: ${audioDir}`);
    return { files, hashToFile };
  }

  const lessonDirs = fs.readdirSync(audioDir).filter(name => {
    const fullPath = path.join(audioDir, name);
    return fs.statSync(fullPath).isDirectory() && name.match(/^A\d+-M\d+-L\d+$/);
  });

  for (const lessonDir of lessonDirs) {
    const lessonPath = path.join(audioDir, lessonDir);
    const audioFiles = fs.readdirSync(lessonPath).filter(f => f.endsWith('.mp3'));

    for (const audioFile of audioFiles) {
      const filePath = path.join(lessonPath, audioFile);
      const audioId = audioFile.replace('.mp3', '');
      const key = `${lessonDir}/${audioId}`;

      try {
        const hash = computeFileHash(filePath);
        files[key] = { filePath, hash };

        if (!hashToFile[hash]) {
          hashToFile[hash] = filePath;
        }
      } catch (err) {
        console.log(`   ⚠️  Error hashing ${filePath}: ${err.message}`);
      }
    }
  }

  return { files, hashToFile };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');

  console.log('🚀 R2 Upload Script (Deduplicated)\n');
  console.log(`   Language pair: ${LANGUAGE_PAIR}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   Force re-upload: ${force}\n`);

  // Load manifests
  console.log('📂 Loading manifests...\n');

  if (!fs.existsSync(AUDIO_MANIFEST_PATH)) {
    console.error(`❌ Audio manifest not found: ${AUDIO_MANIFEST_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(ASSET_REGISTRY_PATH)) {
    console.error(`❌ Asset registry not found: ${ASSET_REGISTRY_PATH}`);
    process.exit(1);
  }

  const audioManifest = JSON.parse(fs.readFileSync(AUDIO_MANIFEST_PATH, 'utf8'));
  const assetRegistry = JSON.parse(fs.readFileSync(ASSET_REGISTRY_PATH, 'utf8'));

  // Initialize R2 client
  const client = dryRun ? null : createR2Client();
  const bucket = process.env.R2_BUCKET_NAME || 'language-learning-assets';

  // Scan actual audio files on disk
  console.log('🔍 Scanning audio directory...\n');
  const audioDir = path.join(STATIC_DIR, 'audio');
  const { files: scannedFiles, hashToFile } = scanAudioDirectory(audioDir);

  // Build audioMap from scanned files
  const audioMap = {};
  for (const [key, { hash }] of Object.entries(scannedFiles)) {
    audioMap[key] = hash;
  }

  const uniqueHashes = new Set(Object.values(audioMap));
  const totalReferences = Object.keys(audioMap).length;

  console.log(`📊 Audio Statistics (from disk scan):`);
  console.log(`   Total files: ${totalReferences}`);
  console.log(`   Unique content: ${uniqueHashes.size}`);
  console.log(`   Deduplication savings: ${((1 - uniqueHashes.size / totalReferences) * 100).toFixed(1)}%\n`);

  // Upload unique audio files
  console.log('🎵 Uploading audio files (by hash)...\n');

  let audioUploaded = 0;
  let audioSkipped = 0;
  let audioErrors = 0;

  for (const hash of uniqueHashes) {
    const localPath = hashToFile[hash];
    if (!localPath || !fs.existsSync(localPath)) {
      console.log(`   ⚠️  File not found for hash: ${hash}`);
      audioErrors++;
      continue;
    }

    const r2Key = `${LANGUAGE_PAIR}/audio/by-hash/${hash}.mp3`;

    if (dryRun) {
      console.log(`   [DRY RUN] ${r2Key}`);
      audioUploaded++;
    } else {
      try {
        // Check if already exists (skip unless --force)
        if (!force && await objectExists(client, bucket, r2Key)) {
          audioSkipped++;
          continue;
        }

        await uploadFile(client, bucket, r2Key, localPath, 'audio/mpeg');
        console.log(`   ✅ ${r2Key}`);
        audioUploaded++;
      } catch (err) {
        console.log(`   ❌ ${r2Key}: ${err.message}`);
        audioErrors++;
      }
    }
  }

  console.log(`\n   Summary: ${audioUploaded} uploaded, ${audioSkipped} skipped, ${audioErrors} errors\n`);

  // Upload images
  console.log('🖼️  Uploading images...\n');

  let imageUploaded = 0;
  let imageSkipped = 0;
  let imageErrors = 0;
  const images = {};

  for (const [assetId, asset] of Object.entries(assetRegistry.assets || {})) {
    if (asset.status !== 'completed' || !asset.path) continue;

    const localPath = path.join(STATIC_DIR, asset.path);
    if (!fs.existsSync(localPath)) {
      console.log(`   ⚠️  Image not found: ${localPath}`);
      imageErrors++;
      continue;
    }

    const r2Key = `${LANGUAGE_PAIR}${asset.path}`;
    images[assetId] = asset.path;

    if (dryRun) {
      console.log(`   [DRY RUN] ${r2Key}`);
      imageUploaded++;
    } else {
      try {
        if (!force && await objectExists(client, bucket, r2Key)) {
          imageSkipped++;
          continue;
        }

        await uploadFile(client, bucket, r2Key, localPath, getContentType(localPath));
        console.log(`   ✅ ${r2Key}`);
        imageUploaded++;
      } catch (err) {
        console.log(`   ❌ ${r2Key}: ${err.message}`);
        imageErrors++;
      }
    }
  }

  console.log(`\n   Summary: ${imageUploaded} uploaded, ${imageSkipped} skipped, ${imageErrors} errors\n`);

  // Build and upload R2 manifest
  console.log('📋 Building R2 manifest...\n');

  const r2Manifest = {
    id: LANGUAGE_PAIR,
    version: '1.0.0',
    name: { source: 'Deutsch', target: 'آلمانی' },
    flag: '🇩🇪',
    levels: ['A1', 'A2', 'B1', 'B2'],
    freeLessons: 6,
    audioMap: audioMap,
    images: images,
    stats: {
      totalAudioFiles: uniqueHashes.size,
      totalAudioReferences: totalReferences,
      totalImages: Object.keys(images).length,
      deduplicationSavings: `${((1 - uniqueHashes.size / totalReferences) * 100).toFixed(1)}%`,
    },
    updatedAt: new Date().toISOString(),
  };

  const manifestKey = `${LANGUAGE_PAIR}/manifest.json`;

  if (dryRun) {
    console.log(`   [DRY RUN] ${manifestKey}`);
    console.log('\n   Manifest preview:');
    console.log(`   - Audio files: ${r2Manifest.stats.totalAudioFiles}`);
    console.log(`   - Audio references: ${r2Manifest.stats.totalAudioReferences}`);
    console.log(`   - Images: ${r2Manifest.stats.totalImages}`);
    console.log(`   - Savings: ${r2Manifest.stats.deduplicationSavings}`);
  } else {
    try {
      await uploadJSON(client, bucket, manifestKey, r2Manifest);
      console.log(`   ✅ ${manifestKey}`);
    } catch (err) {
      console.log(`   ❌ ${manifestKey}: ${err.message}`);
    }
  }

  console.log('\n✅ Upload complete!\n');

  // Print public URL info
  const accountId = process.env.R2_ACCOUNT_ID;
  console.log('📎 Next steps:');
  console.log('   1. Enable public access for the bucket in Cloudflare dashboard');
  console.log('   2. Get your public URL (e.g., https://pub-xxx.r2.dev)');
  console.log('   3. Add PUBLIC_R2_URL to your .env\n');
}

main().catch(err => {
  console.error('❌ Upload failed:', err);
  process.exit(1);
});
