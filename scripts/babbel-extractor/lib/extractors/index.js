/**
 * Babbel Content Extractors
 *
 * Extract learning content from each screen type.
 * Supports all 23 discovered screen types.
 */

/**
 * Extract content from current screen
 * @param {Page} page - Puppeteer page object
 * @param {string} type - Screen type from detector
 * @returns {Promise<object>} - Extracted content
 */
export async function extractContent(page, type) {
  const extractors = {
    // Vocabulary
    'vocab-intro': extractVocabIntro,

    // Translation
    'mcq-translation': extractMcq,

    // Listening
    'listening-fill': extractListeningFill,
    'listening-choose-said': extractListeningChooseSaid,

    // Grammar
    'grammar-tip': extractGrammarTip,

    // Matching
    'matching': extractMatching,
    'response-matching': extractResponseMatching,

    // Building
    'word-sorting': extractWordSorting,
    'sentence-order': extractSentenceOrder,
    'spelling': extractSpelling,

    // Dialogue
    'dialogue': extractDialogue,
    'response-choice': extractResponseChoice,

    // Pronunciation
    'pronunciation-fill': extractPronunciationFill,
    'listen-repeat': extractListenRepeat,
    'pronunciation-rule': extractPronunciationRule,
    'pronunciation-quiz': extractPronunciationQuiz,

    // Meta/Navigation
    'lesson-end': extractLessonEnd,
    'pronunciation-end': extractLessonEnd,
    'feedback-popup-tip': extractFeedbackPopupTip,
    'recap-intro': extractRecapIntro,
    'recap-end': extractRecapEnd,
    'formality-choice': extractFormalityChoice,
    'story-intro': extractStoryIntro
  };

  const extractor = extractors[type];
  if (!extractor) {
    return { type, raw: await extractGeneric(page) };
  }

  try {
    const content = await extractor(page);
    return { type, content };
  } catch (error) {
    console.error(`Error extracting ${type}:`, error.message);
    return { type, error: error.message };
  }
}

/**
 * Extract vocabulary introduction content
 */
async function extractVocabIntro(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    const buttons = main.querySelectorAll('button');
    const texts = [];

    buttons.forEach(btn => {
      const text = btn.textContent.trim();
      if (text && !text.includes('Hide') && !text.includes('Show')) {
        texts.push(text);
      }
    });

    // Get all text nodes
    const allText = main.textContent;

    return {
      words: texts,
      fullText: allText.trim()
    };
  });
}

/**
 * Extract MCQ translation content
 */
async function extractMcq(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    // Find the word to translate (usually first button)
    const wordButton = main.querySelector('button:not([description*="answer"])');
    const germanWord = wordButton?.textContent.trim();

    // Find answer options
    const options = [];
    const answerButtons = main.querySelectorAll('button[description*="answer"], button[description*="Placeholder"]');
    answerButtons.forEach(btn => {
      const text = btn.textContent.trim();
      const description = btn.getAttribute('description') || '';
      options.push({
        text,
        description
      });
    });

    return {
      germanWord,
      options
    };
  });
}

/**
 * Extract listening fill-in content
 */
async function extractListeningFill(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    // Get the sentence template
    const textNodes = [];
    main.querySelectorAll('*').forEach(el => {
      if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
        const text = el.textContent.trim();
        if (text) textNodes.push(text);
      }
    });

    // Get answer options
    const options = [];
    const answerButtons = main.querySelectorAll('button[description*="answer"]');
    answerButtons.forEach(btn => {
      const description = btn.getAttribute('description') || '';
      const match = description.match(/answer (.+)/);
      if (match) {
        options.push(match[1]);
      }
    });

    // Get translation if visible
    const translation = textNodes.find(t =>
      t.includes('Hello') || t.includes('Thanks') || t.includes('Bye') ||
      t.includes("I'm") || t.includes('Welcome')
    );

    return {
      textParts: textNodes,
      options,
      translation
    };
  });
}

/**
 * Extract grammar tip content
 */
async function extractGrammarTip(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    const allText = main.textContent;

    // Get answer options
    const options = [];
    const answerButtons = main.querySelectorAll('button[description*="answer"]');
    answerButtons.forEach(btn => {
      const description = btn.getAttribute('description') || '';
      const match = description.match(/answer (.+)/);
      if (match) {
        options.push(match[1]);
      }
    });

    return {
      fullText: allText.trim(),
      options
    };
  });
}

