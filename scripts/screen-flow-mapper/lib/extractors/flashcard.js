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

    // Get audio - try multiple selectors
    const audioEl = document.querySelector('[data-testid="asset-audio"] source') ||
                    document.querySelector('audio source') ||
                    document.querySelector('[data-testid="asset-audio"]');
    let audioUrl = null;
    if (audioEl) {
      audioUrl = audioEl.src || audioEl.querySelector('source')?.src || null;
    }

    // Also check for audio button (audio may load on click)
    // Flashcards use ex-audio-icon-button for their audio
    const audioButton = document.querySelector(
      '[data-testid="ex-audio-icon-button"], ' +
      '[data-testid="audio-button"], ' +
      '[data-testid="feedback-audio-button"], ' +
      '.audio-button, ' +
      'button[aria-label*="audio"], ' +
      'button[aria-label*="play"], ' +
      '.ex-audio-btn, ' +
      '[class*="audio"]'
    );
    const hasAudioButton = !!audioButton;

    // Get video - flashcards use asset-simple-video
    const videoEl = document.querySelector('[data-testid="asset-simple-video"] video source') ||
                    document.querySelector('[data-testid="asset-simple-video"] source') ||
                    document.querySelector('[data-testid="asset-video"] source') ||
                    document.querySelector('video source');
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
        video: videoUrl,
        hasAudio: !!audioUrl || hasAudioButton
      },
      features: {
        hasFavorite
      }
    };
  });
}

export default extractFlashcard;
