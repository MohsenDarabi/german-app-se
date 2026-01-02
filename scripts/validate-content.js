#!/usr/bin/env node

/**
 * Content Validation Pipeline v3.0
 *
 * Validates lesson JSON files for:
 * 1. Filename matches lessonId
 * 2. Lesson ID naming convention (e.g., A1-1-M01-L01)
 * 3. Required fields & schema compliance
 * 4. Step ID uniqueness & naming
 * 5. Exercise answer validity & distribution
 * 6. Persian translations present
 * 7. Audio folder existence & file mapping
 * 8. Content quality checks
 * 9. URL path sync with modules.ts
 *
 * Usage:
 *   node scripts/validate-content.js                    # Validate all
 *   node scripts/validate-content.js --level=A1        # Validate A1 only
 *   node scripts/validate-content.js --file=path.json  # Validate single file
 *   node scripts/validate-content.js --fix             # Auto-fix filename issues
 *   node scripts/validate-content.js --shuffle         # Shuffle exercise options
 *   node scripts/validate-content.js --audio           # Include audio validation
 *   node scripts/validate-content.js --sync            # Sync modules.ts paths
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bold}${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.magenta}▸ ${msg}${colors.reset}`)
};

// Valid step types
const VALID_STEP_TYPES = [
  'new-word', 'grammar-tip', 'dialog', 'completion',
  'multiple-choice', 'fill-in-blank', 'word-order', 'true-false',
  'matching', 'translation', 'listen-and-choose', 'formality-choice',
  'speed-challenge', 'rapid-fire', 'memory-match', 'word-hunt', 'vocab-check',
  'spelling', 'comprehension'
];

// Lesson ID pattern: {Level}-{SubLevel}-M{Module}-L{Lesson} or {Level}-M{Module}-L{Lesson}
const LESSON_ID_PATTERN = /^(A[12]|B[12])(-[12])?-M\d{2}-L\d{2}$/;

// Validation rules
const validators = {

  // Rule 1: Filename must match lessonId
  filenameMatchesId: (json, filePath) => {
    const filename = path.basename(filePath, '.json');
    const lessonId = json.id;

    if (filename !== lessonId) {
      return {
        valid: false,
        error: `Filename "${filename}.json" does not match lessonId "${lessonId}"`,
        fix: {
          type: 'rename',
          from: filePath,
          to: path.join(path.dirname(filePath), `${lessonId}.json`)
        }
      };
    }
    return { valid: true };
  },

  // Rule 2: Lesson ID follows naming convention
  lessonIdFormat: (json) => {
    const lessonId = json.id;
    if (!LESSON_ID_PATTERN.test(lessonId)) {
      return {
        valid: false,
        error: `Lesson ID "${lessonId}" doesn't match pattern. Expected: A1-1-M01-L01, A1-M01-L01, A2-2-M07-L01, etc.`,
        severity: 'warning'
      };
    }
    return { valid: true };
  },

  // Rule 3: Required top-level fields
  requiredFields: (json) => {
    const required = ['id', 'title', 'level', 'module', 'lessonNumber', 'steps'];
    const missing = required.filter(f => !(f in json));

    if (missing.length > 0) {
      return {
        valid: false,
        error: `Missing required fields: ${missing.join(', ')}`
      };
    }
    return { valid: true };
  },

  // Rule 4: Title has both de and fa
  bilingualTitle: (json) => {
    if (!json.title?.de || !json.title?.fa) {
      return {
        valid: false,
        error: `Title must have both "de" and "fa" translations`
      };
    }
    return { valid: true };
  },

  // Rule 5: Steps array not empty
  hasSteps: (json) => {
    if (!Array.isArray(json.steps) || json.steps.length === 0) {
      return {
        valid: false,
        error: `Lesson must have at least one step`
      };
    }
    return { valid: true };
  },

  // Rule 6: All steps have unique IDs
  uniqueStepIds: (json) => {
    const ids = json.steps?.map(s => s.id) || [];
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);

    if (duplicates.length > 0) {
      return {
        valid: false,
        error: `Duplicate step IDs: ${[...new Set(duplicates)].join(', ')}`
      };
    }
    return { valid: true };
  },

  // Rule 7: All steps have valid type
  stepsHaveValidType: (json) => {
    const invalidSteps = [];
    json.steps?.forEach((s, i) => {
      if (!s.type) {
        invalidSteps.push({ position: i + 1, issue: 'missing type' });
      } else if (!VALID_STEP_TYPES.includes(s.type)) {
        invalidSteps.push({ position: i + 1, issue: `unknown type "${s.type}"` });
      }
    });

    if (invalidSteps.length > 0) {
      return {
        valid: false,
        error: `Invalid steps: ${invalidSteps.map(x => `#${x.position} (${x.issue})`).join(', ')}`
      };
    }
    return { valid: true };
  },

  // Rule 8: new-word steps have word.de and word.fa
  newWordBilingual: (json) => {
    const invalid = [];
    json.steps?.forEach((s, i) => {
      if (s.type === 'new-word') {
        if (!s.word?.de || !s.word?.fa) {
          invalid.push(i + 1);
        }
      }
    });

    if (invalid.length > 0) {
      return {
        valid: false,
        error: `new-word steps missing de/fa translations: positions ${invalid.join(', ')}`
      };
    }
    return { valid: true };
  },

  // Rule 9: fill-in-blank correctAnswers are valid indices
  fillInBlankAnswers: (json) => {
    const errors = [];
    json.steps?.forEach((s, i) => {
      if (s.type === 'fill-in-blank') {
        const optionCount = s.options?.length || 0;
        if (optionCount < 2) {
          errors.push(`Step ${i + 1}: fill-in-blank needs at least 2 options`);
        }
        s.correctAnswers?.forEach((ans, j) => {
          if (ans < 0 || ans >= optionCount) {
            errors.push(`Step ${i + 1}: correctAnswers[${j}]=${ans} out of range (options: 0-${optionCount - 1})`);
          }
        });
        if (!s.sentence) {
          errors.push(`Step ${i + 1}: fill-in-blank missing "sentence" field`);
        }
      }
    });

    if (errors.length > 0) {
      return {
        valid: false,
        error: errors.join('; ')
      };
    }
    return { valid: true };
  },

  // Rule 10: multiple-choice correctAnswerIndex is valid
  multipleChoiceAnswers: (json) => {
    const errors = [];
    json.steps?.forEach((s, i) => {
      if (s.type === 'multiple-choice') {
        const optionCount = s.options?.length || 0;
        if (optionCount < 2) {
          errors.push(`Step ${i + 1}: multiple-choice needs at least 2 options`);
        }
        const correctIdx = s.correctAnswerIndex ?? s.answer;
        if (correctIdx === undefined || correctIdx < 0 || correctIdx >= optionCount) {
          errors.push(`Step ${i + 1}: correctAnswerIndex=${correctIdx} invalid (options: 0-${optionCount - 1})`);
        }
        if (!s.question && !s.prompt) {
          errors.push(`Step ${i + 1}: multiple-choice missing "question" or "prompt" field`);
        }
      }
    });

    if (errors.length > 0) {
      return {
        valid: false,
        error: errors.join('; ')
      };
    }
    return { valid: true };
  },

  // Rule 11: matching pairs are valid
  matchingPairs: (json) => {
    const errors = [];
    json.steps?.forEach((s, i) => {
      if (s.type === 'matching') {
        const itemIds = s.items?.map(x => x.id) || [];
        const matchIds = s.matches?.map(x => x.id) || [];

        if (itemIds.length < 2) {
          errors.push(`Step ${i + 1}: matching needs at least 2 items`);
        }
        if (matchIds.length < 2) {
          errors.push(`Step ${i + 1}: matching needs at least 2 matches`);
        }

        s.correctPairs?.forEach(([itemId, matchId], j) => {
          if (!itemIds.includes(itemId)) {
            errors.push(`Step ${i + 1}: correctPairs[${j}] references unknown item "${itemId}"`);
          }
          if (!matchIds.includes(matchId)) {
            errors.push(`Step ${i + 1}: correctPairs[${j}] references unknown match "${matchId}"`);
          }
        });
      }
    });

    if (errors.length > 0) {
      return {
        valid: false,
        error: errors.join('; ')
      };
    }
    return { valid: true };
  },

  // Rule 12: word-order has words array
  wordOrderSteps: (json) => {
    const errors = [];
    json.steps?.forEach((s, i) => {
      if (s.type === 'word-order') {
        if (!s.words || !Array.isArray(s.words) || s.words.length < 2) {
          errors.push(`Step ${i + 1}: word-order needs "words" array with at least 2 words`);
        }
        if (!s.correctOrder || !Array.isArray(s.correctOrder)) {
          errors.push(`Step ${i + 1}: word-order needs "correctOrder" array`);
        }
      }
    });

    if (errors.length > 0) {
      return {
        valid: false,
        error: errors.join('; ')
      };
    }
    return { valid: true };
  },

  // Rule 13: dialog steps have lines
  dialogSteps: (json) => {
    const errors = [];
    json.steps?.forEach((s, i) => {
      if (s.type === 'dialog') {
        if (!s.lines || !Array.isArray(s.lines) || s.lines.length < 1) {
          errors.push(`Step ${i + 1}: dialog needs "lines" array`);
        } else {
          s.lines.forEach((line, j) => {
            if (!line.speaker) {
              errors.push(`Step ${i + 1}: dialog line ${j + 1} missing "speaker"`);
            }
            if (!line.text?.de || !line.text?.fa) {
              errors.push(`Step ${i + 1}: dialog line ${j + 1} missing de/fa text`);
            }
          });
        }
      }
    });

    if (errors.length > 0) {
      return {
        valid: false,
        error: errors.join('; ')
      };
    }
    return { valid: true };
  },

  // Rule 14: grammar-tip has content
  grammarTipContent: (json) => {
    const errors = [];
    json.steps?.forEach((s, i) => {
      if (s.type === 'grammar-tip') {
        if (!s.content || s.content.trim().length < 10) {
          errors.push(`Step ${i + 1}: grammar-tip needs meaningful "content" (min 10 chars)`);
        }
      }
    });

    if (errors.length > 0) {
      return {
        valid: false,
        error: errors.join('; ')
      };
    }
    return { valid: true };
  },

  // Rule 15: Step IDs follow naming convention (warning only)
  stepIdNaming: (json) => {
    const lessonId = json.id;
    const invalid = [];

    json.steps?.forEach((s, i) => {
      // Expected pattern: {lessonId}-S{nn} or simple s1, s2 (legacy)
      const expectedPrefix = `${lessonId}-S`;
      const isLegacy = /^s\d+[a-z]?$/.test(s.id);
      if (!s.id?.startsWith(expectedPrefix) && !isLegacy) {
        invalid.push({ position: i + 1, id: s.id });
      }
    });

    if (invalid.length > 0) {
      return {
        valid: false,
        error: `Step IDs should follow pattern "${lessonId}-SXX" or legacy "sN": ${invalid.slice(0, 3).map(x => `#${x.position}`).join(', ')}${invalid.length > 3 ? ` (+${invalid.length - 3} more)` : ''}`,
        severity: 'warning'
      };
    }
    return { valid: true };
  },

  // Rule 16: Has completion step at end
  hasCompletion: (json) => {
    const lastStep = json.steps?.[json.steps.length - 1];
    if (lastStep?.type !== 'completion') {
      return {
        valid: false,
        error: `Last step should be "completion" type, found "${lastStep?.type}"`,
        severity: 'warning'
      };
    }
    return { valid: true };
  },

  // Rule 17: Lesson has minimum vocabulary (new-word steps)
  minimumVocabulary: (json) => {
    const newWordCount = json.steps?.filter(s => s.type === 'new-word').length || 0;
    if (newWordCount < 3) {
      return {
        valid: false,
        error: `Lesson has only ${newWordCount} vocabulary words (minimum: 3)`,
        severity: 'warning'
      };
    }
    return { valid: true };
  },

  // Rule 18: No empty strings in critical fields
  noEmptyStrings: (json) => {
    const errors = [];

    if (json.title?.de?.trim() === '') errors.push('title.de is empty');
    if (json.title?.fa?.trim() === '') errors.push('title.fa is empty');

    json.steps?.forEach((s, i) => {
      if (s.type === 'new-word') {
        if (s.word?.de?.trim() === '') errors.push(`Step ${i + 1}: word.de is empty`);
        if (s.word?.fa?.trim() === '') errors.push(`Step ${i + 1}: word.fa is empty`);
      }
    });

    if (errors.length > 0) {
      return {
        valid: false,
        error: errors.join('; ')
      };
    }
    return { valid: true };
  },

  // Rule 19: MCQ correct answer should be shuffled (not always index 0)
  mcqAnswerDistribution: (json) => {
    const mcqSteps = json.steps?.filter(s => s.type === 'multiple-choice') || [];
    if (mcqSteps.length < 2) return { valid: true };

    const allFirstOption = mcqSteps.every(s => s.correctAnswerIndex === 0);
    if (allFirstOption) {
      return {
        valid: false,
        error: `All ${mcqSteps.length} MCQ questions have correctAnswerIndex=0. Options should be shuffled so correct answer is distributed across positions.`,
        severity: 'warning',
        fixable: true
      };
    }
    return { valid: true };
  },

  // Rule 20: No duplicate options in MCQ/fill-in-blank
  noDuplicateOptions: (json) => {
    const errors = [];
    json.steps?.forEach((s, i) => {
      if (s.type === 'multiple-choice' || s.type === 'fill-in-blank') {
        const options = s.options || [];
        const uniqueOptions = new Set(options.map(o => o.toLowerCase().trim()));
        if (uniqueOptions.size !== options.length) {
          const dupes = options.filter((opt, idx) =>
            options.findIndex(o => o.toLowerCase().trim() === opt.toLowerCase().trim()) !== idx
          );
          errors.push(`Step ${i + 1} (${s.type}): duplicate options: ${dupes.join(', ')}`);
        }
      }
    });

    if (errors.length > 0) {
      return {
        valid: false,
        error: errors.join('; ')
      };
    }
    return { valid: true };
  },

  // Rule 21: Fill-in-blank answer distribution check
  fillInBlankAnswerDistribution: (json) => {
    const fibSteps = json.steps?.filter(s => s.type === 'fill-in-blank') || [];
    if (fibSteps.length < 2) return { valid: true };

    const allFirstOption = fibSteps.every(s => {
      const answers = s.correctAnswers || [];
      return answers.length > 0 && answers[0] === 0;
    });

    if (allFirstOption) {
      return {
        valid: false,
        error: `All ${fibSteps.length} fill-in-blank questions have first answer as index 0. Consider shuffling options.`,
        severity: 'warning'
      };
    }
    return { valid: true };
  },

  // Rule 22: Listen-and-choose correct answer distribution
  listenChooseAnswerDistribution: (json) => {
    const listenSteps = json.steps?.filter(s => s.type === 'listen-and-choose') || [];
    if (listenSteps.length < 2) return { valid: true };

    const allFirstOption = listenSteps.every(s => s.correctAnswerIndex === 0);
    if (allFirstOption) {
      return {
        valid: false,
        error: `All ${listenSteps.length} listen-and-choose questions have correctAnswerIndex=0`,
        severity: 'warning'
      };
    }
    return { valid: true };
  },

  // Rule 23: Speed-challenge questions should have varied correct answers
  speedChallengeVariety: (json) => {
    const speedSteps = json.steps?.filter(s => s.type === 'speed-challenge') || [];

    for (const step of speedSteps) {
      const questions = step.questions || [];
      if (questions.length < 3) continue;

      const allSameIndex = questions.every(q => q.correctAnswerIndex === questions[0].correctAnswerIndex);
      if (allSameIndex) {
        return {
          valid: false,
          error: `Speed-challenge step "${step.id}" has all ${questions.length} questions with same correctAnswerIndex=${questions[0].correctAnswerIndex}`,
          severity: 'warning'
        };
      }
    }
    return { valid: true };
  },

  // Rule 24: Rapid-fire questions should have balanced left/right answers
  rapidFireBalance: (json) => {
    const rapidSteps = json.steps?.filter(s => s.type === 'rapid-fire') || [];

    for (const step of rapidSteps) {
      const questions = step.questions || [];
      if (questions.length < 4) continue;

      const leftCount = questions.filter(q => q.correctSide === 'left').length;
      const rightCount = questions.filter(q => q.correctSide === 'right').length;

      // Flag if more than 80% are on one side
      const ratio = Math.max(leftCount, rightCount) / questions.length;
      if (ratio > 0.8) {
        return {
          valid: false,
          error: `Rapid-fire step "${step.id}" is unbalanced: ${leftCount} left, ${rightCount} right (${Math.round(ratio * 100)}% same side)`,
          severity: 'warning'
        };
      }
    }
    return { valid: true };
  },

  // Rule 25: Word-order words should be scrambled (not already in correct order)
  wordOrderScrambled: (json) => {
    const errors = [];
    json.steps?.forEach((s, i) => {
      if (s.type === 'word-order') {
        const words = s.words || [];
        const correctOrder = s.correctOrder || [];

        // Check if already in correct order (0,1,2,3...)
        const isAlreadySolved = correctOrder.every((idx, pos) => idx === pos);
        if (isAlreadySolved && correctOrder.length > 2) {
          errors.push(`Step ${i + 1}: word-order words are already in correct order (not scrambled)`);
        }
      }
    });

    if (errors.length > 0) {
      return {
        valid: false,
        error: errors.join('; '),
        severity: 'warning'
      };
    }
    return { valid: true };
  },

  // Rule 26: Matching items count should equal matches count
  matchingCountsEqual: (json) => {
    const errors = [];
    json.steps?.forEach((s, i) => {
      if (s.type === 'matching') {
        const itemCount = s.items?.length || 0;
        const matchCount = s.matches?.length || 0;
        const pairCount = s.correctPairs?.length || 0;

        if (itemCount !== matchCount) {
          errors.push(`Step ${i + 1}: matching has ${itemCount} items but ${matchCount} matches`);
        }
        if (pairCount !== itemCount) {
          errors.push(`Step ${i + 1}: matching has ${itemCount} items but ${pairCount} correct pairs`);
        }
      }
    });

    if (errors.length > 0) {
      return {
        valid: false,
        error: errors.join('; ')
      };
    }
    return { valid: true };
  },

  // Rule 27: Fill-in-blank should not mix conjugations from different verbs
  // This catches pedagogically confusing exercises
  // EXCEPTION: Modal verb + infinitive and werden + infinitive (future) are valid patterns
  fillInBlankVerbConsistency: (json) => {
    // German verb conjugation families (common verbs that are often confused)
    const verbFamilies = {
      sein: ['bin', 'bist', 'ist', 'sind', 'seid', 'war', 'warst', 'waren', 'wart'],
      heißen: ['heiße', 'heißt', 'heißen'],
      haben: ['habe', 'hast', 'hat', 'haben', 'habt', 'hatte', 'hattest', 'hatten', 'hattet'],
      werden: ['werde', 'wirst', 'wird', 'werden', 'werdet', 'wurde', 'wurdest', 'wurden', 'wurdet'],
      kommen: ['komme', 'kommst', 'kommt', 'kommen'],
      wohnen: ['wohne', 'wohnst', 'wohnt', 'wohnen'],
      machen: ['mache', 'machst', 'macht', 'machen'],
      gehen: ['gehe', 'gehst', 'geht', 'gehen', 'ging', 'gingst', 'gingen', 'gingt'],
      können: ['kann', 'kannst', 'können', 'könnt', 'konnte', 'konntest', 'konnten', 'konntet'],
      mögen: ['mag', 'magst', 'mögen', 'mögt', 'mochte', 'mochtest', 'mochten', 'mochtet'],
      müssen: ['muss', 'musst', 'müssen', 'müsst', 'musste', 'musstest', 'mussten', 'musstet'],
      wollen: ['will', 'willst', 'wollen', 'wollt', 'wollte', 'wolltest', 'wollten', 'wolltet'],
      sollen: ['soll', 'sollst', 'sollen', 'sollt', 'sollte', 'solltest', 'sollten', 'solltet'],
      dürfen: ['darf', 'darfst', 'dürfen', 'dürft', 'durfte', 'durftest', 'durften', 'durftet'],
      sprechen: ['spreche', 'sprichst', 'spricht', 'sprechen', 'sprecht'],
      lesen: ['lese', 'liest', 'lesen', 'lest'],
      schreiben: ['schreibe', 'schreibst', 'schreibt', 'schreiben'],
      arbeiten: ['arbeite', 'arbeitest', 'arbeitet', 'arbeiten'],
      lernen: ['lerne', 'lernst', 'lernt', 'lernen'],
      essen: ['esse', 'isst', 'essen', 'esst'],
      trinken: ['trinke', 'trinkst', 'trinkt', 'trinken'],
      fahren: ['fahre', 'fährst', 'fährt', 'fahren'],
      schlafen: ['schlafe', 'schläfst', 'schläft', 'schlafen'],
      sehen: ['sehe', 'siehst', 'sieht', 'sehen', 'seht'],
      nehmen: ['nehme', 'nimmst', 'nimmt', 'nehmen', 'nehmt'],
      geben: ['gebe', 'gibst', 'gibt', 'geben', 'gebt'],
      wissen: ['weiß', 'weißt', 'wissen', 'wisst', 'wusste', 'wusstest', 'wussten', 'wusstet']
    };

    // Modal verbs and werden can combine with infinitives (valid grammar patterns)
    const modalVerbs = ['können', 'müssen', 'sollen', 'wollen', 'dürfen', 'mögen'];
    const conjugatedModalForms = {
      können: ['kann', 'kannst', 'könnt', 'konnte', 'konntest', 'konnten', 'konntet'],
      müssen: ['muss', 'musst', 'müsst', 'musste', 'musstest', 'mussten', 'musstet'],
      sollen: ['soll', 'sollst', 'sollt', 'sollte', 'solltest', 'sollten', 'solltet'],
      wollen: ['will', 'willst', 'wollt', 'wollte', 'wolltest', 'wollten', 'wolltet'],
      dürfen: ['darf', 'darfst', 'dürft', 'durfte', 'durftest', 'durften', 'durftet'],
      mögen: ['mag', 'magst', 'mögt', 'mochte', 'mochtest', 'mochten', 'mochtet']
    };
    const conjugatedWerdenForms = ['werde', 'wirst', 'wird', 'werdet', 'wurde', 'wurdest', 'wurden', 'wurdet'];

    // Function to find which verb family a word belongs to
    function findVerbFamily(word) {
      const lowerWord = word.toLowerCase();
      for (const [verb, conjugations] of Object.entries(verbFamilies)) {
        if (conjugations.includes(lowerWord)) {
          return verb;
        }
      }
      return null;
    }

    // Check if word is a conjugated modal verb (not infinitive form)
    function isConjugatedModal(word) {
      const lowerWord = word.toLowerCase();
      for (const forms of Object.values(conjugatedModalForms)) {
        if (forms.includes(lowerWord)) return true;
      }
      return false;
    }

    // Check if word is conjugated werden (not infinitive)
    function isConjugatedWerden(word) {
      return conjugatedWerdenForms.includes(word.toLowerCase());
    }

    // Check if word looks like an infinitive (ends in -en, not a conjugated form)
    function isInfinitive(word) {
      const lowerWord = word.toLowerCase();
      // Must end in -en and not be a known conjugated form
      if (!lowerWord.endsWith('en')) return false;
      // Check it's not a conjugated wir/sie/Sie form
      // Infinitives are typically longer words
      if (lowerWord.length < 4) return false;
      // If it's in our verb families as the infinitive form (last in each array), it's an infinitive
      for (const [verb, conjugations] of Object.entries(verbFamilies)) {
        // Infinitive is usually the verb name itself ending in -en or -n
        if (verb.endsWith('en') && verb === lowerWord) return true;
        if (conjugations.includes(lowerWord) && lowerWord.endsWith('en')) {
          // Check if this is the plural/infinitive form (usually last or matches verb name)
          return true;
        }
      }
      return lowerWord.endsWith('en');
    }

    const warnings = [];

    json.steps?.forEach((s, i) => {
      if (s.type === 'fill-in-blank' && s.options && s.correctAnswers) {
        // Get correct answer words
        const correctWords = s.correctAnswers
          .map(idx => s.options[idx])
          .filter(w => w);

        // Find verb families for correct answers
        const familyMap = new Map(); // word -> family
        correctWords.forEach(word => {
          const family = findVerbFamily(word);
          if (family) familyMap.set(word, family);
        });

        const families = new Set(familyMap.values());

        // If 2+ different verb families, check if it's a valid pattern
        if (families.size >= 2) {
          // Check for valid modal + infinitive or werden + infinitive pattern
          let hasConjugatedModal = false;
          let hasConjugatedWerden = false;
          let hasInfinitive = false;
          let conjugatedVerbs = [];

          correctWords.forEach(word => {
            if (isConjugatedModal(word)) {
              hasConjugatedModal = true;
              conjugatedVerbs.push(word);
            } else if (isConjugatedWerden(word)) {
              hasConjugatedWerden = true;
              conjugatedVerbs.push(word);
            } else if (isInfinitive(word)) {
              hasInfinitive = true;
            } else if (familyMap.has(word)) {
              conjugatedVerbs.push(word);
            }
          });

          // Valid patterns: modal + infinitive OR werden + infinitive
          const isValidModalPattern = hasConjugatedModal && hasInfinitive && conjugatedVerbs.length <= 1;
          const isValidFuturePattern = hasConjugatedWerden && hasInfinitive && conjugatedVerbs.length <= 1;

          if (!isValidModalPattern && !isValidFuturePattern) {
            const familyList = Array.from(families).join(' + ');
            warnings.push(
              `Step ${i + 1} (id: ${s.id}): fill-in-blank mixes verbs from different families: ${familyList}. ` +
              `Correct answers: "${correctWords.join('", "')}". ` +
              `This may confuse learners.`
            );
          }
        }
      }
    });

    if (warnings.length > 0) {
      return {
        valid: false,
        error: warnings.join('\n'),
        severity: 'warning',
        pedagogical: true
      };
    }
    return { valid: true };
  }
};

// Audio validators (separate, optional)
const audioValidators = {

  // Check audio folder exists for lesson
  audioFolderExists: (json, filePath, audioDir) => {
    const lessonId = json.id;
    const audioFolder = path.join(audioDir, lessonId);

    if (!fs.existsSync(audioFolder)) {
      return {
        valid: false,
        error: `Audio folder missing: ${lessonId}/`,
        severity: 'warning'
      };
    }
    return { valid: true };
  },

  // Check required audio files exist
  audioFilesExist: (json, filePath, audioDir) => {
    const lessonId = json.id;
    const audioFolder = path.join(audioDir, lessonId);

    if (!fs.existsSync(audioFolder)) {
      return { valid: true }; // Skip if folder doesn't exist (covered by above rule)
    }

    const existingFiles = fs.readdirSync(audioFolder);
    const missing = [];

    json.steps?.forEach((s, i) => {
      const stepId = s.id;

      // new-word needs {stepId}-word.mp3
      if (s.type === 'new-word') {
        const wordAudio = `${stepId}-word.mp3`;
        if (!existingFiles.includes(wordAudio)) {
          missing.push(wordAudio);
        }
      }

      // dialog needs {stepId}-line{N}.mp3 for each line
      if (s.type === 'dialog' && s.lines) {
        s.lines.forEach((line, j) => {
          const lineAudio = `${stepId}-line${j}.mp3`;
          if (!existingFiles.includes(lineAudio)) {
            missing.push(lineAudio);
          }
        });
      }
    });

    if (missing.length > 0) {
      return {
        valid: false,
        error: `Missing audio files (${missing.length}): ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ` (+${missing.length - 5} more)` : ''}`,
        severity: 'warning'
      };
    }
    return { valid: true };
  }
};

// Find all lesson files
function findLessonFiles(contentDir, level = null) {
  const files = [];

  const levels = level ? [level] : ['A1', 'A2', 'B1', 'B2'];

  for (const lvl of levels) {
    const levelDir = path.join(contentDir, lvl);
    if (!fs.existsSync(levelDir)) continue;

    const modules = fs.readdirSync(levelDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name.startsWith('module-'));

    for (const mod of modules) {
      const moduleDir = path.join(levelDir, mod.name);
      const lessons = fs.readdirSync(moduleDir)
        .filter(f => f.endsWith('.json'));

      for (const lesson of lessons) {
        files.push(path.join(moduleDir, lesson));
      }
    }
  }

  return files;
}

// Validate a single file
function validateFile(filePath, audioDir = null) {
  const results = {
    file: filePath,
    errors: [],
    warnings: [],
    fixes: []
  };

  // Check file exists
  if (!fs.existsSync(filePath)) {
    results.errors.push(`File not found: ${filePath}`);
    return results;
  }

  // Parse JSON
  let json;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    json = JSON.parse(content);
  } catch (e) {
    results.errors.push(`Invalid JSON: ${e.message}`);
    return results;
  }

  // Run content validators
  for (const [name, validator] of Object.entries(validators)) {
    try {
      const result = validator(json, filePath);
      if (!result.valid) {
        if (result.severity === 'warning') {
          results.warnings.push(`[${name}] ${result.error}`);
        } else {
          results.errors.push(`[${name}] ${result.error}`);
        }
        if (result.fix) {
          results.fixes.push(result.fix);
        }
      }
    } catch (e) {
      results.errors.push(`[${name}] Validator crashed: ${e.message}`);
    }
  }

  // Run audio validators if audioDir provided
  if (audioDir) {
    for (const [name, validator] of Object.entries(audioValidators)) {
      try {
        const result = validator(json, filePath, audioDir);
        if (!result.valid) {
          if (result.severity === 'warning') {
            results.warnings.push(`[${name}] ${result.error}`);
          } else {
            results.errors.push(`[${name}] ${result.error}`);
          }
        }
      } catch (e) {
        results.warnings.push(`[${name}] Validator crashed: ${e.message}`);
      }
    }
  }

  return results;
}

// Apply fixes
function applyFixes(fixes, dryRun = true) {
  for (const fix of fixes) {
    if (fix.type === 'rename') {
      if (dryRun) {
        log.info(`Would rename: ${fix.from} → ${fix.to}`);
      } else {
        fs.renameSync(fix.from, fix.to);
        log.success(`Renamed: ${path.basename(fix.from)} → ${path.basename(fix.to)}`);
      }
    }
  }
}

// Shuffle array with Fisher-Yates algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Auto-fix: Shuffle MCQ/fill-in-blank options
function shuffleExerciseOptions(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(content);
  let modified = false;

  json.steps?.forEach((step, i) => {
    // Shuffle multiple-choice options
    if (step.type === 'multiple-choice' && step.options?.length >= 2) {
      const correctAnswer = step.options[step.correctAnswerIndex];
      const shuffled = shuffleArray(step.options);
      const newIndex = shuffled.indexOf(correctAnswer);

      step.options = shuffled;
      step.correctAnswerIndex = newIndex;
      modified = true;
    }

    // Shuffle fill-in-blank options (if only single blank)
    if (step.type === 'fill-in-blank' && step.options?.length >= 2 && step.correctAnswers?.length === 1) {
      const correctAnswer = step.options[step.correctAnswers[0]];
      const shuffled = shuffleArray(step.options);
      const newIndex = shuffled.indexOf(correctAnswer);

      step.options = shuffled;
      step.correctAnswers = [newIndex];
      modified = true;
    }

    // Shuffle listen-and-choose options
    if (step.type === 'listen-and-choose' && step.options?.length >= 2) {
      const correctAnswer = step.options[step.correctAnswerIndex];
      const shuffled = shuffleArray(step.options);
      const newIndex = shuffled.indexOf(correctAnswer);

      step.options = shuffled;
      step.correctAnswerIndex = newIndex;
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
    return true;
  }
  return false;
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const flags = {
    level: args.find(a => a.startsWith('--level='))?.split('=')[1],
    file: args.find(a => a.startsWith('--file='))?.split('=')[1],
    fix: args.includes('--fix'),
    shuffle: args.includes('--shuffle'),
    audio: args.includes('--audio'),
    sync: args.includes('--sync'),
    help: args.includes('--help') || args.includes('-h')
  };

  if (flags.help) {
    console.log(`
Content Validation Pipeline v3.0

Usage:
  node scripts/validate-content.js                    # Validate all
  node scripts/validate-content.js --level=A1        # Validate A1 only
  node scripts/validate-content.js --file=path.json  # Validate single file
  node scripts/validate-content.js --fix             # Auto-fix filename issues
  node scripts/validate-content.js --shuffle         # Shuffle exercise options (fix correctAnswerIndex=0)
  node scripts/validate-content.js --audio           # Include audio validation

Validation Rules (26 total):
  Content Structure:
    - Filename matches lessonId
    - Lesson ID follows naming convention (A1-1-M01-L01)
    - Required fields present (id, title, level, module, lessonNumber, steps)
    - Bilingual title (de + fa)
    - Unique step IDs
    - Valid step types

  Exercise Logic:
    - MCQ correct answer distributed (not always index 0)
    - Fill-in-blank answers distributed
    - No duplicate options in exercises
    - Speed-challenge varied answers
    - Rapid-fire balanced left/right
    - Word-order words scrambled
    - Matching items/matches counts equal

  Audio (--audio):
    - Audio folder exists for lesson
    - Required audio files exist (word.mp3, line{N}.mp3)
`);
    process.exit(0);
  }

  log.title('Content Validation Pipeline v3.0');

  // Find content directory
  const possibleContentDirs = [
    path.resolve(__dirname, '../content/de-fa'),
    path.resolve(__dirname, '../apps/web/content/de-fa'),
  ];

  const contentDir = possibleContentDirs.find(d => fs.existsSync(d));
  if (!contentDir) {
    log.error('Content directory not found!');
    process.exit(1);
  }

  log.info(`Content directory: ${contentDir}`);

  // Find audio directory if audio validation requested
  let audioDir = null;
  if (flags.audio) {
    const possibleAudioDirs = [
      path.resolve(__dirname, '../apps/web/static/audio'),
    ];
    audioDir = possibleAudioDirs.find(d => fs.existsSync(d));
    if (audioDir) {
      log.info(`Audio directory: ${audioDir}`);
    } else {
      log.warn('Audio directory not found, skipping audio validation');
    }
  }

  // Get files to validate
  let files;
  if (flags.file) {
    files = [flags.file];
  } else {
    files = findLessonFiles(contentDir, flags.level);
  }

  if (files.length === 0) {
    log.warn('No lesson files found');
    process.exit(0);
  }

  log.info(`Found ${files.length} lesson file(s)`);
  log.info(`Validators: ${Object.keys(validators).length} content${audioDir ? ` + ${Object.keys(audioValidators).length} audio` : ''}`);

  // Validate each file
  let totalErrors = 0;
  let totalWarnings = 0;
  const allFixes = [];
  let passedFiles = 0;

  for (const file of files) {
    const relPath = path.relative(contentDir, file);
    const results = validateFile(file, audioDir);

    if (results.errors.length === 0 && results.warnings.length === 0) {
      log.success(relPath);
      passedFiles++;
    } else {
      console.log(`\n${colors.bold}${relPath}${colors.reset}`);

      for (const err of results.errors) {
        log.error(err);
        totalErrors++;
      }

      for (const warn of results.warnings) {
        log.warn(warn);
        totalWarnings++;
      }

      allFixes.push(...results.fixes);
    }
  }

  // Summary
  log.title('Summary');
  console.log(`Files:    ${files.length} (${passedFiles} passed)`);
  console.log(`Errors:   ${totalErrors}`);
  console.log(`Warnings: ${totalWarnings}`);

  // Apply fixes if requested
  if (allFixes.length > 0) {
    log.title('Fixes Available');
    applyFixes(allFixes, !flags.fix);

    if (!flags.fix) {
      log.info('Run with --fix to apply fixes');
    }
  }

  // Shuffle exercise options if requested
  if (flags.shuffle) {
    log.title('Shuffling Exercise Options');
    let shuffledCount = 0;
    for (const file of files) {
      try {
        const wasShuffled = shuffleExerciseOptions(file);
        if (wasShuffled) {
          shuffledCount++;
          log.success(`Shuffled: ${path.relative(contentDir, file)}`);
        }
      } catch (e) {
        log.error(`Failed to shuffle ${file}: ${e.message}`);
      }
    }
    log.info(`Shuffled options in ${shuffledCount} file(s)`);
    log.info('Re-run validation to verify');
  }

  // Sync modules.ts if requested
  if (flags.sync) {
    log.title('Syncing modules.ts');
    const { execSync } = await import('child_process');
    try {
      execSync('node scripts/sync-modules.js --write', {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit'
      });
    } catch (e) {
      log.error(`Failed to sync modules.ts: ${e.message}`);
    }
  }

  // Validate modules.ts paths (always check)
  log.title('Checking modules.ts Paths');
  const modulesPathIssues = validateModulesPaths(contentDir);
  if (modulesPathIssues.length > 0) {
    for (const issue of modulesPathIssues) {
      if (issue.type === 'mismatch') {
        log.error(`Path mismatch: ${issue.id} - expected "${issue.expected}", got "${issue.actual}"`);
        totalErrors++;
      } else if (issue.type === 'missing') {
        log.warn(`Lesson ${issue.id} not in modules.ts`);
        totalWarnings++;
      } else if (issue.type === 'extra') {
        log.warn(`modules.ts has path for non-existent lesson: ${issue.id}`);
        totalWarnings++;
      }
    }
    log.info('Run with --sync to fix modules.ts');
  } else {
    log.success('All modules.ts paths are correct');
  }

  // Exit with error code if errors found
  process.exit(totalErrors > 0 ? 1 : 0);
}

// Validate modules.ts paths match actual files
function validateModulesPaths(contentDir) {
  const issues = [];
  const modulesFile = path.resolve(__dirname, '../apps/web/src/lib/data/modules.ts');

  if (!fs.existsSync(modulesFile)) {
    issues.push({ type: 'error', message: 'modules.ts not found' });
    return issues;
  }

  const modulesContent = fs.readFileSync(modulesFile, 'utf-8');

  // Extract lesson id/path pairs (only those with /learn/de-fa/ paths)
  const pathRegex = /id:\s*"([A-B][12]-[^"]+)"[^}]*path:\s*"(\/learn\/de-fa\/[^"]+)"/g;
  const modulePaths = new Map();
  let match;
  while ((match = pathRegex.exec(modulesContent)) !== null) {
    modulePaths.set(match[1], match[2]);
  }

  // Scan all lesson files
  const levels = ['A1', 'A2', 'B1', 'B2'];
  const actualLessons = new Map();

  for (const level of levels) {
    const levelDir = path.join(contentDir, level);
    if (!fs.existsSync(levelDir)) continue;

    const modules = fs.readdirSync(levelDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name.startsWith('module-'));

    for (const mod of modules) {
      const moduleDir = path.join(levelDir, mod.name);
      const files = fs.readdirSync(moduleDir).filter(f => f.endsWith('.json'));

      for (const file of files) {
        const lessonId = path.basename(file, '.json');
        const expectedPath = `/learn/de-fa/${level}/${lessonId}`;
        actualLessons.set(lessonId, expectedPath);

        const modulePath = modulePaths.get(lessonId);
        if (!modulePath) {
          issues.push({ type: 'missing', id: lessonId, expected: expectedPath });
        } else if (modulePath !== expectedPath) {
          issues.push({ type: 'mismatch', id: lessonId, expected: expectedPath, actual: modulePath });
        }

        modulePaths.delete(lessonId);
      }
    }
  }

  // Remaining entries in modulePaths are extra (no matching file)
  for (const [id, path] of modulePaths) {
    issues.push({ type: 'extra', id, path });
  }

  return issues;
}

main().catch(e => {
  log.error(e.message);
  process.exit(1);
});
