/**
 * Spelling / Word Completion Extractor
 * Screen Types: ST-17 (full spelling), ST-18 (word completion)
 * Selector: data-qa-ex="ex-spelling"
 *
 * See: docs/busuu-research/screen-types/ST-17-spelling.md
 * See: docs/busuu-research/screen-types/ST-18-word-completion.md
 */

/**
 * Extract spelling exercise content
 * @param {import('puppeteer').Page} page
 * @returns {Promise<object>}
 */
export async function extractSpelling(page) {
  return await page.evaluate(() => {
    const container = document.querySelector('[data-qa-ex="ex-spelling"]');
    if (!container) return null;

    // Get instruction
    const instruction = document.querySelector('[data-testid="ex-instruction"]')?.textContent?.trim();

    // Check if this is word completion (has given letters) or full spelling
    const spellingWords = document.querySelectorAll('.spelling__sentence .spelling__word');
    const firstWord = spellingWords[0];

    // Get given letters (if any - for word completion)
    const givenLetterEls = firstWord?.querySelectorAll(':scope > .font-face-lt') || [];
    const givenLetters = Array.from(givenLetterEls).map(el => el.textContent?.trim() || '');

    // Get blank count
    const blanks = firstWord?.querySelectorAll(':scope > .ex-btn--dashed') || [];
    const blanksCount = blanks.length;

    // Determine if word completion or full spelling
    const isWordCompletion = givenLetters.length > 0 && blanksCount > 0;

    // Get context words (rest of sentence, if any)
    const contextWords = Array.from(spellingWords).slice(1).map(
      w => w.querySelector('.font-face-lt')?.textContent?.trim() || ''
    ).filter(Boolean);

    // Get letter options with positions
    const letterEls = document.querySelectorAll('[data-qa-choice][data-qa-pass]');
    const letters = Array.from(letterEls).map(el => ({
      letter: el.querySelector('.font-face-lt')?.textContent?.trim() || '',
      position: parseInt(el.getAttribute('data-qa-pass') || '0', 10)
    }));

    // Sort by position to reconstruct correct word
    const sortedLetters = [...letters].sort((a, b) => a.position - b.position);
    const missingPart = sortedLetters.map(l => l.letter).join('');

    // Build complete word
    const givenPart = givenLetters.join('');
    const correctWord = givenPart + missingPart;

    // Get punctuation if present
    const punctuation = firstWord?.querySelector(':scope > .font-face-lt:last-child')?.textContent?.trim() || '';
    const hasPunctuation = ['!', '?', '.', ','].includes(punctuation);

    // Get image if present
    const imageEl = document.querySelector('[data-testid="asset-image"]');
    const imageUrl = imageEl?.src || null;

    // Get audio if present
    const audioEl = document.querySelector('[data-testid="asset-audio"] source');
    const audioUrl = audioEl?.src || null;

    return {
      type: isWordCompletion ? 'word-completion' : 'spelling',
      instruction,
      givenLetters: givenLetters.length > 0 ? givenLetters : null,
      letters: letters.map(l => ({
        letter: l.letter,
        correctPosition: l.position
      })),
      correctWord,
      punctuation: hasPunctuation ? punctuation : null,
      context: contextWords.length > 0 ? contextWords.join(' ') : null,
      media: {
        image: imageUrl,
        audio: audioUrl
      }
    };
  });
}

export default extractSpelling;
