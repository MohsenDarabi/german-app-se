/**
 * True/False Extractor
 * Screen Type: ST-14
 * Selector: data-qa-ex="ex-true-false"
 *
 * See: docs/busuu-research/screen-types/ST-14-true-false.md
 */

/**
 * Extract true/false exercise content
 * @param {import('puppeteer').Page} page
 * @returns {Promise<object>}
 */
export async function extractTrueFalse(page) {
  return await page.evaluate(() => {
    const container = document.querySelector('[data-qa-ex="ex-true-false"]');
    if (!container) return null;

    // Get instruction
    const instruction = document.querySelector('[data-testid="ex-instruction"]')?.textContent?.trim();

    // Get statement text
    const assetText = document.querySelector('[data-testid="asset-text"]');
    const statement = assetText?.textContent?.trim() || '';

    // Get options (True/False buttons)
    const optionEls = document.querySelectorAll('[data-qa-choice][data-qa-pass]');
    const options = Array.from(optionEls).map(el => {
      const text = el.querySelector('.font-face-lt')?.textContent?.trim() || '';
      const position = parseInt(el.getAttribute('data-qa-pass') || '0', 10);
      // data-qa-pass="0" = correct answer
      return {
        text,
        isCorrect: position === 0
      };
    });

    // Determine correct answer
    const correctOption = options.find(opt => opt.isCorrect);
    const correctAnswer = correctOption?.text?.toLowerCase() === 'true' ||
                          correctOption?.text?.toLowerCase() === 'richtig';

    // Get image if present
    const imageEl = document.querySelector('[data-testid="asset-image"]');
    const imageUrl = imageEl?.src || null;

    // Get audio if present
    const audioEl = document.querySelector('[data-testid="asset-audio"] source');
    const audioUrl = audioEl?.src || null;

    return {
      type: 'true-false',
      instruction,
      statement,
      correctAnswer,
      options: options.map(opt => opt.text),
      media: {
        image: imageUrl,
        audio: audioUrl
      }
    };
  });
}

export default extractTrueFalse;
