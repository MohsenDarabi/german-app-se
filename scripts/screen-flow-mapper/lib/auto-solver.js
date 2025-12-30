/**
 * Auto-Solver Module
 *
 * Automatically completes Busuu exercises by clicking correct answers.
 * Uses data-qa-pass attributes to identify correct options.
 */

/**
 * Sleep helper
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Auto-solve the current exercise
 * @param {import('puppeteer').Page} page
 * @returns {Promise<{solved: boolean, method: string}>}
 */
export async function solveExercise(page) {
  // Try each solver in order
  const solvers = [
    { name: 'conversation', fn: solveConversation }, // Skip community exercises first
    { name: 'tip', fn: solveTip }, // Grammar tips - just informational
    { name: 'flashcard', fn: solveFlashcard },
    { name: 'typing', fn: solveTyping },
    { name: 'true-false', fn: solveTrueFalse },
    { name: 'mcq', fn: solveMCQ },
    { name: 'highlighter', fn: solveHighlighter }, // Word highlighter - click ALL correct words
    { name: 'fillgap', fn: solveFillgap },
    { name: 'word-order', fn: solveWordOrder },
    { name: 'matchup', fn: solveMatchup },
    { name: 'spelling', fn: solveSpelling },
    { name: 'generic', fn: solveGeneric }
  ];

  for (const solver of solvers) {
    try {
      const result = await solver.fn(page);
      if (result) {
        return { solved: true, method: `${solver.name}: ${result}` };
      }
    } catch (error) {
      // Continue to next solver
    }
  }

  return { solved: false, method: 'none' };
}

/**
 * Conversation/Community exercise - skip by clicking Continue
 * These have Speak/Write buttons for community feedback (can't automate)
 */
async function solveConversation(page) {
  // Check for conversation exercise
  const isConversation = await page.$('[data-qa-ex="ex-conversation"]');
  if (!isConversation) {
    // Also check for speak/write button combination (community exercise)
    const hasSpeakWrite = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button')];
      const hasSpeak = buttons.some(b => b.textContent?.trim().toLowerCase() === 'speak');
      const hasWrite = buttons.some(b => b.textContent?.trim().toLowerCase() === 'write');
      return hasSpeak && hasWrite;
    });
    if (!hasSpeakWrite) return null;
  }

  // Click the Continue button in the feedback footer
  const clicked = await page.evaluate(() => {
    // Try feedback bar continue button first
    const continueBtn = document.querySelector(
      '[data-testid="check_button"], ' +
      '.ex-feedback-bar__button, ' +
      '[data-qa-feedback-cta], ' +
      'button.sc-gsDKAQ'
    );
    if (continueBtn && continueBtn.offsetParent !== null) {
      continueBtn.click();
      return 'continue';
    }

    // Try any button with "Continue" text
    const buttons = [...document.querySelectorAll('button')];
    const contBtn = buttons.find(b =>
      b.textContent?.trim().toLowerCase() === 'continue' &&
      b.offsetParent !== null
    );
    if (contBtn) {
      contBtn.click();
      return 'continue (text)';
    }

    // Try close button
    const closeBtn = document.querySelector('button[aria-label*="close"], button[aria-label*="Close"]');
    if (closeBtn) {
      closeBtn.click();
      return 'close';
    }

    return null;
  });

  return clicked ? `skip-community: ${clicked}` : null;
}

/**
 * Grammar Tip - just informational, click Continue
 */
async function solveTip(page) {
  const isTip = await page.$('[data-qa-ex="ex-tip"]');
  if (!isTip) return null;
  return 'continue (informational)';
}

/**
 * Word Highlighter - click ALL buttons with data-qa-pass="true"
 */
async function solveHighlighter(page) {
  const isHighlighter = await page.$('[data-qa-ex="ex-highlighter"]');
  if (!isHighlighter) return null;

  // Click ALL buttons with data-qa-pass="true" that aren't already selected
  const clicked = await page.evaluate(() => {
    const buttons = document.querySelectorAll('[data-qa-ex="ex-highlighter"] button[data-qa-pass="true"]');
    const clickedWords = [];

    for (const btn of buttons) {
      // Skip if already selected
      if (btn.classList.contains('ex-btn--selected')) continue;

      // Check if clickable
      if (btn.offsetParent !== null) {
        btn.click();
        clickedWords.push(btn.textContent?.trim());
      }
    }

    return clickedWords;
  });

  if (clicked.length > 0) {
    await sleep(200);
    return clicked.join(' + ');
  }

  // All correct words might already be selected
  return 'already complete';
}

