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
    'letter-dictation': solveLetterDictation,
    'spelling': solveSpelling,

    // Dialogue / Vocabulary
    'dialogue': solveDialogue,
    'vocab-card': solveVocabCard,
    'response-choice': solveResponseChoice,

    // Pronunciation / Speech
    'pronunciation-fill': solvePronunciationFill,
    'listen-repeat': solveListenRepeat,
    'speech-exercise': solveSpeechExercise,
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
 *
 * IMPORTANT: Uses CDP click because Babbel's React app checks event.isTrusted
 *
 * Some vocab screens have a mic-toggle that needs to be clicked first to
 * skip the speech practice before navigation is enabled.
 */
async function solveVocabIntro(page) {
  await page.waitForTimeout(300);

  // Check if there's a mic-toggle button (speech practice screen)
  // Click it to disable speech and enable navigation
  const micToggleCoords = await page.evaluate(() => {
    const btn = document.querySelector('[data-selector="mic-toggle"]');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return { found: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
    }
    return { found: false };
  });

  if (micToggleCoords.found) {
    const client = await page.target().createCDPSession();
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: micToggleCoords.x, y: micToggleCoords.y, button: 'left', clickCount: 1
    });
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: micToggleCoords.x, y: micToggleCoords.y, button: 'left', clickCount: 1
    });
    await client.detach();
    console.log(`  [vocab-intro] Clicked mic-toggle to skip speech`);
    await page.waitForTimeout(500);
  }

  // Get forward button coordinates
  const fwdCoords = await page.evaluate(() => {
    const btn = document.querySelector('[data-selector="navigation-forward"]:not([disabled])');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return { found: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
    }
    return { found: false };
  });

  if (fwdCoords.found) {
    const client = await page.target().createCDPSession();
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: fwdCoords.x, y: fwdCoords.y, button: 'left', clickCount: 1
    });
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: fwdCoords.x, y: fwdCoords.y, button: 'left', clickCount: 1
    });
    await client.detach();
    console.log(`  [vocab-intro] CDP clicked forward navigation`);
  } else {
    console.log(`  [vocab-intro] Forward button not found or disabled`);
  }
  await page.waitForTimeout(500);
}

/**
 * MCQ Translation - find and click correct answer tile then advance
 * Uses data-correct="true" or data-item-id matching to find correct answer
 *
 * IMPORTANT: Uses CDP clicks because Babbel's React checks event.isTrusted
 */
