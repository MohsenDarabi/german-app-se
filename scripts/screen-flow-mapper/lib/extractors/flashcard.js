/**
 * Flashcard (Vocabulary Card) Extractor
 * Screen Type: ST-02
 * Selector: data-qa-ex="ex-flashcard"
 *
 * See: docs/busuu-research/screen-types/ST-02-video-vocabulary.md
 */

/**
 * Extract vocabulary flashcard content
 * @param {import('puppeteer').Page} page
 * @returns {Promise<object>}
 */
export async function extractFlashcard(page) {
  return await page.evaluate(() => {
    const container = document.querySelector('[data-qa-ex="ex-flashcard"]');
    if (!container) return null;

    // Get instruction
    const instruction = document.querySelector('[data-testid="ex-instruction"]')?.textContent?.trim();

    // Get main text (German word/phrase)
    const assetText = document.querySelector('[data-testid="asset-text"]');
    const germanText = assetText?.querySelector('p > span > b')?.textContent?.trim() ||
                       assetText?.querySelector('p > span')?.textContent?.trim() || '';

    // Get translation (usually in italic or separate span)
    const translationEl = assetText?.querySelector('p > span > i') ||
                          assetText?.querySelector('p > span:last-child');
    const englishText = translationEl?.textContent?.trim() || '';

    // Get image
    const imageEl = document.querySelector('[data-testid="asset-image"]');
    const imageUrl = imageEl?.src || null;

    // Get audio
    const audioEl = document.querySelector('[data-testid="asset-audio"] source');
    const audioUrl = audioEl?.src || null;

    // Get video (some flashcards have video instead of image)
    const videoEl = document.querySelector('[data-testid="asset-video"] source');
    const videoUrl = videoEl?.src || null;

    // Check for favorite button
    const favoriteBtn = document.querySelector('[data-testid="favourite-button"]');
    const hasFavorite = !!favoriteBtn;

    return {
      type: 'flashcard',
      instruction,
      content: {
        german: germanText,
        english: englishText
      },
      media: {
        image: imageUrl,
        audio: audioUrl,
        video: videoUrl
      },
      features: {
        hasFavorite
      }
    };
  });
}

export default extractFlashcard;
