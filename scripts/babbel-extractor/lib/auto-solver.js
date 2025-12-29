/**
 * Babbel Auto-Solver
 *
 * Automatically completes exercises to progress through lessons
 *
 * Supports all 23 screen types discovered in research.
 */

/**
 * Solve the current exercise based on its type
 * @param {Page} page - Puppeteer page object
 * @param {string} type - Screen type from detector
 * @returns {Promise<boolean>} - Whether solve was successful
 */
export async function solveExercise(page, type) {
  const solvers = {
    // Vocabulary
    'vocab-intro': solveVocabIntro,

    // Translation
    'mcq-translation': solveMcq,

    // Listening
    'listening-fill': solveListeningFill,
    'listening-choose-said': solveListeningChooseSaid,

    // Grammar
    'grammar-tip': solveGrammarTip,

    // Matching
    'matching': solveMatching,
    'response-matching': solveResponseMatching,

    // Building
    'word-sorting': solveWordSorting,
    'sentence-order': solveSentenceOrder,
    'spelling': solveSpelling,

    // Dialogue
    'dialogue': solveDialogue,
    'response-choice': solveResponseChoice,

    // Pronunciation
    'pronunciation-fill': solvePronunciationFill,
    'listen-repeat': solveListenRepeat,
    'pronunciation-rule': solvePronunciationRule,
    'pronunciation-quiz': solvePronunciationQuiz,

    // Meta/Navigation
    'lesson-end': solveLessonEnd,
    'pronunciation-end': solveLessonEnd,
    'feedback-popup-tip': solveFeedbackPopup,
    'recap-intro': solveRecapIntro,
    'recap-end': solveRecapEnd,
    'formality-choice': solveFormalityChoice,
    'story-intro': solveStoryIntro,

    // Fallbacks
    'feedback': solveFeedback,
    'exercise-unknown': solveGeneric
  };

  const solver = solvers[type];
  if (!solver) {
    console.log(`No solver for type: ${type}`);
    return false;
  }

  try {
    await solver(page);
    return true;
  } catch (error) {
    console.error(`Error solving ${type}:`, error.message);
    return false;
  }
}

/**
 * Vocab intro - click the forward arrow (>) in navigation to progress
 * The screen shows vocabulary with a word card - advance via nav arrow
 */
async function solveVocabIntro(page) {
  await page.evaluate(() => {
    // Direct selector for forward navigation button
    const forwardBtn = document.querySelector('[data-selector="navigation-forward"]');
    if (forwardBtn && !forwardBtn.disabled) {
      forwardBtn.click();
      return;
    }

    // Fallback: look for button with title containing "next"
    const allBtns = document.querySelectorAll('button');
    for (const btn of allBtns) {
      const title = (btn.getAttribute('title') || '').toLowerCase();
      if (title.includes('next') || title.includes('forward')) {
        btn.click();
        return;
      }
    }
  });
  await page.waitForTimeout(500);
}

/**
 * MCQ Translation - find and click correct answer tile then advance
 * The correct tile has the same data-item-id as the prompt
 */
async function solveMcq(page) {
  // Check if there are tiles to click
  const hasTiles = await page.evaluate(() => {
    return document.querySelector('[data-selector="vocabulary-click-tile"]') !== null ||
           document.querySelector('button[data-correct]') !== null;
  });

  if (hasTiles) {
    await page.evaluate(() => {
      // Get the prompt item's ID
      const promptBtn = document.querySelector('[data-selector="vocabulary-click-ll-item"]');
      if (promptBtn) {
        const targetId = promptBtn.getAttribute('data-item-id');
        if (targetId) {
          // Find the tile with matching ID
          const tiles = document.querySelectorAll('[data-selector="vocabulary-click-tile"]');
          for (const tile of tiles) {
            if (tile.getAttribute('data-item-id') === targetId) {
              tile.click();
              return;
            }
          }
        }
      }

      // Fallback: try data-correct="true" button
      const correctBtn = document.querySelector('button[data-correct="true"]');
      if (correctBtn) {
        correctBtn.click();
        return;
      }

      // Second fallback: click first tile
      const firstTile = document.querySelector('[data-selector="vocabulary-click-tile"]');
      if (firstTile) {
        firstTile.click();
      }
    });
    await page.waitForTimeout(800);
  }

  // After answering, click forward nav to advance
  await page.evaluate(() => {
    const forwardBtn = document.querySelector('[data-selector="navigation-forward"]');
    if (forwardBtn && !forwardBtn.disabled) {
      forwardBtn.click();
    }
  });
  await page.waitForTimeout(500);
}

/**
 * Listening fill-in - click correct answer button (choice items) then advance
 */