async function solveMcq(page) {
  await page.waitForTimeout(300);

  // Find the correct answer button
  const answerCoords = await page.evaluate(() => {
    // Method 1: data-correct="true"
    let btn = document.querySelector('button[data-correct="true"]:not([disabled])');

    // Method 2: Match data-item-id from prompt
    if (!btn) {
      const promptBtn = document.querySelector('[data-selector="vocabulary-click-ll-item"]');
      if (promptBtn) {
        const targetId = promptBtn.getAttribute('data-item-id');
        if (targetId) {
          const tiles = document.querySelectorAll('[data-selector="vocabulary-click-tile"]');
          for (const tile of tiles) {
            if (tile.getAttribute('data-item-id') === targetId) {
              btn = tile;
              break;
            }
          }
        }
      }
    }

    // Method 3: Any choice-item button
    if (!btn) {
      btn = document.querySelector('button[data-selector^="choice-item"]:not([disabled])');
    }

    // Method 4: First tile
    if (!btn) {
      btn = document.querySelector('[data-selector="vocabulary-click-tile"]');
    }

    if (btn) {
      btn.scrollIntoView({ behavior: 'instant', block: 'center' });
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          found: true,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          text: btn.textContent.substring(0, 30)
        };
      }
    }
    return { found: false };
  });

  if (answerCoords.found) {
    const client = await page.target().createCDPSession();
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: answerCoords.x, y: answerCoords.y, button: 'left', clickCount: 1
    });
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: answerCoords.x, y: answerCoords.y, button: 'left', clickCount: 1
    });
    await client.detach();
    console.log(`  [mcq] CDP clicked "${answerCoords.text}"`);
  } else {
    console.log(`  [mcq] No answer found`);
  }

  await page.waitForTimeout(800);

  // Click forward navigation
  const fwdCoords = await page.evaluate(() => {
    const btn = document.querySelector('[data-selector="navigation-forward"]:not([disabled])');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0) return { found: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { found: false };
  });

  if (fwdCoords.found) {
    const client = await page.target().createCDPSession();
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: fwdCoords.x, y: fwdCoords.y, button: 'left', clickCount: 1
    });
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: fwdCoords.x, y: fwdCoords.y, button: 'left', clickCount: 1
    });
    await client.detach();
    console.log(`  [mcq] Clicked forward navigation`);
  }
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
  // Keep matching until no more unmatched items
  // Strategy: Click base items in order, then find matching option by solution-id
  // If no ACTIVE state, use the solution-id from the clicked base directly

  for (let i = 0; i < 10; i++) { // Max 10 pairs
    // Wait for DOM to stabilize
    await page.waitForTimeout(1000);

    // Check how many unmatched items remain
    const remainingCount = await page.evaluate(() => {
      const bases = document.querySelectorAll('[data-item-type="base"]:not([data-matched-item="true"])');
      const options = document.querySelectorAll('[data-item-type="option"]:not([data-matched-item="true"])');
      return { bases: bases.length, options: options.length };
    });

    console.log(`  [matching] Iteration ${i + 1}: ${remainingCount.bases} bases, ${remainingCount.options} options remain`);

    if (remainingCount.bases === 0 && remainingCount.options === 0) {
      console.log(`  [matching] All pairs matched!`);
      break;
    }

    // Get info about the first unmatched base (whether active or not)
    let targetInfo = await page.evaluate(() => {
      // First try to find an active base
      let activeBase = document.querySelector('[data-appearance="ACTIVE"] [data-solution-id]');
      if (activeBase) {
        return {
          targetId: activeBase.getAttribute('data-solution-id'),
          activeText: activeBase.textContent.substring(0, 30),
          wasActive: true
        };
      }

      // If no active, get the first unmatched base's solution-id
      const unmatchedBase = document.querySelector('[data-item-type="base"]:not([data-matched-item="true"]) [data-solution-id]');
      if (unmatchedBase) {
        return {
          targetId: unmatchedBase.getAttribute('data-solution-id'),
          activeText: unmatchedBase.textContent.substring(0, 30),
          wasActive: false
        };
      }

      return null;
    });

    // If we found a base but it's not active, click it first
    if (targetInfo && !targetInfo.wasActive) {
      console.log(`  [matching] Clicking base to activate: "${targetInfo.activeText}"`);

      // Click the base item
      const baseCoords = await page.evaluate((solutionId) => {
        const bases = document.querySelectorAll('[data-item-type="base"]:not([data-matched-item="true"])');
        for (const base of bases) {
          const solEl = base.querySelector(`[data-solution-id="${solutionId}"]`);
          if (solEl) {
            const clickable = base.querySelector('[data-selector="matching-item-option"]');
            if (clickable) {
              clickable.scrollIntoView({ behavior: 'instant', block: 'center' });
              const rect = clickable.getBoundingClientRect();
              return {
                found: true,
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
              };
            }
          }
        }
        return { found: false };
      }, targetInfo.targetId);

      if (baseCoords.found) {
        await page.waitForTimeout(200);
        const client = await page.target().createCDPSession();
        await client.send('Input.dispatchMouseEvent', {
          type: 'mousePressed', x: baseCoords.x, y: baseCoords.y, button: 'left', clickCount: 1
        });
        await client.send('Input.dispatchMouseEvent', {
          type: 'mouseReleased', x: baseCoords.x, y: baseCoords.y, button: 'left', clickCount: 1
        });
        await client.detach();
        console.log(`  [matching] Clicked base at (${baseCoords.x}, ${baseCoords.y})`);
        await page.waitForTimeout(600);
      }
    }

    if (!targetInfo) {
      console.log(`  [matching] No base found to match`);
      break;
    }

    console.log(`  [matching] Looking for option with solution-id: ${targetInfo.targetId}`);

    // Find and click the matching option
    const optionCoords = await page.evaluate((targetId) => {
      const options = document.querySelectorAll('[data-item-type="option"]:not([data-matched-item="true"])');
      for (const opt of options) {
        const solutionEl = opt.querySelector(`[data-solution-id="${targetId}"]`);
        if (solutionEl) {
          const clickable = opt.querySelector('[data-selector="matching-item-option"]');
          if (clickable) {
            clickable.scrollIntoView({ behavior: 'instant', block: 'center' });
            const rect = clickable.getBoundingClientRect();
            return {
              found: true,
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              text: clickable.textContent.substring(0, 30)
            };
          }
        }
      }
      return { found: false };
    }, targetInfo.targetId);

    if (optionCoords.found) {
      await page.waitForTimeout(200);
      const client = await page.target().createCDPSession();
      await client.send('Input.dispatchMouseEvent', {
        type: 'mousePressed', x: optionCoords.x, y: optionCoords.y, button: 'left', clickCount: 1
      });
      await client.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased', x: optionCoords.x, y: optionCoords.y, button: 'left', clickCount: 1
      });
      await client.detach();
      console.log(`  [matching] Clicked option: "${optionCoords.text}"`);
    } else {
      console.log(`  [matching] Could not find option for solution-id ${targetInfo.targetId}`);
      // Try clicking any unmatched option as fallback
      const anyOption = await page.evaluate(() => {
        const opt = document.querySelector('[data-item-type="option"]:not([data-matched-item="true"]) [data-selector="matching-item-option"]');
        if (opt) {
          opt.scrollIntoView({ behavior: 'instant', block: 'center' });
          const rect = opt.getBoundingClientRect();
          return { found: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        }
        return { found: false };
      });
      if (anyOption.found) {
        const client = await page.target().createCDPSession();
        await client.send('Input.dispatchMouseEvent', {
          type: 'mousePressed', x: anyOption.x, y: anyOption.y, button: 'left', clickCount: 1
        });
        await client.send('Input.dispatchMouseEvent', {
          type: 'mouseReleased', x: anyOption.x, y: anyOption.y, button: 'left', clickCount: 1
        });
        await client.detach();
        console.log(`  [matching] Clicked fallback option`);
      }
    }

    // Wait for match animation to complete
    await page.waitForTimeout(1500);
  }

  // After matching, click forward nav to advance
  await page.waitForTimeout(500);
  const fwdCoords = await page.evaluate(() => {
    const btn = document.querySelector('[data-selector="navigation-forward"]:not([disabled])');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      return { found: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { found: false };
  });

  if (fwdCoords.found) {
    const client = await page.target().createCDPSession();
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: fwdCoords.x, y: fwdCoords.y, button: 'left', clickCount: 1
    });
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: fwdCoords.x, y: fwdCoords.y, button: 'left', clickCount: 1
    });
    await client.detach();
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
 * Vocab card - vocabulary introduction with single answer
 * Uses data-solution attribute to find the correct answer
 */
