require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const LANGUAGE_PAIR = 'en-fa';
const STATIC_DIR = path.join(__dirname, '../apps/web/static');

function createR2Client() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

async function objectExists(client, bucket, key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) return false;
    throw err;
  }
}

function computeFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

function scanAudioDirectory(audioDir) {
  const files = {};
  const hashToFile = {};
  if (!fs.existsSync(audioDir)) return { files, hashToFile };

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
      const hash = computeFileHash(filePath);
      files[key] = { filePath, hash };
      if (!hashToFile[hash]) hashToFile[hash] = filePath;
    }
  }
  return { files, hashToFile };
}

async function main() {
  console.log(`🚀 Uploading ${LANGUAGE_PAIR} audio to R2\n`);

  const client = createR2Client();
  const bucket = process.env.R2_BUCKET_NAME || 'language-learning-assets';
  const audioDir = path.join(STATIC_DIR, 'audio', LANGUAGE_PAIR);
  const { files, hashToFile } = scanAudioDirectory(audioDir);

  const audioMap = {};
  for (const [key, { hash }] of Object.entries(files)) {
    audioMap[key] = hash;
  }

  const uniqueHashes = new Set(Object.values(audioMap));
  console.log(`📊 Found ${Object.keys(audioMap).length} audio files (${uniqueHashes.size} unique)\n`);

  // Upload unique audio files
  let uploaded = 0;
  for (const hash of uniqueHashes) {
    const localPath = hashToFile[hash];
    const r2Key = `${LANGUAGE_PAIR}/audio/by-hash/${hash}.mp3`;
    
    if (await objectExists(client, bucket, r2Key)) {
      console.log(`   ⏭️  ${r2Key} (exists)`);
      continue;
    }

    const fileContent = fs.readFileSync(localPath);
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: r2Key,
      Body: fileContent,
      ContentType: 'audio/mpeg',
    }));
    console.log(`   ✅ ${r2Key}`);
    uploaded++;
  }

  // Create language manifest
  const manifest = {
    id: LANGUAGE_PAIR,
    version: '1.0.0',
    name: { source: 'English', target: 'انگلیسی' },
    flag: '🇬🇧',
    levels: ['A1', 'A2', 'B1', 'B2'],
    freeLessons: 6,
    audioMap: audioMap,
    stats: {
      totalAudioFiles: uniqueHashes.size,
      totalAudioReferences: Object.keys(audioMap).length,
      deduplicationSavings: '0%',
    },
    updatedAt: new Date().toISOString(),
  };

  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: `${LANGUAGE_PAIR}/manifest.json`,
    Body: JSON.stringify(manifest, null, 2),
    ContentType: 'application/json',
  }));
  console.log(`\n   ✅ ${LANGUAGE_PAIR}/manifest.json`);

  // Update root index
  let rootIndex;
  try {
    const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: 'index.json' }));
    rootIndex = JSON.parse(await response.Body.transformToString());
  } catch {
    rootIndex = { version: '1.0.0', availableLanguages: [], updatedAt: new Date().toISOString() };
  }

  const langEntry = {
    id: LANGUAGE_PAIR,
    name: manifest.name,
    flag: manifest.flag,
    hasAudio: true,
    hasContent: true,
    updatedAt: new Date().toISOString(),
  };

  const idx = rootIndex.availableLanguages.findIndex(l => l.id === LANGUAGE_PAIR);
  if (idx >= 0) rootIndex.availableLanguages[idx] = langEntry;
  else rootIndex.availableLanguages.push(langEntry);
  rootIndex.updatedAt = new Date().toISOString();

  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: 'index.json',
    Body: JSON.stringify(rootIndex, null, 2),
    ContentType: 'application/json',
  }));
  console.log(`   ✅ index.json (added ${LANGUAGE_PAIR})`);

  console.log(`\n✅ Done! Uploaded ${uploaded} files`);
}

main().catch(console.error);
