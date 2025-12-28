/**
 * Phrase Builder (Word Order) Extractor
 * Screen Type: ST-08
 * Selector: data-qa-ex="ex-phrase-builder"
 *
 * See: docs/busuu-research/screen-types/ST-08-word-order.md
 */

/**
 * Extract phrase builder exercise content
 * @param {import('puppeteer').Page} page
 * @returns {Promise<object>}
 */
export async function extractPhraseBuilder(page) {
  return await page.evaluate(() => {
    const container = document.querySelector('[data-qa-ex="ex-phrase-builder"]');
    if (!container) return null;

    // Get instruction
    const instruction = document.querySelector('[data-testid="ex-instruction"]')?.textContent?.trim();

    // Get translation/prompt (the sentence to build)
    const assetText = document.querySelector('[data-testid="asset-text"]');
    const promptText = assetText?.textContent?.trim() || '';

    // Get all word options with their correct positions
    const wordEls = document.querySelectorAll('[data-qa-choice][data-qa-pass]');
    const words = Array.from(wordEls).map(el => ({
      text: el.querySelector('.font-face-lt')?.textContent?.trim() || '',
      position: parseInt(el.getAttribute('data-qa-pass') || '0', 10)
    }));

    // Sort by position to get correct word order
    const sortedWords = [...words].sort((a, b) => a.position - b.position);
    const correctSentence = sortedWords.map(w => w.text).join(' ');

    // Get image if present
    const imageEl = document.querySelector('[data-testid="asset-image"]');
    const imageUrl = imageEl?.src || null;

    // Get audio if present
    const audioEl = document.querySelector('[data-testid="asset-audio"] source');
    const audioUrl = audioEl?.src || null;

    return {
      type: 'phrase-builder',
      instruction,
      prompt: promptText,
      words: words.map(w => ({
        text: w.text,
        correctPosition: w.position
      })),
      correctSentence,
      media: {
        image: imageUrl,
        audio: audioUrl
      }
    };
  });
}

export default extractPhraseBuilder;