async function solveVocabCard(page) {
  // Find the correct solution from data-solution attribute
  const solution = await page.evaluate(() => {
    const solutionEl = document.querySelector('[data-solution]');
    return solutionEl ? solutionEl.getAttribute('data-solution') : null;
  });

  // Check if there are enabled answer buttons
  const buttons = await page.$$('button[title^="answer"]:not([disabled])');

  if (buttons.length > 0) {
    if (solution) {
      console.log(`  [vocab-card] Looking for answer: "${solution}"`);
      for (const btn of buttons) {
        const text = await btn.evaluate(el => el.textContent.trim());
        const cleanText = text.replace(/^\d+/, '').trim();
        if (cleanText.includes(solution) || solution.includes(cleanText)) {
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
            console.log(`  [vocab-card] CDP clicked "${text}"`);
            break;
          }
        }
      }
    } else {
      // Click first button
      const btn = buttons[0];
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
        console.log(`  [vocab-card] CDP clicked first button`);
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
      console.log(`  [vocab-card] Clicked forward navigation`);
    }
  }
}

/**
 * Dialogue / Dialog-choose - fill in blanks
 * Uses data-correct="true" attribute to find the correct answer button
 * Loops to handle multiple dialogue turns (multiple questions in sequence)
 */
async function solveDialogue(page) {
  // Wait for DOM to stabilize
  await page.waitForTimeout(500);

  // Helper to click a correct button using CDP
  async function clickCorrectButton() {
    // Method 1: Find button with data-correct="true" (most reliable)
    const correctBtn = await page.$('button[data-correct="true"]:not([disabled])');
    if (correctBtn) {
      const box = await correctBtn.boundingBox();
      if (box) {
        const client = await page.target().createCDPSession();
        await client.send('Input.dispatchMouseEvent', {
          type: 'mousePressed', x: box.x + box.width/2, y: box.y + box.height/2, button: 'left', clickCount: 1
        });
        await client.send('Input.dispatchMouseEvent', {
          type: 'mouseReleased', x: box.x + box.width/2, y: box.y + box.height/2, button: 'left', clickCount: 1
        });
        await client.detach();
        const choice = await correctBtn.evaluate(el => el.getAttribute('data-choice') || el.textContent.trim());
        console.log(`  [dialogue] CDP clicked correct answer: "${choice}"`);
        return true;
      }
    }

    // Method 2: Use data-solution attribute
    const solution = await page.evaluate(() => {
      const solutionEl = document.querySelector('[data-solution]');
      return solutionEl ? solutionEl.getAttribute('data-solution') : null;
    });

    if (solution) {
      console.log(`  [dialogue] Looking for answer: "${solution}"`);
      const buttons = await page.$$('button[title^="answer"]:not([disabled])');

      for (const btn of buttons) {
        const choice = await btn.evaluate(el => el.getAttribute('data-choice'));
        if (choice === solution) {
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
            console.log(`  [dialogue] CDP clicked "${choice}"`);
            return true;
          }
        }
      }
    }

    return false;
  }

  // Loop to handle multiple dialogue turns (max 10 to prevent infinite loop)
  for (let turn = 0; turn < 10; turn++) {
    // Check if there are answer buttons available
    const hasButtons = await page.evaluate(() => {
      return document.querySelector('button[data-correct]:not([disabled])') !== null ||
             document.querySelector('button[title^="answer"]:not([disabled])') !== null;
    });

    if (!hasButtons) {
      console.log(`  [dialogue] No more answer buttons, completed ${turn} turns`);
      break;
    }

    const clicked = await clickCorrectButton();
    if (!clicked) {
      console.log(`  [dialogue] Could not click correct button on turn ${turn + 1}`);
      break;
    }

    // Wait for feedback animation and next question to appear
    await page.waitForTimeout(1200);
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
 * Uses data-correct="true" attribute to find the correct answer (most reliable)
 */
async function solveListeningChooseSaid(page) {
  await page.waitForTimeout(500);

  // Method 1: Find button with data-correct="true" (most reliable)
  const correctBtn = await page.$('button[data-correct="true"]:not([disabled])');
  if (correctBtn) {
    const box = await correctBtn.boundingBox();
    if (box) {
      const client = await page.target().createCDPSession();
      await client.send('Input.dispatchMouseEvent', {
        type: 'mousePressed', x: box.x + box.width/2, y: box.y + box.height/2, button: 'left', clickCount: 1
      });
      await client.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased', x: box.x + box.width/2, y: box.y + box.height/2, button: 'left', clickCount: 1
      });
      await client.detach();
      const choice = await correctBtn.evaluate(el => el.getAttribute('data-choice') || el.textContent.trim());
      console.log(`  [listening-choose-said] CDP clicked correct: "${choice}"`);
    }
  } else {
    // Method 2: Match data-solution with data-choice
    const solution = await page.evaluate(() => {
      const solutionEl = document.querySelector('[data-solution]');
      return solutionEl ? solutionEl.getAttribute('data-solution') : null;
    });

    if (solution) {
      console.log(`  [listening-choose-said] Looking for: "${solution}"`);
      const buttons = await page.$$('button[title^="answer"]:not([disabled])');

      for (const btn of buttons) {
        const choice = await btn.evaluate(el => el.getAttribute('data-choice'));
        if (choice === solution) {
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
            console.log(`  [listening-choose-said] CDP clicked "${choice}"`);
            break;
          }
        }
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
 * Sentence order - arrange words OR letters in correct order using data-solution
 *
 * Two modes:
 * 1. Multi-word sentence: "Ich bin Freddy." → click word buttons in order
 * 2. Single word: "hallo" → click letter buttons in order (spelling exercise)
 */
async function solveSentenceOrder(page) {
  // Get the solution from data-solution
  const solution = await page.evaluate(() => {
    const solutionEl = document.querySelector('[data-solution]');
    return solutionEl ? solutionEl.getAttribute('data-solution') : null;
  });

  if (!solution) {
    console.log(`  [sentence-order] No data-solution found`);
    return;
  }

  console.log(`  [sentence-order] Solution: "${solution}"`);

  // Check if it's a single word (no spaces) - this means click individual letters
  const words = solution.split(/\s+/).filter(w => w.length > 0);
  const isSingleWord = words.length === 1 && !solution.includes(' ');

  if (isSingleWord) {
    // Single word - could be syllables (hal-lo) or letters (h-a-l-l-o)
    // Strategy: find buttons and click them in the order that builds the solution
    console.log(`  [sentence-order] Single word mode - clicking parts for "${solution}"`);

    // Get all button texts and find the order that builds the solution
    const buttonData = await page.evaluate(() => {
      const btns = document.querySelectorAll('button[title^="answer"]:not([disabled])');
      const data = [];
      for (const btn of btns) {
        const text = btn.textContent.replace(/^[a-z]\s*/, '').trim();
        const rect = btn.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          data.push({
            text,
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          });
        }
      }
      return data;
    });

    console.log(`  [sentence-order] Found ${buttonData.length} buttons: ${buttonData.map(b => b.text).join(', ')}`);

    if (buttonData.length > 0) {
      // Try to find the order that builds the solution
      // For "hallo" with buttons ["lo", "hal"] → click "hal" first, then "lo"
      let remaining = solution.toLowerCase();
      const clickOrder = [];

      // Greedy approach: find button that matches the start of remaining string
      for (let i = 0; i < buttonData.length && remaining.length > 0; i++) {
        for (const btn of buttonData) {
          if (!clickOrder.includes(btn) && remaining.startsWith(btn.text.toLowerCase())) {
            clickOrder.push(btn);
            remaining = remaining.substring(btn.text.length);
            break;
          }
        }
      }

      // If we couldn't match all, fall back to clicking all buttons in order
      if (remaining.length > 0) {
        console.log(`  [sentence-order] Could not fully match solution, using all buttons`);
        clickOrder.length = 0;
        for (const btn of buttonData) {
          clickOrder.push(btn);
        }
      }

      // Click buttons in order
      for (const btn of clickOrder) {
        const client = await page.target().createCDPSession();
        await client.send('Input.dispatchMouseEvent', {
          type: 'mousePressed', x: btn.x, y: btn.y, button: 'left', clickCount: 1
        });
        await client.send('Input.dispatchMouseEvent', {
          type: 'mouseReleased', x: btn.x, y: btn.y, button: 'left', clickCount: 1
        });
        await client.detach();
        console.log(`  [sentence-order] CDP clicked "${btn.text}"`);
        await page.waitForTimeout(400);
      }
    }
  } else {
    // Multi-word sentence - click word buttons in order
    console.log(`  [sentence-order] Words to click: ${words.join(', ')}`);

    // Click each word in order
    for (const word of words) {
      // Find button matching this word
      const buttons = await page.$$('button[title^="answer"]:not([disabled])');
      let clicked = false;

      // Strip trailing punctuation for matching (buttons often don't have punctuation)
      const wordNoPunct = word.replace(/[.,!?:;]+$/, '');

      for (const btn of buttons) {
        const text = await btn.evaluate(el => el.textContent.trim());
        // Remove shortcut letter prefix if present
        const cleanText = text.replace(/^[a-z]\s*/, '').trim();
        const cleanTextNoPunct = cleanText.replace(/[.,!?:;]+$/, '');

        // Match exact word or case-insensitive match (also try without punctuation)
        if (cleanText === word || cleanText.toLowerCase() === word.toLowerCase() ||
            cleanText === wordNoPunct || cleanText.toLowerCase() === wordNoPunct.toLowerCase() ||
            cleanTextNoPunct === wordNoPunct || cleanTextNoPunct.toLowerCase() === wordNoPunct.toLowerCase()) {
          // Use CDP click
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
            console.log(`  [sentence-order] CDP clicked "${cleanText}"`);
            clicked = true;
            break;
          }
        }
      }

      if (!clicked) {
        // Try keyboard shortcut
        const shortcut = await page.evaluate((targetWord, targetWordNoPunct) => {
          const btns = document.querySelectorAll('button[title^="answer"]:not([disabled])');
          for (const btn of btns) {
            const text = btn.textContent.replace(/^[a-z]\s*/, '').trim();
            const textNoPunct = text.replace(/[.,!?:;]+$/, '');
            if (text === targetWord || text.toLowerCase() === targetWord.toLowerCase() ||
                text === targetWordNoPunct || text.toLowerCase() === targetWordNoPunct.toLowerCase() ||
                textNoPunct === targetWordNoPunct || textNoPunct.toLowerCase() === targetWordNoPunct.toLowerCase()) {
              const shortcutSpan = btn.querySelector('[data-shortcut-key]');
              return shortcutSpan ? shortcutSpan.getAttribute('data-shortcut-key') : null;
            }
          }
          return null;
        }, word, wordNoPunct);

        if (shortcut && /^[a-zA-Z0-9]$/.test(shortcut)) {
          await page.keyboard.press(shortcut);
          console.log(`  [sentence-order] Pressed shortcut "${shortcut}" for "${word}"`);
        } else {
          console.log(`  [sentence-order] Could not find button for "${word}"`);
        }
      }
      await page.waitForTimeout(400);
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
      console.log(`  [sentence-order] Clicked forward navigation`);
    }
  }
}

