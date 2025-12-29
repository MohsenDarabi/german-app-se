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
 * Matching - match items by data-solution-id then advance
 *
 * DOM Pattern (Babbel):
 * - Active base item: [data-appearance="ACTIVE"] [data-solution-id="X"]
 * - Options: [data-selector="matching-item-option"] contains [data-solution-id="X"]
 * - The focusable/clickable element is [data-selector="matching-item-option"] with tabindex="0"
 *
 * IMPORTANT: JavaScript .click() doesn't work on Babbel's React elements.
 * Must use Puppeteer's native page.click() with selector.
 *
 * IMPORTANT: Click [data-selector="matching-item-option"] element, not the outer wrapper.
 * The wrapper has data-clickable-item="true" but the actual clickable element is the inner div.
 */
async function solveMatching(page) {
  // Keep matching until no more active base items
  // After each match, wait for DOM update and check for next active item

  for (let i = 0; i < 10; i++) { // Max 10 pairs
    // Wait for DOM to stabilize after previous match
    await page.waitForTimeout(1000);

    // Get the target solution-id from active base
    const targetInfo = await page.evaluate(() => {
      const activeBase = document.querySelector('[data-appearance="ACTIVE"] [data-solution-id]');
      if (!activeBase) return null;
      return {
        targetId: activeBase.getAttribute('data-solution-id'),
        activeText: activeBase.textContent.substring(0, 30)
      };
    });

    if (!targetInfo) {
      // Check how many unmatched options remain
      const remainingOptions = await page.$$eval(
        '[data-item-type="option"]:not([data-matched-item="true"])',
        els => els.length
      );
      if (remainingOptions === 0) {
        console.log(`  [matching] All pairs matched`);
      } else {
        console.log(`  [matching] No active base found but ${remainingOptions} options remain`);
      }
      break;
    }

    console.log(`  [matching] Looking for match for "${targetInfo.activeText}" (id: ${targetInfo.targetId})`);

    // Find and click the matching option using Puppeteer's native click
    const wrappers = await page.$$('[data-item-type="option"]:not([data-matched-item="true"])');
    let clicked = false;

    for (const wrapper of wrappers) {
      // Check if this wrapper contains the matching solution-id
      const hasMatch = await wrapper.evaluate((el, targetId) => {
        const solutionEl = el.querySelector(`[data-solution-id="${targetId}"]`);
        return !!solutionEl;
      }, targetInfo.targetId);

      if (hasMatch) {
        // Get the clickable element inside
        const clickable = await wrapper.$('[data-selector="matching-item-option"]');
        if (clickable) {
          // Use CDP click for trusted events that React accepts
          await clickable.scrollIntoViewIfNeeded();
          const box = await clickable.boundingBox();
          if (box) {
            const client = await page.target().createCDPSession();
            const x = box.x + box.width / 2;
            const y = box.y + box.height / 2;
            await client.send('Input.dispatchMouseEvent', {
              type: 'mousePressed',
              x, y,
              button: 'left',
              clickCount: 1
            });
            await client.send('Input.dispatchMouseEvent', {
              type: 'mouseReleased',
              x, y,
              button: 'left',
              clickCount: 1
            });
            await client.detach();
            const matchText = await clickable.evaluate(el => el.textContent.substring(0, 30));
            console.log(`  [matching] Clicked match: "${matchText}"`);
            clicked = true;
            break;
          }
        }
      }
    }

    if (!clicked) {
      console.log(`  [matching] Could not find match for "${targetInfo.activeText}"`);
      // Don't break - maybe the match happened and we need to wait
    }

    // Wait for match animation to complete
    await page.waitForTimeout(1200);
  }

  // After matching, click forward nav to advance
  await page.waitForTimeout(500);
  try {
    await page.click('[data-selector="navigation-forward"]:not([disabled])', { delay: 50 });
  } catch (e) {
    // Nav button not found or not clickable yet
  }
  await page.waitForTimeout(500);
}

/**
 * Word sorting - click syllables in correct order by data-position then advance
 *
 * DOM Pattern (Babbel):
 * <div data-position="0"><div data-choice="dan"><button data-selector="choice-item-dan" title="answer dan">dan</button></div></div>
 * <div data-position="1"><div data-choice="ke"><button data-selector="choice-item-ke" title="answer ke">ke</button></div></div>
 *
 * Click in position order (0, 1, 2...) to spell the word correctly
 *
 * NOTE: Button clicks work via page.evaluate() but navigation needs Puppeteer native click
 */
