/**
 * Extractors Index
 *
 * Exports all exercise type extractors and provides a unified extraction interface.
 */

import extractFlashcard from './flashcard.js';
import extractFillgap from './fillgap.js';
import extractMcq from './mcq.js';
import extractPhraseBuilder from './phrase-builder.js';
import extractMatchup from './matchup.js';
import extractTrueFalse from './true-false.js';
import extractTyping from './typing.js';
import extractSpelling from './spelling.js';
import extractComprehension from './comprehension.js';
import extractTip from './tip.js';
import extractFeedback, { waitForFeedback } from './feedback.js';
import extractGeneric from './generic.js';

// Map screen type IDs to extractors
const EXTRACTORS = {
  'flashcard': extractFlashcard,
  'fillgap': extractFillgap,
  'phrase-builder': extractPhraseBuilder,
  'mcq': extractMcq,
  'matchup': extractMatchup,
  'true-false': extractTrueFalse,
  'typing': extractTyping,
  'spelling': extractSpelling,
  'comprehension': extractComprehension,
  'tip': extractTip,
  'feedback': extractFeedback,
  'generic-exercise': extractGeneric,
  'word-select': extractGeneric  // Use generic for word-select too
};

/**
 * Extract content based on detected screen type
 * @param {import('puppeteer').Page} page
 * @param {string} screenTypeId - The screen type ID from detector
 * @returns {Promise<object|null>}
 */
export async function extract(page, screenTypeId) {
  const extractor = EXTRACTORS[screenTypeId];

  if (!extractor) {
    console.warn(`No extractor for screen type: ${screenTypeId}`);
    return null;
  }

  try {
    return await extractor(page);
  } catch (error) {
    console.error(`Extraction error for ${screenTypeId}:`, error.message);
    return null;
  }
}

/**
 * Check if we have an extractor for a screen type
 * @param {string} screenTypeId
 * @returns {boolean}
 */
export function hasExtractor(screenTypeId) {
  return screenTypeId in EXTRACTORS;
}

/**
 * Get list of supported screen types
 * @returns {string[]}
 */
export function getSupportedTypes() {
  return Object.keys(EXTRACTORS);
}

export {
  extractFlashcard,
  extractFillgap,
  extractMcq,
  extractPhraseBuilder,
  extractMatchup,
  extractTrueFalse,
  extractTyping,
  extractSpelling,
  extractComprehension,
  extractTip,
  extractFeedback,
  extractGeneric,
  waitForFeedback
};

export default {
  extract,
  hasExtractor,
  getSupportedTypes,
  EXTRACTORS
};