/**
 * Letter dictation - type individual letters based on data-solution
 * E.g., data-solution="vwh" means click v, w, h buttons in order
 *
 * DOM Pattern (Babbel):
 * - data-trainer-dictate="true" indicates this is a dictation exercise
 * - data-solution="vwh" contains the letters to click
 * - Buttons: choice-item-v, choice-item-w, choice-item-h
 */
async function solveLetterDictation(page) {
  await page.waitForTimeout(300);

  // Get the solution (letters to click)
  const solution = await page.evaluate(() => {
    const solutionEl = document.querySelector('[data-solution]');
    return solutionEl ? solutionEl.getAttribute('data-solution') : null;
  });

  if (!solution) {
    console.log(`  [letter-dictation] No data-solution found`);
    return;
  }

  console.log(`  [letter-dictation] Solution: "${solution}" (${solution.length} letters)`);

  // Click each letter in order
  for (const letter of solution) {
    // Find button for this letter
    const btnCoords = await page.evaluate((targetLetter) => {
      // Try choice-item-{letter}
      let btn = document.querySelector(`button[data-selector="choice-item-${targetLetter}"]:not([disabled])`);

      // Fallback: find by title
      if (!btn) {
        const btns = document.querySelectorAll('button[title^="answer"]:not([disabled])');
        for (const b of btns) {
          if (b.getAttribute('title') === `answer ${targetLetter}`) {
            btn = b;
            break;
          }
        }
      }

      // Fallback: find by data-choice
      if (!btn) {
        const btns = document.querySelectorAll(`[data-choice="${targetLetter}"] button:not([disabled])`);
        if (btns.length > 0) btn = btns[0];
      }

      if (btn) {
        btn.scrollIntoView({ behavior: 'instant', block: 'center' });
        const rect = btn.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return {
            found: true,
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
        }
      }
      return { found: false };
    }, letter);

    if (btnCoords.found) {
      const client = await page.target().createCDPSession();
      await client.send('Input.dispatchMouseEvent', {
        type: 'mousePressed', x: btnCoords.x, y: btnCoords.y, button: 'left', clickCount: 1
      });
      await client.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased', x: btnCoords.x, y: btnCoords.y, button: 'left', clickCount: 1
      });
      await client.detach();
      console.log(`  [letter-dictation] CDP clicked letter "${letter}"`);
    } else {
      console.log(`  [letter-dictation] Could not find button for letter "${letter}"`);
    }
    await page.waitForTimeout(400);
  }

  // Click forward navigation
  await page.waitForTimeout(600);
  const fwdCoords = await page.evaluate(() => {
    const btn = document.querySelector('[data-selector="navigation-forward"]:not([disabled])');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0) return { found: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { found: false };
  });

  if (fwdCoords.found) {
    const client = await page.target().createCDPSession();
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: fwdCoords.x, y: fwdCoords.y, button: 'left', clickCount: 1
    });
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: fwdCoords.x, y: fwdCoords.y, button: 'left', clickCount: 1
    });
    await client.detach();
    console.log(`  [letter-dictation] Clicked forward navigation`);
  }
  await page.waitForTimeout(500);
}