/**
 * Extract matching content
 */
async function extractMatching(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    // Get all text content for matching pairs
    const items = [];
    const generics = main.querySelectorAll('[role="generic"]');
    generics.forEach(g => {
      const text = g.textContent.trim();
      if (text) items.push(text);
    });

    return {
      items
    };
  });
}

/**
 * Extract word sorting content
 */
async function extractWordSorting(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    // Get translation
    const allText = main.textContent;

    // Get syllables/fragments
    const fragments = [];
    const answerButtons = main.querySelectorAll('button[description*="answer"]');
    answerButtons.forEach(btn => {
      const description = btn.getAttribute('description') || '';
      const match = description.match(/answer (.+)/);
      if (match) {
        fragments.push(match[1]);
      }
    });

    return {
      fullText: allText.trim(),
      fragments
    };
  });
}

/**
 * Extract dialogue content
 */
async function extractDialogue(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    // Get all dialogue turns
    const turns = [];
    const generics = main.querySelectorAll('[role="generic"]');
    generics.forEach(g => {
      const text = g.textContent.trim();
      if (text && text.length > 2) {
        turns.push(text);
      }
    });

    // Get context if present
    const allText = main.textContent;
    let context = null;
    if (allText.includes('…')) {
      const match = allText.match(/([^.]+…)/);
      if (match) context = match[1];
    }

    return {
      context,
      turns,
      fullText: allText.trim()
    };
  });
}

/**
 * Extract lesson end content
 */
async function extractLessonEnd(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    // Get score
    const text = main.textContent;
    const scoreMatch = text.match(/(\d+)\s*\/\s*(\d+)/);

    return {
      score: scoreMatch ? {
        correct: parseInt(scoreMatch[1]),
        total: parseInt(scoreMatch[2])
      } : null,
      fullText: text.trim()
    };
  });
}

/**
 * Generic extraction fallback
 */
async function extractGeneric(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    return main ? main.textContent.trim() : null;
  });
}

// ============================================================
// NEW EXTRACTORS FOR ALL 23 SCREEN TYPES
// ============================================================

/**
 * Extract listening - choose what is said content
 */
async function extractListeningChooseSaid(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    // Get the answer options (German text choices)
    const options = [];
    const answerButtons = main.querySelectorAll('button[description*="answer"]');
    answerButtons.forEach(btn => {
      const text = btn.textContent.trim();
      if (text) options.push(text);
    });

    return {
      options,
      fullText: main.textContent.trim()
    };
  });
}

/**
 * Extract response matching content
 */
async function extractResponseMatching(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    // Get prompt
    const generics = main.querySelectorAll('[role="generic"]');
    const items = [];
    generics.forEach(g => {
      const text = g.textContent.trim();
      if (text && text.length > 2) items.push(text);
    });

    // Get numbered response options
    const options = [];
    const buttons = main.querySelectorAll('button');
    buttons.forEach(btn => {
      const text = btn.textContent.trim();
      if (/^\d/.test(text)) {
        options.push(text);
      }
    });

    return {
      items,
      options,
      fullText: main.textContent.trim()
    };
  });
}

/**
 * Extract sentence order content
 */
async function extractSentenceOrder(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    // Get translation (usually English)
    const allText = main.textContent;

    // Get word tiles
    const tiles = [];
    const answerButtons = main.querySelectorAll('button[description*="answer"]');
    answerButtons.forEach(btn => {
      const description = btn.getAttribute('description') || '';
      const match = description.match(/answer (.+)/);
      if (match) {
        tiles.push(match[1]);
      }
    });

    return {
      tiles,
      fullText: allText.trim()
    };
  });
}

/**
 * Extract spelling exercise content
 */
async function extractSpelling(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    // Get the sentence with blank
    const allText = main.textContent;

    // Get available letters
    const letters = [];
    const answerButtons = main.querySelectorAll('button[description*="answer"]');
    answerButtons.forEach(btn => {
      const description = btn.getAttribute('description') || '';
      const match = description.match(/answer (.+)/);
      if (match) {
        letters.push(match[1]);
      }
    });

    return {
      letters,
      fullText: allText.trim()
    };
  });
}

/**
 * Extract response choice content
 */
