#!/usr/bin/env node
/**
 * Script to add memory-match steps to lessons that are missing them.
 * Reads vocabulary from the completion step and creates a memory-match game.
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'de-fa', 'A1');

function addMemoryMatch(lessonPath) {
  const content = fs.readFileSync(lessonPath, 'utf8');
  const lesson = JSON.parse(content);

  // Check if already has memory-match
  if (lesson.steps.some(s => s.type === 'memory-match')) {
    console.log(`  Skipping ${lesson.id} - already has memory-match`);
    return false;
  }

  // Find completion step to get vocabulary
  const completionStep = lesson.steps.find(s => s.type === 'completion');
  if (!completionStep || !completionStep.vocabularyLearned) {
    console.log(`  Skipping ${lesson.id} - no vocabularyLearned`);
    return false;
  }

  // Get vocabulary pairs (max 6 for memory-match)
  const vocab = completionStep.vocabularyLearned
    .filter(v => v.word && v.word.de && v.word.fa)
    .slice(0, 6)
    .map(v => ({ de: v.word.de.replace(/^(der|die|das)\s+/, ''), fa: v.word.fa }));

  if (vocab.length < 4) {
    console.log(`  Skipping ${lesson.id} - not enough vocabulary (${vocab.length})`);
    return false;
  }

  // Find vocab-check index to insert before it
  const vocabCheckIndex = lesson.steps.findIndex(s => s.type === 'vocab-check');
  if (vocabCheckIndex === -1) {
    console.log(`  Skipping ${lesson.id} - no vocab-check step`);
    return false;
  }

  // Find next available game ID
  const existingGameIds = lesson.steps
    .filter(s => s.id && s.id.startsWith('g'))
    .map(s => parseInt(s.id.slice(1)))
    .filter(n => !isNaN(n));
  const nextGameId = existingGameIds.length > 0 ? Math.max(...existingGameIds) + 1 : 1;

  // Create memory-match step
  const memoryMatchStep = {
    type: 'memory-match',
    id: `g${nextGameId}`,
    title: 'بازی حافظه',
    pairs: vocab,
    timeLimit: 60
  };

  // Insert before vocab-check
  lesson.steps.splice(vocabCheckIndex, 0, memoryMatchStep);

  // Update vocab-check id if needed (increment game IDs after)
  const vocabCheck = lesson.steps[vocabCheckIndex + 1];
  if (vocabCheck && vocabCheck.id && vocabCheck.id.startsWith('g')) {
    const oldId = parseInt(vocabCheck.id.slice(1));
    if (!isNaN(oldId) && oldId <= nextGameId) {
      vocabCheck.id = `g${nextGameId + 1}`;
    }
  }

  // Write updated lesson
  fs.writeFileSync(lessonPath, JSON.stringify(lesson, null, 2) + '\n');
  console.log(`  ✓ Added memory-match to ${lesson.id}`);
  return true;
}

// Process all modules
const modules = fs.readdirSync(CONTENT_DIR).filter(d => d.startsWith('module-'));
let updated = 0;

for (const module of modules.sort()) {
  const modulePath = path.join(CONTENT_DIR, module);
  const lessons = fs.readdirSync(modulePath).filter(f => f.endsWith('.json'));

  console.log(`\nProcessing ${module}:`);

  for (const lessonFile of lessons.sort()) {
    const lessonPath = path.join(modulePath, lessonFile);
    if (addMemoryMatch(lessonPath)) {
      updated++;
    }
  }
}

console.log(`\n✅ Updated ${updated} lessons`);
