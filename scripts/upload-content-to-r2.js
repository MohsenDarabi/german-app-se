#!/usr/bin/env node
/**
 * Upload Lesson Content to Cloudflare R2
 *
 * Uploads lesson JSON files to R2 CDN with content index.
 * This enables cloud-based content delivery instead of bundling in APK.
 *
 * Features:
 * - Scans all lesson JSON files in /content/{languagePair}/
 * - Uploads each lesson to R2: {languagePair}/content/{level}/lessons/{lessonId}.json
 * - Generates and uploads content index: {languagePair}/content/index.json
 * - Supports multiple language pairs
 *
 * Usage:
 *   node scripts/upload-content-to-r2.js --dry-run          # Preview what would upload
 *   node scripts/upload-content-to-r2.js                    # Actually upload
 *   node scripts/upload-content-to-r2.js --lang=en-fa       # Upload specific language
 *   node scripts/upload-content-to-r2.js --force            # Re-upload all (ignore existing)
 *
 * Environment variables (from .env.local):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

// Configuration
const CONTENT_DIR = path.join(__dirname, '..', 'content');
const LANGUAGE_PAIRS = ['de-fa', 'en-fa']; // Add more as needed

// Language metadata
const LANGUAGE_META = {
  'de-fa': { name: { source: 'Deutsch', target: 'آلمانی' }, flag: '🇩🇪' },
  'en-fa': { name: { source: 'English', target: 'انگلیسی' }, flag: '🇬🇧' },
  'fr-fa': { name: { source: 'Français', target: 'فرانسوی' }, flag: '🇫🇷' },
};

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

// Upload JSON to R2
async function uploadJSON(client, bucket, key, data) {
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(data, null, 2),
    ContentType: 'application/json',
    CacheControl: 'public, max-age=3600, stale-while-revalidate=86400',
  }));
}

/**
 * Recursively find all lesson JSON files
 */
function findLessonFiles(dir, lessons = []) {
  if (!fs.existsSync(dir)) return lessons;

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      findLessonFiles(fullPath, lessons);
    } else if (item.name.match(/^A[12]-M\d+-L\d+\.json$/)) {
      lessons.push(fullPath);
    }
  }

  return lessons;
}

/**
 * Parse lesson file and extract metadata
 */
function parseLessonFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lesson = JSON.parse(content);
  const stats = fs.statSync(filePath);

  return {
    id: lesson.id,
    level: lesson.level,
    module: lesson.module,
    lessonNumber: lesson.lessonNumber,
    title: lesson.title,
    estimatedMinutes: lesson.estimatedMinutes || 10,
    stepCount: lesson.steps?.length || 0,
    vocabularyCount: lesson.vocabulary?.length || 0,
    tags: lesson.tags || [],
    size: stats.size,
    data: lesson,
    filePath,
  };
}

/**
 * Build content index for a language pair
 */
