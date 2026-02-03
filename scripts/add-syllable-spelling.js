#!/usr/bin/env node
/**
 * Migration Script: Add Syllable-Spelling Steps
 *
 * Adds a syllable-spelling step before each spelling step in lessons.
 * This implements "Scaffolded Spelling Progression" - users first arrange
 * syllables (easier) before arranging individual letters (harder).
 *
 * Based on Miller's Chunking Theory (1956) - syllables as larger chunks
 * reduce cognitive load.
 */

const fs = require('fs');
const path = require('path');

// German syllable splitting - simplified rules
// In real implementation, would use a proper syllabification library
const SYLLABLE_MAP = {
  // L02 words
  'schlecht': ['schlecht'], // monosyllabic
  'super': ['su', 'per'],
  'prima': ['pri', 'ma'],
  'toll': ['toll'], // monosyllabic
  'wunderbar': ['wun', 'der', 'bar'],
  'fantastisch': ['fan', 'tas', 'tisch'],

  // L03 words
  'Deutschland': ['Deutsch', 'land'],
  'Österreich': ['Ös', 'ter', 'reich'],
  'Schweiz': ['Schweiz'], // monosyllabic
  'Berlin': ['Ber', 'lin'],
  'München': ['Mün', 'chen'],
  'Hamburg': ['Ham', 'burg'],
  'Wien': ['Wien'], // monosyllabic
  'Zürich': ['Zü', 'rich'],

  // L04 words
  'Lehrer': ['Leh', 'rer'],
  'Lehrerin': ['Leh', 're', 'rin'],
  'Student': ['Stu', 'dent'],
  'Studentin': ['Stu', 'den', 'tin'],
  'Arzt': ['Arzt'], // monosyllabic
  'Ärztin': ['Ärz', 'tin'],
  'Ingenieur': ['In', 'ge', 'nieur'],
  'Ingenieurin': ['In', 'ge', 'nieu', 'rin'],

  // L05 words
  'Kaffee': ['Kaf', 'fee'],
  'Tee': ['Tee'], // monosyllabic
  'Wasser': ['Was', 'ser'],
  'Bier': ['Bier'], // monosyllabic
  'Wein': ['Wein'], // monosyllabic
  'Saft': ['Saft'], // monosyllabic
  'Milch': ['Milch'], // monosyllabic

  // L06 words
  'Brot': ['Brot'], // monosyllabic
  'Brötchen': ['Bröt', 'chen'],
  'Kuchen': ['Ku', 'chen'],
  'Käse': ['Kä', 'se'],
  'Schinken': ['Schin', 'ken'],
  'Butter': ['But', 'ter'],
  'Marmelade': ['Mar', 'me', 'la', 'de'],

  // L01 - already done
  'Tschüss': ['Tschü', 'ss'],

  // L04 verbs
  'sprechen': ['spre', 'chen'],
  'arbeiten': ['ar', 'bei', 'ten'],
  'lernen': ['ler', 'nen'],
  'verstehen': ['ver', 'ste', 'hen'],

  // L05 verbs/intro phrases
  'heiße': ['hei', 'ße'],
  'heißen': ['hei', 'ßen'],
  'kommen': ['kom', 'men'],
  'gehen': ['ge', 'hen'],

  // L06 verbs
  'wohnen': ['woh', 'nen'],
  'leben': ['le', 'ben'],
  'machen': ['ma', 'chen'],
  'spielen': ['spie', 'len'],
};

// Distractor syllables by category
const DISTRACTORS = {
  common: ['sch', 'ch', 'er', 'en', 'el', 'le', 'te', 'de', 'ge', 'be'],
  endings: ['ung', 'keit', 'heit', 'lich', 'isch'],
  prefixes: ['ver', 'be', 'ge', 'ent', 'er'],
};

function getDistractors(word, syllables) {
  // Get 1-2 distractors that don't appear in the word
  const distractors = [];
  const wordLower = word.toLowerCase();

  // Try common distractors first
  for (const d of DISTRACTORS.common) {
    if (!wordLower.includes(d) && !syllables.some(s => s.toLowerCase() === d)) {
      distractors.push(d);
      if (distractors.length >= 2) break;
    }
  }

  // If we need more, try endings
  if (distractors.length < 1) {
    for (const d of DISTRACTORS.endings) {
      if (!wordLower.includes(d)) {
        distractors.push(d);
        break;
      }
    }
  }

  return distractors.slice(0, 2);
}

function createSyllableStep(spellingStep) {
  const word = spellingStep.word;
  const syllables = SYLLABLE_MAP[word];

  if (!syllables) {
    console.warn(`  ⚠️ No syllable data for: ${word}`);
    return null;
  }

  // Skip monosyllabic words (no point in syllable exercise)
  if (syllables.length === 1) {
    console.log(`  ⏭️ Skipping monosyllabic: ${word}`);
    return null;
  }

  const distractors = getDistractors(word, syllables);

  // Generate new step ID (add 'a' suffix to spelling step ID)
  const newId = spellingStep.id.replace(/(\d+)$/, '$1a');

  return {
    type: 'syllable-spelling',
    id: newId,
    word: word,
    translation: spellingStep.translation,
    syllables: syllables,
    distractors: distractors.length > 0 ? distractors : undefined,
    hint: spellingStep.hint,
    instruction: 'قطعات را کنار هم بگذارید'
  };
}

function processLesson(filePath) {
  console.log(`\n📋 Processing: ${path.basename(filePath)}`);

  const content = fs.readFileSync(filePath, 'utf8');
  const lesson = JSON.parse(content);

  // Check if already has syllable-spelling steps
  const hasSyllableSpelling = lesson.steps.some(s => s.type === 'syllable-spelling');
  if (hasSyllableSpelling) {
    console.log('  ✅ Already has syllable-spelling steps, skipping');
    return false;
  }

  // Find spelling steps and insert syllable-spelling before them
  const newSteps = [];
  let modified = false;

  for (const step of lesson.steps) {
    if (step.type === 'spelling') {
      const syllableStep = createSyllableStep(step);
      if (syllableStep) {
        newSteps.push(syllableStep);
        console.log(`  ✅ Added syllable-spelling for: ${step.word} (${syllableStep.syllables.join('-')})`);
        modified = true;
      }
    }
    newSteps.push(step);
  }

  if (modified) {
    lesson.steps = newSteps;
    fs.writeFileSync(filePath, JSON.stringify(lesson, null, 2) + '\n');
    console.log(`  💾 Saved with ${newSteps.length} steps`);
    return true;
  }

  return false;
}

// Main
const contentDir = path.join(__dirname, '..', 'content', 'de-fa');
const lessonFiles = [];

// Find all lesson files
function findLessons(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findLessons(fullPath);
    } else if (entry.name.endsWith('.json') && entry.name.match(/^A\d+-M\d+-L\d+\.json$/)) {
      lessonFiles.push(fullPath);
    }
  }
}

findLessons(contentDir);

console.log('🔄 Syllable-Spelling Migration Script');
console.log('=====================================');
console.log(`Found ${lessonFiles.length} lesson files`);

let modifiedCount = 0;
for (const file of lessonFiles.sort()) {
  if (processLesson(file)) {
    modifiedCount++;
  }
}

console.log('\n=====================================');
console.log(`✅ Modified ${modifiedCount} lessons`);
console.log('\nRun validation: node scripts/validate-lesson.js <file>');