/**
 * Spelling / Fill in the blanks - click letters in correct order then Done
 *
 * DOM Pattern (Babbel):
 * - data-selector="vocabulary-puzzlehelper" + done-button + delete-button
 * - data-solution="bist" on active-gap element contains the answer
 * - Letter buttons have data-choice="b", data-choice="i", etc.
 * - data-selector="done-button" to submit
 *
 * IMPORTANT: Uses CDP click because Babbel's React checks event.isTrusted
 */
async function solveSpelling(page) {
  await page.waitForTimeout(300);

  // Get the solution from data-solution attribute
  const solution = await page.evaluate(() => {
    const solutionEl = document.querySelector('[data-solution]');
    return solutionEl ? solutionEl.getAttribute('data-solution') : null;
  });

  if (solution) {
    console.log(`  [spelling] Solution: "${solution}" (${solution.length} letters)`);

    // Click each letter in order using data-choice attribute
    for (const letter of solution) {
      const btnCoords = await page.evaluate((targetLetter) => {
        // Try exact match first
        let btn = document.querySelector(`button[data-choice="${targetLetter}"]:not([disabled])`);

        // Try lowercase match (buttons usually have lowercase letters)
        if (!btn) {
          btn = document.querySelector(`button[data-choice="${targetLetter.toLowerCase()}"]:not([disabled])`);
        }

        // Try uppercase match
        if (!btn) {
          btn = document.querySelector(`button[data-choice="${targetLetter.toUpperCase()}"]:not([disabled])`);
        }

        if (btn) {
          btn.scrollIntoView({ behavior: 'instant', block: 'center' });
          const rect = btn.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            return { found: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          }
        }
        return { found: false };
      }, letter);

      if (btnCoords.found) {
        const client = await page.target().createCDPSession();
        await client.send('Input.dispatchMouseEvent', {
          type: 'mousePressed', x: btnCoords.x, y: btnCoords.y, button: 'left', clickCount: 1
        });
        await client.send('Input.dispatchMouseEvent', {
          type: 'mouseReleased', x: btnCoords.x, y: btnCoords.y, button: 'left', clickCount: 1
        });
        await client.detach();
        console.log(`  [spelling] CDP clicked letter "${letter}"`);
      } else {
        console.log(`  [spelling] Could not find button for letter "${letter}"`);
      }
      await page.waitForTimeout(200);
    }
  } else {
    console.log(`  [spelling] No data-solution found`);
  }

  // Click Done button using CDP
  await page.waitForTimeout(400);
  const doneCoords = await page.evaluate(() => {
    const btn = document.querySelector('[data-selector="done-button"]:not([disabled])');
    if (btn) {
      btn.scrollIntoView({ behavior: 'instant', block: 'center' });
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return { found: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
    }
    return { found: false };
  });

  if (doneCoords.found) {
    const client = await page.target().createCDPSession();
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: doneCoords.x, y: doneCoords.y, button: 'left', clickCount: 1
    });
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: doneCoords.x, y: doneCoords.y, button: 'left', clickCount: 1
    });
    await client.detach();
    console.log(`  [spelling] Clicked Done button`);
  }

  // Click forward navigation
  await page.waitForTimeout(800);
  const fwdCoords = await page.evaluate(() => {
    const btn = document.querySelector('[data-selector="navigation-forward"]:not([disabled])');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0) return { found: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { found: false };
  });

  if (fwdCoords.found) {
    const client = await page.target().createCDPSession();
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: fwdCoords.x, y: fwdCoords.y, button: 'left', clickCount: 1
    });
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: fwdCoords.x, y: fwdCoords.y, button: 'left', clickCount: 1
    });
    await client.detach();
    console.log(`  [spelling] Clicked forward navigation`);
  }
  await page.waitForTimeout(500);
}