/**
 * Flashcard - just needs Continue button
 */
async function solveFlashcard(page) {
  const isFlashcard = await page.$('[data-qa-ex="ex-flashcard"]');
  if (!isFlashcard) return null;
  return 'continue';
}

/**
 * Typing exercise - type the correct answer
 */
async function solveTyping(page) {
  const typingSelector = '.ex-typing__input:not([disabled])';
  const typingInput = await page.$(typingSelector);

  if (!typingInput) return null;

  const correctAnswer = await page.evaluate(sel => {
    const input = document.querySelector(sel);
    return input?.getAttribute('data-qa-pass');
  }, typingSelector);

  if (correctAnswer) {
    await typingInput.click({ clickCount: 3 }); // Select all
    await typingInput.type(correctAnswer);
    return correctAnswer;
  }

  return null;
}

/**
 * True/False exercise
 */
async function solveTrueFalse(page) {
  return await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const trueBtn = buttons.find(b => b.textContent?.trim().toLowerCase() === 'true');
    const falseBtn = buttons.find(b => b.textContent?.trim().toLowerCase() === 'false');

    if (!trueBtn || !falseBtn) return null;

    const trueIsCorrect = trueBtn.getAttribute('data-qa-pass') === 'true';
    const falseIsCorrect = falseBtn.getAttribute('data-qa-pass') === 'true';

    if (trueIsCorrect) {
      trueBtn.click();
      return 'True';
    } else if (falseIsCorrect) {
      falseBtn.click();
      return 'False';
    } else {
      trueBtn.click();
      return 'True (guessed)';
    }
  });
}

/**
 * Multiple Choice exercise
 */
async function solveMCQ(page) {
  return await page.evaluate(() => {
    const isClickable = (el) => {
      if (!el || el.offsetParent === null) return false;
      const style = window.getComputedStyle(el);
      return style.pointerEvents !== 'none' && style.opacity !== '0' &&
             !el.disabled && !el.classList.contains('disabled');
    };

    const mcqOptions = document.querySelectorAll(
      '[data-qa-ex="ex-mcq"] button[data-qa-choice="true"], .ex-mcq__options button.ex-btn'
    );
    const clickable = [...mcqOptions].filter(isClickable);

    if (clickable.length === 0) return null;

    const correctOption = clickable.find(b => b.getAttribute('data-qa-pass') === 'true');
    const optionToClick = correctOption || clickable[0];
    optionToClick.click();

    return optionToClick.textContent?.trim().substring(0, 30);
  });
}

/**
 * Fill-gap / Drag-drop exercise
 */
async function solveFillgap(page) {
  // Get the words to click in order
  const wordsToClick = await page.evaluate(() => {
    const isClickable = (el) => {
      if (!el || el.offsetParent === null) return false;
      const style = window.getComputedStyle(el);
      return style.pointerEvents !== 'none' && style.opacity !== '0' &&
             !el.disabled && !el.classList.contains('disabled') &&
             !el.classList.contains('ex-btn--disabled');
    };

    // Find drag options
    const dragOptions = document.querySelectorAll(
      '.fillgap-dragdrop__options .ex-btn[role="button"], ' +
      '[role="button"][aria-label^="Drag item:"], ' +
      '.ex-btn[role="button"][data-qa-pass][draggable="true"]'
    );
    const clickable = [...dragOptions].filter(b => isClickable(b) && b.textContent?.trim());

    if (clickable.length === 0) return null;

    // Sort by data-qa-pass (1, 2, 3... for correct order)
    const sorted = clickable.sort((a, b) => {
      const passA = parseInt(a.getAttribute('data-qa-pass') || '99');
      const passB = parseInt(b.getAttribute('data-qa-pass') || '99');
      return passA - passB;
    });

    return sorted.map(b => ({
      text: b.textContent?.trim(),
      pass: b.getAttribute('data-qa-pass')
    }));
  });

  if (!wordsToClick || wordsToClick.length === 0) return null;

  // Click each word with delay
  const clicked = [];
  for (const word of wordsToClick) {
    await page.evaluate((passValue) => {
      const btn = document.querySelector(
        `.ex-btn[role="button"][data-qa-pass="${passValue}"]:not(.ex-btn--disabled), ` +
        `[role="button"][data-qa-pass="${passValue}"]:not(.ex-btn--disabled)`
      );
      if (btn) btn.click();
    }, word.pass);
    clicked.push(word.text);
    await sleep(150);
  }

  return clicked.join(' ');
}

