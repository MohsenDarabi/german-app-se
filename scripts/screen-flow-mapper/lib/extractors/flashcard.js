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

    // Try multiple strategies for German text
    const germanText = assetText?.querySelector('p > span > b')?.textContent?.trim() ||
                       assetText?.querySelector('p > span > strong')?.textContent?.trim() ||
                       assetText?.querySelector('b')?.textContent?.trim() ||
                       assetText?.querySelector('p > span')?.textContent?.trim() || '';

    // Get translation (usually in italic, parentheses, or separate element)
    // Try multiple strategies:
    // 1. Italic text
    let englishText = assetText?.querySelector('p > span > i')?.textContent?.trim() ||
                      assetText?.querySelector('i')?.textContent?.trim() || '';

    // 2. Text in parentheses from the full content
    if (!englishText && assetText) {
      const fullText = assetText.textContent || '';
      const parenMatch = fullText.match(/\(([^)]+)\)/);
      if (parenMatch) {
        englishText = parenMatch[1].trim();
      }
    }

    // 3. Look for a secondary text element
    if (!englishText) {
      const secondaryText = document.querySelector('[data-testid="asset-secondary-text"]');
      englishText = secondaryText?.textContent?.trim() || '';
    }

    // 4. Don't repeat German if no translation found
    if (!englishText || englishText === germanText) {
      englishText = null; // Explicitly null rather than duplicating German
    }

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