/**
 * Response choice - choose appropriate response ("How would you respond?")
 * Uses data-correct="true" to find the correct answer
 *
 * IMPORTANT: Uses CDP click because Babbel's React checks event.isTrusted
 */
async function solveResponseChoice(page) {
  await page.waitForTimeout(300);

  // Find the correct answer button
  const btnCoords = await page.evaluate(() => {
    // First try data-correct="true"
    let btn = document.querySelector('button[data-correct="true"]:not([disabled])');
    if (!btn) {
      // Fallback: any answer button
      btn = document.querySelector('button[data-selector^="choice-item"]:not([disabled])');
    }
    if (!btn) {
      btn = document.querySelector('button[title^="answer"]:not([disabled])');
    }
    if (btn) {
      btn.scrollIntoView({ behavior: 'instant', block: 'center' });
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          found: true,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          text: btn.textContent.substring(0, 30)
        };
      }
    }
    return { found: false };
  });

  if (btnCoords.found) {
    const client = await page.target().createCDPSession();
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: btnCoords.x, y: btnCoords.y, button: 'left', clickCount: 1
    });
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: btnCoords.x, y: btnCoords.y, button: 'left', clickCount: 1
    });
    await client.detach();
    console.log(`  [response-choice] CDP clicked "${btnCoords.text}"`);
  } else {
    console.log(`  [response-choice] No answer button found`);
  }

  await page.waitForTimeout(1000);

  // Click forward navigation
  const fwdCoords = await page.evaluate(() => {
    const btn = document.querySelector('[data-selector="navigation-forward"]:not([disabled])');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0) return { found: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { found: false };
  });

  if (fwdCoords.found) {
    const client = await page.target().createCDPSession();
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: fwdCoords.x, y: fwdCoords.y, button: 'left', clickCount: 1
    });
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: fwdCoords.x, y: fwdCoords.y, button: 'left', clickCount: 1
    });
    await client.detach();
    console.log(`  [response-choice] Clicked forward navigation`);
  }
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
 * Speech exercise - skip using the skip button
 * The skip button has data-selector="skip-button" and title="Next"
 *
 * IMPORTANT: The skip button is HIDDEN (display: none) by default!
 * It only becomes visible after clicking the mic-toggle button to disable the microphone.
 *
 * Flow:
 * 1. Click mic-toggle to disable microphone
 * 2. Skip button becomes visible
 * 3. Click skip button to advance
 */
