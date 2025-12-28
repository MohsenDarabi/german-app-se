/**
 * Human-in-the-Loop Validator
 *
 * CLI prompts for validating extracted content.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// We'll use readline for simpler CLI interaction
import * as readline from 'readline';

/**
 * Create readline interface
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask a yes/no question
 * @param {string} question
 * @returns {Promise<boolean>}
 */
export async function askYesNo(question) {
  const rl = createInterface();

  return new Promise((resolve) => {
    rl.question(`${question} [Y/n]: `, (answer) => {
      rl.close();
      const lower = answer.toLowerCase().trim();
      resolve(lower !== 'n' && lower !== 'no');
    });
  });
}

/**
 * Ask for text input
 * @param {string} question
 * @returns {Promise<string>}
 */
export async function askText(question) {
  const rl = createInterface();

  return new Promise((resolve) => {
    rl.question(`${question}: `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Wait for Enter key
 * @param {string} message
 */
export async function waitForEnter(message = 'Press Enter to continue...') {
  const rl = createInterface();

  return new Promise((resolve) => {
    rl.question(message, () => {
      rl.close();
      resolve();
    });
  });
}

/**
 * Display extracted content for validation
 * @param {object} screen - Screen data with type and content
 * @param {number} screenIndex
 * @param {string} lessonName
 */
export function displayScreen(screen, screenIndex, lessonName = 'Unknown') {
  console.log('\n');
  console.log('═'.repeat(60));
  console.log(`Screen #${screenIndex + 1} of Lesson "${lessonName}"`);
  console.log('═'.repeat(60));
  console.log();
  console.log(`Detected Type: ${screen.type || 'unknown'}`);
  console.log();
  console.log('Extracted Content:');
  console.log('─'.repeat(40));

  // Pretty print the content
  displayContent(screen.content || screen, 2);

  console.log();
  console.log('─'.repeat(60));
}

/**
 * Recursively display content with indentation
 * @param {any} obj
 * @param {number} indent
 */
function displayContent(obj, indent = 0) {
  const prefix = ' '.repeat(indent);

  if (obj === null || obj === undefined) {
    console.log(`${prefix}(empty)`);
    return;
  }

  if (typeof obj !== 'object') {
    console.log(`${prefix}${obj}`);
    return;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      console.log(`${prefix}[]`);
      return;
    }
    obj.forEach((item, i) => {
      if (typeof item === 'object') {
        console.log(`${prefix}[${i}]:`);
        displayContent(item, indent + 2);
      } else {
        console.log(`${prefix}- ${item}`);
      }
    });
    return;
  }

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      continue; // Skip null values
    }

    if (typeof value === 'object') {
      console.log(`${prefix}${key}:`);
      displayContent(value, indent + 2);
    } else {
      console.log(`${prefix}${key}: ${value}`);
    }
  }
}

/**
 * Validate extracted screen content
 * @param {object} screen
 * @param {number} screenIndex
 * @param {string} lessonName
 * @returns {Promise<object>} Validation result
 */
export async function validateScreen(screen, screenIndex, lessonName) {
  displayScreen(screen, screenIndex, lessonName);

  const isCorrect = await askYesNo('Is this correct?');

  let userNote = null;
  if (!isCorrect) {
    userNote = await askText("What's wrong? (or press Enter to skip)");
  }

  await waitForEnter();

  return {
    isCorrect,
    userNote: userNote || null,
    timestamp: new Date().toISOString()
  };
}

/**
 * Display validation summary
 * @param {object[]} results - Array of validation results
 */
export function displaySummary(results) {
  const total = results.length;
  const correct = results.filter(r => r.validation?.isCorrect).length;
  const incorrect = total - correct;

  console.log('\n');
  console.log('═'.repeat(60));
  console.log('VALIDATION SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Total screens: ${total}`);
  console.log(`Correct: ${correct} (${Math.round(correct / total * 100)}%)`);
  console.log(`Needs review: ${incorrect}`);
  console.log();

  if (incorrect > 0) {
    console.log('Screens needing review:');
    results.forEach((r, i) => {
      if (!r.validation?.isCorrect) {
        console.log(`  - Screen #${i + 1}: ${r.type || 'unknown'}`);
        if (r.validation?.userNote) {
          console.log(`    Note: ${r.validation.userNote}`);
        }
      }
    });
  }

  console.log('═'.repeat(60));
}

export default {
  askYesNo,
  askText,
  waitForEnter,
  displayScreen,
  validateScreen,
  displaySummary
};
