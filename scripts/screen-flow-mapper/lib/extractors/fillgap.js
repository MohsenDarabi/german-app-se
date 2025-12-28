/**
 * Fill Gap (Drag & Drop) Extractor
 * Screen Types: ST-03 (single), ST-07 (multiple)
 * Selector: data-qa-ex="ex-fillgap-dragdrop"
 *
 * See: docs/busuu-research/screen-types/ST-03-fill-gap-dragdrop.md
 * See: docs/busuu-research/screen-types/ST-07-fill-gap-multiple.md
 */

/**
 * Extract fill gap exercise content
 * @param {import('puppeteer').Page} page
 * @returns {Promise<object>}
 */
export async function extractFillgap(page) {
  return await page.evaluate(() => {
    const container = document.querySelector('[data-qa-ex="ex-fillgap-dragdrop"]');
    if (!container) return null;

    // Get instruction
    const instruction = document.querySelector('[data-testid="ex-instruction"]')?.textContent?.trim();

    // Count blanks to determine single vs multiple
    const blanks = document.querySelectorAll('.fillgap-dragdrop__btn');
    const blanksCount = blanks.length;

    // Get sentence parts in order (blanks and text)
    const sentenceEl = document.querySelector('.fillgap-dragdrop__sentences');
    const parts = [];
    let blankIndex = 0;

    if (sentenceEl) {
      sentenceEl.querySelectorAll(':scope > span').forEach(span => {
        if (span.querySelector('.fillgap-dragdrop__btn')) {
          parts.push({ type: 'blank', index: blankIndex++ });
        } else if (span.querySelector('.fillgap-dragdrop__text')) {
          const text = span.querySelector('.font-face-lt')?.textContent || '';
          if (text) {
            parts.push({ type: 'text', content: text });
          }
        }
      });
    }

    // Get all options with their data-qa-pass values
    const optionEls = document.querySelectorAll('.fillgap-dragdrop__options [data-qa-pass]');
    const options = Array.from(optionEls).map(opt => ({
      text: opt.querySelector('.font-face-lt')?.textContent?.trim() || '',
      position: parseInt(opt.getAttribute('data-qa-pass') || '0', 10)
    }));

    // Sort by position to identify correct answers
    // Lower positions (1, 2, 3...) are typically correct for blanks 0, 1, 2...
    const sortedOptions = [...options].sort((a, b) => a.position - b.position);

    // Map correct answers to blanks
    const correctAnswers = sortedOptions.slice(0, blanksCount).map(opt => opt.text);

    // Reconstruct the complete sentence
    let completeSentence = '';
    let correctIndex = 0;
    parts.forEach(part => {
      if (part.type === 'text') {
        completeSentence += part.content;
      } else if (part.type === 'blank') {
        completeSentence += correctAnswers[correctIndex++] || '___';
      }
    });

    // Get audio if present
    const audioEl = document.querySelector('[data-testid="asset-audio"] source');
    const audioUrl = audioEl?.src || null;

    // Get image if present
    const imageEl = document.querySelector('[data-testid="asset-image"]');
    const imageUrl = imageEl?.src || null;

    // Get video if present
    const videoEl = document.querySelector('[data-testid="asset-video"] source') ||
                    document.querySelector('video source');
    const videoUrl = videoEl?.src || null;

    return {
      type: blanksCount > 1 ? 'fillgap-multiple' : 'fillgap-single',
      instruction,
      sentence: {
        parts,
        blanksCount,
        complete: completeSentence.trim()
      },
      options: options.map(opt => ({
        text: opt.text,
        position: opt.position,
        isCorrect: opt.position <= blanksCount
      })),
      correctAnswers,
      media: {
        audio: audioUrl,
        image: imageUrl,
        video: videoUrl
      }
    };
  });
}

export default extractFillgap;
