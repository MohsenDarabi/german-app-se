#!/usr/bin/env node
/**
 * Lesson Validation Script
 *
 * Validates lesson JSON files against schema and content quality rules.
 * Part of the content fusion pipeline.
 *
 * Usage:
 *   node scripts/validate-lesson.js <lesson-file.json>
 *   node scripts/validate-lesson.js --all          # Validate all lessons
 *   node scripts/validate-lesson.js --level=A1    # Validate all A1 lessons
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, msg) {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

// Validation rules
const rules = [
  // Schema checks
  {
    name: 'has-required-fields',
    description: 'Lesson has id, title, level, module, lessonNumber, steps',
    check: (lesson) => {
      const required = ['id', 'title', 'level', 'module', 'lessonNumber', 'steps'];
      const missing = required.filter(f => !lesson[f]);
      if (missing.length > 0) return { pass: false, error: `Missing: ${missing.join(', ')}` };
      return { pass: true };
    }
  },
  {
    name: 'title-bilingual',
    description: 'Title has both de and fa',
    check: (lesson) => {
      if (!lesson.title?.de || !lesson.title?.fa) {
        return { pass: false, error: 'Title missing de or fa' };
      }
      return { pass: true };
    }
  },
  {
    name: 'steps-not-empty',
    description: 'Lesson has at least 5 steps',
    check: (lesson) => {
      if (!lesson.steps || lesson.steps.length < 5) {
        return { pass: false, error: `Only ${lesson.steps?.length || 0} steps (min 5)` };
      }
      return { pass: true };
    }
  },
  {
    name: 'steps-have-ids',
    description: 'All steps have unique IDs',
    check: (lesson) => {
      const ids = lesson.steps?.map(s => s.id) || [];
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        return { pass: false, error: 'Duplicate step IDs found' };
      }
      if (ids.some(id => !id)) {
        return { pass: false, error: 'Some steps missing ID' };
      }
      return { pass: true };
    }
  },
  {
    name: 'steps-have-types',
    description: 'All steps have valid types',
    check: (lesson) => {
      const validTypes = [
        'new-word', 'grammar-tip', 'multiple-choice', 'fill-in-blank',
        'word-order', 'true-false', 'translation', 'dialog', 'completion',
        'speed-challenge', 'spelling', 'comprehension', 'rapid-fire',
        'memory-match', 'vocab-check', 'word-hunt', 'matching'
      ];
      const invalid = lesson.steps?.filter(s => !validTypes.includes(s.type)) || [];
      if (invalid.length > 0) {
        return { pass: false, error: `Invalid types: ${invalid.map(s => s.type).join(', ')}` };
      }
      return { pass: true };
    }
  },
  {
    name: 'ends-with-completion',
    description: 'Lesson ends with completion step',
    check: (lesson) => {
      const lastStep = lesson.steps?.[lesson.steps.length - 1];
      if (lastStep?.type !== 'completion') {
        return { pass: false, error: `Last step is ${lastStep?.type}, not completion` };
      }
      return { pass: true };
    }
  },

  // Content quality checks
  {
    name: 'new-word-has-translations',
    description: 'New-word steps have word.de and word.fa',
    check: (lesson) => {
      const newWords = lesson.steps?.filter(s => s.type === 'new-word') || [];
      const invalid = newWords.filter(s => !s.word?.de || !s.word?.fa);
      if (invalid.length > 0) {
        return { pass: false, error: `${invalid.length} new-word steps missing translations` };
      }
      return { pass: true };
    }
  },
  {
    name: 'mcq-has-options',
    description: 'Multiple-choice steps have 2-4 options',
    check: (lesson) => {
      const mcqs = lesson.steps?.filter(s => s.type === 'multiple-choice') || [];
      const invalid = mcqs.filter(s => !s.options || s.options.length < 2 || s.options.length > 4);
      if (invalid.length > 0) {
        return { pass: false, error: `${invalid.length} MCQ steps with invalid options count` };
      }
      return { pass: true };
    }
  },
  {
    name: 'mcq-correct-index-valid',
    description: 'Multiple-choice correctAnswerIndex is within options range',
    check: (lesson) => {
      const mcqs = lesson.steps?.filter(s => s.type === 'multiple-choice') || [];
      const invalid = mcqs.filter(s => {
        const idx = s.correctAnswerIndex;
        return idx === undefined || idx < 0 || idx >= (s.options?.length || 0);
      });
      if (invalid.length > 0) {
        return { pass: false, error: `${invalid.length} MCQ steps with invalid correctAnswerIndex` };
      }
      return { pass: true };
    }
  },
  {
    name: 'mcq-answer-distribution',
    description: 'Correct answers are distributed (not all index 0)',
    check: (lesson) => {
      const mcqs = lesson.steps?.filter(s => s.type === 'multiple-choice') || [];
      if (mcqs.length < 3) return { pass: true }; // Not enough to check
      const allZero = mcqs.every(s => s.correctAnswerIndex === 0);
      if (allZero) {
        return { pass: false, error: 'All MCQ answers at index 0 - should be randomized' };
      }
      return { pass: true };
    }
  },
  {
    name: 'fill-blank-has-options',
    description: 'Fill-in-blank steps have options and correctAnswers',
    check: (lesson) => {
      const fills = lesson.steps?.filter(s => s.type === 'fill-in-blank') || [];
      const invalid = fills.filter(s => !s.options?.length || !s.correctAnswers?.length);
      if (invalid.length > 0) {
        return { pass: false, error: `${invalid.length} fill-in-blank steps missing options/answers` };
      }
      return { pass: true };
    }
  },
  {
    name: 'word-order-scrambled',
    description: 'Word-order words array is not in correct order',
    check: (lesson) => {
      const wordOrders = lesson.steps?.filter(s => s.type === 'word-order') || [];
      const notScrambled = wordOrders.filter(s => {
        if (!s.words || !s.correctOrder) return false;
        // Check if words are already in correct order (correctOrder would be [0,1,2,...])
        return s.correctOrder.every((v, i) => v === i);
      });
      if (notScrambled.length > 0) {
        return { pass: false, error: `${notScrambled.length} word-order steps not scrambled` };
      }
      return { pass: true };
    }
  },
  {
    name: 'matching-has-pairs',
    description: 'Matching steps have items, matches, and correctPairs',
    check: (lesson) => {
      const matchings = lesson.steps?.filter(s => s.type === 'matching') || [];
      const invalid = matchings.filter(s => {
        return !s.items?.length || !s.matches?.length || !s.correctPairs?.length;
      });
      if (invalid.length > 0) {
        return { pass: false, error: `${invalid.length} matching steps missing items/matches/pairs` };
      }
      return { pass: true };
    }
  },
  {
    name: 'matching-pairs-valid',
    description: 'Matching correctPairs reference valid item/match IDs',
    check: (lesson) => {
      const matchings = lesson.steps?.filter(s => s.type === 'matching') || [];
      for (const step of matchings) {
        const itemIds = new Set(step.items?.map(i => i.id) || []);
        const matchIds = new Set(step.matches?.map(m => m.id) || []);
        for (const [itemId, matchId] of (step.correctPairs || [])) {
          if (!itemIds.has(itemId)) {
            return { pass: false, error: `Invalid item ID in correctPairs: ${itemId}` };
          }
          if (!matchIds.has(matchId)) {
            return { pass: false, error: `Invalid match ID in correctPairs: ${matchId}` };
          }
        }
      }
      return { pass: true };
    }
  },
  {
    name: 'dialog-has-lines',
    description: 'Dialog steps have at least 2 lines',
    check: (lesson) => {
      const dialogs = lesson.steps?.filter(s => s.type === 'dialog') || [];
      const invalid = dialogs.filter(s => !s.lines || s.lines.length < 2);
      if (invalid.length > 0) {
        return { pass: false, error: `${invalid.length} dialog steps with <2 lines` };
      }
      return { pass: true };
    }
  },
  {
    name: 'dialog-lines-bilingual',
    description: 'Dialog lines have text.de and text.fa',
    check: (lesson) => {
      const dialogs = lesson.steps?.filter(s => s.type === 'dialog') || [];
      for (const dialog of dialogs) {
        const invalid = (dialog.lines || []).filter(l => !l.text?.de || !l.text?.fa);
        if (invalid.length > 0) {
          return { pass: false, error: `Dialog ${dialog.id} has ${invalid.length} lines missing translations` };
        }
      }
      return { pass: true };
    }
  },
  {
    name: 'rapid-fire-questions-valid',
    description: 'Rapid-fire steps have valid questions with correctSide',
    check: (lesson) => {
      const rapidFires = lesson.steps?.filter(s => s.type === 'rapid-fire') || [];
      for (const rf of rapidFires) {
        if (!rf.questions?.length) {
          return { pass: false, error: `Rapid-fire ${rf.id} has no questions` };
        }
        const invalid = rf.questions.filter(q =>
          !q.left || !q.right || !['left', 'right'].includes(q.correctSide)
        );
        if (invalid.length > 0) {
          return { pass: false, error: `Rapid-fire ${rf.id} has ${invalid.length} invalid questions` };
        }
      }
      return { pass: true };
    }
  },
  {
    name: 'memory-match-pairs-valid',
    description: 'Memory-match steps have valid pairs with de and fa',
    check: (lesson) => {
      const memoryMatches = lesson.steps?.filter(s => s.type === 'memory-match') || [];
      for (const mm of memoryMatches) {
        if (!mm.pairs?.length || mm.pairs.length < 2) {
          return { pass: false, error: `Memory-match ${mm.id} needs at least 2 pairs` };
        }
        const invalid = mm.pairs.filter(p => !p.de || !p.fa);
        if (invalid.length > 0) {
          return { pass: false, error: `Memory-match ${mm.id} has ${invalid.length} pairs missing de/fa` };
        }
      }
      return { pass: true };
    }
  },
  {
    name: 'vocab-check-words-valid',
    description: 'Vocab-check steps have valid words with de and fa',
    check: (lesson) => {
      const vocabChecks = lesson.steps?.filter(s => s.type === 'vocab-check') || [];
      for (const vc of vocabChecks) {
        if (!vc.words?.length) {
          return { pass: false, error: `Vocab-check ${vc.id} has no words` };
        }
        const invalid = vc.words.filter(w => !w.de || !w.fa);
        if (invalid.length > 0) {
          return { pass: false, error: `Vocab-check ${vc.id} has ${invalid.length} words missing de/fa` };
        }
      }
      return { pass: true };
    }
  },
  {
    name: 'completion-has-vocab',
    description: 'Completion step has vocabularyLearned array',
    check: (lesson) => {
      const completion = lesson.steps?.find(s => s.type === 'completion');
      if (!completion) return { pass: true }; // Will be caught by ends-with-completion
      if (!completion.vocabularyLearned?.length) {
        return { pass: false, error: 'Completion step missing vocabularyLearned' };
      }
      return { pass: true };
    }
  },
  {
    name: 'no-undefined-values',
    description: 'No undefined or null values in critical fields',
    check: (lesson) => {
      const checkObj = (obj, path = '') => {
        const issues = [];
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (value === undefined) {
            issues.push(`${currentPath} is undefined`);
          } else if (value === null && !['image', 'imageId', 'audio', 'video', 'hint', 'feedback'].includes(key)) {
            issues.push(`${currentPath} is null`);
          } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            issues.push(...checkObj(value, currentPath));
          }
        }
        return issues;
      };

      const issues = checkObj(lesson);
      if (issues.length > 0) {
        return { pass: false, error: issues.slice(0, 3).join('; ') + (issues.length > 3 ? ` (+${issues.length - 3} more)` : '') };
      }
      return { pass: true };
    }
  }
];

function validateLesson(filePath) {
  console.log(`\n📋 Validating: ${path.basename(filePath)}`);
  console.log('─'.repeat(50));

  let lesson;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    lesson = JSON.parse(content);
  } catch (e) {
    log('red', `❌ Failed to read/parse file: ${e.message}`);
    return { passed: 0, failed: 1, errors: ['File read/parse error'] };
  }

  let passed = 0;
  let failed = 0;
  const errors = [];

  for (const rule of rules) {
    const result = rule.check(lesson);
    if (result.pass) {
      passed++;
      log('green', `  ✓ ${rule.name}`);
    } else {
      failed++;
      errors.push(`${rule.name}: ${result.error}`);
      log('red', `  ✗ ${rule.name}: ${result.error}`);
    }
  }

  console.log('─'.repeat(50));
  if (failed === 0) {
    log('green', `✅ All ${passed} rules passed`);
  } else {
    log('red', `❌ ${failed} rules failed, ${passed} passed`);
  }

  return { passed, failed, errors };
}

function findLessonFiles(dir, level = null) {
  const files = [];

  function scan(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name.endsWith('.json') && !entry.name.includes('CURRICULUM')) {
        if (!level || fullPath.includes(`/${level}/`)) {
          files.push(fullPath);
        }
      }
    }
  }

  scan(dir);
  return files;
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage:');
  console.log('  node scripts/validate-lesson.js <lesson-file.json>');
  console.log('  node scripts/validate-lesson.js --all');
  console.log('  node scripts/validate-lesson.js --level=A1');
  process.exit(1);
}

const contentDir = path.resolve(__dirname, '../content/de-fa');

if (args[0] === '--all' || args[0].startsWith('--level=')) {
  const level = args[0].startsWith('--level=') ? args[0].split('=')[1] : null;
  const files = findLessonFiles(contentDir, level);

  console.log(`\n🔍 Validating ${files.length} lesson files${level ? ` (level ${level})` : ''}...\n`);

  let totalPassed = 0;
  let totalFailed = 0;
  const allErrors = [];

  for (const file of files) {
    const result = validateLesson(file);
    totalPassed += result.passed;
    totalFailed += result.failed;
    if (result.errors.length > 0) {
      allErrors.push({ file: path.basename(file), errors: result.errors });
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(50));
  console.log(`Files validated: ${files.length}`);
  console.log(`Total rules passed: ${totalPassed}`);
  console.log(`Total rules failed: ${totalFailed}`);

  if (allErrors.length > 0) {
    console.log(`\n❌ Files with errors:`);
    for (const { file, errors } of allErrors) {
      console.log(`  ${file}:`);
      for (const err of errors) {
        console.log(`    - ${err}`);
      }
    }
    process.exit(1);
  } else {
    log('green', '\n✅ All lessons valid!');
  }
} else {
  const result = validateLesson(args[0]);
  process.exit(result.failed > 0 ? 1 : 0);
}
