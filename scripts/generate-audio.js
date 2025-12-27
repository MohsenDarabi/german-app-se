#!/usr/bin/env node
/**
 * Audio Generation Script for German Learning App
 *
 * Features:
 * - Uses Google Cloud TTS Chirp3-HD voices (highest quality)
 * - Deduplicates texts (same text = generate once, copy to all locations)
 * - Tracks character usage with monthly reset
 * - Maintains manifest of generated audio
 * - Safety threshold at 90% of free tier
 *
 * Usage:
 *   Option 1 (API key):
 *     export GOOGLE_CLOUD_API_KEY="your-api-key"
 *   Option 2 (Service account):
 *     export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
 *
 *   node scripts/generate-audio.js [options]
 *
 * Options:
 *   --dry-run       Show what would be generated without calling API
 *   --force         Regenerate all audio (ignore manifest)
 *   --status        Show usage stats only
 *   --level=A1      Filter to specific level (e.g., A1, A2, B1)
 *   --clean-level   Delete existing audio files for the level before regenerating
 *                   (requires --level=XX, fixes audio/content mismatch after reimport)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// ============================================
// SERVICE ACCOUNT AUTHENTICATION
// ============================================

let cachedAccessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedAccessToken && Date.now() < tokenExpiry - 300000) {
    return cachedAccessToken;
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
  }

  if (!fs.existsSync(credentialsPath)) {
    throw new Error(`Service account file not found: ${credentialsPath}`);
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

  // Create JWT
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600, // 1 hour
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${base64Header}.${base64Payload}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(credentials.private_key, 'base64url');
  const jwt = `${signatureInput}.${signature}`;

  // Exchange JWT for access token
  return new Promise((resolve, reject) => {
    const postData = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`;

    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Token error ${res.statusCode}: ${data}`));
          return;
        }
        try {
          const response = JSON.parse(data);
          cachedAccessToken = response.access_token;
          tokenExpiry = Date.now() + (response.expires_in * 1000);
          resolve(cachedAccessToken);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // Google Cloud TTS settings - Chirp3-HD for highest quality
  voice: {
    languageCode: 'de-DE',
    name: 'de-DE-Chirp3-HD-Aoede', // Chirp3-HD female voice (highest quality)
  },
  audioConfig: {
    audioEncoding: 'MP3',
    // Note: Chirp3-HD doesn't support speakingRate or pitch control
  },

  // Paths
  contentDir: path.join(__dirname, '..', 'content', 'de-fa'),
  outputDir: path.join(__dirname, '..', 'apps', 'web', 'static', 'audio'),
  dataDir: path.join(__dirname, 'audio-data'),
  manifestFile: path.join(__dirname, 'audio-data', 'manifest.json'),
  usageFile: path.join(__dirname, 'audio-data', 'usage.json'),

  // Free tier limits
  freeLimit: 1000000,        // 1M characters per month
  safetyThreshold: 0.90,     // Stop at 90% of free tier
  warningThreshold: 0.70,    // Warn at 70%

  // Processing options
  delayMs: 200,              // Delay between API calls
};

// ============================================
// DATA MANAGEMENT
// ============================================

function ensureDataDir() {
  if (!fs.existsSync(CONFIG.dataDir)) {
    fs.mkdirSync(CONFIG.dataDir, { recursive: true });
  }
}

function loadManifest() {
  ensureDataDir();
  if (fs.existsSync(CONFIG.manifestFile)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG.manifestFile, 'utf8'));
    } catch (e) {
      console.warn('⚠️  Could not load manifest, starting fresh');
    }
  }
  return { generatedTexts: {}, fileMapping: {} };
}

function saveManifest(manifest) {
  ensureDataDir();
  fs.writeFileSync(CONFIG.manifestFile, JSON.stringify(manifest, null, 2));
}

function loadUsage() {
  ensureDataDir();
  const currentMonth = new Date().toISOString().slice(0, 7); // "2025-12"

  if (fs.existsSync(CONFIG.usageFile)) {
    try {
      const usage = JSON.parse(fs.readFileSync(CONFIG.usageFile, 'utf8'));

      // Check if we need to reset for new month
      if (usage.billingMonth !== currentMonth) {
        console.log(`📅 New billing month detected! Resetting usage from ${usage.billingMonth} to ${currentMonth}`);

        // Archive old month
        if (!usage.history) usage.history = [];
        usage.history.push({
          month: usage.billingMonth,
          used: usage.charactersUsed
        });

        // Reset for new month
        usage.billingMonth = currentMonth;
        usage.charactersUsed = 0;
        saveUsage(usage);
      }

      return usage;
    } catch (e) {
      console.warn('⚠️  Could not load usage, starting fresh');
    }
  }

  return {
    billingMonth: currentMonth,
    charactersUsed: 0,
    freeLimit: CONFIG.freeLimit,
    voiceType: 'Chirp3-HD',
    lastUpdated: new Date().toISOString(),
    history: []
  };
}

function saveUsage(usage) {
  ensureDataDir();
  usage.lastUpdated = new Date().toISOString();
  fs.writeFileSync(CONFIG.usageFile, JSON.stringify(usage, null, 2));
}

function getTextHash(text) {
  return crypto.createHash('md5').update(text.trim()).digest('hex');
}

// ============================================
// GOOGLE CLOUD TTS API
// ============================================

async function synthesizeSpeech(text, outputPath) {
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
  const useServiceAccount = !apiKey && process.env.GOOGLE_APPLICATION_CREDENTIALS;

  const requestBody = JSON.stringify({
    input: { text },
    voice: CONFIG.voice,
    audioConfig: CONFIG.audioConfig,
  });

  let headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestBody),
  };

  let urlPath;
  if (apiKey) {
    // Try Vertex AI regional endpoint with API key
    urlPath = `/v1beta1/text:synthesize?key=${apiKey}`;
  } else {
    // Use service account with OAuth
    const accessToken = await getAccessToken();
    headers['Authorization'] = `Bearer ${accessToken}`;
    urlPath = '/v1/text:synthesize';
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: apiKey ? 'us-central1-texttospeech.googleapis.com' : 'texttospeech.googleapis.com',
      path: urlPath,
      method: 'POST',
      headers,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`API error ${res.statusCode}: ${data}`));
          return;
        }

        try {
          const response = JSON.parse(data);
          const audioContent = Buffer.from(response.audioContent, 'base64');

          // Ensure directory exists
          const dir = path.dirname(outputPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(outputPath, audioContent);
          resolve({ path: outputPath, size: audioContent.length });
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

// ============================================
// TEXT EXTRACTION FROM LESSONS
// ============================================

function extractAudioItems(lesson) {
  const items = [];
  const lessonId = lesson.id;

  for (const step of lesson.steps) {
    const stepId = step.id;

    switch (step.type) {
      case 'new-word':
        if (step.word?.de) {
          items.push({
            id: `${stepId}-word`,
            text: step.word.de.trim(),
            type: 'word',
            lessonId,
          });
        }
        if (step.example?.text?.de) {
          items.push({
            id: `${stepId}-example`,
            text: step.example.text.de.trim(),
            type: 'sentence',
            lessonId,
          });
        }
        break;

      case 'dialog':
        if (step.lines) {
          step.lines.forEach((line, idx) => {
            if (line.text?.de) {
              items.push({
                id: `${stepId}-line${idx}`,
                text: line.text.de.trim(),
                type: 'dialog',
                lessonId,
              });
            }
          });
        }
        break;

      case 'fill-in-blank':
        if (step.sentence && step.options && step.correctAnswers) {
          let fullSentence = step.sentence;
          step.correctAnswers.forEach((answerIdx, blankIdx) => {
            fullSentence = fullSentence.replace(`{${blankIdx}}`, step.options[answerIdx] || '');
          });
          items.push({
            id: `${stepId}-sentence`,
            text: fullSentence.trim(),
            type: 'sentence',
            lessonId,
          });
        }
        break;

      case 'translation':
        if (step.correctTranslation?.de) {
          items.push({
            id: `${stepId}-translation`,
            text: step.correctTranslation.de.trim(),
            type: 'sentence',
            lessonId,
          });
        }
        break;

      case 'word-order':
        if (step.correctSentence?.de) {
          items.push({
            id: `${stepId}-sentence`,
            text: step.correctSentence.de.trim(),
            type: 'sentence',
            lessonId,
          });
        }
        break;

      case 'multiple-choice':
        if (step.question && /[äöüßÄÖÜ]/.test(step.question)) {
          items.push({
            id: `${stepId}-question`,
            text: step.question.trim(),
            type: 'sentence',
            lessonId,
          });
        }
        break;

      case 'true-false':
        if (step.statement && /[äöüßÄÖÜa-zA-Z]/.test(step.statement) && !/[\u0600-\u06FF]/.test(step.statement)) {
          items.push({
            id: `${stepId}-statement`,
            text: step.statement.trim(),
            type: 'sentence',
            lessonId,
          });
        }
        break;

      case 'grammar-tip':
        if (step.examples) {
          step.examples.forEach((example, idx) => {
            if (example.de) {
              items.push({
                id: `${stepId}-example${idx}`,
                text: example.de.trim(),
                type: 'sentence',
                lessonId,
              });
            }
          });
        }
        break;
    }
  }

  return items;
}

// ============================================
// FILE DISCOVERY
// ============================================

function findAllLessons(dir) {
  const lessons = [];

  function scanDir(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (item.endsWith('.json') && item.startsWith('lesson-')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lesson = JSON.parse(content);
          lessons.push({ path: fullPath, lesson });
        } catch (err) {
          console.error(`Error reading ${fullPath}: ${err.message}`);
        }
      }
    }
  }

  scanDir(dir);
  return lessons;
}

// ============================================
// MAIN PROCESSING
// ============================================

async function main() {
  console.log('🎵 German Learning App - Audio Generator (Chirp3-HD)');
  console.log('═══════════════════════════════════════════════════════\n');

  // Parse command line args
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const forceRegenerate = args.includes('--force');
  const statusOnly = args.includes('--status');
  const cleanLevel = args.includes('--clean-level');
  const levelFilter = args.find(a => a.startsWith('--level='))?.split('=')[1];

  // Load tracking data
  const manifest = loadManifest();
  const usage = loadUsage();

  // Show status
  console.log('📊 CURRENT STATUS');
  console.log('───────────────────────────────────────────────────────');
  console.log(`Billing month:     ${usage.billingMonth}`);
  console.log(`Characters used:   ${usage.charactersUsed.toLocaleString()} / ${usage.freeLimit.toLocaleString()}`);
  console.log(`Usage:             ${((usage.charactersUsed / usage.freeLimit) * 100).toFixed(2)}%`);
  console.log(`Remaining:         ${(usage.freeLimit - usage.charactersUsed).toLocaleString()} chars`);
  console.log(`Safety threshold:  ${(CONFIG.safetyThreshold * 100)}% (${Math.floor(usage.freeLimit * CONFIG.safetyThreshold).toLocaleString()} chars)`);
  console.log(`Generated texts:   ${Object.keys(manifest.generatedTexts).length} unique`);
  console.log('───────────────────────────────────────────────────────\n');

  if (statusOnly) {
    return;
  }

  // Check for credentials (API key or service account)
  const hasApiKey = !!process.env.GOOGLE_CLOUD_API_KEY;
  const hasServiceAccount = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!hasApiKey && !hasServiceAccount && !dryRun) {
    console.error('❌ Error: No Google Cloud credentials found\n');
    console.log('Option 1 - API Key (simpler):');
    console.log('  export GOOGLE_CLOUD_API_KEY="your-api-key"');
    console.log('');
    console.log('Option 2 - Service Account (if API key fails):');
    console.log('  export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"');
    console.log('');
    process.exit(1);
  }

  if (!dryRun) {
    console.log(`🔑 Auth: ${hasApiKey ? 'API Key (Vertex AI endpoint)' : 'Service Account (OAuth)'}\n`);
  }

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No API calls will be made\n');
  }

  if (forceRegenerate) {
    console.log('⚠️  FORCE MODE - Ignoring manifest, regenerating all\n');
  }

  // Find all lessons
  console.log(`📂 Scanning: ${CONFIG.contentDir}`);
  let lessons = findAllLessons(CONFIG.contentDir);
  console.log(`   Found ${lessons.length} lesson files`);

  // Apply level filter if specified
  if (levelFilter) {
    const beforeCount = lessons.length;
    lessons = lessons.filter(({ lesson }) => {
      // Match by lesson ID prefix (e.g., "A1-1-1" matches "A1")
      // Or by lesson level property if available
      return lesson.id?.startsWith(levelFilter) ||
             lesson.level?.startsWith(levelFilter);
    });
    console.log(`   Filtered to ${lessons.length} lessons for level: ${levelFilter}`);
  }
  console.log('');

  if (lessons.length === 0) {
    console.log('No lessons found. Make sure content exists in content/de-fa/');
    if (levelFilter) {
      console.log(`(Note: Level filter "${levelFilter}" was applied)`);
    }
    process.exit(1);
  }

  // Clean level option: delete existing audio files and clear manifest for this level
  if (cleanLevel && levelFilter) {
    console.log(`🧹 CLEAN MODE - Removing old audio files for level: ${levelFilter}\n`);

    const lessonIds = lessons.map(({ lesson }) => lesson.id);
    let deletedFiles = 0;
    let deletedDirs = 0;

    // Delete audio directories for each lesson
    for (const lessonId of lessonIds) {
      const audioDir = path.join(CONFIG.outputDir, lessonId);
      if (fs.existsSync(audioDir)) {
        const files = fs.readdirSync(audioDir);
        for (const file of files) {
          fs.unlinkSync(path.join(audioDir, file));
          deletedFiles++;
        }
        fs.rmdirSync(audioDir);
        deletedDirs++;
      }

      // Clear fileMapping for this lesson
      if (manifest.fileMapping[lessonId]) {
        delete manifest.fileMapping[lessonId];
      }
    }

    // Save updated manifest
    saveManifest(manifest);

    console.log(`   Deleted ${deletedFiles} audio files from ${deletedDirs} directories`);
    console.log(`   Cleared manifest fileMapping for ${lessonIds.length} lessons\n`);
  } else if (cleanLevel && !levelFilter) {
    console.log('⚠️  --clean-level requires --level=XX to be specified\n');
    process.exit(1);
  }

  // Extract all audio items
  const allItems = [];
  for (const { lesson } of lessons) {
    const items = extractAudioItems(lesson);
    allItems.push(...items);
  }

  // Build deduplication map: text -> [items that need this audio]
  const textToItems = new Map();
  for (const item of allItems) {
    const text = item.text;
    if (!textToItems.has(text)) {
      textToItems.set(text, []);
    }
    textToItems.get(text).push(item);
  }

  console.log(`📋 Total audio items: ${allItems.length}`);
  console.log(`📋 Unique texts: ${textToItems.size}`);
  console.log(`📋 Duplicates saved: ${allItems.length - textToItems.size}\n`);

  // Calculate what needs to be generated
  let textsToGenerate = [];
  let textsAlreadyGenerated = 0;
  let charsToGenerate = 0;

  for (const [text, items] of textToItems) {
    const hash = getTextHash(text);

    // Check if already in manifest (unless force regenerate)
    if (!forceRegenerate && manifest.generatedTexts[hash]) {
      textsAlreadyGenerated++;

      // Still need to copy files to all locations
      const sourceFile = manifest.generatedTexts[hash].filePath;
      if (fs.existsSync(sourceFile)) {
        for (const item of items) {
          const destPath = path.join(CONFIG.outputDir, item.lessonId, `${item.id}.mp3`);
          const destDir = path.dirname(destPath);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }

          // Check if file needs updating: either doesn't exist or mapping changed
          const currentMapping = manifest.fileMapping[item.lessonId]?.[item.id];
          const needsUpdate = !fs.existsSync(destPath) || currentMapping !== hash;

          if (needsUpdate) {
            fs.copyFileSync(sourceFile, destPath);
            // Update fileMapping
            if (!manifest.fileMapping[item.lessonId]) {
              manifest.fileMapping[item.lessonId] = {};
            }
            manifest.fileMapping[item.lessonId][item.id] = hash;
          }
        }
      }
      continue;
    }

    textsToGenerate.push({ text, hash, items });
    charsToGenerate += text.length;
  }

  console.log('───────────────────────────────────────────────────────');
  console.log(`Already generated: ${textsAlreadyGenerated} texts`);
  console.log(`To generate:       ${textsToGenerate.length} texts`);
  console.log(`Characters needed: ${charsToGenerate.toLocaleString()}`);
  console.log('───────────────────────────────────────────────────────\n');

  // Check if we have budget
  const projectedUsage = usage.charactersUsed + charsToGenerate;
  const maxAllowed = usage.freeLimit * CONFIG.safetyThreshold;

  if (projectedUsage > maxAllowed) {
    const available = maxAllowed - usage.charactersUsed;
    console.log(`⛔ SAFETY LIMIT REACHED!`);
    console.log(`   Requested:  ${charsToGenerate.toLocaleString()} chars`);
    console.log(`   Available:  ${Math.max(0, available).toLocaleString()} chars (before ${CONFIG.safetyThreshold * 100}% threshold)`);
    console.log(`   Use --force-over-limit to override (NOT RECOMMENDED)\n`);

    if (!args.includes('--force-over-limit')) {
      process.exit(1);
    }
    console.log('⚠️  OVERRIDING SAFETY LIMIT - You may incur charges!\n');
  }

  // Warning threshold
  if (projectedUsage > usage.freeLimit * CONFIG.warningThreshold) {
    console.log(`⚠️  WARNING: This will use ${((projectedUsage / usage.freeLimit) * 100).toFixed(1)}% of your free tier\n`);
  }

  if (textsToGenerate.length === 0) {
    // Save manifest in case fileMapping was updated for existing texts
    saveManifest(manifest);
    console.log('✅ All audio already generated! Nothing to do.\n');
    return;
  }

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Generate audio
  const stats = {
    generated: 0,
    errors: 0,
    charactersUsed: 0,
  };

  console.log('🎙️  GENERATING AUDIO');
  console.log('───────────────────────────────────────────────────────\n');

  for (let i = 0; i < textsToGenerate.length; i++) {
    const { text, hash, items } = textsToGenerate[i];
    const firstItem = items[0];
    const primaryPath = path.join(CONFIG.outputDir, firstItem.lessonId, `${firstItem.id}.mp3`);

    const preview = text.length > 35 ? text.substring(0, 35) + '...' : text;
    process.stdout.write(`[${i + 1}/${textsToGenerate.length}] "${preview}" `);

    if (dryRun) {
      console.log('→ [DRY RUN]');
      stats.generated++;
      stats.charactersUsed += text.length;
      continue;
    }

    try {
      // Generate audio
      const result = await synthesizeSpeech(text, primaryPath);

      // Update manifest
      manifest.generatedTexts[hash] = {
        text,
        hash,
        filePath: primaryPath,
        generatedAt: new Date().toISOString(),
        voiceType: 'Chirp3-HD',
        fileSize: result.size,
        charCount: text.length,
      };

      // Copy to all locations that need this audio
      for (const item of items) {
        const destPath = path.join(CONFIG.outputDir, item.lessonId, `${item.id}.mp3`);
        if (destPath !== primaryPath) {
          const destDir = path.dirname(destPath);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }
          fs.copyFileSync(primaryPath, destPath);
        }

        // Track file mapping
        if (!manifest.fileMapping[item.lessonId]) {
          manifest.fileMapping[item.lessonId] = {};
        }
        manifest.fileMapping[item.lessonId][item.id] = hash;
      }

      // Update usage
      usage.charactersUsed += text.length;
      stats.generated++;
      stats.charactersUsed += text.length;

      console.log(`✅ (${items.length} location${items.length > 1 ? 's' : ''})`);

      // Save progress periodically
      if (stats.generated % 10 === 0) {
        saveManifest(manifest);
        saveUsage(usage);
      }

      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayMs));

    } catch (err) {
      console.log(`❌ ${err.message}`);
      stats.errors++;
    }
  }

  // Final save
  saveManifest(manifest);
  saveUsage(usage);

  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 GENERATION COMPLETE');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`Generated:         ${stats.generated} unique texts`);
  console.log(`Errors:            ${stats.errors}`);
  console.log(`Characters used:   ${stats.charactersUsed.toLocaleString()}`);
  console.log('');
  console.log('📊 UPDATED USAGE');
  console.log('───────────────────────────────────────────────────────');
  console.log(`Total this month:  ${usage.charactersUsed.toLocaleString()} / ${usage.freeLimit.toLocaleString()}`);
  console.log(`Usage:             ${((usage.charactersUsed / usage.freeLimit) * 100).toFixed(2)}%`);
  console.log(`Remaining:         ${(usage.freeLimit - usage.charactersUsed).toLocaleString()} chars`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (!dryRun && stats.generated > 0) {
    console.log('✅ Audio files saved to: apps/web/static/audio/');
    console.log('   Manifest saved to: scripts/audio-data/manifest.json');
    console.log('   Usage saved to: scripts/audio-data/usage.json\n');
  }
}

// Run
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
