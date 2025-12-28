/**
 * Answer Feedback + Tip Extractor
 * Screen Type: ST-04
 * Selector: [data-testid="feedback-footer"]
 *
 * Note: This is an overlay that appears after answering exercises.
 * See: docs/busuu-research/screen-types/ST-04-answer-feedback-tip.md
 */

/**
 * Extract feedback/tip content after answer submission
 * @param {import('puppeteer').Page} page
 * @returns {Promise<object|null>}
 */
export async function extractFeedback(page) {
  return await page.evaluate(() => {
    const feedback = document.querySelector('[data-testid="feedback-footer"]');
    if (!feedback) return null;

    // Get the tip text from footer
    const footer = feedback.querySelector('footer');
    const tipText = footer?.textContent?.trim() || '';

    // Check if answer was correct or incorrect
    // Usually indicated by color or icon
    const isCorrect = !feedback.classList.contains('incorrect') &&
                      !feedback.querySelector('.incorrect');

    // Get any highlighted terms
    const highlights = Array.from(footer?.querySelectorAll('b, strong') || [])
      .map(el => el.textContent?.trim())
      .filter(Boolean);

    // Get audio if present in feedback
    const audioEl = feedback.querySelector('audio source, [data-testid="asset-audio"] source');
    const audioUrl = audioEl?.src || null;

    return {
      type: 'feedback',
      isCorrect,
      tip: tipText,
      highlights,
      hasAudio: !!audioUrl,
      audioUrl
    };
  });
}

/**
 * Wait for feedback to appear after submitting answer
 * @param {import('puppeteer').Page} page
 * @param {number} timeout
 * @returns {Promise<boolean>}
 */
export async function waitForFeedback(page, timeout = 5000) {
  try {
    await page.waitForSelector('[data-testid="feedback-footer"]', { timeout });
    return true;
  } catch {
    return false;
  }
}

export default extractFeedback;
export { waitForFeedback };