async function solveSpeechExercise(page) {
  console.log(`  [speech-exercise] Skipping speech recognition...`);

  // Wait for speech UI to fully load
  await page.waitForTimeout(1500);

  // Step 1: Click the mic-toggle button to disable microphone
  // This reveals the skip button
  const micToggleCoords = await page.evaluate(() => {
    const btn = document.querySelector('[data-selector="mic-toggle"]');
    if (btn) {
      btn.scrollIntoView({ behavior: 'instant', block: 'center' });
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          found: true,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      }
    }
    return { found: false };
  });

  if (micToggleCoords.found) {
    console.log(`  [speech-exercise] Clicking mic-toggle to disable microphone...`);
    await page.waitForTimeout(200);
    const client = await page.target().createCDPSession();
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: micToggleCoords.x,
      y: micToggleCoords.y,
      button: 'left',
      clickCount: 1
    });
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: micToggleCoords.x,
      y: micToggleCoords.y,
      button: 'left',
      clickCount: 1
    });
    await client.detach();
    console.log(`  [speech-exercise] Disabled microphone`);
    await page.waitForTimeout(800);
  } else {
    console.log(`  [speech-exercise] mic-toggle button not found`);
  }

  // Step 2: Now the skip button should be visible - click it
  const skipBtnCoords = await page.evaluate(() => {
    const btn = document.querySelector('[data-selector="skip-button"]');
    if (btn) {
      const style = window.getComputedStyle(btn);
      btn.scrollIntoView({ behavior: 'instant', block: 'center' });
      const rect = btn.getBoundingClientRect();
      return {
        found: true,
        display: style.display,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height
      };
    }
    return { found: false };
  });

  console.log(`  [speech-exercise] Skip button: display=${skipBtnCoords.display}, w=${skipBtnCoords.width}, h=${skipBtnCoords.height}`);

  if (skipBtnCoords.found && skipBtnCoords.width > 0) {
    console.log(`  [speech-exercise] Clicking skip button...`);
    await page.waitForTimeout(200);
    const client = await page.target().createCDPSession();
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: skipBtnCoords.x,
      y: skipBtnCoords.y,
      button: 'left',
      clickCount: 1
    });
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: skipBtnCoords.x,
      y: skipBtnCoords.y,
      button: 'left',
      clickCount: 1
    });
    await client.detach();
    console.log(`  [speech-exercise] CDP clicked skip button`);
    await page.waitForTimeout(1000);
    return;
  }

  console.log(`  [speech-exercise] Skip button still hidden, trying forward navigation`);

  // Fallback: try navigation forward
  const forwardCoords = await page.evaluate(() => {
    const btn = document.querySelector('[data-selector="navigation-forward"]:not([disabled])');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0) {
        return { found: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
    }
    return { found: false };
  });

  if (forwardCoords.found) {
    const client = await page.target().createCDPSession();
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: forwardCoords.x, y: forwardCoords.y, button: 'left', clickCount: 1
    });
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: forwardCoords.x, y: forwardCoords.y, button: 'left', clickCount: 1
    });
    await client.detach();
    console.log(`  [speech-exercise] Clicked forward navigation`);
  }
  await page.waitForTimeout(800);
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
 * Uses data-correct="true" to find the correct answer
 *
 * IMPORTANT: Uses CDP click because Babbel's React checks event.isTrusted
 * NOTE: After clicking the answer, must wait for feedback animation before
 *       forward navigation becomes enabled.
 */
