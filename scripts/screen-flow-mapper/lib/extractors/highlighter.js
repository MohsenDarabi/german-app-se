/**
 * Word Highlighter Extractor
 * Screen Type: ex-highlighter
 * Select multiple correct words from a sentence
 */

/**
 * Extract word highlighter exercise content
 * @param {import('puppeteer').Page} page
 * @returns {Promise<object>}
 */
export async function extractHighlighter(page) {
  return await page.evaluate(() => {
    const container = document.querySelector('[data-qa-ex="ex-highlighter"]');
    if (!container) return null;

    // Get instruction
    const instruction = document.querySelector('[data-testid="ex-instruction"]')?.textContent?.trim();

    // Get all word options
    const wordBtns = container.querySelectorAll('button[data-qa-choice="true"]');
    const words = [...wordBtns].map(btn => {
      const text = btn.querySelector('.font-face-lt')?.textContent?.trim() || btn.textContent?.trim();
      const isCorrect = btn.getAttribute('data-qa-pass') === 'true';
      return { text, isCorrect };
    });

    // Get correct answers
    const correctAnswers = words.filter(w => w.isCorrect).map(w => w.text);

    // Build the full sentence from words
    const sentence = words.map(w => w.text).join(' ').replace(/ ([,?!.])/g, '$1');

    return {
      type: 'highlighter',
      instruction,
      sentence,
      words,
      correctAnswers,
      correctPhrase: correctAnswers.join(' ')
    };
  });
}

export default extractHighlighter;
