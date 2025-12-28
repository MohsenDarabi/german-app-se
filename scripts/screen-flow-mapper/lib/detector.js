/**
 * Screen Type Detector
 *
 * Detects Busuu screen types based on documented DOM patterns.
 * See: docs/busuu-research/screen-types/
 */

// Screen type definitions based on our research
export const SCREEN_TYPES = {
  // Extractable exercise types
  FLASHCARD: {
    id: 'flashcard',
    name: 'Vocabulary Card',
    selector: '[data-qa-ex="ex-flashcard"]',
    extract: true
  },
  FILLGAP: {
    id: 'fillgap',
    name: 'Fill Gap (Drag & Drop)',
    selector: '[data-qa-ex="ex-fillgap-dragdrop"]',
    extract: true
  },
  PHRASE_BUILDER: {
    id: 'phrase-builder',
    name: 'Word Order (Phrase Builder)',
    selector: '[data-qa-ex="ex-phrase-builder"]',
    extract: true
  },
  MCQ: {
    id: 'mcq',
    name: 'Multiple Choice',
    selector: '[data-qa-ex="ex-mcq"]',
    extract: true
  },
  MATCHUP: {
    id: 'matchup',
    name: 'Matching Pairs',
    selector: '[data-qa-ex="ex-matchup"]',
    extract: true
  },
  TRUE_FALSE: {
    id: 'true-false',
    name: 'True/False',
    selector: '[data-qa-ex="ex-true-false"]',
    extract: true
  },
  TYPING: {
    id: 'typing',
    name: 'Typing Exercise',
    selector: '[data-qa-ex="ex-typing"]',
    extract: true
  },
  SPELLING: {
    id: 'spelling',
    name: 'Spelling / Word Completion',
    selector: '[data-qa-ex="ex-spelling"]',
    extract: true
  },
  COMPREHENSION: {
    id: 'comprehension',
    name: 'Video Comprehension',
    selector: '[data-qa-ex="ex-comprehension"]',
    extract: true
  },
  TIP: {
    id: 'tip',
    name: 'Grammar Tip',
    selector: '[data-qa-ex="ex-tip"]',
    extract: true
  },

  // Pass-through types (detect but don't extract)
  CONVERSATION: {
    id: 'conversation',
    name: 'Community Conversation',
    selector: '[data-qa-ex="ex-conversation"]',
    extract: false,
    passThrough: true
  },

  // Feedback (appears after exercises)
  FEEDBACK: {
    id: 'feedback',
    name: 'Answer Feedback + Tip',
    selector: '[data-testid="feedback-footer"]',
    extract: true,
    isOverlay: true
  },

  // Navigation screens
  LESSON_COMPLETE: {
    id: 'lesson-complete',
    name: 'Lesson Completion',
    selector: '[data-testid="lesson-complete"], .lesson-complete',
    extract: false,
    isEnd: true
  }
};

/**
 * Detect the current screen type
 * @param {import('puppeteer').Page} page - Puppeteer page instance
 * @returns {Promise<{type: object, element: ElementHandle|null}>}
 */
export async function detectScreenType(page) {
  // Check each screen type in order of priority
  for (const [key, type] of Object.entries(SCREEN_TYPES)) {
    const element = await page.$(type.selector);
    if (element) {
      return {
        type,
        key,
        element
      };
    }
  }

  return {
    type: null,
    key: 'UNKNOWN',
    element: null
  };
}

/**
 * Wait for any exercise screen to appear
 * @param {import('puppeteer').Page} page
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<{type: object, key: string, element: ElementHandle}>}
 */
export async function waitForScreen(page, timeout = 10000) {
  const selectors = Object.values(SCREEN_TYPES)
    .map(t => t.selector)
    .join(', ');

  try {
    await page.waitForSelector(selectors, { timeout });
    return await detectScreenType(page);
  } catch (error) {
    throw new Error(`No screen type detected within ${timeout}ms`);
  }
}

/**
 * Check if current screen has feedback overlay
 * @param {import('puppeteer').Page} page
 * @returns {Promise<boolean>}
 */
export async function hasFeedback(page) {
  const feedback = await page.$('[data-testid="feedback-footer"]');
  return !!feedback;
}

/**
 * Check if spelling exercise is word completion variant
 * (has given letters + blanks vs all blanks)
 * @param {import('puppeteer').Page} page
 * @returns {Promise<boolean>}
 */
export async function isWordCompletion(page) {
  const givenLetters = await page.$$('.spelling__word > .font-face-lt');
  const blanks = await page.$$('.spelling__word .ex-btn--dashed');
  return givenLetters.length > 0 && blanks.length > 0;
}

/**
 * Check if fillgap has multiple blanks
 * @param {import('puppeteer').Page} page
 * @returns {Promise<number>}
 */
export async function countFillgapBlanks(page) {
  const blanks = await page.$$('.fillgap-dragdrop__btn');
  return blanks.length;
}

export default {
  SCREEN_TYPES,
  detectScreenType,
  waitForScreen,
  hasFeedback,
  isWordCompletion,
  countFillgapBlanks
};