function buildContentIndex(languagePair, lessons) {
  const levels = {};

  for (const lesson of lessons) {
    if (!levels[lesson.level]) {
      levels[lesson.level] = {
        modules: new Set(),
        lessons: 0,
        totalMinutes: 0,
      };
    }
    levels[lesson.level].modules.add(lesson.module);
    levels[lesson.level].lessons++;
    levels[lesson.level].totalMinutes += lesson.estimatedMinutes;
  }

  // Convert Sets to counts
  for (const level of Object.keys(levels)) {
    levels[level].modules = levels[level].modules.size;
  }

  const meta = LANGUAGE_META[languagePair] || { name: { source: languagePair, target: languagePair }, flag: '🌐' };

  return {
    version: '1.0.0',
    languagePair,
    name: meta.name,
    flag: meta.flag,
    levels,
    lessons: lessons.map(l => ({
      id: l.id,
      level: l.level,
      module: l.module,
      lessonNumber: l.lessonNumber,
      title: l.title,
      estimatedMinutes: l.estimatedMinutes,
      stepCount: l.stepCount,
      vocabularyCount: l.vocabularyCount,
      tags: l.tags,
      size: l.size,
    })),
    stats: {
      totalLessons: lessons.length,
      totalMinutes: lessons.reduce((sum, l) => sum + l.estimatedMinutes, 0),
      totalSize: lessons.reduce((sum, l) => sum + l.size, 0),
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Upload content for a single language pair
 */
async function uploadLanguagePair(client, bucket, languagePair, options) {
  const { dryRun, force } = options;

  console.log(`\n📚 Processing ${languagePair}...\n`);

  const langDir = path.join(CONTENT_DIR, languagePair);
  if (!fs.existsSync(langDir)) {
    console.log(`   ⚠️  Directory not found: ${langDir}`);
    return { uploaded: 0, skipped: 0, errors: 0 };
  }

  // Find all lesson files
  const lessonFiles = findLessonFiles(langDir);
  console.log(`   Found ${lessonFiles.length} lesson files\n`);

  if (lessonFiles.length === 0) {
    return { uploaded: 0, skipped: 0, errors: 0 };
  }

  // Parse all lessons
  const lessons = [];
  for (const filePath of lessonFiles) {
    try {
      lessons.push(parseLessonFile(filePath));
    } catch (err) {
      console.log(`   ⚠️  Error parsing ${filePath}: ${err.message}`);
    }
  }

  // Sort by level, module, lesson number
  lessons.sort((a, b) => {
    if (a.level !== b.level) return a.level.localeCompare(b.level);
    if (a.module !== b.module) return a.module - b.module;
    return a.lessonNumber - b.lessonNumber;
  });

  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  // Upload each lesson
  console.log('   📤 Uploading lessons...\n');

  for (const lesson of lessons) {
    const r2Key = `${languagePair}/content/${lesson.level}/lessons/${lesson.id}.json`;

    if (dryRun) {
      console.log(`   [DRY RUN] ${r2Key}`);
      uploaded++;
      continue;
    }

    try {
      // Check if already exists (skip unless --force)
      if (!force && await objectExists(client, bucket, r2Key)) {
        skipped++;
        continue;
      }

      await uploadJSON(client, bucket, r2Key, lesson.data);
      console.log(`   ✅ ${r2Key}`);
      uploaded++;
    } catch (err) {
      console.log(`   ❌ ${r2Key}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n   Lessons: ${uploaded} uploaded, ${skipped} skipped, ${errors} errors`);

  // Build and upload content index
  console.log('\n   📋 Building content index...\n');

  const contentIndex = buildContentIndex(languagePair, lessons);
  const indexKey = `${languagePair}/content/index.json`;

  if (dryRun) {
    console.log(`   [DRY RUN] ${indexKey}`);
    console.log('\n   Index preview:');
    console.log(`   - Lessons: ${contentIndex.stats.totalLessons}`);
    console.log(`   - Total time: ${contentIndex.stats.totalMinutes} minutes`);
    console.log(`   - Total size: ${(contentIndex.stats.totalSize / 1024).toFixed(1)} KB`);
  } else {
    try {
      await uploadJSON(client, bucket, indexKey, contentIndex);
      console.log(`   ✅ ${indexKey}`);
    } catch (err) {
      console.log(`   ❌ ${indexKey}: ${err.message}`);
      errors++;
    }
  }

  return { uploaded, skipped, errors };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const langArg = args.find(a => a.startsWith('--lang='));
  const targetLang = langArg ? langArg.split('=')[1] : null;

  console.log('🚀 R2 Content Upload Script\n');
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   Force re-upload: ${force}`);
  if (targetLang) console.log(`   Target language: ${targetLang}`);
  console.log('');

  // Initialize R2 client
  const client = dryRun ? null : createR2Client();
  const bucket = process.env.R2_BUCKET_NAME || 'language-learning-assets';

  // Process language pairs
  const languagesToProcess = targetLang ? [targetLang] : LANGUAGE_PAIRS;
  const results = { uploaded: 0, skipped: 0, errors: 0 };

  for (const langPair of languagesToProcess) {
    const langResults = await uploadLanguagePair(client, bucket, langPair, { dryRun, force });
    results.uploaded += langResults.uploaded;
    results.skipped += langResults.skipped;
    results.errors += langResults.errors;
  }

  console.log('\n════════════════════════════════════════════════════════');
  console.log('📊 Summary:');
  console.log(`   Total uploaded: ${results.uploaded}`);
  console.log(`   Total skipped: ${results.skipped}`);
  console.log(`   Total errors: ${results.errors}`);

  if (dryRun) {
    console.log('\n💡 Run without --dry-run to actually upload.');
  } else if (results.uploaded > 0) {
    const publicUrl = process.env.PUBLIC_R2_URL || 'https://pub-xxx.r2.dev';
    console.log('\n✅ Upload complete!');
    console.log(`\n📎 Content URLs:`);
    for (const langPair of languagesToProcess) {
      console.log(`   ${langPair}: ${publicUrl}/${langPair}/content/index.json`);
    }
  }

  console.log('');
}

main().catch(err => {
  console.error('❌ Upload failed:', err);
  process.exit(1);
});