async function solveFormalityChoice(page) {
  await page.waitForTimeout(500);

  // Find the correct answer button
  const btnCoords = await page.evaluate(() => {
    // First try data-correct="true"
    let btn = document.querySelector('button[data-correct="true"]:not([disabled])');
    if (!btn) {
      // Fallback: find button with formell/informell text
      const buttons = document.querySelectorAll('button[title^="answer"]:not([disabled])');
      for (const b of buttons) {
        const text = b.textContent.toLowerCase();
        if (text.includes('formell')) {
          btn = b;
          break;
        }
      }
    }
    // Fallback: any answer button
    if (!btn) {
      btn = document.querySelector('button[data-selector^="choice-item"]:not([disabled])');
    }
    if (btn) {
      btn.scrollIntoView({ behavior: 'instant', block: 'center' });
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          found: true,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          text: btn.textContent.substring(0, 30)
        };
      }
    }
    return { found: false };
  });

  if (btnCoords.found) {
    const client = await page.target().createCDPSession();
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: btnCoords.x, y: btnCoords.y, button: 'left', clickCount: 1
    });
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: btnCoords.x, y: btnCoords.y, button: 'left', clickCount: 1
    });
    await client.detach();
    console.log(`  [formality-choice] CDP clicked "${btnCoords.text}"`);
  } else {
    console.log(`  [formality-choice] No answer button found`);
  }

  // Wait longer for feedback animation to complete
  await page.waitForTimeout(1200);

  // Try clicking forward navigation with retry
  for (let attempt = 0; attempt < 3; attempt++) {
    const fwdCoords = await page.evaluate(() => {
      const btn = document.querySelector('[data-selector="navigation-forward"]:not([disabled])');
      if (btn) {
        btn.scrollIntoView({ behavior: 'instant', block: 'center' });
        const rect = btn.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return { found: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        }
      }
      return { found: false };
    });

    if (fwdCoords.found) {
      const client = await page.target().createCDPSession();
      await client.send('Input.dispatchMouseEvent', {
        type: 'mousePressed', x: fwdCoords.x, y: fwdCoords.y, button: 'left', clickCount: 1
      });
      await client.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased', x: fwdCoords.x, y: fwdCoords.y, button: 'left', clickCount: 1
      });
      await client.detach();
      console.log(`  [formality-choice] Clicked forward navigation (attempt ${attempt + 1})`);
      break;
    } else {
      console.log(`  [formality-choice] Forward button not ready, waiting... (attempt ${attempt + 1})`);
      await page.waitForTimeout(800);
    }
  }
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