async function extractResponseChoice(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    // Get context (usually English)
    const allText = main.textContent;

    // Get German response options
    const options = [];
    const answerButtons = main.querySelectorAll('button[description*="answer"]');
    answerButtons.forEach(btn => {
      const text = btn.textContent.trim();
      if (text) options.push(text);
    });

    return {
      options,
      fullText: allText.trim()
    };
  });
}

/**
 * Extract pronunciation fill content
 */
async function extractPronunciationFill(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    const allText = main.textContent;

    // Get answer options
    const options = [];
    const answerButtons = main.querySelectorAll('button[description*="answer"]');
    answerButtons.forEach(btn => {
      const description = btn.getAttribute('description') || '';
      const match = description.match(/answer (.+)/);
      if (match) {
        options.push(match[1]);
      }
    });

    return {
      options,
      fullText: allText.trim()
    };
  });
}

/**
 * Extract listen and repeat content
 */
async function extractListenRepeat(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    const allText = main.textContent;

    // Try to extract the word to pronounce
    // Usually it's prominently displayed
    const wordElement = main.querySelector('h1, h2, [role="heading"]');
    const word = wordElement ? wordElement.textContent.trim() : null;

    return {
      word,
      fullText: allText.trim(),
      note: 'Speech recognition exercise - requires microphone'
    };
  });
}

/**
 * Extract pronunciation rule content
 */
async function extractPronunciationRule(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    const allText = main.textContent;

    // Get blanks/options
    const options = [];
    const answerButtons = main.querySelectorAll('button[description*="answer"]');
    answerButtons.forEach(btn => {
      const description = btn.getAttribute('description') || '';
      const match = description.match(/answer (.+)/);
      if (match) {
        options.push(match[1]);
      }
    });

    return {
      options,
      fullText: allText.trim()
    };
  });
}

/**
 * Extract pronunciation quiz content
 */
async function extractPronunciationQuiz(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    const allText = main.textContent;

    // Extract the word being tested
    const wordElement = main.querySelector('h1, h2, [role="heading"]');
    const word = wordElement ? wordElement.textContent.trim() : null;

    // Options are usually "long" and "short"
    const options = [];
    const buttons = main.querySelectorAll('button');
    buttons.forEach(btn => {
      const text = btn.textContent.toLowerCase().trim();
      if (text === 'long' || text === 'short') {
        options.push(text);
      }
    });

    return {
      word,
      options,
      fullText: allText.trim()
    };
  });
}

/**
 * Extract feedback popup tip content
 */
async function extractFeedbackPopupTip(page) {
  return await page.evaluate(() => {
    const popup = document.querySelector('[role="dialog"]') || document.querySelector('.popup');
    const main = document.querySelector('main');

    const tipText = popup ? popup.textContent.trim() : (main ? main.textContent.trim() : '');

    return {
      tip: tipText,
      isPopup: !!popup
    };
  });
}

/**
 * Extract recap intro content
 */
async function extractRecapIntro(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    return {
      fullText: main.textContent.trim(),
      isIntro: true
    };
  });
}

/**
 * Extract recap end content
 */
async function extractRecapEnd(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    // Try to get score if present
    const text = main.textContent;
    const scoreMatch = text.match(/(\d+)\s*\/\s*(\d+)/);

    return {
      score: scoreMatch ? {
        correct: parseInt(scoreMatch[1]),
        total: parseInt(scoreMatch[2])
      } : null,
      fullText: text.trim()
    };
  });
}

/**
 * Extract formality choice content
 */
async function extractFormalityChoice(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    const allText = main.textContent;

    // Check which options are available
    const options = [];
    const buttons = main.querySelectorAll('button');
    buttons.forEach(btn => {
      const text = btn.textContent.toLowerCase().trim();
      if (text.includes('formell') || text.includes('informell')) {
        options.push(text);
      }
    });

    return {
      options,
      fullText: allText.trim()
    };
  });
}

/**
 * Extract story intro content
 */
async function extractStoryIntro(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;

    // Get title if present
    const titleElement = main.querySelector('h1, h2, [role="heading"]');
    const title = titleElement ? titleElement.textContent.trim() : null;

    // Get story/context text
    const allText = main.textContent.trim();

    return {
      title,
      story: allText,
      isNarrative: true
    };
  });
}

export default {
  extractContent
};
