#!/usr/bin/env node
/**
 * Count unique characters for audio generation (with deduplication)
 */

const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '..', 'content', 'de-fa');

// Track unique texts
const uniqueTexts = new Map(); // text -> { count, lessons }
const allItems = [];

function extractAudioItems(lesson) {
  const items = [];
  const lessonId = lesson.id;

  for (const step of lesson.steps) {
    const stepId = step.id;

    switch (step.type) {
      case 'new-word':
        if (step.word?.de) {
          items.push({ id: `${stepId}-word`, text: step.word.de, type: 'word', lessonId });
        }
        if (step.example?.text?.de) {
          items.push({ id: `${stepId}-example`, text: step.example.text.de, type: 'sentence', lessonId });
        }
        break;

      case 'dialog':
        if (step.lines) {
          step.lines.forEach((line, idx) => {
            if (line.text?.de) {
              items.push({ id: `${stepId}-line${idx}`, text: line.text.de, type: 'dialog', lessonId });
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
          items.push({ id: `${stepId}-sentence`, text: fullSentence, type: 'sentence', lessonId });
        }
        break;

      case 'translation':
        if (step.correctTranslation?.de) {
          items.push({ id: `${stepId}-translation`, text: step.correctTranslation.de, type: 'sentence', lessonId });
        }
        break;

      case 'word-order':
        if (step.correctSentence?.de) {
          items.push({ id: `${stepId}-sentence`, text: step.correctSentence.de, type: 'sentence', lessonId });
        }
        break;

      case 'multiple-choice':
        if (step.question && /[äöüßÄÖÜ]/.test(step.question)) {
          items.push({ id: `${stepId}-question`, text: step.question, type: 'sentence', lessonId });
        }
        break;

      case 'true-false':
        if (step.statement && /[äöüßÄÖÜa-zA-Z]/.test(step.statement) && !/[\u0600-\u06FF]/.test(step.statement)) {
          items.push({ id: `${stepId}-statement`, text: step.statement, type: 'sentence', lessonId });
        }
        break;

      case 'grammar-tip':
        if (step.examples) {
          step.examples.forEach((example, idx) => {
            if (example.de) {
              items.push({ id: `${stepId}-example${idx}`, text: example.de, type: 'sentence', lessonId });
            }
          });
        }
        break;
    }
  }

  return items;
}

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

// Main
console.log('🔍 Analyzing audio content for unique characters...\n');

const lessons = findAllLessons(contentDir);
console.log(`📚 Found ${lessons.length} lesson files\n`);

let totalItems = 0;
let totalCharsWithDuplicates = 0;

for (const { lesson } of lessons) {
  const items = extractAudioItems(lesson);
  totalItems += items.length;
  
  for (const item of items) {
    const text = item.text.trim();
    totalCharsWithDuplicates += text.length;
    
    if (uniqueTexts.has(text)) {
      const existing = uniqueTexts.get(text);
      existing.count++;
      existing.lessons.add(item.lessonId);
    } else {
      uniqueTexts.set(text, { 
        count: 1, 
        lessons: new Set([item.lessonId]),
        type: item.type,
        length: text.length
      });
    }
    
    allItems.push(item);
  }
}

// Calculate stats
const uniqueChars = Array.from(uniqueTexts.values()).reduce((sum, item) => sum + item.length, 0);
const duplicateTexts = Array.from(uniqueTexts.entries()).filter(([_, v]) => v.count > 1);
const charsSaved = totalCharsWithDuplicates - uniqueChars;

// Find most duplicated
const sortedByCount = Array.from(uniqueTexts.entries())
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 10);

console.log('═══════════════════════════════════════════════════════');
console.log('📊 SUMMARY');
console.log('═══════════════════════════════════════════════════════\n');

console.log(`Total audio items:           ${totalItems}`);
console.log(`Unique texts:                ${uniqueTexts.size}`);
console.log(`Duplicate texts found:       ${duplicateTexts.length}\n`);

console.log(`Characters (with duplicates): ${totalCharsWithDuplicates.toLocaleString()}`);
console.log(`Characters (unique only):     ${uniqueChars.toLocaleString()}`);
console.log(`Characters saved:             ${charsSaved.toLocaleString()} (${((charsSaved/totalCharsWithDuplicates)*100).toFixed(1)}%)\n`);

console.log('═══════════════════════════════════════════════════════');
console.log('💰 COST ESTIMATE (Chirp3-HD @ 1M free chars/month)');
console.log('═══════════════════════════════════════════════════════\n');

const freeLimit = 1000000;
const usagePercent = (uniqueChars / freeLimit) * 100;

console.log(`Free tier limit:             ${freeLimit.toLocaleString()} chars`);
console.log(`Your unique chars:           ${uniqueChars.toLocaleString()} chars`);
console.log(`Usage:                       ${usagePercent.toFixed(2)}% of free tier`);
console.log(`Remaining:                   ${(freeLimit - uniqueChars).toLocaleString()} chars\n`);

if (uniqueChars <= freeLimit) {
  console.log('✅ COST: FREE (within free tier)\n');
} else {
  const overageChars = uniqueChars - freeLimit;
  const overageCost = (overageChars / 1000000) * 16; // Assuming $16/1M for Chirp
  console.log(`⚠️  COST: $${overageCost.toFixed(2)} (${overageChars.toLocaleString()} chars over limit)\n`);
}

console.log('═══════════════════════════════════════════════════════');
console.log('🔄 TOP 10 MOST REPEATED TEXTS');
console.log('═══════════════════════════════════════════════════════\n');

sortedByCount.forEach(([text, data], idx) => {
  const preview = text.length > 40 ? text.substring(0, 40) + '...' : text;
  console.log(`${idx + 1}. "${preview}"`);
  console.log(`   Count: ${data.count}x | Chars: ${data.length} | Type: ${data.type}`);
});

console.log('\n═══════════════════════════════════════════════════════');
console.log('📁 BY TYPE');
console.log('═══════════════════════════════════════════════════════\n');

const byType = {};
for (const [text, data] of uniqueTexts) {
  if (!byType[data.type]) byType[data.type] = { count: 0, chars: 0 };
  byType[data.type].count++;
  byType[data.type].chars += data.length;
}

for (const [type, stats] of Object.entries(byType)) {
  console.log(`${type}: ${stats.count} unique items, ${stats.chars.toLocaleString()} chars`);
}

console.log('\n');
