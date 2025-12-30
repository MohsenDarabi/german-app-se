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

  // Word Highlighter - select multiple correct words
  HIGHLIGHTER: {
    id: 'highlighter',
    name: 'Word Highlighter',
    selector: '[data-qa-ex="ex-highlighter"]',
    extract: true
  },

  // Generic exercise fallback - catches any data-qa-ex we haven't defined
  GENERIC_EXERCISE: {
    id: 'generic-exercise',
    name: 'Generic Exercise',
    selector: '[data-qa-ex]',
    extract: true
  },

  // Feedback (appears after exercises) - checked LAST among exercises
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
  },

  // Well Done / Summary screens (should skip)
  WELL_DONE: {
    id: 'well-done',
    name: 'Well Done Screen',
    selector: '[class*="summary"], [class*="Summary"], [class*="result"], [class*="Result"]',
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
    // Special handling for FEEDBACK - only match if no active exercise
    if (key === 'FEEDBACK') {
      const hasActiveExercise = await page.evaluate(() => {
        // Check if there are clickable answer buttons (active exercise)
        const answerBtns = document.querySelectorAll('button[data-qa-pass], button[data-qa-choice]');
        const clickableAnswers = [...answerBtns].filter(b => {
          const style = window.getComputedStyle(b);
          return b.offsetParent !== null && style.pointerEvents !== 'none';
        });
        return clickableAnswers.length > 0;
      });

      if (hasActiveExercise) {
        // Skip FEEDBACK detection, there's an active exercise
        continue;
      }
    }

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
 * Check if current screen has VISIBLE feedback overlay with actual content
 * (and we're NOT on a completion/well-done screen)
 * @param {import('puppeteer').Page} page
 * @returns {Promise<boolean>}
 */
export async function hasFeedback(page) {
  return await page.evaluate(() => {
    // First, check if we're on a completion/well-done/summary screen - these are NOT feedback
    const completionIndicators = [
      'Well done',
      'Lesson complete',
      'Congratulations',
      'Great job',
      'challenges',          // Matches "Today's challenges" regardless of apostrophe
      'Earn 20 stars',
      'Complete 3 lessons',
      'Score over 80%',
      'Bronze League',
      'Silver League',
      'Gold League',
      'Welcome to the',
      'Keep it up',
      'on a streak',         // Matches "You're on a streak" regardless of apostrophe
      'Daily goal',
      'XP earned'
    ];

    const bodyText = document.body?.innerText || '';
    const isCompletionScreen = completionIndicators.some(text =>
      bodyText.toLowerCase().includes(text.toLowerCase())
    );

    // Also check for summary/result classes
    const hasSummaryClass = !!document.querySelector(
      '[class*="summary"], [class*="Summary"], [class*="result"], [class*="Result"], [class*="complete"], [class*="Complete"]'
    );

    if (isCompletionScreen || hasSummaryClass) {
      return false; // Not feedback, it's a completion screen
    }

    const feedback = document.querySelector('[data-testid="feedback-footer"]');
    if (!feedback) return false;

    // Check if actually visible (not hidden)
    const style = window.getComputedStyle(feedback);
    const isVisible = style.display !== 'none' &&
                      style.visibility !== 'hidden' &&
                      style.opacity !== '0' &&
                      feedback.offsetParent !== null;

    if (!isVisible) return false;

    // IMPORTANT: Also check that feedback has actual tip content
    // This prevents false positives when feedback element exists but is empty
    const footer = feedback.querySelector('footer');
    const tipText = footer?.textContent?.trim() || '';

    // Must have some meaningful tip text (at least 10 chars)
    return tipText.length >= 10;
  });
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

/**
 * Check if we're on an interstitial page that should be clicked through (not an exercise)
 * These are reward/progress screens that appear BETWEEN exercises
 * @param {import('puppeteer').Page} page
 * @returns {Promise<boolean>}
 */
export async function isInterstitialPage(page) {
  return await page.evaluate(() => {
    const interstitialIndicators = [
      'Checkpoint completed',
      'challenges',          // Matches "Today's challenges" regardless of apostrophe
      'Earn 20 stars',       // Specific text from Today's challenges screen
      'Complete 3 lessons',  // Another specific text
      'Score over 80%',      // Another challenge text
      'Bronze League',
      'Silver League',
      'Gold League',
      'Welcome to the',
      'Keep it up',
      'on a streak',         // Matches "You're on a streak" regardless of apostrophe
      'Daily goal',
      'XP earned',
      'Challenge completed',
      'New achievement',
      'Level up',
      'Great job',
      'Congratulations'
    ];

    // Normalize text by replacing fancy apostrophes with regular ones
    const bodyText = (document.body?.innerText || '').replace(/[\u2018\u2019]/g, "'");
    return interstitialIndicators.some(text =>
      bodyText.toLowerCase().includes(text.toLowerCase())
    );
  });
}

/**
 * Check if lesson has actually ended (back to timeline or explicit completion)
 * @param {import('puppeteer').Page} page
 * @returns {Promise<boolean>}
 */
export async function isLessonEnded(page) {
  return await page.evaluate(() => {
    const url = window.location.href;

    // If we're back on timeline, lesson is done
    if (url.includes('/timeline/') && !url.includes('/course/') && !url.includes('/learning/')) {
      return true;
    }

    // Check for explicit lesson completion indicators
    // Note: "Well done" can be "Well done!", "Well done mohsen!", etc.
    const endIndicators = [
      'Lesson complete',
      'Well done',  // Matches "Well done!", "Well done mohsen!", etc.
      'lesson finished'
    ];

    const bodyText = document.body?.innerText || '';

    // Also check for vocabulary summary section (appears on lesson complete screen)
    const hasVocabSummary = bodyText.includes('VOCABULARY') &&
                           (bodyText.includes('Stars') || bodyText.includes('Score'));

    return hasVocabSummary || endIndicators.some(text =>
      bodyText.toLowerCase().includes(text.toLowerCase())
    );
  });
}

/**
 * Check if we're on a page that should be skipped (not an exercise)
 * @param {import('puppeteer').Page} page
 * @returns {Promise<boolean>}
 * @deprecated Use isInterstitialPage() or isLessonEnded() instead
 */
export async function isSkipPage(page) {
  // Keep for backwards compatibility - combines both checks
  const isInterstitial = await isInterstitialPage(page);
  const isEnded = await isLessonEnded(page);
  return isInterstitial || isEnded;
}

export default {
  SCREEN_TYPES,
  detectScreenType,
  waitForScreen,
  hasFeedback,
  isSkipPage,
  isInterstitialPage,
  isLessonEnded,
  isWordCompletion,
  countFillgapBlanks
};
