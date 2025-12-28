/**
 * Video Comprehension (Dialog) Extractor
 * Screen Type: ST-20
 * Selector: data-qa-ex="ex-comprehension"
 *
 * See: docs/busuu-research/screen-types/ST-20-video-comprehension.md
 */

/**
 * Extract video comprehension content
 * @param {import('puppeteer').Page} page
 * @returns {Promise<object>}
 */
export async function extractComprehension(page) {
  return await page.evaluate(() => {
    const container = document.querySelector('[data-qa-ex="ex-comprehension"]');
    if (!container) return null;

    // Get instruction
    const instruction = document.querySelector('[data-testid="ex-instruction"]')?.textContent?.trim();

    // Get video sources
    const video = document.querySelector('[data-testid="asset-video"] video');
    const poster = video?.getAttribute('data-poster') || null;
    const sources = Array.from(video?.querySelectorAll('source') || []).map(s => ({
      src: s.src,
      type: s.type
    }));

    // Get dialog transcript
    // German lines are in <b>, English in <i>
    const assetText = document.querySelector('[data-testid="asset-text"]');
    const germanLines = assetText?.querySelectorAll('b') || [];
    const englishLines = assetText?.querySelectorAll('i') || [];

    const dialog = Array.from(germanLines).map((b, i) => {
      const germanText = b.textContent?.trim() || '';
      const englishText = englishLines[i]?.textContent?.trim() || '';

      // Parse speaker from "Speaker: text" format
      let speaker = '';
      let german = germanText;
      let english = englishText;

      if (germanText.includes(': ')) {
        const parts = germanText.split(': ');
        speaker = parts[0];
        german = parts.slice(1).join(': ');
      }

      if (englishText.includes(': ')) {
        const parts = englishText.split(': ');
        // Speaker should match, just get the text
        english = parts.slice(1).join(': ');
      }

      return { speaker, german, english };
    });

    return {
      type: 'comprehension',
      instruction,
      video: {
        poster,
        sources
      },
      dialog
    };
  });
}

export default extractComprehension;
