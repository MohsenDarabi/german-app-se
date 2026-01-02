#!/usr/bin/env node
/**
 * Generate a single audio file for German text
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS="./scripts/keys/gcp-tts-service-account.json" \
 *     node scripts/generate-single-audio.js --text="Hallo" --output="apps/web/static/audio/test.mp3"
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Parse args
const args = process.argv.slice(2);
let text = '';
let outputPath = '';

for (const arg of args) {
  if (arg.startsWith('--text=')) {
    text = arg.slice(7);
  } else if (arg.startsWith('--output=')) {
    outputPath = arg.slice(9);
  }
}

if (!text || !outputPath) {
  console.error('Usage: node generate-single-audio.js --text="German text" --output="path/to/output.mp3"');
  process.exit(1);
}

// Get access token from service account
async function getAccessToken() {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS not set');
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${base64Header}.${base64Payload}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(credentials.private_key, 'base64url');
  const jwt = `${signatureInput}.${signature}`;

  return new Promise((resolve, reject) => {
    const postData = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`;

    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Token error: ${data}`));
          return;
        }
        const { access_token, expires_in } = JSON.parse(data);
        resolve(access_token);
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Generate audio via TTS API
async function generateAudio(text, outputPath) {
  const accessToken = await getAccessToken();

  const requestBody = JSON.stringify({
    input: { text },
    voice: {
      languageCode: 'de-DE',
      name: 'de-DE-Chirp3-HD-Achernar',
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.9,
    },
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'texttospeech.googleapis.com',
      path: '/v1/text:synthesize',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`TTS error ${res.statusCode}: ${data}`));
          return;
        }

        const { audioContent } = JSON.parse(data);
        const audioBuffer = Buffer.from(audioContent, 'base64');

        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, audioBuffer);
        console.log(`✅ Generated: ${outputPath} (${audioBuffer.length} bytes)`);
        console.log(`   Text: "${text}"`);
        resolve();
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

generateAudio(text, outputPath).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