async function solveListeningFill(page) {
  // First check if we need to answer or just advance
  const hasChoices = await page.evaluate(() => {
    return document.querySelector('button[data-correct]') !== null ||
           document.querySelector('button[data-selector^="choice-item"]') !== null;
  });

  if (hasChoices) {
    await page.evaluate(() => {
      // First try: find button with data-correct="true"
      const correctBtn = document.querySelector('button[data-correct="true"]');
      if (correctBtn) {
        correctBtn.click();
        return;
      }

      // Second try: find choice-item buttons
      const choiceBtn = document.querySelector('button[data-selector^="choice-item"]');
      if (choiceBtn) {
        choiceBtn.click();
        return;
      }

      // Third try: buttons with title starting with "answer"
      const allBtns = document.querySelectorAll('button');
      for (const btn of allBtns) {
        const title = btn.getAttribute('title') || '';
        if (title.startsWith('answer')) {
          btn.click();
          return;
        }
      }
    });
    await page.waitForTimeout(800);
  }

  // After answering (or if already answered), click forward nav to advance
  await page.evaluate(() => {
    const forwardBtn = document.querySelector('[data-selector="navigation-forward"]');
    if (forwardBtn && !forwardBtn.disabled) {
      forwardBtn.click();
    }
  });
  await page.waitForTimeout(500);
}

/**
 * Grammar tip - click answer to fill in blank then advance
 */
async function solveGrammarTip(page) {
  // Check if there are answers to click
  const hasAnswers = await page.evaluate(() => {
    return document.querySelector('button[data-correct]') !== null ||
           document.querySelector('button[data-selector^="choice-item"]') !== null ||
           document.querySelector('button[title^="answer"]') !== null;
  });

  if (hasAnswers) {
    await page.evaluate(() => {
      // First try: find button with data-correct="true"
      const correctBtn = document.querySelector('button[data-correct="true"]');
      if (correctBtn) {
        correctBtn.click();
        return;
      }

      // Second try: find choice-item buttons
      const choiceBtn = document.querySelector('button[data-selector^="choice-item"]');
      if (choiceBtn) {
        choiceBtn.click();
        return;
      }

      // Third try: buttons with title starting with "answer"
      const allBtns = document.querySelectorAll('button');
      for (const btn of allBtns) {
        const title = btn.getAttribute('title') || '';
        if (title.startsWith('answer')) {
          btn.click();
          return;
        }
      }
    });
    await page.waitForTimeout(800);
  }

  // After answering (or if already answered), click forward nav to advance
  await page.evaluate(() => {
    const forwardBtn = document.querySelector('[data-selector="navigation-forward"]');
    if (forwardBtn && !forwardBtn.disabled) {
      forwardBtn.click();
    }
  });
  await page.waitForTimeout(500);
}

/**
 * Matching - click numbered options to match pairs
 */
async function solveMatching(page) {
  // Keep clicking available options until all matched
  for (let i = 0; i < 10; i++) {
    const clicked = await page.evaluate(() => {
      const options = document.querySelectorAll('main [role="generic"]:not([disabled])');
      for (const opt of options) {
        const text = opt.textContent;
        // Click numbered options (1, 2, 3, 4)
        if (/^\d/.test(text.trim())) {
          opt.click();
          return true;
        }
      }
      return false;
    });

    if (!clicked) break;
    await page.waitForTimeout(400);
  }
}

/**
 * Word sorting - click syllables in correct order
 */
async function solveWordSorting(page) {
  // Click answer buttons in order (they appear in correct order usually)
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button[description*="answer"]:not([disabled])');
      if (buttons.length > 0) {
        buttons[0].click();
      }
    });
    await page.waitForTimeout(300);
  }
}

/**
 * Dialogue - fill in all blanks in sequence
 */
async function solveDialogue(page) {
  // Keep filling blanks until dialogue is complete
  for (let i = 0; i < 10; i++) {
    const hasMoreBlanks = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button[description*="answer"]:not([disabled])');
      if (buttons.length > 0) {
        buttons[0].click();
        return true;
      }
      return false;
    });

    if (!hasMoreBlanks) {
      // Check for Continue button
      const continued = await page.evaluate(() => {
        const continueBtn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent.includes('Continue'));
        if (continueBtn && !continueBtn.disabled) {
          continueBtn.click();
          return true;
        }
        return false;
      });
      if (continued) break;
    }

    await page.waitForTimeout(400);
  }
}

/**
 * Lesson end - click close or continue
 */
async function solveLessonEnd(page) {
  await page.evaluate(() => {
    // Click close button
    const closeBtn = document.querySelector('button[description="Close"]');
    if (closeBtn) {
      closeBtn.click();
      return;
    }

    // Or any button with Close text
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Close') || btn.textContent.includes('Continue')) {
        btn.click();
        break;
      }
    }
  });
  await page.waitForTimeout(500);
}

/**
 * Feedback/streak page - click continue
 */
async function solveFeedback(page) {
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Continue')) {
        btn.click();
        break;
      }
    }
  });
  await page.waitForTimeout(500);
}

/**
 * Generic solver - try clicking any available answer button
 */
async function solveGeneric(page) {
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button[description*="answer"]:not([disabled])');
    if (buttons.length > 0) {
      buttons[0].click();
    }
  });
  await page.waitForTimeout(500);
}

// ============================================================
// NEW SOLVERS FOR ALL 23 SCREEN TYPES
// ============================================================

/**
 * Listening - choose what is said (click correct audio option)
 */
