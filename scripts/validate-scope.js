#!/usr/bin/env node
/**
 * Validates lesson content against the canonical scope definition
 * Ensures vocabulary, grammar, and characters are within scope
 */

const fs = require('fs');
const path = require('path');

const SCOPE_PATH = path.join(__dirname, '../ai-workspace/curriculum/canonical-scope.json');
const GOETHE_PATH = path.join(__dirname, '../ai-workspace/curriculum/official-sources/goethe-a1-wordlist.json');
const CHARACTERS_PATH = path.join(__dirname, '../ai-workspace/curriculum/characters/character-registry.json');

// Load scope data
let canonicalScope, goetheWords, characterRegistry;

try {
  canonicalScope = JSON.parse(fs.readFileSync(SCOPE_PATH, 'utf-8'));
  goetheWords = JSON.parse(fs.readFileSync(GOETHE_PATH, 'utf-8'));
  characterRegistry = JSON.parse(fs.readFileSync(CHARACTERS_PATH, 'utf-8'));
} catch (err) {
  console.error('Error loading scope files:', err.message);
  process.exit(1);
}

// Build word sets
const goetheWordSet = new Set(goetheWords.words.map(w => w.de.toLowerCase()));
const functionWords = new Set(canonicalScope.functionWords.allowedAlways.map(w => w.toLowerCase()));

// English words to ignore (common in JSON field names and instructions)
const englishIgnoreList = new Set([
  'new', 'word', 'grammar', 'tip', 'rapid', 'fire', 'right', 'wrong', 'correct',
  'incorrect', 'answer', 'question', 'listen', 'speak', 'read', 'write', 'match',
  'select', 'choose', 'complete', 'fill', 'blank', 'option', 'options', 'true',
  'false', 'yes', 'next', 'back', 'skip', 'hint', 'help', 'start', 'end',
  'continue', 'finish', 'done', 'submit', 'check', 'review', 'practice', 'learn',
  'step', 'steps', 'lesson', 'module', 'level', 'score', 'points', 'progress',
  'audio', 'image', 'video', 'media', 'type', 'content', 'text', 'title',
  'description', 'instruction', 'instructions', 'example', 'examples', 'note',
  'notes', 'translation', 'meaning', 'context', 'category', 'tag', 'tags',
  'id', 'index', 'count', 'total', 'max', 'min', 'value', 'key', 'name',
  'status', 'state', 'mode', 'version', 'data', 'info', 'item', 'items',
  'list', 'array', 'object', 'string', 'number', 'boolean', 'null', 'undefined'
]);

