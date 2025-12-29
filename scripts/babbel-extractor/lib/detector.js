/**
 * Babbel Screen Type Detector
 *
 * Detects the current exercise/screen type based on DOM elements
 *
 * Known screen types from research (23 total):
 *
 * Vocabulary:
 *   1. vocab-intro - Introduction of new vocabulary
 *
 * Translation:
 *   2. mcq-translation - Multiple choice translation with images
 *
 * Listening:
 *   3. listening-fill - Listen and fill in the blank
 *   4. listening-choose-said - Listen and choose what is said
 *
 * Grammar:
 *   5. grammar-tip - Grammar explanation with fill-in practice
 *
 * Matching:
 *   6. matching - Match German words to English translations
 *   7. response-matching - Match prompts to responses
 *
 * Building:
 *   8. word-sorting - Build words from syllables
 *   9. sentence-order - Put sentence in correct order
 *   10. spelling - Fill in gaps letter by letter
 *
 * Dialogue:
 *   11. dialogue - Contextual conversation with fill-ins
 *   12. response-choice - Choose appropriate response
 *
 * Pronunciation:
 *   13. pronunciation-fill - Fill-in about pronunciation rules
 *   14. listen-repeat - Listen and repeat (speech recognition)
 *   15. pronunciation-rule - Learn pronunciation rules
 *   16. pronunciation-quiz - Is the sound long or short?
 *
 * Meta/Navigation:
 *   17. lesson-end - Lesson completion screen
 *   18. pronunciation-end - Pronunciation lesson end
 *   19. feedback-popup-tip - Grammar/cultural tip popup
 *   20. recap-intro - Quiz introduction
 *   21. recap-end - Quiz completion
 *   22. formality-choice - Formal vs informal choice
 *   23. story-intro - Story/context introduction
 */

/**
 * Detect the current screen type
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<{type: string, instruction: string|null}>}
 */