async function solveListeningChooseSaid(page) {
  // Similar to MCQ but for audio options
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button[description*="answer"]');
    if (buttons.length > 0) {
      buttons[0].click();
    }
  });
  await page.waitForTimeout(500);
}

/**
 * Response matching - match prompts to responses
 */
async function solveResponseMatching(page) {
  // Click numbered options to match
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => {
      const options = document.querySelectorAll('main button:not([disabled])');
      for (const opt of options) {
        const text = opt.textContent.trim();
        if (/^[1-4]$/.test(text)) {
          opt.click();
          return;
        }
      }
    });
    await page.waitForTimeout(400);
  }
}

/**
 * Sentence order - arrange words in correct order
 */
async function solveSentenceOrder(page) {
  // Click word tiles in order
  for (let i = 0; i < 10; i++) {
    const clicked = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button[description*="answer"]:not([disabled])');
      if (buttons.length > 0) {
        buttons[0].click();
        return true;
      }
      return false;
    });
    if (!clicked) break;
    await page.waitForTimeout(300);
  }
}

/**
 * Spelling - click letters in correct order then Done
 */
async function solveSpelling(page) {
  // This is tricky - we need to click letters in the right order
  // For auto-solving, we'll try clicking available letters
  for (let i = 0; i < 15; i++) {
    const hasMore = await page.evaluate(() => {
      const letterBtns = document.querySelectorAll('button[description*="answer"]:not([disabled])');
      if (letterBtns.length > 0) {
        letterBtns[0].click();
        return true;
      }
      return false;
    });
    if (!hasMore) break;
    await page.waitForTimeout(200);
  }

  // Click Done button
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Done')) {
        btn.click();
        break;
      }
    }
  });
  await page.waitForTimeout(500);
}

/**
 * Response choice - choose appropriate response
 */
async function solveResponseChoice(page) {
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button[description*="answer"]');
    if (buttons.length > 0) {
      buttons[0].click();
    }
  });
  await page.waitForTimeout(500);
}

/**
 * Pronunciation fill - fill in pronunciation rule
 */
async function solvePronunciationFill(page) {
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button[description*="answer"]');
    if (buttons.length > 0) {
      buttons[0].click();
    }
  });
  await page.waitForTimeout(500);
}

/**
 * Listen and repeat - skip speech recognition exercise
 */
async function solveListenRepeat(page) {
  // Can't automate microphone, use "To next trainer" button
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const desc = btn.getAttribute('description') || '';
      const text = btn.textContent || '';
      if (desc.includes('next trainer') || text.includes('next trainer') ||
          desc.includes('Next') || text.includes('Skip')) {
        btn.click();
        return;
      }
    }
    // Fallback: click any navigation button
    const navBtn = document.querySelector('button[description*="To next"]');
    if (navBtn) navBtn.click();
  });
  await page.waitForTimeout(500);
}

/**
 * Pronunciation rule - fill in blanks about rules
 */
async function solvePronunciationRule(page) {
  // Fill in all blanks
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button[description*="answer"]:not([disabled])');
      if (buttons.length > 0) {
        buttons[0].click();
      }
    });
    await page.waitForTimeout(300);
  }
}

/**
 * Pronunciation quiz - choose long or short
 */
async function solvePronunciationQuiz(page) {
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const text = btn.textContent.toLowerCase();
      if (text.includes('long') || text.includes('short')) {
        btn.click();
        break;
      }
    }
  });
  await page.waitForTimeout(500);
}

/**
 * Feedback popup tip - click "Got it" to dismiss
 */
async function solveFeedbackPopup(page) {
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Got it')) {
        btn.click();
        return;
      }
    }
  });
  await page.waitForTimeout(500);
}

/**
 * Recap intro - click answer to start quiz
 */
async function solveRecapIntro(page) {
  await page.evaluate(() => {
    // Click the "Los geht's" answer or Continue button
    const buttons = document.querySelectorAll('button[description*="answer"]');
    if (buttons.length > 0) {
      buttons[0].click();
      return;
    }
    // Fallback to Continue
    const allBtns = document.querySelectorAll('button');
    for (const btn of allBtns) {
      if (btn.textContent.includes('Continue') || btn.textContent.includes('Start')) {
        btn.click();
        break;
      }
    }
  });
  await page.waitForTimeout(500);
}

/**
 * Recap end - click Continue
 */
async function solveRecapEnd(page) {
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Continue')) {
        btn.click();
        break;
      }
    }
  });
  await page.waitForTimeout(500);
}

/**
 * Formality choice - choose formell or informell
 */
async function solveFormalityChoice(page) {
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const text = btn.textContent.toLowerCase();
      if (text.includes('formell') || text.includes('informell')) {
        btn.click();
        break;
      }
    }
  });
  await page.waitForTimeout(500);
}

/**
 * Story intro - click Continue to proceed
 */
async function solveStoryIntro(page) {
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Continue')) {
        btn.click();
        break;
      }
    }
  });
  await page.waitForTimeout(500);
}

export default {
  solveExercise
};