// Extract all German words from text
function extractGermanWords(text) {
  if (!text) return [];
  return text
    .split(/[\s.,!?;:'"()\[\]{}«»„"–—\-\/\\<>]+/)
    .filter(w => w.length > 1)
    .filter(w => /^[A-ZÄÖÜa-zäöüß]+$/.test(w))
    .map(w => w.toLowerCase())
    .filter(w => !englishIgnoreList.has(w)); // Filter out English words
}

// Get lesson number from ID (e.g., "A1-M01-L03" -> 3)
function getLessonNumber(lessonId) {
  const match = lessonId.match(/L(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Get lesson scope (vocabulary allowed up to this lesson)
function getLessonScope(lessonId) {
  const allowedVocab = new Set(functionWords);
  const allowedGrammar = new Set();
  const forbiddenGrammar = new Set();
  const allowedCharacters = new Set(['Lisa', 'Theo']); // Default

  let foundLesson = false;
  const lessonNum = getLessonNumber(lessonId);

  // Add vocabulary from formulaic expressions
  if (canonicalScope.formulaicExpressions) {
    // Always add L01 idiom vocabulary
    if (canonicalScope.formulaicExpressions.vocabularyFromIdioms) {
      canonicalScope.formulaicExpressions.vocabularyFromIdioms.forEach(w =>
        allowedVocab.add(w.toLowerCase())
      );
    }
  }

  for (const section of canonicalScope.sections) {
    for (const lesson of section.lessons) {
      // Add vocabulary from this lesson
      if (lesson.vocabulary?.introduces) {
        lesson.vocabulary.introduces.forEach(w => allowedVocab.add(w.toLowerCase()));
      }

      // Add idiom vocabulary from this lesson
      if (lesson.vocabulary?.idioms) {
        lesson.vocabulary.idioms.forEach(idiom => {
          extractGermanWords(idiom).forEach(w => allowedVocab.add(w));
        });
      }

      // Add grammar from this lesson
      if (lesson.grammar?.introduces) {
        lesson.grammar.introduces.forEach(g => allowedGrammar.add(g));
      }

      // Add characters from this lesson
      if (lesson.characters) {
        lesson.characters.forEach(c => allowedCharacters.add(c));
      }

      if (lesson.id === lessonId) {
        foundLesson = true;
        // Get forbidden grammar for this specific lesson
        if (lesson.grammar?.forbidden) {
          lesson.grammar.forbidden.forEach(g => forbiddenGrammar.add(g));
        }
        break;
      }
    }
    if (foundLesson) break;
  }

  return { allowedVocab, allowedGrammar, forbiddenGrammar, allowedCharacters, foundLesson, lessonNum };
}

// Extract vocabulary from lesson content (only German text fields)
function extractLessonVocabulary(lesson) {
  const words = new Set();

  function processContent(obj, parentKey = '') {
    if (!obj) return;

    if (typeof obj === 'string') {
      // Only extract from German-related fields
      const germanFields = ['de', 'german', 'sentence', 'word', 'phrase'];
      if (germanFields.includes(parentKey) || parentKey === '') {
        extractGermanWords(obj).forEach(w => words.add(w));
      }
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach(item => processContent(item, parentKey));
      return;
    }

    if (typeof obj === 'object') {
      // Skip non-German fields entirely
      const skipFields = ['fa', 'en', 'english', 'translation', 'hint', 'audio', 'image',
                          'grammarTip', 'tip', 'note', 'id', 'type', 'stepType'];

      for (const [key, value] of Object.entries(obj)) {
        if (!skipFields.includes(key)) {
          processContent(value, key);
        }
      }
    }
  }

  // Process all steps
  if (lesson.steps) {
    for (const step of lesson.steps) {
      // Focus on content that learners see
      if (step.content) {
        processContent(step.content);
      }
      // Also check vocabulary arrays
      if (step.vocabulary) {
        processContent(step.vocabulary);
      }
    }
  }

  // Process vocabulary section
  if (lesson.vocabulary) {
    lesson.vocabulary.forEach(v => {
      if (v.de) extractGermanWords(v.de).forEach(w => words.add(w));
      if (v.word) extractGermanWords(v.word).forEach(w => words.add(w));
    });
  }

  return words;
}

// Extract characters from lesson
function extractCharacters(lesson) {
  const characters = new Set();
  const knownNames = new Set([
    ...characterRegistry.characters.primary.names,
    ...characterRegistry.characters.secondary.names,
    ...characterRegistry.characters.persian.names
  ]);

  function processContent(obj) {
    if (!obj) return;

    if (typeof obj === 'string') {
      // Check for known character names (case-sensitive)
      knownNames.forEach(name => {
        // Use word boundary to avoid partial matches
        const regex = new RegExp(`\\b${name}\\b`);
        if (regex.test(obj)) {
          characters.add(name);
        }
      });
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach(processContent);
      return;
    }

    if (typeof obj === 'object') {
      for (const value of Object.values(obj)) {
        processContent(value);
      }
    }
  }

  processContent(lesson);
  return characters;
}

// Main validation function
function validateLesson(lessonPath) {
  console.log(`\n🔍 Validating: ${path.basename(lessonPath)}\n`);

  // Load lesson
  let lesson;
  try {
    lesson = JSON.parse(fs.readFileSync(lessonPath, 'utf-8'));
  } catch (err) {
    console.error(`❌ Error loading lesson: ${err.message}`);
    return { valid: false, errors: [err.message] };
  }

  const lessonId = lesson.id || path.basename(lessonPath, '.json');
  const scope = getLessonScope(lessonId);

  const errors = [];
  const warnings = [];

  // 1. Check if lesson exists in scope
  if (!scope.foundLesson) {
    warnings.push(`⚠️  Lesson ${lessonId} not found in canonical scope`);
  }

  // 2. Check vocabulary
  const usedVocab = extractLessonVocabulary(lesson);
  const outOfScope = [];
  const notInGoethe = [];

  for (const word of usedVocab) {
    // Skip very short words and numbers
    if (word.length <= 2 || /^\d+$/.test(word)) continue;

    if (!scope.allowedVocab.has(word)) {
      outOfScope.push(word);
    }

    if (!goetheWordSet.has(word) && !functionWords.has(word) && !scope.allowedVocab.has(word)) {
      notInGoethe.push(word);
    }
  }

  if (outOfScope.length > 0) {
    errors.push(`❌ Out-of-scope vocabulary (${outOfScope.length}): ${outOfScope.slice(0, 10).join(', ')}${outOfScope.length > 10 ? '...' : ''}`);
  }

  if (notInGoethe.length > 0) {
    warnings.push(`⚠️  Not in Goethe A1 wordlist (${notInGoethe.length}): ${notInGoethe.slice(0, 10).join(', ')}${notInGoethe.length > 10 ? '...' : ''}`);
  }

  // 3. Check characters
  const usedCharacters = extractCharacters(lesson);
  const unknownCharacters = [];

  for (const char of usedCharacters) {
    if (!scope.allowedCharacters.has(char)) {
      unknownCharacters.push(char);
    }
  }

  if (unknownCharacters.length > 0) {
    errors.push(`❌ Characters not allowed: ${unknownCharacters.join(', ')} (use Lisa & Theo for L01-L04)`);
  }

  if (usedCharacters.size > canonicalScope.validationRules.characters.maxPerScene) {
    warnings.push(`⚠️  Too many characters (${usedCharacters.size} > ${canonicalScope.validationRules.characters.maxPerScene})`);
  }

  // 4. Check vocabulary count
  const newVocabCount = lesson.vocabulary?.length || 0;
  const maxNewWords = canonicalScope.validationRules.vocabulary.maxNewWordsPerLesson;

  if (newVocabCount > maxNewWords) {
    warnings.push(`⚠️  Too many new vocabulary items (${newVocabCount} > ${maxNewWords})`);
  }

  // Output results
  console.log('📊 Results:');
  console.log(`   Lesson: ${lessonId}`);
  console.log(`   Vocabulary used: ${usedVocab.size} German words`);
  console.log(`   Characters: ${Array.from(usedCharacters).join(', ') || 'none detected'}`);

  if (errors.length > 0) {
    console.log('\n🚫 ERRORS:');
    errors.forEach(e => console.log(`   ${e}`));
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(w => console.log(`   ${w}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n✅ Lesson passes all scope checks!');
  }

  const valid = errors.length === 0;
  console.log(`\n${valid ? '✅ VALID' : '❌ INVALID'}`);

  return { valid, errors, warnings };
}

// CLI
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: node validate-scope.js <lesson.json> [--verbose]

Examples:
  node scripts/validate-scope.js content/de-fa/A1/module-01/A1-M01-L01.json
  node scripts/validate-scope.js content/de-fa/A1/**/*.json  # Validate all

Options:
  --verbose    Show detailed scope information
  --json       Output as JSON
    `);
    process.exit(0);
  }

  const verbose = args.includes('--verbose');
  const jsonOutput = args.includes('--json');
  const files = args.filter(a => !a.startsWith('--'));

  const results = [];

  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.error(`File not found: ${file}`);
      continue;
    }

    const result = validateLesson(file);
    results.push({ file, ...result });
  }

  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
  }

  // Exit with error if any validation failed
  const hasErrors = results.some(r => !r.valid);
  process.exit(hasErrors ? 1 : 0);
}

main();