async function solveWordSorting(page) {
  // First, try the structured approach: collect all position elements
  const positionData = await page.evaluate(() => {
    const items = [];
    const posElems = document.querySelectorAll('[data-position]');
    for (const posElem of posElems) {
      const pos = parseInt(posElem.getAttribute('data-position'), 10);
      const choiceDiv = posElem.querySelector('[data-choice]');
      const choice = choiceDiv ? choiceDiv.getAttribute('data-choice') : null;
      if (!isNaN(pos) && choice) {
        items.push({ position: pos, choice });
      }
    }
    // Sort by position
    items.sort((a, b) => a.position - b.position);
    return items;
  });

  console.log(`  [word-sorting] Found ${positionData.length} items:`, positionData.map(i => i.choice).join(', '));

  if (positionData.length > 0) {
    // Click each button in position order
    for (const item of positionData) {
      // data-selector uses hyphens instead of spaces: "ich bin" -> "ich-bin"
      const selectorChoice = item.choice.replace(/\s+/g, '-');

      // Try multiple selectors to find the button
      const selectors = [
        `button[data-selector="choice-item-${selectorChoice}"]:not([disabled])`,
        `button[data-selector="choice-item-${item.choice}"]:not([disabled])`,
        `button[title="answer ${item.choice}"]:not([disabled])`
      ];

      let clicked = false;

      // First, try to find the shortcut key for this choice
      const shortcutKey = await page.evaluate((choice) => {
        // Find button with this choice and get its shortcut key
        const btns = document.querySelectorAll('button[data-selector^="choice-item"]:not([disabled])');
        for (const btn of btns) {
          if (btn.getAttribute('title') === `answer ${choice}`) {
            const shortcutSpan = btn.querySelector('[data-shortcut-key]');
            if (shortcutSpan) {
              return shortcutSpan.getAttribute('data-shortcut-key');
            }
          }
        }
        return null;
      }, item.choice);

      if (shortcutKey) {
        // Use keyboard shortcut - only works for simple ASCII characters
        const isSimpleKey = /^[a-zA-Z0-9]$/.test(shortcutKey);
        if (isSimpleKey) {
          await page.keyboard.press(shortcutKey);
          console.log(`  [word-sorting] Pressed shortcut "${shortcutKey}" for "${item.choice}"`);
          clicked = true;
        }
      }

      if (!clicked) {
        // Use CDP click for special characters and as fallback
        // CDP clicks are "trusted" events that React accepts
        for (const selector of selectors) {
          const btn = await page.$(selector);
          if (btn) {
            try {
              const box = await btn.boundingBox();
              if (box) {
                const client = await page.target().createCDPSession();
                const x = box.x + box.width / 2;
                const y = box.y + box.height / 2;
                await client.send('Input.dispatchMouseEvent', {
                  type: 'mousePressed',
                  x, y,
                  button: 'left',
                  clickCount: 1
                });
                await client.send('Input.dispatchMouseEvent', {
                  type: 'mouseReleased',
                  x, y,
                  button: 'left',
                  clickCount: 1
                });
                await client.detach();
                console.log(`  [word-sorting] CDP clicked "${item.choice}"`);
                clicked = true;
                break;
              }
            } catch (e) {
              console.log(`  [word-sorting] CDP click failed for "${item.choice}": ${e.message}`);
            }
          }
        }
      }

      if (!clicked) {
        console.log(`  [word-sorting] Could not find button for: ${item.choice}`);
      }
      await page.waitForTimeout(500);
    }
  } else {
    // Fallback: click buttons with title starting with "answer" in order using mouse
    for (let i = 0; i < 10; i++) {
      const btn = await page.$('button[title^="answer"]:not([disabled])');
      if (btn) {
        const box = await btn.boundingBox();
        if (box) {
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          await page.waitForTimeout(400);
        } else {
          break;
        }
      } else {
        break;
      }
    }
  }

  // Wait for answer to register, then click forward nav to advance
  await page.waitForTimeout(800);
  const forwardBtn = await page.$('[data-selector="navigation-forward"]:not([disabled])');
  if (forwardBtn) {
    try {
      await forwardBtn.click({ force: true, delay: 100 });
      console.log(`  [word-sorting] Clicked forward navigation`);
    } catch (e) {
      console.log(`  [word-sorting] Forward click failed: ${e.message}`);
    }
  } else {
    console.log(`  [word-sorting] Forward button not found or disabled`);
  }
  await page.waitForTimeout(500);
}

/**
 * Dialogue / Dialog-choose - fill in blanks using data-solution attribute
 * The correct answer is marked with data-solution="CorrectText"
 */
