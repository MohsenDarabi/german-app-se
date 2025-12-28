/**
 * Multiple Choice (MCQ) Extractor
 * Screen Type: ST-09
 * Selector: data-qa-ex="ex-mcq"
 *
 * See: docs/busuu-research/screen-types/ST-09-mcq.md
 */

/**
 * Extract multiple choice exercise content
 * @param {import('puppeteer').Page} page
 * @returns {Promise<object>}
 */
export async function extractMcq(page) {
  return await page.evaluate(() => {
    const container = document.querySelector('[data-qa-ex="ex-mcq"]');
    if (!container) return null;

    // Get instruction
    const instruction = document.querySelector('[data-testid="ex-instruction"]')?.textContent?.trim();

    // Get question/prompt text
    const assetText = document.querySelector('[data-testid="asset-text"]');
    const questionText = assetText?.textContent?.trim() || '';

    // Get all options
    const optionEls = document.querySelectorAll('[data-qa-choice][data-qa-pass]');
    const options = Array.from(optionEls).map(opt => {
      const text = opt.querySelector('.font-face-lt')?.textContent?.trim() || '';
      const position = parseInt(opt.getAttribute('data-qa-pass') || '0', 10);
      // In MCQ, data-qa-pass="0" typically means correct answer
      const isCorrect = position === 0;

      return {
        text,
        position,
        isCorrect
      };
    });

    // Find the correct answer
    const correctOption = options.find(opt => opt.isCorrect);
    const correctAnswer = correctOption?.text || '';

    // Get image if present
    const imageEl = document.querySelector('[data-testid="asset-image"]');
    const imageUrl = imageEl?.src || null;

    // Get audio if present
    const audioEl = document.querySelector('[data-testid="asset-audio"] source');
    const audioUrl = audioEl?.src || null;

    return {
      type: 'mcq',
      instruction,
      question: questionText,
      options: options.map(opt => ({
        text: opt.text,
        isCorrect: opt.isCorrect
      })),
      correctAnswer,
      media: {
        image: imageUrl,
        audio: audioUrl
      }
    };
  });
}

export default extractMcq;
