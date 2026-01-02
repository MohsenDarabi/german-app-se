/**
 * BiDi (Bidirectional Text) Utilities
 *
 * Handles detection and proper rendering of mixed RTL/LTR text
 * (Persian/Arabic + German/Latin).
 *
 * ═══════════════════════════════════════════════════════════════════
 * RULE FOR CONTENT CREATORS:
 * ═══════════════════════════════════════════════════════════════════
 *
 * When mixing Persian and German/English words in a sentence,
 * THE FIRST WORD DETERMINES THE TEXT DIRECTION.
 *
 * - If the sentence is Persian with embedded German words:
 *   START with a Persian word, not the German word.
 *
 * WRONG: "Hi" رسمی‌تر از "Hallo" است.
 *        (First char is "H" → detected as LTR → displays incorrectly)
 *
 * RIGHT: کلمه "Hi" رسمی‌تر از "Hallo" است.
 *        (First char is Persian "ک" → detected as RTL → displays correctly)
 *
 * - If the sentence is German with embedded Persian:
 *   START with a German word.
 *
 * This rule ensures the Unicode BiDi algorithm renders text correctly
 * without needing to hardcode direction attributes.
 * ═══════════════════════════════════════════════════════════════════
 */

// RTL Unicode ranges: Arabic, Persian, Hebrew, etc.
const RTL_REGEX = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;

// LTR Unicode ranges: Latin (including extended), German umlauts, etc.
const LTR_REGEX = /[A-Za-z\u00C0-\u00FF\u0100-\u017F\u0180-\u024F]/;

/**
 * Detect the text direction based on the first "strong" directional character.
 *
 * This mimics how browser extensions like "Auto RTL/LTR Switcher" work:
 * - Scan the text character by character
 * - Return 'rtl' when the first RTL character (Persian, Arabic, Hebrew) is found
 * - Return 'ltr' when the first LTR character (Latin) is found
 * - Default to 'ltr' if no strong directional character is found
 *
 * @param text - The text to analyze
 * @returns 'rtl' or 'ltr'
 */
export function detectDirection(text: string): 'rtl' | 'ltr' {
  if (!text) return 'ltr';

  for (const char of text) {
    if (RTL_REGEX.test(char)) return 'rtl';
    if (LTR_REGEX.test(char)) return 'ltr';
  }

  return 'ltr';
}

/**
 * Check if a character is an RTL character
 */
export function isRtlChar(char: string): boolean {
  return RTL_REGEX.test(char);
}

/**
 * Check if a character is an LTR character
 */
export function isLtrChar(char: string): boolean {
  return LTR_REGEX.test(char);
}

/**
 * Check if text contains any RTL characters
 */
export function hasRtlChars(text: string): boolean {
  return RTL_REGEX.test(text);
}

/**
 * Check if text contains any LTR characters
 */
export function hasLtrChars(text: string): boolean {
  return LTR_REGEX.test(text);
}

/**
 * Check if text is mixed (contains both RTL and LTR characters)
 */
export function isMixedText(text: string): boolean {
  return hasRtlChars(text) && hasLtrChars(text);
}