async function solveDialogue(page) {
  // Find the correct solution from data-solution attribute
  const solution = await page.evaluate(() => {
    const solutionEl = document.querySelector('[data-solution]');
    return solutionEl ? solutionEl.getAttribute('data-solution') : null;
  });

  // Check if there are enabled answer buttons
  const buttons = await page.$$('button[title^="answer"]:not([disabled])');

  if (buttons.length === 0) {
    console.log(`  [dialogue] No answer buttons available`);
  } else if (solution) {
    console.log(`  [dialogue] Looking for answer: "${solution}"`);

    // Find and click the button with matching text using CDP
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent.trim());
      // Strip leading number from button text for comparison
      const cleanText = text.replace(/^\d+/, '').trim();
      if (cleanText.includes(solution) || solution.includes(cleanText) || text.includes(solution)) {
        const box = await btn.boundingBox();
        if (box) {
          const client = await page.target().createCDPSession();
          const x = box.x + box.width / 2;
          const y = box.y + box.height / 2;
          await client.send('Input.dispatchMouseEvent', {
            type: 'mousePressed', x, y, button: 'left', clickCount: 1
          });
          await client.send('Input.dispatchMouseEvent', {
            type: 'mouseReleased', x, y, button: 'left', clickCount: 1
          });
          await client.detach();
          console.log(`  [dialogue] CDP clicked "${text}"`);
          break;
        }
      }
    }
  } else {
    // No data-solution, click first available answer button via CDP
    const btn = buttons[0];
    if (btn) {
      const box = await btn.boundingBox();
      if (box) {
        const client = await page.target().createCDPSession();
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        await client.send('Input.dispatchMouseEvent', {
          type: 'mousePressed', x, y, button: 'left', clickCount: 1
        });
        await client.send('Input.dispatchMouseEvent', {
          type: 'mouseReleased', x, y, button: 'left', clickCount: 1
        });
        await client.detach();
        console.log(`  [dialogue] CDP clicked first answer button`);
      }
    }
  }

  // Click forward navigation
  await page.waitForTimeout(500);
  const forwardBtn = await page.$('[data-selector="navigation-forward"]:not([disabled])');
  if (forwardBtn) {
    const box = await forwardBtn.boundingBox();
    if (box) {
      const client = await page.target().createCDPSession();
      await client.send('Input.dispatchMouseEvent', {
        type: 'mousePressed', x: box.x + box.width/2, y: box.y + box.height/2, button: 'left', clickCount: 1
      });
      await client.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased', x: box.x + box.width/2, y: box.y + box.height/2, button: 'left', clickCount: 1
      });
      await client.detach();
      console.log(`  [dialogue] Clicked forward navigation`);
    }
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
    const buttons = document.querySelectorAll('button[title^="answer"]:not([disabled])');
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
 * Uses data-solution attribute to find the correct answer
 */
async function solveListeningChooseSaid(page) {
  // Find the correct solution from data-solution attribute
  const solution = await page.evaluate(() => {
    const solutionEl = document.querySelector('[data-solution]');
    return solutionEl ? solutionEl.getAttribute('data-solution') : null;
  });

  if (solution) {
    console.log(`  [listening-choose-said] Looking for answer: "${solution}"`);

    // Find and click the button with matching text using CDP
    const buttons = await page.$$('button[title^="answer"]:not([disabled])');

    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent.trim());
      if (text.includes(solution) || solution.includes(text.replace(/^\d+/, '').trim())) {
        const box = await btn.boundingBox();
        if (box) {
          const client = await page.target().createCDPSession();
          const x = box.x + box.width / 2;
          const y = box.y + box.height / 2;
          await client.send('Input.dispatchMouseEvent', {
            type: 'mousePressed', x, y, button: 'left', clickCount: 1
          });
          await client.send('Input.dispatchMouseEvent', {
            type: 'mouseReleased', x, y, button: 'left', clickCount: 1
          });
          await client.detach();
          console.log(`  [listening-choose-said] CDP clicked "${text}"`);
          break;
        }
      }
    }
  } else {
    // Fallback: click first button
    const btn = await page.$('button[title^="answer"]:not([disabled])');
    if (btn) {
      const box = await btn.boundingBox();
      if (box) {
        const client = await page.target().createCDPSession();
        await client.send('Input.dispatchMouseEvent', {
          type: 'mousePressed', x: box.x + box.width/2, y: box.y + box.height/2, button: 'left', clickCount: 1
        });
        await client.send('Input.dispatchMouseEvent', {
          type: 'mouseReleased', x: box.x + box.width/2, y: box.y + box.height/2, button: 'left', clickCount: 1
        });
        await client.detach();
        console.log(`  [listening-choose-said] CDP clicked first button`);
      }
    }
  }

  // Click forward navigation
  await page.waitForTimeout(600);
  const forwardBtn = await page.$('[data-selector="navigation-forward"]:not([disabled])');
  if (forwardBtn) {
    const box = await forwardBtn.boundingBox();
    if (box) {
      const client = await page.target().createCDPSession();
      await client.send('Input.dispatchMouseEvent', {
        type: 'mousePressed', x: box.x + box.width/2, y: box.y + box.height/2, button: 'left', clickCount: 1
      });
      await client.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased', x: box.x + box.width/2, y: box.y + box.height/2, button: 'left', clickCount: 1
      });
      await client.detach();
      console.log(`  [listening-choose-said] Clicked forward navigation`);
    }
  }
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
      const buttons = document.querySelectorAll('button[title^="answer"]:not([disabled])');
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
      const letterBtns = document.querySelectorAll('button[title^="answer"]:not([disabled])');
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
    const buttons = document.querySelectorAll('button[title^="answer"]');
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
    const buttons = document.querySelectorAll('button[title^="answer"]');
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
      const buttons = document.querySelectorAll('button[title^="answer"]:not([disabled])');
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
    const buttons = document.querySelectorAll('button[title^="answer"]');
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
