/**
 * Typing Exercise Extractor
 * Screen Type: ST-16
 * Selector: data-qa-ex="ex-typing"
 *
 * See: docs/busuu-research/screen-types/ST-16-typing.md
 */

/**
 * Extract typing exercise content
 * @param {import('puppeteer').Page} page
 * @returns {Promise<object>}
 */
export async function extractTyping(page) {
  return await page.evaluate(() => {
    const container = document.querySelector('[data-qa-ex="ex-typing"]');
    if (!container) return null;

    // Get instruction
    const instruction = document.querySelector('[data-testid="ex-instruction"]')?.textContent?.trim();

    // Get the input field - correct answer is in data-qa-pass attribute!
    const input = document.querySelector('.ex-typing__input');
    const correctAnswer = input?.getAttribute('data-qa-pass') || '';

    // Get sentence wrapper to extract context
    const wrapper = document.querySelector('.ex-typing__wrapper');
    const fullText = wrapper?.textContent?.trim() || '';

    // Try to extract sentence parts (before and after the blank)
    // The input placeholder is typically "Type here"
    const inputPlaceholder = input?.placeholder || 'Type here';

    // Get extra letters (German special characters)
    const extraLetterBtns = document.querySelectorAll('[data-testid="extra-letters-label"] ~ div button span, .ex-typing__extra-letters button');
    const extraLetters = Array.from(extraLetterBtns).map(btn => btn.textContent?.trim()).filter(Boolean);

    // Get image if present
    const imageEl = document.querySelector('[data-testid="asset-image"]');
    const imageUrl = imageEl?.src || null;

    // Get audio if present
    const audioEl = document.querySelector('[data-testid="asset-audio"] source');
    const audioUrl = audioEl?.src || null;

    return {
      type: 'typing',
      instruction,
      sentence: fullText,
      correctAnswer,
      extraLetters: extraLetters.length > 0 ? extraLetters : ['ä', 'ö', 'ü', 'ß'],
      media: {
        image: imageUrl,
        audio: audioUrl
      }
    };
  });
}

export default extractTyping;
