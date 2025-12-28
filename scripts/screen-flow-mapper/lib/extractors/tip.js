/**
 * Grammar Tip Extractor
 * Screen Type: ST-21
 * Selector: data-qa-ex="ex-tip"
 *
 * See: docs/busuu-research/screen-types/ST-21-grammar-tip.md
 */

/**
 * Extract grammar tip content
 * @param {import('puppeteer').Page} page
 * @returns {Promise<object>}
 */
export async function extractTip(page) {
  return await page.evaluate(() => {
    const container = document.querySelector('[data-qa-ex="ex-tip"]');
    if (!container) return null;

    // Get title (usually "Here's a tip!")
    const title = document.querySelector('[data-testid="ex-instruction"]')?.textContent?.trim();

    // Get explanation text
    const tipText = document.querySelector('[data-testid="tip-text"]');
    const explanation = tipText?.textContent?.trim() || '';

    // Get highlighted terms in explanation
    const highlightEls = tipText?.querySelectorAll('b') || [];
    const highlights = Array.from(highlightEls).map(b => b.textContent?.trim()).filter(Boolean);

    // Get examples from table
    const exampleRows = document.querySelectorAll('table tbody tr');
    const examples = Array.from(exampleRows).map(row => {
      const p = row.querySelector('td p');
      const fullText = p?.textContent?.trim() || '';

      // Parse "German text. (English text.)" format
      const match = fullText.match(/^(.+?)\s*\((.+?)\)$/);
      const german = match?.[1]?.trim() || fullText;
      const english = match?.[2]?.trim() || '';

      // Get highlights in this example
      const exHighlights = Array.from(p?.querySelectorAll('b') || [])
        .map(b => b.textContent?.trim())
        .filter(Boolean);

      // Check for audio button
      const hasAudio = !!row.querySelector('[data-testid="ex-audio-icon-button"]');

      return {
        german,
        english,
        highlights: exHighlights,
        hasAudio
      };
    });

    return {
      type: 'tip',
      title,
      explanation,
      highlights,
      examples
    };
  });
}

export default extractTip;