export async function detectScreenType(page) {
  const url = page.url();

  // Check for lesson/activity end
  if (url.includes('/activity-end/')) {
    // Check if it's a pronunciation lesson end vs regular lesson end
    const isPronunciation = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('pronunciation') || text.includes('Pronouncing');
    });
    return { type: isPronunciation ? 'pronunciation-end' : 'lesson-end', instruction: null };
  }

  // Check for feedback/streak pages
  if (url.includes('/feedback')) {
    return { type: 'feedback', instruction: null };
  }

  // Get comprehensive page info for detection
  const pageInfo = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return { text: '', instruction: null, hasAnswerButtons: false };

    const fullText = main.textContent || '';

    // Get instruction text
    let instruction = null;
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent.trim();
      if (text.length > 10 && text.length < 100) {
        instruction = text;
        break;
      }
    }

    // Check for various elements
    const hasAnswerButtons = document.querySelectorAll('button[description*="answer"]').length > 0;
    const hasMicrophone = !!document.querySelector('button[description*="microphone"]');
    const hasDeleteButton = !!document.querySelector('button[description="delete"]');
    const hasDoneButton = Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Done'));
    const hasLongShortOptions = fullText.includes('long') && fullText.includes('short');
    const hasFormellInformell = fullText.includes('formell') || fullText.includes('informell');
    const hasNumberedOptions = /\b[1-4]\b/.test(fullText);
    const hasContext = fullText.includes('…') || fullText.length > 300;
    const hasStoryTitle = !!document.querySelector('h1, h2');
    const hasContinueOnly = document.querySelectorAll('button').length <= 2;
    const hasImages = document.querySelectorAll('img').length > 0;

    // Check for popup/tip overlay
    const hasPopup = !!document.querySelector('[role="dialog"]') ||
                     !!document.querySelector('.popup') ||
                     fullText.includes('Got it');

    return {
      text: fullText,
      instruction,
      hasAnswerButtons,
      hasMicrophone,
      hasDeleteButton,
      hasDoneButton,
      hasLongShortOptions,
      hasFormellInformell,
      hasNumberedOptions,
      hasContext,
      hasStoryTitle,
      hasContinueOnly,
      hasImages,
      hasPopup
    };
  });

  const { text, instruction } = pageInfo;

  // === POPUP/TIP DETECTION ===
  if (pageInfo.hasPopup && text.includes('Got it')) {
    return { type: 'feedback-popup-tip', instruction };
  }

  // === META/NAVIGATION SCREENS ===

  // Story introduction - narrative context screen
  if (text.includes('second day') || text.includes('first day') ||
      (pageInfo.hasStoryTitle && pageInfo.hasContinueOnly && !pageInfo.hasAnswerButtons)) {
    const hasNarrativeContent = text.includes('apartment') || text.includes('Berlin') ||
                                text.includes('meeting') || text.includes('story');
    if (hasNarrativeContent) {
      return { type: 'story-intro', instruction };
    }
  }

  // Recap introduction
  if (text.includes('Quiz Time') || text.includes('Los geht') ||
      (text.includes('test what you remember') && pageInfo.hasContinueOnly)) {
    return { type: 'recap-intro', instruction };
  }

  // Recap end
  if (text.includes('Nice work') && (text.includes('Continue') || text.includes('keep going'))) {
    return { type: 'recap-end', instruction };
  }

  // === PRONUNCIATION TYPES ===

  // Listen and repeat (speech recognition)
  if (pageInfo.hasMicrophone || text.includes('Listen and repeat')) {
    return { type: 'listen-repeat', instruction };
  }

  // Pronunciation quiz (long/short)
  if (pageInfo.hasLongShortOptions && (text.includes('long or short') || text.includes('Is the'))) {
    return { type: 'pronunciation-quiz', instruction };
  }

  // Pronunciation rule
  if (text.includes('short and long') || text.includes('The short') || text.includes('The long')) {
    if (pageInfo.hasAnswerButtons) {
      return { type: 'pronunciation-rule', instruction };
    }
  }

  // Pronunciation fill
  if (text.includes('Pronouncing') || (text.includes('pronounced') && pageInfo.hasAnswerButtons)) {
    return { type: 'pronunciation-fill', instruction };
  }

  // === INSTRUCTION-BASED DETECTION ===

  if (instruction) {
    // Vocabulary introduction
    if (instruction.includes("Let's look at your first") || instruction.includes('new German word')) {
      return { type: 'vocab-intro', instruction };
    }

    // MCQ Translation
    if (instruction.includes('Choose the correct translation')) {
      return { type: 'mcq-translation', instruction };
    }

    // Listening - choose what's said
    if (instruction.includes('Listen and choose what is said')) {
      return { type: 'listening-choose-said', instruction };
    }

    // Listening fill or dialogue
    if (instruction.includes('Listen and choose')) {
      return { type: pageInfo.hasContext ? 'dialogue' : 'listening-fill', instruction };
    }

    // Response matching
    if (instruction.includes('Match the correct response')) {
      return { type: 'response-matching', instruction };
    }

    // Regular matching
    if (instruction.includes('Match the items')) {
      return { type: 'matching', instruction };
    }

    // Sentence order
    if (instruction.includes('Put the sentence') || instruction.includes('right order')) {
      return { type: 'sentence-order', instruction };
    }

    // Word sorting
    if (instruction.includes('Sort the items')) {
      return { type: 'word-sorting', instruction };
    }

    // Spelling
    if (instruction.includes('Fill in the gaps') && pageInfo.hasDeleteButton) {
      return { type: 'spelling', instruction };
    }

    // Response choice
    if (instruction.includes('How would you respond')) {
      return { type: 'response-choice', instruction };
    }

    // Formality choice
    if (instruction.includes('formal') && instruction.includes('informal')) {
      return { type: 'formality-choice', instruction };
    }
    if (pageInfo.hasFormellInformell) {
      return { type: 'formality-choice', instruction };
    }

    // Grammar tip
    if (instruction.includes('Introducing') || instruction.includes('To introduce') ||
        instruction.includes('grammar') || instruction.includes('Grammar')) {
      return { type: 'grammar-tip', instruction };
    }
  }

  // === FALLBACK DETECTION ===

  // Spelling (has delete button + letter buttons)
  if (pageInfo.hasDeleteButton && pageInfo.hasDoneButton) {
    return { type: 'spelling', instruction };
  }

  // Formality choice fallback
  if (pageInfo.hasFormellInformell) {
    return { type: 'formality-choice', instruction };
  }

  // Generic exercise with answer buttons
  if (pageInfo.hasAnswerButtons) {
    return { type: 'exercise-unknown', instruction };
  }

  return { type: 'unknown', instruction };
}

/**
 * Get current progress (screen X of Y)
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<{current: number, total: number}|null>}
 */
export async function getProgress(page) {
  return await page.evaluate(() => {
    const nav = document.querySelector('nav');
    if (!nav) return null;

    const text = nav.textContent;
    const match = text.match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      return {
        current: parseInt(match[1]),
        total: parseInt(match[2])
      };
    }
    return null;
  });
}

/**
 * Check if lesson is complete
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<boolean>}
 */
export async function isLessonComplete(page) {
  const url = page.url();
  return url.includes('/activity-end/') || url.includes('/feedback');
}

export default {
  detectScreenType,
  getProgress,
  isLessonComplete
};