/**
 * Word order / Phrase builder exercise
 */
async function solveWordOrder(page) {
  const isWordOrder = await page.$('[data-qa-ex="ex-phrase-builder"]');
  if (!isWordOrder) return null;

  // Same logic as fillgap
  return await solveFillgap(page);
}

/**
 * Matching pairs exercise
 */
async function solveMatchup(page) {
  const isMatchup = await page.$('[data-qa-ex="ex-matchup"]');
  if (!isMatchup) return null;

  return await page.evaluate(() => {
    const isClickable = (el) => {
      if (!el || el.offsetParent === null) return false;
      const style = window.getComputedStyle(el);
      return style.pointerEvents !== 'none' && style.opacity !== '0' &&
             !el.disabled && !el.classList.contains('disabled');
    };

    const matchupItems = document.querySelectorAll('[data-qa-ex="ex-matchup"] [role="button"][data-qa-pass]');
    const clickable = [...matchupItems].filter(isClickable);

    if (clickable.length === 0) return null;

    // Group by type (answer vs asset)
    const answers = clickable.filter(el => el.getAttribute('data-qa-type') === 'answer');
    const assets = clickable.filter(el => el.getAttribute('data-qa-type') === 'asset');

    const matched = [];
    for (const answer of answers) {
      const passValue = answer.getAttribute('data-qa-pass');
      const matchingAsset = assets.find(a =>
        a.getAttribute('data-qa-pass') === passValue && isClickable(a)
      );

      if (matchingAsset && isClickable(answer)) {
        answer.click();
        matchingAsset.click();
        matched.push(answer.textContent?.trim().substring(0, 15));
      }
    }

    return matched.length > 0 ? matched.join(' + ') : null;
  });
}

/**
 * Spelling exercise - click letters in order
 */
async function solveSpelling(page) {
  const isSpelling = await page.$('[data-qa-ex="ex-spelling"]');
  if (!isSpelling) return null;

  // Get letter buttons sorted by data-qa-pass
  const letters = await page.evaluate(() => {
    const letterBtns = document.querySelectorAll('.spelling__options .ex-btn[data-qa-pass]');
    const sorted = [...letterBtns].sort((a, b) => {
      const passA = parseInt(a.getAttribute('data-qa-pass') || '99');
      const passB = parseInt(b.getAttribute('data-qa-pass') || '99');
      return passA - passB;
    });
    return sorted.map(b => ({
      text: b.textContent?.trim(),
      pass: b.getAttribute('data-qa-pass')
    }));
  });

  if (!letters || letters.length === 0) return null;

  for (const letter of letters) {
    await page.evaluate((passValue) => {
      const btn = document.querySelector(`.spelling__options .ex-btn[data-qa-pass="${passValue}"]`);
      if (btn) btn.click();
    }, letter.pass);
    await sleep(100);
  }

  return letters.map(l => l.text).join('');
}

/**
 * Generic fallback - click any correct option button
 */
async function solveGeneric(page) {
  return await page.evaluate(() => {
    const isClickable = (el) => {
      if (!el || el.offsetParent === null) return false;
      const style = window.getComputedStyle(el);
      return style.pointerEvents !== 'none' && style.opacity !== '0' &&
             !el.disabled && !el.classList.contains('disabled');
    };

    // Try to find any button with data-qa-pass="true" or "1"
    const correctBtns = document.querySelectorAll(
      'button[data-qa-pass="true"], button[data-qa-pass="1"], ' +
      '.ex-btn[data-qa-pass="true"], .ex-btn[data-qa-pass="1"]'
    );

    for (const btn of correctBtns) {
      if (isClickable(btn)) {
        btn.click();
        return btn.textContent?.trim().substring(0, 30);
      }
    }

    return null;
  });
}

export default { solveExercise };
