/**
 * Generic Exercise Extractor
 * Fallback for exercise types we haven't specifically defined
 * Captures whatever content is available
 */

/**
 * Extract generic exercise content
 * @param {import('puppeteer').Page} page
 * @returns {Promise<object>}
 */
export async function extractGeneric(page) {
  return await page.evaluate(() => {
    const container = document.querySelector('[data-qa-ex]');
    if (!container) return null;

    // Get the exercise type from data-qa-ex
    const exerciseType = container.getAttribute('data-qa-ex');

    // Get instruction
    const instruction = document.querySelector('[data-testid="ex-instruction"]')?.textContent?.trim();

    // Get all text content from the exercise
    const textElements = container.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');
    const texts = [...textElements]
      .map(el => el.textContent?.trim())
      .filter(t => t && t.length > 0 && t.length < 500);

    // Get all buttons with data-qa-pass (answer options)
    const optionBtns = container.querySelectorAll('button[data-qa-pass], [role="button"][data-qa-pass]');
    const options = [...optionBtns].map(btn => ({
      text: btn.textContent?.trim(),
      pass: btn.getAttribute('data-qa-pass'),
      isCorrect: btn.getAttribute('data-qa-pass') === 'true' || btn.getAttribute('data-qa-pass') === '1'
    }));

    // Get any images
    const images = [...container.querySelectorAll('img')].map(img => img.src);

    // Get any audio elements
    const audioBtn = container.querySelector('[data-testid="ex-audio-icon-button"]');
    const hasAudio = !!audioBtn;

    // Get any video
    const video = document.querySelector('video source')?.src ||
                  document.querySelector('[data-testid="asset-simple-video"] source')?.src;

    return {
      type: 'generic',
      exerciseType,
      instruction,
      texts: [...new Set(texts)], // Dedupe
      options,
      media: {
        images,
        hasAudio,
        video: video || null
      }
    };
  });
}

export default extractGeneric;
